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
  var miniCover = $("mini-cover");
  if (miniCover) miniCover.src = data.artwork512 || data.cover || "";

  $("artist").textContent = data.artist || "";
  $("album-title").textContent = data.title || "Album";
  document.title = (data.title || "Album") + (data.artist ? " — " + data.artist : "");
  $("year").textContent = data.year || "";
  $("description").textContent = data.description || "";

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

      btn.appendChild(num);
      btn.appendChild(main);
      btn.appendChild(eq);
      btn.appendChild(dur);
      btn.addEventListener("click", function () { player.select(i); });
      li.appendChild(btn);
      list.appendChild(li);
      trackEls.push({ li: li, btn: btn, dur: dur });
    });
  })();

  // ---------------------------------------------------------------- Lyrics
  var lyricsSection = $("lyrics-section");
  var lyricsToggle = $("lyrics-toggle");
  var lyricsBadge = $("lyrics-badge");
  var lyricsFsBtn = $("lyrics-fullscreen");
  var lyricsBody = $("lyrics-body");
  var lyricsCredits = $("lyrics-credits");
  var lyricsBox = $("lyrics-box");

  var lyricsOpen = false;
  var currentLyrics = { synced: false, lines: [] };
  var lineEls = [];
  var activeLine = -1;
  var userScrollUntil = 0;

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
    lyricsSection.hidden = !(hasLyrics || hasCredits);
    lyricsFsBtn.hidden = !hasLyrics;
    lyricsBadge.hidden = !currentLyrics.synced;
    if (hasCredits) { lyricsCredits.textContent = track.credits; lyricsCredits.hidden = false; }
    else lyricsCredits.hidden = true;

    currentLyrics.lines.forEach(function (line, i) {
      var d = el("div", "lyric-line", line.text || " ");
      d.setAttribute("role", "listitem");
      if (currentLyrics.synced) {
        d.classList.add("seekable");
        d.addEventListener("click", function () {
          player.seekRelative(line.t);
          if (!player.isPlaying()) player.play();
        });
      }
      lyricsBox.appendChild(d);
      lineEls.push(d);
    });
    if (lyricsOpen) syncLyrics(player.relPosition(), true);
  }

  function setLyricsOpen(open) {
    lyricsOpen = open;
    lyricsBody.hidden = !open;
    lyricsToggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) syncLyrics(player.relPosition(), true);
  }

  function syncLyrics(position, force) {
    if (!currentLyrics.synced || !lyricsOpen || lineEls.length === 0) return;
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
  lyricsToggle.addEventListener("click", function () { setLyricsOpen(!lyricsOpen); });

  function toggleFullscreen(on) {
    lyricsSection.classList.toggle("fullscreen", on);
    document.body.classList.toggle("lyrics-locked", on);
    lyricsFsBtn.setAttribute("aria-label", on ? "Quitter le plein ecran" : "Paroles en plein ecran");
    if (on && !lyricsOpen) setLyricsOpen(true);
    if (on) syncLyrics(player.relPosition(), true);
  }
  lyricsFsBtn.addEventListener("click", function () {
    toggleFullscreen(!lyricsSection.classList.contains("fullscreen"));
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lyricsSection.classList.contains("fullscreen")) toggleFullscreen(false);
  });

  // Vignette du lecteur -> ouvre les paroles (et defile jusqu'a elles).
  var miniBtn = $("mini-cover-btn");
  if (miniBtn) {
    miniBtn.addEventListener("click", function () {
      if (lyricsSection.hidden) return;
      if (!lyricsOpen) setLyricsOpen(true);
      lyricsSection.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
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
    npTitle.textContent = t.title || "";
    trackEls.forEach(function (ref, i) {
      var active = i === e.index;
      ref.li.classList.toggle("current", active);
      if (active) ref.btn.setAttribute("aria-current", "true");
      else ref.btn.removeAttribute("aria-current");
    });
    loadLyrics(t);
    setScene(t.scene);
  });

  player.on("playstate", function (e) {
    btnPlay.classList.toggle("is-playing", e.playing);
    btnPlay.setAttribute("aria-label", e.playing ? "Pause" : "Lecture");
    document.body.classList.toggle("is-playing", e.playing);
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
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./service-worker.js").catch(function () {});
    });
  }
})();
