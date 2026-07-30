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
  var page = await browser.newPage();
  await page.goto(BASE_URL + "/index.html", { waitUntil: "networkidle" });

  for (var idx = 0; idx < files.length; idx++) {
    var relFile = files[idx]; // ex: "./audio/01-half-dead.mp3"
    var t0 = Date.now();
    var peaks = await page.evaluate(
      async function (args) {
        var ctx = new (window.AudioContext || window.webkitAudioContext)();
        var buf = await fetch(args.file).then(function (r) { return r.arrayBuffer(); });
        var audioBuffer = await ctx.decodeAudioData(buf);
        var ch0 = audioBuffer.getChannelData(0);
        var ch1 = audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : null;
        var bucket = Math.max(1, Math.round(audioBuffer.sampleRate / args.peaksPerSecond));
        var total = Math.ceil(ch0.length / bucket);
        var out = new Array(total);
        for (var p = 0; p < total; p++) {
          var start = p * bucket, end = Math.min(start + bucket, ch0.length), max = 0;
          for (var i = start; i < end; i++) {
            var v = ch1 ? (Math.abs(ch0[i]) + Math.abs(ch1[i])) / 2 : Math.abs(ch0[i]);
            if (v > max) max = v;
          }
          out[p] = Math.round(max * 1000) / 1000;
        }
        await ctx.close();
        return out;
      },
      { file: relFile, peaksPerSecond: PEAKS_PER_SECOND }
    );

    var outName = path.basename(relFile).replace(/\.mp3$/, ".json");
    var outPath = path.join(OUT_DIR, outName);
    fs.writeFileSync(outPath, JSON.stringify({ peaksPerSecond: PEAKS_PER_SECOND, peaks: peaks }));
    console.log(relFile + " -> assets/waveforms/" + outName + "  (" + peaks.length + " pics, " + (Date.now() - t0) + "ms)");
  }

  await browser.close();
  console.log("Termine.");
})();
