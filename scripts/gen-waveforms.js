/*
 * scripts/gen-waveforms.js
 * =========================
 * Precalcule les pics du spectre (plein ecran, bandeau) pour chaque piste de
 * js/album-data.js et ecrit un petit JSON par piste dans assets/waveforms/.
 * Le site lit ces JSON en priorite (quasi instantane) ; si l'un d'eux manque
 * pour une piste, js/app.js retombe automatiquement sur un decodage Web Audio
 * en direct dans le navigateur (plus lent, mais fonctionnel).
 *
 * A relancer apres tout ajout/remplacement de fichier audio.
 *
 * Prerequis : Node avec Playwright installe, et un serveur HTTP statique du
 * projet deja lance (le decodage audio se fait dans un vrai navigateur,
 * pas en pur Node).
 *
 * Usage :
 *   npx http-server . -p 8000 -c-1 &
 *   node scripts/gen-waveforms.js http://localhost:8000
 */

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const ALBUM_DATA_PATH = path.join(__dirname, "..", "js", "album-data.js");
const OUT_DIR = path.join(__dirname, "..", "assets", "waveforms");
const PEAKS_PER_SECOND = 10;
// Courbe appliquee au RMS normalise. < 1 releve les passages calmes ; a 1 le
// rendu est lineaire (les parties douces deviennent quasi invisibles sur un
// master tres compresse).
const GAMMA = 0.9;
const BASE_URL = process.argv[2] || "http://localhost:8000";

function readTrackFiles() {
  var src = fs.readFileSync(ALBUM_DATA_PATH, "utf8");
  var re = /file:\s*"([^"]+\.mp3)"/g;
  var files = [];
  var m;
  while ((m = re.exec(src)) !== null) {
    if (m[1].indexOf("album-complet") === -1) files.push(m[1]);
  }
  return files;
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  var files = readTrackFiles();
  if (!files.length) {
    console.error("Aucune piste trouvee dans album-data.js");
    process.exit(1);
  }

  var browser = await chromium.launch({ headless: true });
  // serviceWorkers: "block" -- app.js recharge la page au premier
  // controllerchange (pour ne jamais rester coince sur une UI en cache cote
  // utilisateurs). Sur un contexte tout neuf, le SW revendique quand meme
  // les clients au premier chargement (self.clients.claim()), ce qui
  // declenche ce reload et peut casser un page.evaluate() en plein vol. Cet
  // outil n'a besoin d'aucun comportement PWA : on bloque le SW purement et
  // simplement.
  var context = await browser.newContext({ serviceWorkers: "block" });
  var page = await context.newPage();
  await page.goto(BASE_URL + "/index.html", { waitUntil: "networkidle" });

  for (var idx = 0; idx < files.length; idx++) {
    var relFile = files[idx]; // ex: "./audio/01-half-dead.mp3"
    var t0 = Date.now();
    // RMS (energie moyenne) et NON le pic max de la tranche. Ces masters sont
    // tres limites : le pic depasse 0.95 quasiment partout, donc un spectre
    // base sur le pic n'affiche qu'un bloc plein sans relief. Le RMS, lui,
    // suit ce qu'on entend. Il est ensuite normalise par piste puis passe
    // dans une courbe douce (gamma) pour rendre les passages calmes lisibles
    // sans ecraser les forts.
    var peaks = await page.evaluate(
      async function (args) {
        var ctx = new (window.AudioContext || window.webkitAudioContext)();
        var buf = await fetch(args.file).then(function (r) { return r.arrayBuffer(); });
        var audioBuffer = await ctx.decodeAudioData(buf);
        var ch0 = audioBuffer.getChannelData(0);
        var ch1 = audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : null;
        var bucket = Math.max(1, Math.round(audioBuffer.sampleRate / args.peaksPerSecond));
        var total = Math.ceil(ch0.length / bucket);
        var rms = new Float64Array(total);
        for (var p = 0; p < total; p++) {
          var start = p * bucket, end = Math.min(start + bucket, ch0.length), sum = 0, n = 0;
          for (var i = start; i < end; i++) {
            var v = ch1 ? (ch0[i] + ch1[i]) / 2 : ch0[i];
            sum += v * v; n++;
          }
          rms[p] = n ? Math.sqrt(sum / n) : 0;
        }
        // Reference = 99e centile (et non le max) : un unique transitoire ne
        // doit pas ecraser tout le reste du morceau.
        var sorted = Array.prototype.slice.call(rms).sort(function (a, b) { return a - b; });
        var ref = sorted[Math.floor(sorted.length * 0.99)] || sorted[sorted.length - 1] || 1;
        var out = new Array(total);
        for (var q = 0; q < total; q++) {
          var norm = ref > 0 ? rms[q] / ref : 0;
          if (norm > 1) norm = 1;
          out[q] = Math.round(Math.pow(norm, args.gamma) * 1000) / 1000;
        }
        await ctx.close();
        return out;
      },
      { file: relFile, peaksPerSecond: PEAKS_PER_SECOND, gamma: GAMMA }
    );

    var outName = path.basename(relFile).replace(/\.mp3$/, ".json");
    var outPath = path.join(OUT_DIR, outName);
    fs.writeFileSync(outPath, JSON.stringify({
      peaksPerSecond: PEAKS_PER_SECOND, mode: "rms", gamma: GAMMA, peaks: peaks,
    }));
    var avg = peaks.reduce(function (a, b) { return a + b; }, 0) / peaks.length;
    var full = peaks.filter(function (v) { return v >= 0.99; }).length / peaks.length * 100;
    console.log(relFile + " -> assets/waveforms/" + outName + "  (" + peaks.length + " pics, moy " +
      avg.toFixed(2) + ", " + full.toFixed(1) + "% pleine hauteur, " + (Date.now() - t0) + "ms)");
  }

  await browser.close();
  console.log("Termine.");
})();
