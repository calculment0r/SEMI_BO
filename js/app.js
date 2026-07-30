/*
 * app.js — Interface SEMI
 * Relie le moteur (player.js) au DOM : album, liste (avec durees), lecteur
 * compact, karaoke (gros lettrage, lignes voisines grisees, interlude), et
 * la scene cinema en fond (plan large de la piste en cours, pan lent, fondu
 * enchaine au changement de morceau).
 */

(function () {
  "use strict";

  var data = window.ALBUM_DATA;
  var audio = document.getElementById("audio-player");

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function showError(message) {
    var b = $("error-banner");
    if (!b) return;
    b.textContent = message;
    b.hidden = false;
    clearTimeout(showError._t);
    showError._t = setTimeout(function () { b.hidden = true; }, 6000);
  }
  function formatTime(sec) {
    if (typeof sec !== "number" || !isFinite(sec) || sec < 0) return "0:00";
    var s = Math.floor(sec), m = Math.floor(s / 60), r = s % 60;
    return m + ":" + (r < 10 ? "0" : "") + r;
  }
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Garde --player-h synchronise avec la vraie hauteur du lecteur fixe (elle
  // varie avec env(safe-area-inset-bottom) sur iPhone a encoche / Dynamic
  // Island). Sans ca, le bas de la page (dont les derniers titres de la
  // liste) peut se retrouver cache sous le lecteur.
  (function watchPlayerHeight() {
    var playerEl = document.querySelector(".player");
    if (!playerEl) return;
    function sync() {
      document.documentElement.style.setProperty("--player-h", playerEl.offsetHeight + "px");
    }
    sync();
    if ("ResizeObserver" in window) {
      // box: "border-box" est indispensable ici : la hauteur du lecteur
      // change surtout par son padding-bottom (env(safe-area-inset-bottom)),
      // pas par la taille de son contenu. En "content-box" (par defaut),
      // l'observer ne se declenche pas quand seul le padding bouge.
      new ResizeObserver(sync).observe(playerEl, { box: "border-box" });
    } else {
      window.addEventListener("resize", sync);
      window.addEventListener("orientationchange", sync);
    }
  })();

  if (!data || typeof data !== "object" || !Array.isArray(data.tracks) || data.tracks.length === 0) {
    showError("Configuration de l'album invalide. Verifie js/album-data.js.");
    return;
  }

  // ---------------------------------------------------------------- Header
  var cover = $("cover");
  if (data.cover) {
    cover.src = data.cover;
    cover.onerror = function () { cover.style.opacity = "0"; };
  }
  cover.alt = "Pochette de l'album " + (data.title || "");
  // La vignette du lecteur (mini-cover) est mise a jour par piste dans
  // updateTrackVisuals ; cover-512 sert juste de repli avant le 1er morceau.
  var miniCover = $("mini-cover");
  if (miniCover) miniCover.src = data.artwork512 || data.cover || "";

  $("artist").textContent = data.artist || "";
  document.title = (data.title || "Album") + (data.artist ? " — " + data.artist : "");
  $("year").textContent = data.year || "";
  $("description").textContent = data.description || "";
  var playerBrand = $("player-brand");
  if (playerBrand) playerBrand.textContent = data.title || "";

  (function renderLinks() {
    var wrap = $("links"), links = data.links || {};
    var labels = { soundcloud: "SoundCloud", bandcamp: "Bandcamp", instagram: "Instagram", website: "Site" };
    Object.keys(labels).forEach(function (key) {
      if (!links[key]) return;
      var a = el("a", "link", labels[key]);
      a.href = links[key]; a.target = "_blank"; a.rel = "noopener noreferrer";
      wrap.appendChild(a);
    });
  })();

  // ---------------------------------------------------------------- Scene (fond cinema)
  // Deux calques superposes pour un fondu enchaine ; chacun pan lentement sur
  // toute la largeur de son image (cf. .scene-layer / @keyframes scene-pan).
  var sceneLayers = [$("scene-a"), $("scene-b")];
  var sceneOnIndex = -1;

  function restartPan(layer) {
    layer.style.animation = "none";
    void layer.offsetWidth; // force le reflow -> relance l'animation depuis le debut
    layer.style.animation = "";
  }

  function setScene(url) {
    if (!url) return;
    var nextIndex = sceneOnIndex === 0 ? 1 : 0;
    var next = sceneLayers[nextIndex];
    var prev = sceneOnIndex >= 0 ? sceneLayers[sceneOnIndex] : null;
    if (!next) return;
    next.style.backgroundImage = "url('" + url + "')";
    restartPan(next);
    requestAnimationFrame(function () {
      next.classList.add("on");
      if (prev) prev.classList.remove("on");
    });
    sceneOnIndex = nextIndex;
  }

  // ---------------------------------------------------------------- Tracklist
  var trackEls = [];
  (function renderTracks() {
    var list = $("tracklist");
    var count = $("tracks-count");
    if (count) count.textContent = ("0" + data.tracks.length).slice(-2) + " titres";
    data.tracks.forEach(function (t, i) {
      var li = el("li", "track");
      var btn = el("button", "track-btn");
      btn.type = "button";
      btn.setAttribute("aria-label", "Lire " + (t.title || "morceau " + (i + 1)));

      var top = el("div", "track-top");
      var num = el("span", "track-num mono", ("0" + (t.number != null ? t.number : i + 1)).slice(-2));
      var main = el("div", "track-main");
      main.appendChild(el("div", "track-title", t.title || "Sans titre"));
      var eq = el("span", "track-eq"); eq.setAttribute("aria-hidden", "true");
      eq.innerHTML = "<i></i><i></i><i></i>";
      var dur = el("span", "track-dur");
      // duree connue d'avance (champ 'duration' ou bornes start/end)
      var d = null;
      if (typeof t.duration === "number") d = t.duration;
      else if (typeof t.start === "number" && typeof t.end === "number") d = t.end - t.start;
      dur.textContent = d != null ? formatTime(d) : "";

      top.appendChild(num);
      top.appendChild(main);
      top.appendChild(eq);
      top.appendChild(dur);
      btn.appendChild(top);

      if (t.scene) {
        var scene = el("div", "track-scene");
        scene.style.backgroundImage = "url('" + t.scene + "')";
        scene.setAttribute("aria-hidden", "true");
        btn.appendChild(scene);
      }

      btn.addEventListener("click", function () { player.select(i); });
      li.appendChild(btn);
      list.appendChild(li);
      trackEls.push({ li: li, btn: btn, dur: dur });
    });
  })();

  // ---------------------------------------------------------------- Lyrics
  var lyricsSection = $("lyrics-section");
  var lyricsHead = $("lyrics-head");
  var lyricsFsBtn = $("lyrics-fullscreen");
  var lyricsBody = $("lyrics-body");
  var lyricsCredits = $("lyrics-credits");
  var lyricsBox = $("lyrics-box");
  var lyricsBannerImg = $("lyrics-banner-img");
  var lyricsBannerArtist = $("lyrics-banner-artist");
  var lyricsBannerTrack = $("lyrics-banner-track");
  var lyricsBg = $("lyrics-bg");
  var waveformCanvas = $("waveform-canvas");
  var waveformEl = $("waveform");

  // Visuel de la piste courante : vignette du lecteur, bandeau + fond du
  // plein ecran. Meme image (t.scene) partout, chacun avec son propre cadrage.
  function updateTrackVisuals(track) {
    var url = track && track.scene;
    if (url && miniCover) miniCover.src = url;
    if (url && lyricsBannerImg) lyricsBannerImg.style.backgroundImage = "url('" + url + "')";
    if (url && lyricsBg) lyricsBg.style.backgroundImage = "url('" + url + "')";
    if (lyricsBannerArtist) lyricsBannerArtist.textContent = data.artist || "";
    if (lyricsBannerTrack) lyricsBannerTrack.textContent = (track && track.title) || "";
  }

  var currentLyrics = { synced: false, lines: [] };
  var lineEls = [];
  var activeLine = -1;
  var userScrollUntil = 0;
  var currentTrackRef = null;

  function parseLyrics(raw) {
    if (typeof raw !== "string" || raw.trim() === "") return { synced: false, lines: [] };
    var tag = /\[(\d{1,2}):(\d{1,2}(?:[.:]\d{1,3})?)\]/g;
    var rows = raw.split(/\r?\n/), timed = [], plain = [], hasTimed = false;
    rows.forEach(function (row) {
      var matches = [], m; tag.lastIndex = 0;
      while ((m = tag.exec(row)) !== null) {
        matches.push(parseInt(m[1], 10) * 60 + parseFloat(m[2].replace(":", ".")));
      }
      var text = row.replace(tag, "").trim();
      if (matches.length) { hasTimed = true; matches.forEach(function (t) { timed.push({ t: t, text: text }); }); }
      else plain.push({ t: null, text: text });
    });
    if (hasTimed) { timed.sort(function (a, b) { return a.t - b.t; }); return { synced: true, lines: timed }; }
    return { synced: false, lines: plain };
  }

  function loadLyrics(track) {
    currentLyrics = parseLyrics(track && track.lyrics);
    activeLine = -1; lineEls = []; lyricsBox.innerHTML = "";
    var hasLyrics = currentLyrics.lines.length > 0;
    var hasCredits = track && track.credits;
    // La section reste toujours accessible en plein ecran (bandeau + fond
    // panoramiques valables meme sans paroles) ; seule la ligne "PAROLES"
    // (inline et plein ecran) se masque quand il n'y a rien a lire.
    lyricsSection.hidden = false;
    lyricsHead.hidden = !(hasLyrics || hasCredits);
    lyricsFsBtn.hidden = !hasLyrics;
    if (hasCredits) { lyricsCredits.textContent = track.credits; lyricsCredits.hidden = false; }
    else lyricsCredits.hidden = true;

    currentLyrics.lines.forEach(function (line, i) {
      var d = el("div", "lyric-line", line.text || " ");
      d.setAttribute("role", "listitem");
      if (currentLyrics.synced) {
        d.classList.add("seekable");
        // Double-clic/double-tap expres : un simple clic doit rester un
        // geste de lecture/scroll normal, pas deplacer la tete de lecture.
        d.addEventListener("dblclick", function () {
          player.seekRelative(line.t);
          if (!player.isPlaying()) player.play();
        });
      }
      lyricsBox.appendChild(d);
      lineEls.push(d);
    });
    syncLyrics(player.relPosition(), true);
  }

  function syncLyrics(position, force) {
    if (!currentLyrics.synced || lineEls.length === 0) return;
    var lines = currentLyrics.lines;
    var idx = -1;
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].t <= position + 0.15) idx = i; else break;
    }
    if (idx === -1) idx = 0;
    if (idx !== activeLine || force) {
      lineEls.forEach(function (n) { n.classList.remove("active", "near", "waiting"); });
      activeLine = idx;
      var node = lineEls[idx];
      if (node) {
        node.classList.add("active");
        if (lineEls[idx - 1]) lineEls[idx - 1].classList.add("near");
        if (lineEls[idx + 1]) lineEls[idx + 1].classList.add("near");
        autoScrollTo(node);
      }
    }
    updateWaiting(idx, position);
  }

  // Grand ecart instrumental : marque la ligne active "waiting" (points animes).
  function updateWaiting(idx, position) {
    var node = lineEls[idx];
    if (!node) return;
    var lines = currentLyrics.lines;
    var cur = lines[idx].t;
    var nxt = idx + 1 < lines.length ? lines[idx + 1].t : player.relDuration();
    if (!isFinite(nxt)) nxt = cur + 4;
    var gap = nxt - cur, into = position - cur, toNext = nxt - position;
    node.classList.toggle("waiting", gap > 6 && into > 3.5 && toNext > 2);
  }

  function autoScrollTo(node) {
    if (Date.now() < userScrollUntil) return;
    var box = lyricsBox;
    var target = node.offsetTop - box.clientHeight / 2 + node.clientHeight / 2;
    if (reduceMotion || typeof box.scrollTo !== "function") box.scrollTop = target;
    else box.scrollTo({ top: target, behavior: "smooth" });
  }

  lyricsBox.addEventListener("wheel", function () { userScrollUntil = Date.now() + 4000; });
  lyricsBox.addEventListener("touchmove", function () { userScrollUntil = Date.now() + 4000; });

  // ------------------------------------------------------- Spectre (header)
  // Fenetre glissante de 20s (10 avant / 10 apres la position courante)
  // dessinee sur un canvas, cue rouge fixe au centre. Les pics sont
  // PRECALCULES a la construction du site (voir scripts/gen-waveforms, sortie
  // dans assets/waveforms/*.json) : un petit JSON de quelques Ko charge quasi
  // instantanement, plutot que retelecharger + redecoder le mp3 entier (des
  // Mo) a chaque ouverture du plein ecran. Si le JSON precalcule manque pour
  // une piste, on retombe sur un decodage Web Audio en direct dans le
  // navigateur, plus lent mais fonctionnel.
  var waveformCtx = null;
  var waveformCache = {}; // fichier -> { peaks, pps }
  var waveformPeaksPerSecond = 10; // valeur par defaut, utilisee par le decodage de secours
  var waveformCurrentPeaks = null;
  var waveformCurrentPPS = waveformPeaksPerSecond;
  var waveformCurrentFile = null;
  var waveformRAF = null;
  var waveformColors = null;

  function waveformAudioCtx() {
    if (waveformCtx) return waveformCtx;
    var Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    try { waveformCtx = new Ctor(); } catch (e) { waveformCtx = null; }
    return waveformCtx;
  }

  function precomputedWaveformPath(file) {
    return file.replace("/audio/", "/assets/waveforms/").replace(/\.mp3(\?.*)?$/i, ".json");
  }

  function extractPeaks(buffer) {
    var ch0 = buffer.getChannelData(0);
    var ch1 = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : null;
    var bucket = Math.max(1, Math.round(buffer.sampleRate / waveformPeaksPerSecond));
    var total = Math.ceil(ch0.length / bucket);
    var peaks = new Float32Array(total);
    for (var p = 0; p < total; p++) {
      var start = p * bucket, end = Math.min(start + bucket, ch0.length), max = 0;
      for (var i = start; i < end; i++) {
        var v = ch1 ? (Math.abs(ch0[i]) + Math.abs(ch1[i])) / 2 : Math.abs(ch0[i]);
        if (v > max) max = v;
      }
      peaks[p] = max;
    }
    return peaks;
  }

  function applyWaveform(file, peaks, pps) {
    waveformCache[file] = { peaks: peaks, pps: pps };
    if (waveformCurrentFile === file) {
      waveformCurrentPeaks = peaks;
      waveformCurrentPPS = pps;
      drawWaveformFrame();
    }
  }

  function decodeWaveformLive(file) {
    var ctx = waveformAudioCtx();
    if (!ctx) return; // Web Audio indisponible : le spectre reste vide, la lecture n'est pas affectee
    fetch(file)
      .then(function (r) { return r.arrayBuffer(); })
      .then(function (buf) { return ctx.decodeAudioData(buf); })
      .then(function (audioBuffer) { applyWaveform(file, extractPeaks(audioBuffer), waveformPeaksPerSecond); })
      .catch(function () { /* spectre indisponible pour ce morceau : pas bloquant */ });
  }

  function loadWaveform(track) {
    var file = track && track.file;
    waveformCurrentPeaks = null;
    waveformCurrentFile = file || null;
    if (!file) { drawWaveformFrame(); return; }
    var cached = waveformCache[file];
    if (cached) {
      waveformCurrentPeaks = cached.peaks;
      waveformCurrentPPS = cached.pps;
      drawWaveformFrame();
      return;
    }
    fetch(precomputedWaveformPath(file))
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (data) {
        if (!data || !Array.isArray(data.peaks) || !data.peaks.length) return Promise.reject();
        applyWaveform(file, data.peaks, data.peaksPerSecond || waveformPeaksPerSecond);
      })
      .catch(function () { decodeWaveformLive(file); });
  }

  function ensureCanvasSize() {
    if (!waveformCanvas) return;
    var rect = waveformCanvas.getBoundingClientRect();
    // Plafonne le DPR : au-dela de 2x, invisible sur ce petit bandeau mais
    // ca double/triple le nombre de pixels a remplir a chaque frame.
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(1, Math.round(rect.width * dpr));
    var h = Math.max(1, Math.round(rect.height * dpr));
    if (waveformCanvas.width !== w || waveformCanvas.height !== h) {
      waveformCanvas.width = w;
      waveformCanvas.height = h;
    }
  }

  // Dessine tout le "passe" en un seul chemin/fill, puis tout "l'a-venir" en
  // un seul autre : deux changements de fillStyle et deux fill() par frame
  // au lieu d'un fillRect individuel (avec son propre changement de style)
  // par barre — c'etait la principale source de rame sur mobile.
  function drawWaveformFrame() {
    if (!waveformCanvas || !lyricsSection.classList.contains("fullscreen")) return;
    var g = waveformCanvas.getContext("2d");
    if (!g) return;
    var cw = waveformCanvas.width, ch = waveformCanvas.height;
    g.clearRect(0, 0, cw, ch);
    var peaks = waveformCurrentPeaks;
    if (!peaks || !peaks.length || !cw) return;
    if (!waveformColors) {
      var cs = getComputedStyle(document.documentElement);
      waveformColors = {
        played: (cs.getPropertyValue("--accent") || "#4fc3f7").trim(),
        upcoming: "rgba(139, 149, 161, 0.4)",
      };
    }
    var pps = waveformCurrentPPS || waveformPeaksPerSecond;
    var pos = player.relPosition();
    var windowSec = 20, half = windowSec / 2;
    var t0 = pos - half, t1 = pos + half;
    var pxPerSec = cw / windowSec;
    var barW = Math.max(1, (pxPerSec / pps) * 0.7);
    var midY = ch / 2;
    var maxBarH = ch * 0.86;
    var startIdx = Math.max(0, Math.floor(t0 * pps));
    var endIdx = Math.min(peaks.length - 1, Math.ceil(t1 * pps));
    var splitIdx = Math.floor(pos * pps);

    function addBar(i) {
      var peakTime = i / pps;
      var x = (peakTime - t0) * pxPerSec;
      var barH = Math.max(1, Math.min(1, peaks[i] * 1.15) * maxBarH);
      g.rect(x - barW / 2, midY - barH / 2, barW, barH);
    }
    g.fillStyle = waveformColors.played;
    g.beginPath();
    for (var i = startIdx; i <= Math.min(endIdx, splitIdx); i++) addBar(i);
    g.fill();
    g.fillStyle = waveformColors.upcoming;
    g.beginPath();
    for (var j = Math.max(startIdx, splitIdx + 1); j <= endIdx; j++) addBar(j);
    g.fill();

    // Degrade gauche/droite peint directement sur le bitmap (destination-out
    // = efface l'alpha existant) au lieu d'un mask-image CSS, recalcule par
    // le compositeur a chaque frame tant que le canvas change.
    var fadeW = cw * 0.16;
    g.globalCompositeOperation = "destination-out";
    var gradL = g.createLinearGradient(0, 0, fadeW, 0);
    gradL.addColorStop(0, "rgba(0,0,0,1)");
    gradL.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gradL;
    g.fillRect(0, 0, fadeW, ch);
    var gradR = g.createLinearGradient(cw - fadeW, 0, cw, 0);
    gradR.addColorStop(0, "rgba(0,0,0,0)");
    gradR.addColorStop(1, "rgba(0,0,0,1)");
    g.fillStyle = gradR;
    g.fillRect(cw - fadeW, 0, fadeW, ch);
    g.globalCompositeOperation = "source-over";
  }

  // ~30fps suffit largement pour un defilement de ce type et coute deux fois
  // moins cher qu'a la frequence native de l'ecran (60-120Hz).
  var waveformLastDraw = 0;
  function waveformTick(ts) {
    if (!waveformLastDraw || ts - waveformLastDraw >= 33) {
      waveformLastDraw = ts;
      drawWaveformFrame();
    }
    waveformRAF = requestAnimationFrame(waveformTick);
  }
  function startWaveformLoop() {
    if (waveformRAF) return;
    waveformLastDraw = 0;
    waveformRAF = requestAnimationFrame(waveformTick);
  }
  function stopWaveformLoop() {
    if (waveformRAF) { cancelAnimationFrame(waveformRAF); waveformRAF = null; }
  }
  window.addEventListener("resize", function () {
    if (lyricsSection.classList.contains("fullscreen")) { ensureCanvasSize(); drawWaveformFrame(); }
  });

  // Le spectre se deplace au doigt : on tire le ruban, la cue ne bouge pas.
  // Glisser vers la droite fait apparaitre le passe (rewind), vers la
  // gauche l'a-venir (avance) — comme si on tirait une bande physique.
  var waveformDrag = null;
  if (waveformEl) {
    waveformEl.addEventListener("pointerdown", function (ev) {
      if (!waveformCurrentPeaks) return;
      var rect = waveformCanvas.getBoundingClientRect();
      waveformDrag = { startX: ev.clientX, startPos: player.relPosition(), cssPxPerSec: rect.width / 20 };
      if (waveformEl.setPointerCapture) { try { waveformEl.setPointerCapture(ev.pointerId); } catch (e) {} }
      ev.preventDefault();
    });
    waveformEl.addEventListener("pointermove", function (ev) {
      if (!waveformDrag) return;
      var dx = ev.clientX - waveformDrag.startX;
      var dur = player.relDuration();
      var next = waveformDrag.startPos - dx / waveformDrag.cssPxPerSec;
      next = Math.max(0, isFinite(dur) ? Math.min(dur, next) : next);
      player.seekRelative(next);
      drawWaveformFrame();
    });
    var endWaveformDrag = function () { waveformDrag = null; };
    waveformEl.addEventListener("pointerup", endWaveformDrag);
    waveformEl.addEventListener("pointercancel", endWaveformDrag);
  }

  function toggleFullscreen(on) {
    lyricsSection.classList.toggle("fullscreen", on);
    document.body.classList.toggle("lyrics-locked", on);
    lyricsFsBtn.setAttribute("aria-label", on ? "Quitter le plein ecran" : "Paroles en plein ecran");
    if (miniBtn) miniBtn.setAttribute("aria-label", on ? "Revenir a la liste des titres" : "Plein ecran");
    if (on) syncLyrics(player.relPosition(), true);
    if (on) {
      ensureCanvasSize();
      loadWaveform(currentTrackRef);
      if (player.isPlaying()) startWaveformLoop(); else drawWaveformFrame();
    } else {
      stopWaveformLoop();
    }
  }
  lyricsFsBtn.addEventListener("click", function () {
    toggleFullscreen(!lyricsSection.classList.contains("fullscreen"));
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lyricsSection.classList.contains("fullscreen")) toggleFullscreen(false);
  });

  // Vignette du lecteur -> bascule plein ecran (bandeau + fond + paroles).
  // Re-cliquer dessus en plein ecran revient a la liste des titres.
  var miniBtn = $("mini-cover-btn");
  if (miniBtn) {
    miniBtn.addEventListener("click", function () {
      toggleFullscreen(!lyricsSection.classList.contains("fullscreen"));
    });
  }

  // ---------------------------------------------------------------- Moteur
  var player = window.createPlayer(audio, data);

  var npTitle = $("np-title");
  var btnPlay = $("btn-play");
  var progress = $("progress");
  var progressFill = $("progress-fill");
  var progressKnob = $("progress-knob");
  var timeCurrent = $("time-current");
  var timeDuration = $("time-duration");

  player.on("trackchange", function (e) {
    var t = e.track || {};
    currentTrackRef = t;
    npTitle.textContent = t.title || "";
    trackEls.forEach(function (ref, i) {
      var active = i === e.index;
      ref.li.classList.toggle("current", active);
      if (active) ref.btn.setAttribute("aria-current", "true");
      else ref.btn.removeAttribute("aria-current");
    });
    // Chacun dans son try/catch : une erreur dans l'un ne doit jamais
    // empecher les autres de s'appliquer.
    try { loadLyrics(t); } catch (err) { console.error("[app] loadLyrics:", err); }
    try { setScene(t.scene); } catch (err) { console.error("[app] setScene:", err); }
    try { updateTrackVisuals(t); } catch (err) { console.error("[app] updateTrackVisuals:", err); }
    // Le spectre ne se (re)decode que si le plein ecran est deja ouvert
    // (sinon on attend que l'utilisateur y entre pour eviter de decoder de
    // l'audio en arriere-plan pour rien).
    if (lyricsSection.classList.contains("fullscreen")) {
      try { loadWaveform(t); } catch (err) { console.error("[app] loadWaveform:", err); }
    }
  });

  player.on("playstate", function (e) {
    btnPlay.classList.toggle("is-playing", e.playing);
    btnPlay.setAttribute("aria-label", e.playing ? "Pause" : "Lecture");
    document.body.classList.toggle("is-playing", e.playing);
    if (lyricsSection.classList.contains("fullscreen")) {
      if (e.playing) startWaveformLoop();
      else { stopWaveformLoop(); drawWaveformFrame(); }
    }
  });

  player.on("time", function (e) {
    var dur = e.duration, pos = e.position;
    var pct = isFinite(dur) && dur > 0 ? Math.max(0, Math.min(100, (pos / dur) * 100)) : 0;
    progressFill.style.width = pct + "%";
    progressKnob.style.left = pct + "%";
    progress.setAttribute("aria-valuenow", String(Math.round(pct)));
    progress.setAttribute("aria-valuetext", formatTime(pos) + " sur " + formatTime(dur));
    timeCurrent.textContent = formatTime(pos);
    timeDuration.textContent = formatTime(dur);
    syncLyrics(pos, false);
    // La boucle rAF redessine deja pendant la lecture ; ici on ne rattrape
    // que les cas ou elle est arretee (pause, seek manuel).
    if (!waveformRAF) drawWaveformFrame();
  });

  player.on("loaded", function (e) {
    // en mode "separate" sans champ duration, on complete apres chargement
    var ref = trackEls[e.index];
    if (ref && !ref.dur.textContent) ref.dur.textContent = formatTime(player.relDuration());
  });

  player.on("error", function (e) { showError(e.message || "Erreur de lecture."); });

  // ---------------------------------------------------------------- Transport
  btnPlay.addEventListener("click", function () { player.toggle(); });
  $("btn-next").addEventListener("click", function () { player.next(); });
  $("btn-prev").addEventListener("click", function () { player.previous(); });

  // ---------------------------------------------------------------- Progress
  function fractionFromEvent(ev) {
    var rect = progress.getBoundingClientRect();
    var x = ev.clientX;
    if (x == null && ev.touches && ev.touches[0]) x = ev.touches[0].clientX;
    return Math.max(0, Math.min(1, (x - rect.left) / rect.width));
  }
  var dragging = false;
  progress.addEventListener("pointerdown", function (ev) {
    dragging = true;
    if (progress.setPointerCapture) { try { progress.setPointerCapture(ev.pointerId); } catch (e) {} }
    player.seekFraction(fractionFromEvent(ev));
    ev.preventDefault();
  });
  progress.addEventListener("pointermove", function (ev) { if (dragging) player.seekFraction(fractionFromEvent(ev)); });
  function endDrag() { dragging = false; }
  progress.addEventListener("pointerup", endDrag);
  progress.addEventListener("pointercancel", endDrag);
  progress.addEventListener("keydown", function (ev) {
    var pos = player.relPosition(), dur = player.relDuration(), handled = true;
    switch (ev.key) {
      case "ArrowRight": case "ArrowUp": player.seekRelative(pos + 5); break;
      case "ArrowLeft": case "ArrowDown": player.seekRelative(pos - 5); break;
      case "Home": player.seekRelative(0); break;
      case "End": if (isFinite(dur)) player.seekRelative(dur - 0.5); break;
      default: handled = false;
    }
    if (handled) ev.preventDefault();
  });

  // ---------------------------------------------------------------- Volume
  var volumeSlider = $("volume");
  var iconVol = document.querySelector(".i-vol");
  var iconMute = document.querySelector(".i-mute");
  function refreshVolumeUI() {
    var muted = player.isMuted() || player.getVolume() === 0;
    if (iconVol) iconVol.style.display = muted ? "none" : "block";
    if (iconMute) iconMute.style.display = muted ? "block" : "none";
    $("btn-mute").setAttribute("aria-label", muted ? "Retablir le son" : "Couper le son");
    volumeSlider.value = String(player.getVolume());
  }
  volumeSlider.addEventListener("input", function () {
    player.setVolume(parseFloat(volumeSlider.value));
    if (player.isMuted() && parseFloat(volumeSlider.value) > 0) player.setMuted(false);
    refreshVolumeUI();
  });
  $("btn-mute").addEventListener("click", function () { player.toggleMute(); refreshVolumeUI(); });

  // ---------------------------------------------------------------- Raccourcis
  document.addEventListener("keydown", function (ev) {
    var tag = (ev.target && ev.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (ev.code === "Space" || ev.key === " ") { ev.preventDefault(); player.toggle(); }
  });

  // ---------------------------------------------------------------- Demarrage
  player.init();
  refreshVolumeUI();

  if ("serviceWorker" in navigator) {
    // Recharge une fois quand une nouvelle version du service worker prend
    // la main, pour ne jamais rester coince sur une interface en cache
    // pendant qu'on itere sur le site (album-data.js etc. suivent deja une
    // strategie reseau-d'abord, mais le fichier service-worker.js lui-meme
    // peut mettre un moment a etre redetecte par le navigateur).
    var reloadedForUpdate = false;
    navigator.serviceWorker.addEventListener("controllerchange", function () {
      if (reloadedForUpdate) return;
      reloadedForUpdate = true;
      window.location.reload();
    });
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./service-worker.js").catch(function () {});
    });
  }
})();
