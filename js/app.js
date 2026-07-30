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

  document.title = (data.title || "Album") + (data.artist ? " — " + data.artist : "");
  // Artiste + annee incrustes en petit en haut de la pochette (plus de bloc
  // texte separe en dessous) pour ne pas allonger la home pour rien.
  var coverMeta = $("cover-meta");
  if (coverMeta) coverMeta.textContent = [data.artist, data.year].filter(Boolean).join(" · ");

  var descEl = $("description");
  descEl.textContent = data.description || "";
  descEl.hidden = !data.description;

  var linksEl = $("links");
  var anyLinks = false;
  (function renderLinks() {
    var links = data.links || {};
    var labels = { soundcloud: "SoundCloud", bandcamp: "Bandcamp", instagram: "Instagram", website: "Site" };
    Object.keys(labels).forEach(function (key) {
      if (!links[key]) return;
      anyLinks = true;
      var a = el("a", "link", labels[key]);
      a.href = links[key]; a.target = "_blank"; a.rel = "noopener noreferrer";
      linksEl.appendChild(a);
    });
  })();
  linksEl.hidden = !anyLinks;
  // Le conteneur lui-meme n'a pas a reserver d'espace (gap du flex parent)
  // quand description et liens sont tous les deux vides.
  var albumMetaEl = document.querySelector(".album-meta");
  if (albumMetaEl) albumMetaEl.hidden = !data.description && !anyLinks;

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
    data.tracks.forEach(function (t, i) {
      var li = el("li", "track");
      var btn = el("button", "track-btn");
      btn.type = "button";
      btn.setAttribute("aria-label", "Lire " + (t.title || "morceau " + (i + 1)));

      // Carte : image pleine largeur, numero/titre/duree incrustes dessus
      // (pas au-dessus) pour ne pas allonger la liste pour rien.
      var card = el("div", "track-card");
      if (t.scene) {
        var scene = el("div", "track-scene");
        scene.style.backgroundImage = "url('" + t.scene + "')";
        scene.setAttribute("aria-hidden", "true");
        card.appendChild(scene);
      }
      card.appendChild(el("div", "track-scrim"));

      var info = el("div", "track-info");
      var infoTop = el("div", "track-info-top");
      var num = el("span", "track-num mono", ("0" + (t.number != null ? t.number : i + 1)).slice(-2));
      var eq = el("span", "track-eq"); eq.setAttribute("aria-hidden", "true");
      eq.innerHTML = "<i></i><i></i><i></i>";
      var dur = el("span", "track-dur");
      // duree connue d'avance (champ 'duration' ou bornes start/end)
      var d = null;
      if (typeof t.duration === "number") d = t.duration;
      else if (typeof t.start === "number" && typeof t.end === "number") d = t.end - t.start;
      dur.textContent = d != null ? formatTime(d) : "";

      infoTop.appendChild(num);
      infoTop.appendChild(eq);
      infoTop.appendChild(dur);
      info.appendChild(infoTop);
      info.appendChild(el("div", "track-title", t.title || "Sans titre"));
      card.appendChild(info);
      btn.appendChild(card);

      btn.addEventListener("click", function () { player.select(i); });
      li.appendChild(btn);
      list.appendChild(li);
      trackEls.push({ li: li, btn: btn, dur: dur });
    });
  })();

  // ---------------------------------------------------------------- Lyrics
  var lyricsSection = $("lyrics-section");
  var lyricsBody = $("lyrics-body");
  var lyricsCredits = $("lyrics-credits");
  var lyricsBox = $("lyrics-box");
  var lyricsBannerImg = $("lyrics-banner-img");
  var lyricsBannerArtist = $("lyrics-banner-artist");
  var lyricsBannerTrack = $("lyrics-banner-track");
  var lyricsBg = $("lyrics-bg");
  var waveformCanvasAccent = $("waveform-canvas-accent");
  var waveformCanvasGray = $("waveform-canvas-gray");
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
    var hasCredits = track && track.credits;
    // La section reste toujours accessible en plein ecran (bandeau + fond
    // panoramiques valables meme sans paroles).
    lyricsSection.hidden = false;
    if (hasCredits) { lyricsCredits.textContent = track.credits; lyricsCredits.hidden = false; }
    else lyricsCredits.hidden = true;

    currentLyrics.lines.forEach(function (line) {
      var d = el("div", "lyric-line", line.text || " ");
      d.setAttribute("role", "listitem");
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

  // La ligne active se cale plus haut (32% au lieu du centre) qu'un simple
  // centrage : sinon, sur une phrase longue (ou avec la ligne "near"
  // suivante), le bas du texte se retrouve sous le panel du lecteur fixe en
  // bas de l'ecran.
  function autoScrollTo(node) {
    var box = lyricsBox;
    var target = node.offsetTop - box.clientHeight * 0.32 + node.clientHeight / 2;
    if (reduceMotion || typeof box.scrollTo !== "function") box.scrollTop = target;
    else box.scrollTo({ top: target, behavior: "smooth" });
  }

  // ------------------------------------------------------- Spectre (header)
  // Fenetre glissante de 20s (10 avant / 10 apres la position courante),
  // cue rouge fixe au centre. Les pics sont PRECALCULES a la construction du
  // site (voir scripts/gen-waveforms, sortie dans assets/waveforms/*.json) :
  // un petit JSON de quelques Ko charge quasi instantanement. Si le JSON
  // manque pour une piste, on retombe sur un decodage Web Audio en direct.
  //
  // Le spectre de la piste entiere est dessine UNE SEULE FOIS (deux bitmaps :
  // deja-joue en bleu, a-venir en gris), et le defilement pendant la lecture
  // se fait ensuite par simple translateX sur ces bitmaps deja rendus —
  // anime par le compositeur (GPU), sans redessiner un seul pixel a chaque
  // frame. La premiere version redessinait ~200 barres par frame et restait
  // saccadee meme optimisee ; ceci est l'approche standard pour un defilement
  // fluide (c'est ainsi que fonctionnent la plupart des lecteurs a spectre).
  var waveformCtx = null;
  var waveformCache = {}; // fichier -> { peaks, pps }
  var waveformPeaksPerSecond = 10; // valeur par defaut, utilisee par le decodage de secours
  var waveformCurrentPeaks = null;
  var waveformCurrentPPS = waveformPeaksPerSecond;
  var waveformCurrentFile = null;
  var waveformRAF = null;
  var waveformColors = null;
  var waveformScale = 0; // px CSS par seconde, fige au moment du rendu des bitmaps
  var waveformHalfWidth = 0; // moitie de la largeur CSS de #waveform
  var WAVEFORM_MAX_PX_WIDTH = 12000; // securite : reste large sous les limites connues de <canvas>

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
      buildWaveformBitmaps();
      updateWaveformScroll();
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
    if (!file) return;
    var cached = waveformCache[file];
    if (cached) {
      waveformCurrentPeaks = cached.peaks;
      waveformCurrentPPS = cached.pps;
      buildWaveformBitmaps();
      updateWaveformScroll();
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

  // Rendu unique du spectre complet de la piste, en deux exemplaires colores
  // (deja-joue / a-venir). Rappele sur chargement de nouveaux pics et sur
  // redimensionnement (l'echelle px/seconde depend de la largeur du bandeau).
  function buildWaveformBitmaps() {
    if (!waveformEl || !waveformCanvasAccent || !waveformCanvasGray) return;
    var peaks = waveformCurrentPeaks;
    if (!peaks || !peaks.length) return;
    var stripWidth = waveformEl.getBoundingClientRect().width;
    if (!stripWidth) return;
    waveformHalfWidth = stripWidth / 2;
    waveformScale = stripWidth / 20; // px CSS / seconde (fenetre de reference 20s)

    var pps = waveformCurrentPPS || waveformPeaksPerSecond;
    var cssHeight = waveformEl.clientHeight || 40;
    var cssWidth = Math.max(1, Math.ceil((peaks.length / pps) * waveformScale));
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (cssWidth * dpr > WAVEFORM_MAX_PX_WIDTH) dpr = WAVEFORM_MAX_PX_WIDTH / cssWidth;
    var pxWidth = Math.max(1, Math.round(cssWidth * dpr));
    var pxHeight = Math.max(1, Math.round(cssHeight * dpr));

    if (!waveformColors) {
      var cs = getComputedStyle(document.documentElement);
      waveformColors = {
        played: (cs.getPropertyValue("--accent") || "#4fc3f7").trim(),
        upcoming: "rgba(139, 149, 161, 0.55)",
      };
    }

    var barW = Math.max(1, (pxWidth / peaks.length) * 0.7);
    var midY = pxHeight / 2;
    var maxBarH = pxHeight * 0.86;

    [
      { canvas: waveformCanvasAccent, color: waveformColors.played },
      { canvas: waveformCanvasGray, color: waveformColors.upcoming },
    ].forEach(function (layer) {
      var canvas = layer.canvas;
      canvas.width = pxWidth;
      canvas.height = pxHeight;
      canvas.style.width = cssWidth + "px";
      canvas.style.height = cssHeight + "px";
      var g = canvas.getContext("2d");
      g.clearRect(0, 0, pxWidth, pxHeight);
      g.fillStyle = layer.color;
      g.beginPath();
      for (var i = 0; i < peaks.length; i++) {
        var x = (i / peaks.length) * pxWidth;
        var barH = Math.max(1, Math.min(1, peaks[i] * 1.15) * maxBarH);
        g.rect(x - barW / 2, midY - barH / 2, barW, barH);
      }
      g.fill();
    });
  }

  // Seule fonction appelee a chaque frame pendant la lecture : deux
  // affectations de style (transform), rien d'autre. C'est ce qui rend le
  // defilement fluide, y compris sur mobile bas de gamme.
  function updateWaveformScroll() {
    if (!lyricsSection.classList.contains("fullscreen")) return;
    if (!waveformCurrentPeaks || !waveformCurrentPeaks.length || !waveformScale) return;
    var x = player.relPosition() * waveformScale;
    waveformCanvasAccent.style.transform = "translateX(" + (waveformHalfWidth - x) + "px)";
    waveformCanvasGray.style.transform = "translateX(" + -x + "px)";
  }

  function waveformTick() {
    updateWaveformScroll();
    waveformRAF = requestAnimationFrame(waveformTick);
  }
  function startWaveformLoop() {
    if (waveformRAF) return;
    waveformRAF = requestAnimationFrame(waveformTick);
  }
  function stopWaveformLoop() {
    if (waveformRAF) { cancelAnimationFrame(waveformRAF); waveformRAF = null; }
  }
  window.addEventListener("resize", function () {
    if (lyricsSection.classList.contains("fullscreen")) { buildWaveformBitmaps(); updateWaveformScroll(); }
  });

  // Le spectre se deplace au doigt : on tire le ruban, la cue ne bouge pas.
  // Glisser vers la droite fait apparaitre le passe (rewind), vers la
  // gauche l'a-venir (avance) — comme si on tirait une bande physique.
  var waveformDrag = null;
  if (waveformEl) {
    waveformEl.addEventListener("pointerdown", function (ev) {
      if (!waveformCurrentPeaks || !waveformScale) return;
      waveformDrag = { startX: ev.clientX, startPos: player.relPosition() };
      waveformEl.classList.add("waveform-dragging");
      if (waveformEl.setPointerCapture) { try { waveformEl.setPointerCapture(ev.pointerId); } catch (e) {} }
      ev.preventDefault();
    });
    waveformEl.addEventListener("pointermove", function (ev) {
      if (!waveformDrag) return;
      var dx = ev.clientX - waveformDrag.startX;
      var dur = player.relDuration();
      var next = waveformDrag.startPos - dx / waveformScale;
      next = Math.max(0, isFinite(dur) ? Math.min(dur, next) : next);
      player.seekRelative(next);
      updateWaveformScroll();
    });
    var endWaveformDrag = function () { waveformDrag = null; waveformEl.classList.remove("waveform-dragging"); };
    waveformEl.addEventListener("pointerup", endWaveformDrag);
    waveformEl.addEventListener("pointercancel", endWaveformDrag);
  }

  function toggleFullscreen(on) {
    lyricsSection.classList.toggle("fullscreen", on);
    document.body.classList.toggle("lyrics-locked", on);
    if (miniBtn) miniBtn.setAttribute("aria-label", on ? "Revenir a la liste des titres" : "Plein ecran");
    if (on) syncLyrics(player.relPosition(), true);
    if (on) {
      loadWaveform(currentTrackRef);
      if (player.isPlaying()) startWaveformLoop(); else updateWaveformScroll();
    } else {
      stopWaveformLoop();
    }
  }
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
      else { stopWaveformLoop(); updateWaveformScroll(); }
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
    if (!waveformRAF) updateWaveformScroll();
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
