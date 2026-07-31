/*
 * app.js — Interface SEMI
 * Relie le moteur (player.js) au DOM : album, playlist plate (une image de
 * fond statique derriere la liste), et le lecteur du bas en accordeon
 * (replie = mini-barre, deplie = grand visuel + spectre + ligne de parole
 * courante, lue depuis un fichier .lrc externe).
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

  var playerEl = document.querySelector(".player");

  // Garde --player-h synchronise avec la hauteur REPLIEE du lecteur fixe
  // (elle varie avec env(safe-area-inset-bottom) sur iPhone a encoche /
  // Dynamic Island). Sans ca, le bas de la page (dont les derniers titres de
  // la liste) peut se retrouver cache sous le lecteur. On ignore les
  // changements de hauteur pendant que l'accordeon est deplie : cet etat-la
  // recouvre volontairement la page, il ne doit pas lui reserver de place.
  (function watchPlayerHeight() {
    if (!playerEl) return;
    function sync() {
      if (playerEl.classList.contains("expanded")) return;
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
  // updateExpandVisuals ; cover-512 sert juste de repli avant le 1er morceau.
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

  // ---------------------------------------------------------------- Scene (fond playlist)
  // Deux calques superposes pour un fondu enchaine ; un seul visuel statique
  // affiche a la fois (pas d'animation en boucle, cf. styles.css).
  var sceneLayers = [$("scene-a"), $("scene-b")];
  var sceneOnIndex = -1;

  function setScene(url) {
    if (!url) return;
    var nextIndex = sceneOnIndex === 0 ? 1 : 0;
    var next = sceneLayers[nextIndex];
    var prev = sceneOnIndex >= 0 ? sceneLayers[sceneOnIndex] : null;
    if (!next) return;
    next.style.backgroundImage = "url('" + url + "')";
    requestAnimationFrame(function () {
      next.classList.add("on");
      if (prev) prev.classList.remove("on");
    });
    sceneOnIndex = nextIndex;
  }

  // ---------------------------------------------------------------- Tracklist
  // Playlist plate : une ligne fine par piste (numero, titre, duree), sans
  // visuel — le fond derriere la liste (setScene ci-dessus) suffit.
  var trackEls = [];
  (function renderTracks() {
    var list = $("tracklist");
    data.tracks.forEach(function (t, i) {
      var li = el("li", "track");
      var btn = el("button", "track-btn");
      btn.type = "button";
      btn.setAttribute("aria-label", "Lire " + (t.title || "morceau " + (i + 1)));

      var num = el("span", "track-num mono", ("0" + (t.number != null ? t.number : i + 1)).slice(-2));
      var title = el("span", "track-title", t.title || "Sans titre");
      var eq = el("span", "track-eq"); eq.setAttribute("aria-hidden", "true");
      eq.innerHTML = "<i></i><i></i><i></i>";
      var dur = el("span", "track-dur");
      // duree connue d'avance (champ 'duration' ou bornes start/end)
      var d = null;
      if (typeof t.duration === "number") d = t.duration;
      else if (typeof t.start === "number" && typeof t.end === "number") d = t.end - t.start;
      dur.textContent = d != null ? formatTime(d) : "";

      btn.appendChild(num);
      btn.appendChild(title);
      btn.appendChild(eq);
      btn.appendChild(dur);

      btn.addEventListener("click", function () {
        player.select(i);
        toggleExpand(true);
      });
      li.appendChild(btn);
      list.appendChild(li);
      trackEls.push({ li: li, btn: btn, dur: dur });
    });
  })();

  // ---------------------------------------------------------------- Lyrics (LRC)
  var expandScene = $("expand-scene");
  var expandArtist = $("expand-artist");
  var expandTrack = $("expand-track");
  var expandLyricLine = $("expand-lyric-line");
  var waveformCanvasAccent = $("waveform-canvas-accent");
  var waveformCanvasGray = $("waveform-canvas-gray");
  var waveformEl = $("waveform");
  var waveformCueTime = $("waveform-cue-time");

  // Visuel de la piste courante (accordeon deplie) + vignette du lecteur.
  // Meme image (t.scene) que le fond de la playlist, cadrage propre a
  // l'accordeon.
  function updateExpandVisuals(track) {
    var url = track && track.scene;
    if (url && miniCover) miniCover.src = url;
    if (url && expandScene) expandScene.style.backgroundImage = "url('" + url + "')";
    if (expandArtist) expandArtist.textContent = data.artist || "";
    if (expandTrack) expandTrack.textContent = (track && track.title) || "";
  }

  var currentLyrics = { synced: false, lines: [] };
  var activeLineIndex = -1;
  var currentTrackRef = null;
  var lyricsRequestId = 0;

  // Parseur LRC standard : une ligne par [mm:ss.xx]texte (plusieurs balises
  // sur une meme ligne sont supportees). Sans aucune balise de temps nulle
  // part dans le fichier, le texte est traite comme non synchronise (pas
  // affiche pour l'instant : l'accordeon n'affiche qu'une ligne courante,
  // qui suppose un temps connu).
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
      else if (text) plain.push({ t: null, text: text });
    });
    if (hasTimed) { timed.sort(function (a, b) { return a.t - b.t; }); return { synced: true, lines: timed }; }
    return { synced: false, lines: plain };
  }

  // Charge le .lrc de la piste de facon asynchrone. lyricsRequestId protege
  // contre une reponse perimee qui arriverait APRES un changement de piste
  // plus recent (l'utilisateur qui enchaine vite plusieurs morceaux) : seule
  // la derniere requete en date est appliquee.
  function loadLyrics(track) {
    currentLyrics = { synced: false, lines: [] };
    activeLineIndex = -1;
    if (expandLyricLine) expandLyricLine.textContent = "";
    var file = track && track.lyricsFile;
    if (!file) return;
    var requestId = ++lyricsRequestId;
    fetch(file)
      .then(function (r) { return r.ok ? r.text() : Promise.reject(); })
      .then(function (text) {
        if (requestId !== lyricsRequestId) return;
        currentLyrics = parseLyrics(text);
        activeLineIndex = -1;
        syncLyrics(player.relPosition(), true);
      })
      .catch(function () { /* pas de paroles disponibles pour ce morceau : pas bloquant */ });
  }

  // N'affiche que la ligne EN COURS (pas de liste qui defile) : moins
  // d'espace vertical necessaire dans l'accordeon.
  function syncLyrics(position, force) {
    if (!currentLyrics.synced || !currentLyrics.lines.length) return;
    var lines = currentLyrics.lines;
    var idx = -1;
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].t <= position + 0.15) idx = i; else break;
    }
    if (idx === -1) idx = 0;
    if (idx === activeLineIndex && !force) return;
    activeLineIndex = idx;
    if (expandLyricLine) expandLyricLine.textContent = lines[idx].text || "";
  }

  // ------------------------------------------------------- Spectre (accordeon)
  // Fenetre glissante de 20s (10 avant / 10 apres la position courante),
  // cue rouge fixe au centre, timecode affiche au-dessus de la cue. Les pics
  // sont PRECALCULES a la construction du site (voir scripts/gen-waveforms,
  // sortie dans assets/waveforms/*.json) : un petit JSON de quelques Ko
  // charge quasi instantanement. Si le JSON manque pour une piste, on
  // retombe sur un decodage Web Audio en direct.
  //
  // Le spectre de la piste entiere est dessine UNE SEULE FOIS (deux bitmaps :
  // deja-joue en bleu, a-venir en gris), et le defilement pendant la lecture
  // se fait ensuite par simple translateX sur ces bitmaps deja rendus —
  // anime par le compositeur (GPU), sans redessiner un seul pixel a chaque
  // frame.
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
  // affectations de style (transform) + le texte du timecode. C'est ce qui
  // rend le defilement fluide, y compris sur mobile bas de gamme.
  // pos optionnel : position a afficher (utilise pendant le drag, voir plus
  // bas) ; sans argument, on prend la position reelle de lecture.
  function updateWaveformScroll(pos) {
    if (!playerEl.classList.contains("expanded")) return;
    if (!waveformCurrentPeaks || !waveformCurrentPeaks.length || !waveformScale) return;
    var p = typeof pos === "number" ? pos : player.relPosition();
    var x = p * waveformScale;
    waveformCanvasAccent.style.transform = "translateX(" + (waveformHalfWidth - x) + "px)";
    waveformCanvasGray.style.transform = "translateX(" + -x + "px)";
    if (waveformCueTime) waveformCueTime.textContent = formatTime(p);
  }

  function waveformTick() {
    // Pendant un drag, c'est la boucle de drag (plus bas) qui pilote deja
    // l'affichage a la position de previsualisation : on ne doit pas
    // ecraser ca avec la position reelle de lecture (pas encore a jour tant
    // que le seek n'a pas ete commis).
    if (!waveformDrag) updateWaveformScroll();
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
    if (playerEl.classList.contains("expanded")) { buildWaveformBitmaps(); updateWaveformScroll(); }
  });

  // Le spectre se deplace au doigt : on tire le ruban, la cue ne bouge pas.
  // Glisser vers la droite fait apparaitre le passe (rewind), vers la
  // gauche l'a-venir (avance) — comme si on tirait une bande physique.
  //
  // player.seekRelative() ecrit audio.currentTime, une vraie recherche au
  // niveau du decodeur — pas gratuite. pointermove peut se declencher tres
  // frequemment au doigt (jusqu'a plus de 60 fois/seconde sur certains
  // mobiles) : appeler un vrai seek a CHAQUE evenement crée a la fois des
  // saccades pendant le drag (le decodeur n'arrive pas a suivre) et une
  // grosse surconsommation batterie. On separe donc l'affichage (suit le
  // doigt a chaque evenement, pas cher : juste un transform) du seek reel,
  // qui n'est commis qu'une fois par frame via rAF.
  var waveformDrag = null;
  var waveformDragRAF = null;
  function waveformDragTick() {
    if (!waveformDrag) { waveformDragRAF = null; return; }
    if (waveformDrag.pendingPos !== waveformDrag.committedPos) {
      waveformDrag.committedPos = waveformDrag.pendingPos;
      player.seekRelative(waveformDrag.pendingPos);
    }
    waveformDragRAF = requestAnimationFrame(waveformDragTick);
  }
  if (waveformEl) {
    waveformEl.addEventListener("pointerdown", function (ev) {
      if (!waveformCurrentPeaks || !waveformScale) return;
      var startPos = player.relPosition();
      waveformDrag = { startX: ev.clientX, startPos: startPos, pendingPos: startPos, committedPos: startPos };
      waveformEl.classList.add("waveform-dragging");
      if (waveformEl.setPointerCapture) { try { waveformEl.setPointerCapture(ev.pointerId); } catch (e) {} }
      if (!waveformDragRAF) waveformDragRAF = requestAnimationFrame(waveformDragTick);
      ev.preventDefault();
    });
    waveformEl.addEventListener("pointermove", function (ev) {
      if (!waveformDrag) return;
      var dx = ev.clientX - waveformDrag.startX;
      var dur = player.relDuration();
      var next = waveformDrag.startPos - dx / waveformScale;
      next = Math.max(0, isFinite(dur) ? Math.min(dur, next) : next);
      waveformDrag.pendingPos = next;
      updateWaveformScroll(next);
    });
    var endWaveformDrag = function () {
      if (waveformDrag && waveformDrag.pendingPos !== waveformDrag.committedPos) {
        player.seekRelative(waveformDrag.pendingPos);
      }
      waveformDrag = null;
      if (waveformDragRAF) { cancelAnimationFrame(waveformDragRAF); waveformDragRAF = null; }
      waveformEl.classList.remove("waveform-dragging");
    };
    waveformEl.addEventListener("pointerup", endWaveformDrag);
    waveformEl.addEventListener("pointercancel", endWaveformDrag);
  }

  // ------------------------------------------------------------- Accordeon
  function toggleExpand(on) {
    playerEl.classList.toggle("expanded", on);
    if (miniBtn) miniBtn.setAttribute("aria-label", on ? "Reduire" : "Agrandir");
    if (on) {
      syncLyrics(player.relPosition(), true);
      loadWaveform(currentTrackRef);
      if (player.isPlaying()) startWaveformLoop(); else updateWaveformScroll();
    } else {
      stopWaveformLoop();
    }
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && playerEl.classList.contains("expanded")) toggleExpand(false);
  });

  // Vignette du lecteur -> deplie/replie l'accordeon.
  var miniBtn = $("mini-cover-btn");
  if (miniBtn) {
    miniBtn.addEventListener("click", function () {
      toggleExpand(!playerEl.classList.contains("expanded"));
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
    try { updateExpandVisuals(t); } catch (err) { console.error("[app] updateExpandVisuals:", err); }
    // Le spectre ne se (re)decode que si l'accordeon est deja deplie (sinon
    // on attend que l'utilisateur l'ouvre pour eviter de decoder de l'audio
    // en arriere-plan pour rien).
    if (playerEl.classList.contains("expanded")) {
      try { loadWaveform(t); } catch (err) { console.error("[app] loadWaveform:", err); }
    }
  });

  player.on("playstate", function (e) {
    btnPlay.classList.toggle("is-playing", e.playing);
    btnPlay.setAttribute("aria-label", e.playing ? "Pause" : "Lecture");
    document.body.classList.toggle("is-playing", e.playing);
    if (playerEl.classList.contains("expanded")) {
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
