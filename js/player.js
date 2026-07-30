/*
 * player.js — Moteur de lecture
 * =============================
 * Un seul <audio> natif reutilise pour tout l'album (jamais recree).
 * Gere les deux modes ("separate" / "continuous"), la Media Session API,
 * la persistance localStorage et une gestion d'erreurs lisible.
 *
 * L'UI (app.js) s'abonne via player.on(event, callback).
 * Evenements emis :
 *   trackchange { index, track }
 *   playstate   { playing }
 *   time        { position, duration }   (relatifs au morceau courant)
 *   loaded      { index, track }
 *   error       { message }
 */

(function (global) {
  "use strict";

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function isFiniteNumber(n) {
    return typeof n === "number" && isFinite(n);
  }

  function createPlayer(audio, data) {
    var mode = data.playbackMode === "continuous" ? "continuous" : "separate";
    var tracks = Array.isArray(data.tracks) ? data.tracks : [];
    var listeners = {};
    var index = 0;
    var playing = false;
    var pendingSeekRel = null; // position relative a appliquer apres loadedmetadata
    var manualSeek = false;
    var storeKey = "album-player:" + slugify(data.title || "album");

    // --- petit emetteur d'evenements ------------------------------------
    function on(evt, cb) {
      (listeners[evt] || (listeners[evt] = [])).push(cb);
      return function off() {
        listeners[evt] = (listeners[evt] || []).filter(function (f) {
          return f !== cb;
        });
      };
    }
    function emit(evt, payload) {
      (listeners[evt] || []).forEach(function (cb) {
        try {
          cb(payload);
        } catch (e) {
          /* un listener ne doit jamais casser le moteur */
          console.error("[player] listener error:", e);
        }
      });
    }

    function slugify(s) {
      return String(s)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    // --- bornes d'un morceau --------------------------------------------
    function trackStart(t) {
      return isFiniteNumber(t.start) ? t.start : 0;
    }
    function trackEnd(t, i) {
      if (isFiniteNumber(t.end)) return t.end;
      // dernier recours : borne suivante ou duree du media
      var next = tracks[i + 1];
      if (next && isFiniteNumber(next.start)) return next.start;
      return isFiniteNumber(audio.duration) ? audio.duration : Infinity;
    }

    // duree relative d'un morceau (ce qui est affiche a l'utilisateur)
    function relDuration(i) {
      var t = tracks[i];
      if (!t) return NaN;
      if (mode === "continuous") {
        return trackEnd(t, i) - trackStart(t);
      }
      // mode separate : duree du fichier charge
      return isFiniteNumber(audio.duration) ? audio.duration : NaN;
    }

    // position relative courante dans le morceau
    function relPosition() {
      if (mode === "continuous") {
        var t = tracks[index];
        return t ? clamp(audio.currentTime - trackStart(t), 0, Infinity) : 0;
      }
      return audio.currentTime || 0;
    }

    // en mode continu : quel morceau correspond a un temps absolu ?
    function indexForTime(time) {
      for (var i = 0; i < tracks.length; i++) {
        if (time < trackEnd(tracks[i], i) - 0.001) return i;
      }
      return tracks.length - 1;
    }

    // ---------------------------------------------------------------------
    // Chargement d'un morceau
    // ---------------------------------------------------------------------
    function load(i, opts) {
      opts = opts || {};
      if (i < 0 || i >= tracks.length) return;
      index = i;
      var t = tracks[i];

      if (mode === "continuous") {
        var src = resolve(data.continuousFile);
        // ne JAMAIS remplacer la source pendant la lecture continue
        if (!audio.src || decodeURI(audio.src) !== decodeURI(absolute(src))) {
          audio.src = src;
        }
        var target = trackStart(t) + (isFiniteNumber(opts.rel) ? opts.rel : 0);
        applyCurrentTime(target);
      } else {
        var file = resolve(t.file);
        if (decodeURI(audio.src || "") !== decodeURI(absolute(file))) {
          audio.src = file;
          audio.load();
        }
        pendingSeekRel = isFiniteNumber(opts.rel) ? opts.rel : 0;
        applyPendingSeek();
      }

      emit("trackchange", { index: index, track: t });
      updateMediaMetadata();
      save();

      if (opts.autoplay) {
        play();
      } else {
        // rafraichit l'affichage temps meme a l'arret
        emit("time", { position: relPosition(), duration: relDuration(index) });
      }
    }

    function applyCurrentTime(target) {
      // si les metadonnees ne sont pas pretes, on differe
      if (isFiniteNumber(audio.duration) && audio.duration > 0) {
        try {
          audio.currentTime = clamp(target, 0, audio.duration);
        } catch (e) {
          /* certains navigateurs refusent avant que le buffer soit pret */
        }
      } else {
        pendingSeekRel = target; // reutilise le meme mecanisme
        audio.addEventListener("loadedmetadata", function once() {
          audio.removeEventListener("loadedmetadata", once);
          try {
            audio.currentTime = clamp(target, 0, audio.duration || target);
          } catch (e) {}
          pendingSeekRel = null;
        });
      }
    }

    function applyPendingSeek() {
      if (pendingSeekRel == null) return;
      if (isFiniteNumber(audio.duration)) {
        try {
          audio.currentTime = clamp(pendingSeekRel, 0, audio.duration);
        } catch (e) {}
        pendingSeekRel = null;
      }
      // sinon : traite par le handler loadedmetadata plus bas
    }

    // ---------------------------------------------------------------------
    // Transport
    // ---------------------------------------------------------------------
    function play() {
      var p = audio.play();
      if (p && typeof p.catch === "function") {
        p.catch(function (err) {
          // NotAllowedError = lecture non declenchee par un geste utilisateur
          if (err && err.name === "NotAllowedError") {
            emit("error", {
              message: "Touchez le bouton lecture pour demarrer le son.",
            });
          } else if (err && err.name !== "AbortError") {
            emit("error", { message: messageForMediaError() });
          }
        });
      }
    }

    function pause() {
      audio.pause();
    }

    function toggle() {
      if (audio.paused) play();
      else pause();
    }

    function next() {
      if (index < tracks.length - 1) {
        selectByUser(index + 1, true);
      } else {
        // fin de l'album
        pause();
        selectByUser(0, false);
      }
    }

    function previous() {
      // > 3s (ou deja sur le 1er morceau) : retour au debut du morceau courant.
      // Sinon : morceau precedent.
      if (relPosition() > 3 || index === 0) {
        seekRelative(0);
      } else {
        selectByUser(index - 1, !audio.paused);
      }
    }

    // selection explicite (clic sur un titre, next/prev)
    function selectByUser(i, autoplay) {
      if (mode === "continuous") {
        index = clamp(i, 0, tracks.length - 1);
        manualSeek = true;
        applyCurrentTime(trackStart(tracks[index]));
        emit("trackchange", { index: index, track: tracks[index] });
        updateMediaMetadata();
        save();
        if (autoplay) play();
        emit("time", { position: 0, duration: relDuration(index) });
      } else {
        load(i, { autoplay: autoplay, rel: 0 });
      }
    }

    // deplacement dans le morceau courant, position relative en secondes
    function seekRelative(relSeconds) {
      var t = tracks[index];
      if (!t) return;
      var dur = relDuration(index);
      var r = clamp(relSeconds, 0, isFiniteNumber(dur) ? dur : relSeconds);
      if (mode === "continuous") {
        manualSeek = true;
        try {
          audio.currentTime = clamp(
            trackStart(t) + r,
            0,
            audio.duration || trackStart(t) + r
          );
        } catch (e) {}
      } else {
        try {
          audio.currentTime = r;
        } catch (e) {}
      }
      emit("time", { position: relPosition(), duration: relDuration(index) });
    }

    // deplacement par fraction [0..1] (barre de progression)
    function seekFraction(f) {
      var dur = relDuration(index);
      if (!isFiniteNumber(dur) || dur <= 0) return;
      seekRelative(clamp(f, 0, 1) * dur);
    }

    function setVolume(v) {
      audio.volume = clamp(v, 0, 1);
      save();
    }
    function setMuted(m) {
      audio.muted = !!m;
      save();
    }
    function toggleMute() {
      setMuted(!audio.muted);
      return audio.muted;
    }

    // ---------------------------------------------------------------------
    // Media Session API (ecran verrouille / commandes systeme)
    // ---------------------------------------------------------------------
    function hasMediaSession() {
      return "mediaSession" in navigator;
    }

    function updateMediaMetadata() {
      if (!hasMediaSession() || typeof global.MediaMetadata === "undefined") {
        return;
      }
      var t = tracks[index] || {};
      var art = [];
      if (data.artwork512) {
        art.push({ src: absolute(resolve(data.artwork512)), sizes: "512x512", type: guessType(data.artwork512) });
      }
      if (data.cover) {
        art.push({ src: absolute(resolve(data.cover)), sizes: "1200x1200", type: guessType(data.cover) });
      }
      try {
        navigator.mediaSession.metadata = new global.MediaMetadata({
          title: t.title || "",
          artist: data.artist || "",
          album: data.title || "",
          artwork: art,
        });
      } catch (e) {
        /* pas bloquant */
      }
    }

    function setActionHandler(action, handler) {
      if (!hasMediaSession()) return;
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (e) {
        /* action non supportee par ce navigateur : on ignore proprement */
      }
    }

    function setupMediaSession() {
      if (!hasMediaSession()) return;
      setActionHandler("play", function () {
        play();
      });
      setActionHandler("pause", function () {
        pause();
      });
      setActionHandler("previoustrack", function () {
        previous();
      });
      setActionHandler("nexttrack", function () {
        next();
      });
      setActionHandler("seekbackward", function (d) {
        var off = (d && d.seekOffset) || 10;
        seekRelative(relPosition() - off);
      });
      setActionHandler("seekforward", function (d) {
        var off = (d && d.seekOffset) || 10;
        seekRelative(relPosition() + off);
      });
      setActionHandler("seekto", function (d) {
        if (!d) return;
        if (d.fastSeek && typeof audio.fastSeek === "function" && mode === "separate") {
          audio.fastSeek(d.seekTime);
        } else if (isFiniteNumber(d.seekTime)) {
          seekRelative(d.seekTime);
        }
      });
      setActionHandler("stop", function () {
        pause();
        seekRelative(0);
      });
    }

    function updatePositionState() {
      if (!hasMediaSession() || typeof navigator.mediaSession.setPositionState !== "function") {
        return;
      }
      var dur = relDuration(index);
      var pos = relPosition();
      if (!isFiniteNumber(dur) || dur <= 0) return;
      try {
        navigator.mediaSession.setPositionState({
          duration: dur,
          position: clamp(pos, 0, dur),
          playbackRate: audio.playbackRate || 1,
        });
      } catch (e) {
        /* setPositionState peut lever si les valeurs sont incoherentes */
      }
    }

    function setPlaybackState(state) {
      if (hasMediaSession()) {
        try {
          navigator.mediaSession.playbackState = state;
        } catch (e) {}
      }
    }

    // ---------------------------------------------------------------------
    // Erreurs lisibles
    // ---------------------------------------------------------------------
    function messageForMediaError() {
      var err = audio.error;
      if (!err) return "Impossible de lire ce morceau.";
      switch (err.code) {
        case 1: // MEDIA_ERR_ABORTED
          return "Lecture interrompue.";
        case 2: // MEDIA_ERR_NETWORK
          return "Probleme reseau pendant le chargement du morceau.";
        case 3: // MEDIA_ERR_DECODE
          return "Ce fichier audio semble corrompu.";
        case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
          return "Fichier audio introuvable ou format non supporte.";
        default:
          return "Impossible de lire ce morceau.";
      }
    }

    // ---------------------------------------------------------------------
    // Persistance
    // ---------------------------------------------------------------------
    var saveThrottle = 0;
    function save(force) {
      var now = Date.now ? Date.now() : +new Date();
      if (!force && now - saveThrottle < 3000) return;
      saveThrottle = now;
      try {
        localStorage.setItem(
          storeKey,
          JSON.stringify({
            index: index,
            rel: relPosition(),
            volume: audio.volume,
            muted: audio.muted,
          })
        );
      } catch (e) {
        /* localStorage indisponible (navigation privee) : on ignore */
      }
    }

    function restore() {
      var raw;
      try {
        raw = localStorage.getItem(storeKey);
      } catch (e) {
        raw = null;
      }
      var st = null;
      if (raw) {
        try {
          st = JSON.parse(raw);
        } catch (e) {
          st = null;
        }
      }
      if (st && isFiniteNumber(st.volume)) audio.volume = clamp(st.volume, 0, 1);
      if (st && typeof st.muted === "boolean") audio.muted = st.muted;
      var startIndex = st && isFiniteNumber(st.index) ? clamp(st.index, 0, tracks.length - 1) : 0;
      var rel = st && isFiniteNumber(st.rel) ? st.rel : 0;
      // On restaure le morceau et la position, SANS lancer la lecture.
      load(startIndex, { autoplay: false, rel: rel });
      return st;
    }

    // ---------------------------------------------------------------------
    // Chemins relatifs (compatibles sous-dossier GitHub Pages)
    // ---------------------------------------------------------------------
    function resolve(path) {
      // les chemins de album-data.js sont deja relatifs ("./...").
      return path;
    }
    function absolute(path) {
      try {
        return new URL(path, document.baseURI).href;
      } catch (e) {
        return path;
      }
    }
    function guessType(path) {
      var p = String(path).toLowerCase();
      if (p.endsWith(".png")) return "image/png";
      if (p.endsWith(".webp")) return "image/webp";
      return "image/jpeg";
    }

    // ---------------------------------------------------------------------
    // Branchement des evenements <audio>
    // ---------------------------------------------------------------------
    audio.addEventListener("loadedmetadata", function () {
      applyPendingSeek();
      emit("loaded", { index: index, track: tracks[index] });
      emit("time", { position: relPosition(), duration: relDuration(index) });
      updatePositionState();
    });

    audio.addEventListener("play", function () {
      playing = true;
      setPlaybackState("playing");
      emit("playstate", { playing: true });
      updatePositionState();
    });

    audio.addEventListener("pause", function () {
      playing = false;
      setPlaybackState("paused");
      emit("playstate", { playing: false });
      save(true);
    });

    audio.addEventListener("timeupdate", function () {
      if (mode === "continuous" && !manualSeek) {
        // detecte le passage d'un morceau a l'autre pendant la lecture
        var i = indexForTime(audio.currentTime);
        if (i !== index) {
          index = i;
          emit("trackchange", { index: index, track: tracks[index] });
          updateMediaMetadata();
        }
      }
      manualSeek = false;
      emit("time", { position: relPosition(), duration: relDuration(index) });
      updatePositionState();
      save();
    });

    audio.addEventListener("ended", function () {
      if (mode === "continuous") {
        // le fichier entier est termine : retour au debut, en pause
        pause();
        selectByUser(0, false);
      } else if (index < tracks.length - 1) {
        // enchaine automatiquement sur le morceau suivant
        load(index + 1, { autoplay: true, rel: 0 });
      } else {
        // dernier morceau : on s'arrete proprement
        setPlaybackState("none");
        emit("playstate", { playing: false });
        load(0, { autoplay: false, rel: 0 });
      }
    });

    audio.addEventListener("error", function () {
      // ignore l'erreur "vide" quand aucune source n'est encore definie
      if (!audio.src) return;
      emit("error", { message: messageForMediaError() });
    });

    // sauvegarde a la fermeture / mise en arriere-plan
    ["pagehide", "beforeunload"].forEach(function (ev) {
      global.addEventListener(ev, function () {
        save(true);
      });
    });
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") save(true);
    });

    // ---------------------------------------------------------------------
    // API publique
    // ---------------------------------------------------------------------
    return {
      on: on,
      init: function () {
        setupMediaSession();
        var st = restore();
        return st;
      },
      load: load,
      select: function (i) {
        selectByUser(i, true);
      },
      play: play,
      pause: pause,
      toggle: toggle,
      next: next,
      previous: previous,
      seekFraction: seekFraction,
      seekRelative: seekRelative,
      setVolume: setVolume,
      setMuted: setMuted,
      toggleMute: toggleMute,
      // getters
      getIndex: function () {
        return index;
      },
      isPlaying: function () {
        return !audio.paused;
      },
      getVolume: function () {
        return audio.volume;
      },
      isMuted: function () {
        return audio.muted;
      },
      getMode: function () {
        return mode;
      },
      relPosition: relPosition,
      relDuration: function () {
        return relDuration(index);
      },
    };
  }

  global.createPlayer = createPlayer;
})(window);
