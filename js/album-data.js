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
 *
 * "La Semi" (piste 4) : paroles de test reconstruites depuis un .srt
 * auto-transcrit (TurboScribe) dont les coupures ne suivent pas les lignes
 * du texte. Les timestamps sont interpoles (proportionnels a la position du
 * mot dans le bloc source), donc approximatifs -> A REECOUTER ET CORRIGER.
 * Quelques mots looks douteux de la transcription auto (a verifier a
 * l'oreille) : "T'as la reve ?", "ténètre", "monde enceinte", "Une look",
 * "patatrac", "à corps", "Pour ce qui me choix".
 */

window.ALBUM_DATA = {
  title: "SEMI",
  artist: "SoJo",
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
      lyrics:
        "[00:00.10] La semi-liberté\n" +
        "[00:03.40] Rien que le mot, c'est pas déjà une arnaque ?\n" +
        "[00:09.58] On devrait pas plutôt dire l'inverse ?\n" +
        "[00:11.32] Ben ouais bro, on rentre pas en tôle, on te fait sortir du monde\n" +
        "[00:14.51] T'es pas à moitié libre\n" +
        "[00:15.87] Genre à moitié heureux, ça existe ?\n" +
        "[00:18.24] T'es dehors avec une montre comme seule idée pour tout gérer\n" +
        "[00:21.71] Toute la journée\n" +
        "[00:23.19] Tu fais comme si t'avais une vie normale\n" +
        "[00:24.94] Tu t'entraînes\n" +
        "[00:25.82] Tu vois ta meuf\n" +
        "[00:26.75] Tu parles d'un bébé\n" +
        "[00:27.67] Tu dis que ça va aller\n" +
        "[00:28.79] Et le soir, tu rentres en enfer\n" +
        "[00:30.53] Encore le cerbère et encore mon frère\n" +
        "[00:32.50] J'ai même essayé d'y rentrer à l'envers\n" +
        "[00:34.12] T'as la rêve ?\n" +
        "[00:34.88] Spoiler, c'est pas ténètre\n" +
        "[00:36.61] Au début\n" +
        "[00:37.15] Tu crois que tu vas bien séparer les deux\n" +
        "[00:38.82] La vie dehors\n" +
        "[00:39.87] La vie dedans\n" +
        "[00:40.92] La vie vue de dehors\n" +
        "[00:42.12] La vie vécue dedans\n" +
        "[00:43.16] Mais ça marche pas comme ça, en fait\n" +
        "[00:45.01] Ça marche tout simplement pas\n" +
        "[00:46.60] En tout cas pas comme ça\n" +
        "[00:48.24] Au bout d'un moment\n" +
        "[00:50.09] Tout se mélange\n" +
        "[00:50.89] C'est ça un peu la vraie peine\n" +
        "[00:52.23] Comme un super super pouvoir claqué au sol\n" +
        "[00:54.44] Genre tu peux devenir invisible\n" +
        "[00:56.18] Mais qu'une seconde\n" +
        "[00:57.14] Une seconde\n" +
        "[00:57.73] Toutes les deux secondes\n" +
        "[00:58.90] Une look de deux putains de secondes\n" +
        "[01:00.62] Mais en fait\n" +
        "[01:01.35] Qui voudrait d'un pote qui clignote ?\n" +
        "[01:03.78] Chelou\n" +
        "[01:04.14] Vas-y j'enchaîne\n" +
        "[01:05.10] Et donc\n" +
        "[01:05.52] Tu commences à mentir dehors\n" +
        "[01:07.03] Et puis aussi mentir dedans\n" +
        "[01:08.39] Rien de grave\n" +
        "[01:08.95] Mais c'est ce que font les gens\n" +
        "[01:10.07] Quand leur monde enceinte s'éparpille dans le vent\n" +
        "[01:11.91] Tu prends des risques dedans\n" +
        "[01:13.10] Parce que tu perds tout dehors\n" +
        "[01:14.52] Et toi au milieu\n" +
        "[01:15.30] Tu sais plus qui t'étais\n" +
        "[01:16.45] Tu commences à te fragmenter\n" +
        "[01:17.95] Tu te surprends même à croire\n" +
        "[01:19.46] À répéter leur vérité\n" +
        "[01:20.59] J'fais pas de la patatrac mon vieux\n" +
        "[01:22.61] J'ai juste plus de larmes aux yeux que\n" +
        "[01:25.16] Alors je frappe\n" +
        "[01:27.45] Ok on dit j'boxe\n" +
        "[01:29.14] Ok on dit comme tu veux\n" +
        "[01:30.38] Parce qu'au moins dans la box\n" +
        "[01:31.76] Les choses sont claires\n" +
        "[01:32.85] Le mec veut te coucher\n" +
        "[01:33.96] Et toi\n" +
        "[01:34.32] Tu veux pas tomber\n" +
        "[01:35.39] T'apprends à regarder l'autre main\n" +
        "[01:36.91] Que quelqu'un te tend\n" +
        "[01:37.80] Pour te la serrer\n" +
        "[01:38.69] Parce que c'est\n" +
        "[01:39.45] Avec celle-là\n" +
        "[01:40.19] Qui va te niquer\n" +
        "[01:41.18] Les gens qui mentent\n" +
        "[01:42.77] Je connais\n" +
        "[01:43.56] Avec les mecs de façade\n" +
        "[01:44.51] J'ai toujours fait le vrai\n" +
        "[01:46.01] Mais la justice\n" +
        "[01:47.88] Putain\n" +
        "[01:48.63] Moi je croyais quand même que la justice\n" +
        "[01:50.92] Elle cherchait la vérité\n" +
        "[01:52.06] Mais en fait\n" +
        "[01:52.70] Souvent elle veut te diluer\n" +
        "[01:54.05] Te rendre soluble\n" +
        "[01:54.90] Dans l'exemplarité\n" +
        "[01:55.80] Être exemplaire\n" +
        "[01:56.79] J'y pense parfois\n" +
        "[01:57.91] Ou pas\n" +
        "[01:58.30] Comme si ma vie était pas super compatible Trop compliquée\n" +
        "[02:01.51] Et donc ils font simple\n" +
        "[02:02.85] Genre the ten laws of simplicity\n" +
        "[02:04.94] Laisse tomber\n" +
        "[02:05.83] Aucun magistrat l'a lu\n" +
        "[02:07.10] De toute façon\n" +
        "[02:07.91] Ça leur aurait pas plu\n" +
        "[02:09.48] Leur justice\n" +
        "[02:10.41] Enfer\n" +
        "[02:10.79] Elle te trouve pas assez humble\n" +
        "[02:12.88] Tu captes\n" +
        "[02:13.50] Accepte-la\n" +
        "[02:14.09] Comme on te la donne sur un plateau\n" +
        "[02:15.40] Comme un rail de coke\n" +
        "[02:16.28] Qui peut raser\n" +
        "[02:16.94] Retour à zéro\n" +
        "[02:17.76] Et ils te regardent comme si tout était déjà réglé\n" +
        "[02:20.79] Moi,\n" +
        "[02:21.04] ce que je pense\n" +
        "[02:21.87] Avec humilité,\n" +
        "[02:22.69] c'est qu'on va tout cramer\n" +
        "[02:25.22] Baby\n" +
        "[02:25.67] Ok\n" +
        "[02:25.90] J'ai fait de la merde\n" +
        "[02:27.40] Je le sais\n" +
        "[02:28.05] Toi tu tais\n" +
        "[02:28.70] Ce qui est à moi\n" +
        "[02:29.77] Je le porte\n" +
        "[02:30.36] Pour ce qui me choix\n" +
        "[02:31.50] À chacun son fardeau\n" +
        "[02:32.76] Vision périphérique au max\n" +
        "[02:34.51] Doute et y'a pas photo\n" +
        "[02:35.90] T'es à deux doigts\n" +
        "[02:36.95] De prendre\n" +
        "[02:37.54] Le plus gros des coups de chaud\n" +
        "[02:40.14] Mon père\n" +
        "[02:41.09] Il s'est barré\n" +
        "[02:42.51] Pendant longtemps\n" +
        "[02:44.11] Je me suis dit\n" +
        "[02:45.42] Moi, je ferais pas ça\n" +
        "[02:47.46] Moi, je serais là\n" +
        "[02:49.12] Mais être un daron\n" +
        "[02:52.26] c'est pas juste\n" +
        "[02:54.88] Là. Là juste,\n" +
        "[02:55.95] c'est protéger,\n" +
        "[02:57.19] c'est tenir\n" +
        "[02:57.95] Revenir c'est pas ramener,\n" +
        "[02:59.79] trop de bordel\n" +
        "[03:00.72] de la zonzon à la zone\n" +
        "[03:02.33] Mais là\n" +
        "[03:02.75] Je vois pas d'issue de secours\n" +
        "[03:04.72] J'ai vu passer\n" +
        "[03:05.29] le point de non-retour\n" +
        "[03:06.40] T'as du feu\n" +
        "[03:07.18] Ils m'ont bien cerné\n" +
        "[03:08.56] Attention ça va chauffer\n" +
        "[03:10.35] En me posant seul\n" +
        "[03:11.50] Contre tous,\n" +
        "[03:12.35] c'était pas compliqué\n" +
        "[03:13.84] Seul dans la course\n" +
        "[03:15.95] du dernier des derniers\n" +
        "[03:18.50] Les flics veulent un truc\n" +
        "[03:20.15] Les mecs dedans vendent mes trucs\n" +
        "[03:22.09] Les gens dehors\n" +
        "[03:22.92] disent des trucs\n" +
        "[03:23.72] Finalement je mets tout le monde à corps\n" +
        "[03:25.62] Et ça c'est quand même\n" +
        "[03:26.76] un peu fort\n" +
        "[03:27.26] Tout le monde me tient\n" +
        "[03:28.34] Mais maintenant le mood\n" +
        "[03:29.98] Ça va plutôt être\n" +
        "[03:31.34] à chacun son chemin\n" +
        "[03:33.51] Vas-y là\n" +
        "[03:34.49] T'as la ref putain\n" +
        "[03:36.26] Et moi je cours\n" +
        "[03:37.74] de 8 à 18\n" +
        "[03:38.52] Je rentre à l'heure\n" +
        "[03:40.36] Je sors à l'heure\n" +
        "[03:41.30] Je baisse à l'heure\n" +
        "[03:42.58] Je rêve de malheur\n" +
        "[03:44.34] Je rêve de meilleur\n" +
        "[03:47.74] Pince-moi, je crève\n" +
        "[03:52.44] Il va falloir que ça cesse",
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
