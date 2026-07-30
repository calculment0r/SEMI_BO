/*
 * album-data.js — CONFIGURATION DE L'ALBUM
 * =========================================
 * Le SEUL fichier a editer pour le contenu de l'album (morceaux, pochette,
 * scenes). Voir README.
 *
 * Chaque morceau a un champ "scene" : un plan large (panoramique) affiche en
 * fond pendant sa lecture, recadre en vertical et anime en pan lent.
 *
 * ETAT ACTUEL (provisoire, en attente de confirmation) :
 * - Pochette et les 7 scenes : reelles.
 * - Album a 7 titres (pas 8). Association scene <-> piste NON CONFIRMEE —
 *   l'ordre ci-dessous est arbitraire (ordre d'upload), a corriger.
 * - Audio reel pour les 7 pistes. Titres DEDUITS DU NOM DE FICHIER (a
 *   confirmer) : halfdead -> "Half Dead", livingprooflive -> "Living Proof
 *   (Live)", backlash -> "Backlash", lasemi -> "La Semi",
 *   fastfeat.trace -> "Fast (feat. Trace)", livingproof -> "Living Proof",
 *   dancearound -> "Dance Around". Ordre = ordre d'upload, a corriger si ce
 *   n'est pas l'ordre voulu dans l'album.
 *
 * Paroles "lyrics" : format LRC synchronise -> [mm:ss.xx] texte (temps relatif
 * au debut du morceau). Laisser vide si pas encore disponible.
 */

window.ALBUM_DATA = {
  title: "SEMI",
  artist: "NiKOSTAKI",
  year: "2026",
  description: "",

  cover: "./assets/cover-1200.jpg",
  artwork512: "./assets/cover-512.jpg",

  playbackMode: "separate",
  continuousFile: "./audio/album-complet.mp3",

  links: { soundcloud: "", bandcamp: "", instagram: "", website: "" },

  tracks: [
    {
      number: 1,
      title: "Half Dead",
      file: "./audio/01-half-dead.mp3",
      scene: "./assets/scenes/scene-wall.jpg",
      duration: 149.81,
      credits: "",
      lyrics: "",
    },
    {
      number: 2,
      title: "Living Proof (Live)",
      file: "./audio/02-living-proof-live.mp3",
      scene: "./assets/scenes/scene-lighter.jpg",
      duration: 184.32,
      credits: "",
      lyrics: "",
    },
    {
      number: 3,
      title: "Backlash",
      file: "./audio/03-backlash.mp3",
      scene: "./assets/scenes/scene-gun.jpg",
      duration: 157.2,
      credits: "",
      lyrics: "",
    },
    {
      number: 4,
      title: "La Semi",
      file: "./audio/04-la-semi.mp3",
      scene: "./assets/scenes/scene-couple.jpg",
      duration: 244.37,
      credits: "",
      lyrics: "",
    },
    {
      number: 5,
      title: "Fast (feat. Trace)",
      file: "./audio/05-fast-feat-trace.mp3",
      scene: "./assets/scenes/scene-booking.jpg",
      duration: 443.4,
      credits: "",
      lyrics: "",
    },
    {
      number: 6,
      title: "Living Proof",
      file: "./audio/06-living-proof.mp3",
      scene: "./assets/scenes/scene-pill.jpg",
      duration: 154.56,
      credits: "",
      lyrics: "",
    },
    {
      number: 7,
      title: "Dance Around",
      file: "./audio/07-dance-around.mp3",
      scene: "./assets/scenes/scene-morgue.jpg",
      duration: 189.6,
      credits: "",
      lyrics: "",
    },
  ],
};
