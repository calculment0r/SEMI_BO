/*
 * album-data.js — CONFIGURATION DE L'ALBUM
 * =========================================
 * Le SEUL fichier a editer pour le contenu de l'album (morceaux, pochette,
 * scenes). Voir README.
 *
 * Chaque morceau a un champ "scene" : un plan large (panoramique) affiche en
 * fond pendant sa lecture (visuel unique, statique — pas d'anim en boucle).
 *
 * Paroles : chaque morceau reference un fichier .lrc externe (lyricsFile),
 * charge et parse au moment de la lecture (voir js/app.js). Format LRC
 * standard -> une ligne par [mm:ss.xx]texte, temps relatif au debut du
 * fichier audio. Laisser lyricsFile vide ("") si pas encore disponible.
 *
 * ETAT ACTUEL (masters + .lrc definitifs fournis par l'artiste) :
 * - Ordre de l'album confirme : La Semi, Half Life / Half Dead, Backlash,
 *   Living Proof, Fast (feat. Trace), Living Proof (Live), Dance Around.
 * - Les 7 morceaux ont ete remasterises et ont chacun leur .lrc dedie dans
 *   lyrics/ — duration mesuree directement sur les nouveaux fichiers audio.
 */

window.ALBUM_DATA = {
  title: "SEMI",
  artist: "SoJo",
  year: "2026",
  description: "",

  cover: "./assets/cover-1200.jpg",
  artwork512: "./assets/cover-512.jpg",

  // Image du bandeau en haut de la page. Distincte de "cover" : la pochette
  // carree porte deja le mot SEMI incruste, qui se retrouvait coupe une fois
  // recadre en 21:9. Ici le titre est du vrai texte pose par-dessus (voir
  // .cover-title), donc l'image ne doit pas en contenir. Les visuels de
  // assets/scenes sont deja en 1470x630, soit exactement du 21:9 : aucun
  // recadrage, l'image est vue en entier.
  headerImage: "./assets/scenes/scene-booking.jpg",

  playbackMode: "separate",
  continuousFile: "./audio/album-complet.mp3",

  links: { soundcloud: "", bandcamp: "", instagram: "", website: "" },

  tracks: [
    {
      number: 1,
      title: "La Semi",
      file: "./audio/04-la-semi.mp3",
      scene: "./assets/scenes/scene-couple.jpg",
      duration: 244.39,
      credits: "",
      lyricsFile: "./lyrics/04-la-semi.lrc",
    },
    {
      number: 2,
      title: "Half Life / Half Dead",
      file: "./audio/01-half-dead.mp3",
      scene: "./assets/scenes/scene-wall.jpg",
      duration: 149.83,
      credits: "",
      lyricsFile: "./lyrics/01-half-dead.lrc",
    },
    {
      number: 3,
      title: "Backlash",
      file: "./audio/03-backlash.mp3",
      scene: "./assets/scenes/scene-gun.jpg",
      duration: 157.22,
      credits: "",
      lyricsFile: "./lyrics/03-backlash.lrc",
    },
    {
      number: 4,
      title: "Living Proof",
      file: "./audio/06-living-proof.mp3",
      scene: "./assets/scenes/scene-pill.jpg",
      duration: 154.58,
      credits: "",
      lyricsFile: "./lyrics/06-living-proof.lrc",
    },
    {
      number: 5,
      title: "Fast (feat. Trace)",
      file: "./audio/05-fast-feat-trace.mp3",
      scene: "./assets/scenes/scene-booking.jpg",
      duration: 218.02,
      credits: "",
      lyricsFile: "./lyrics/05-fast-feat-trace.lrc",
    },
    {
      number: 6,
      title: "Living Proof (Live)",
      file: "./audio/02-living-proof-live.mp3",
      scene: "./assets/scenes/scene-lighter.jpg",
      duration: 184.34,
      credits: "",
      lyricsFile: "./lyrics/02-living-proof-live.lrc",
    },
    {
      number: 7,
      title: "Dance Around",
      file: "./audio/07-dance-around.mp3",
      scene: "./assets/scenes/scene-morgue.jpg",
      duration: 189.7,
      credits: "",
      lyricsFile: "./lyrics/07-dance-around.lrc",
    },
  ],
};
