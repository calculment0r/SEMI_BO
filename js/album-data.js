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
 * - Pochette : reelle (pochette.png fournie).
 * - Scenes : 7 reelles sur 8, ASSOCIATION AUX PISTES NON CONFIRMEE — l'ordre
 *   ci-dessous est arbitraire (ordre d'upload), a corriger. La piste 8 utilise
 *   un placeholder en attendant le visuel manquant.
 * - Titres et fichiers audio : PLACEHOLDERS, en attente.
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
      title: "Piste 1",
      file: "./audio/01.mp3",
      scene: "./assets/scenes/scene-wall.jpg",
      credits: "",
      lyrics: "",
    },
    {
      number: 2,
      title: "Piste 2",
      file: "./audio/02.mp3",
      scene: "./assets/scenes/scene-lighter.jpg",
      credits: "",
      lyrics: "",
    },
    {
      number: 3,
      title: "Piste 3",
      file: "./audio/03.mp3",
      scene: "./assets/scenes/scene-gun.jpg",
      credits: "",
      lyrics: "",
    },
    {
      number: 4,
      title: "Piste 4",
      file: "./audio/04.mp3",
      scene: "./assets/scenes/scene-couple.jpg",
      credits: "",
      lyrics: "",
    },
    {
      number: 5,
      title: "Piste 5",
      file: "./audio/05.mp3",
      scene: "./assets/scenes/scene-booking.jpg",
      credits: "",
      lyrics: "",
    },
    {
      number: 6,
      title: "Piste 6",
      file: "./audio/06.mp3",
      scene: "./assets/scenes/scene-pill.jpg",
      credits: "",
      lyrics: "",
    },
    {
      number: 7,
      title: "Piste 7",
      file: "./audio/07.mp3",
      scene: "./assets/scenes/scene-morgue.jpg",
      credits: "",
      lyrics: "",
    },
    {
      number: 8,
      title: "Piste 8",
      file: "./audio/08.mp3",
      scene: "./assets/scenes/scene-placeholder.jpg",
      credits: "",
      lyrics: "",
    },
  ],
};
