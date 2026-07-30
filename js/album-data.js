/*
 * album-data.js — CONFIGURATION DE L'ALBUM
 * =========================================
 * Le SEUL fichier a editer pour le contenu de l'album (morceaux, pochette,
 * scenes). Voir README.
 *
 * Chaque morceau a un champ "scene" : un plan large (panoramique) affiche en
 * fond pendant sa lecture, recadre en vertical et anime en pan lent.
 *
 * ETAT ACTUEL :
 * - Pochette et les 7 scenes : reelles.
 * - Ordre de l'album confirme : La Semi, Half Life / Half Dead, Backlash,
 *   Living Proof, Fast (feat. Trace), Living Proof (Live), Dance Around.
 *
 * Paroles "lyrics" : format LRC synchronise -> [mm:ss.xx] texte (temps relatif
 * au debut du morceau). Texte simple (sans balises de temps) si pas encore
 * synchronise. Laisser vide si pas encore disponible.
 *
 * - "La Semi", "Backlash", "Living Proof" (studio) et "Dance Around" :
 *   textes corriges par l'artiste (les transcriptions auto initiales
 *   comportaient des erreurs de reconnaissance) ; les timestamps existants
 *   (issus des .srt d'origine) ont ete conserves et le texte remplace en
 *   consequence. "Dance Around" avait ete tres mal transcrit a l'origine
 *   (paroles totalement differentes) et a ete integralement corrige.
 * - "Half Life / Half Dead" (ex "Half Dead") : paroles fournies par
 *   l'artiste, mais SANS timing (pas de .srt) -> affichees en texte simple,
 *   non synchronise, en attendant un vrai fichier de sous-titres.
 * - "Living Proof (Live)" : .srt dedie a cette prise live (timing different
 *   de la version studio), non retouche dans cette passe de corrections.
 * - "Fast (feat. Trace)" : "Nora" et "Jose" sont des prenoms recurrents du
 *   texte (Nora aussi presente dans Living Proof), non retouche dans cette
 *   passe de corrections.
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
      title: "La Semi",
      file: "./audio/04-la-semi.mp3",
      scene: "./assets/scenes/scene-couple.jpg",
      duration: 244.37,
      credits: "",
      lyrics:
        "[00:00.10] La semi-liberté\n" +
        "[00:03.40] Rien que le mot, c'est pas déjà une arnaque ?\n" +
        "[00:09.58] On devrait pas plutôt dire l'inverse ?\n" +
        "[00:11.32] Ben ouais bro, on rentre pas en taule, on te fait sortir du monde\n" +
        "[00:14.51] T'es pas à moitié libre\n" +
        "[00:15.87] Genre à moitié heureux, ça existe ?\n" +
        "[00:18.24] T'es dehors avec une montre comme seule idée pour tout gérer\n" +
        "[00:21.71] Toute la journée\n" +
        "[00:23.19] Tu fais comme si t'avais une vie normale\n" +
        "[00:24.94] Tu t'entraînes\n" +
        "[00:25.82] Tu vois ta meuf\n" +
        "[00:26.75] Tu parles d'un bébé\n" +
        "[00:27.67] Tu te dis que ça va aller\n" +
        "[00:28.79] Et le soir, tu re-rentres en enfer\n" +
        "[00:30.53] Encore le Cerbère, et encore mon frère\n" +
        "[00:32.50] J'ai même essayé d'y rentrer à l'envers\n" +
        "[00:34.12] T'as la ref ?\n" +
        "[00:34.88] Spoiler, c'est pas Tenet\n" +
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
        "[00:58.90] Une boucle de deux putains de secondes\n" +
        "[01:00.62] Mais en fait\n" +
        "[01:01.35] Qui voudrait d'un pote qui clignote ?\n" +
        "[01:03.78] Chelou\n" +
        "[01:04.14] Vas-y j'enchaîne\n" +
        "[01:05.10] Et donc\n" +
        "[01:05.52] Tu commences à mentir dehors\n" +
        "[01:07.03] Et puis aussi à mentir dedans\n" +
        "[01:08.39] Rien de grave\n" +
        "[01:08.95] Mais c'est ce que font les gens\n" +
        "[01:10.07] Quand leur monde en cendres s'éparpille dans le vent\n" +
        "[01:11.91] Tu prends des risques dedans\n" +
        "[01:13.10] Parce que tu perds tout dehors\n" +
        "[01:14.52] Et toi au milieu\n" +
        "[01:15.30] Tu sais plus qui t'étais\n" +
        "[01:16.45] Tu commences à te fragmenter\n" +
        "[01:17.95] Tu te surprends même à croire\n" +
        "[01:19.46] À répéter leur vérité\n" +
        "[01:20.59] J'fais pas d'la pata-track mon vieux\n" +
        "[01:22.61] J'ai juste plus de larmes aux yeux qu'eux\n" +
        "[01:25.16] Alors je frappe\n" +
        "[01:27.45] Ok on dit j'boxe\n" +
        "[01:29.14] Ok on dit comme tu veux\n" +
        "[01:30.38] Parce qu'au moins dans la boxe\n" +
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
        "[02:16.28] Qui peut tout raser\n" +
        "[02:16.94] Retour à zéro\n" +
        "[02:17.76] Et ils te regardent comme si tout était déjà réglé\n" +
        "[02:20.79] Moi,\n" +
        "[02:21.04] ce que j'en pense\n" +
        "[02:21.87] Avec humilité,\n" +
        "[02:22.69] c'est qu'on va tout cramer bébé\n" +
        "[02:25.67] Ok\n" +
        "[02:25.90] J'ai fait de la merde\n" +
        "[02:27.40] Je le sais\n" +
        "[02:28.05] Toi tu te tais\n" +
        "[02:28.70] Ce qui est à moi\n" +
        "[02:29.77] Je le porte\n" +
        "[02:30.36] Pour ce qui est de mes choix\n" +
        "[02:31.50] À chacun son fardeau\n" +
        "[02:32.76] Vision périphérique au max\n" +
        "[02:34.51] D'où t'es, y'a pas photo\n" +
        "[02:35.90] T'es à deux doigts\n" +
        "[02:36.95] De prendre\n" +
        "[02:37.54] Le plus gros de tes coups de chaud\n" +
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
        "[03:23.72] Finalement je mets tout le monde d'accord\n" +
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
        "[03:41.30] Je baise à l'heure\n" +
        "[03:42.58] Je rêve de malheur\n" +
        "[03:44.34] Je rêve de meilleur\n" +
        "[03:47.74] Pince-moi, je crève\n" +
        "[03:52.44] Il va falloir que ça cesse",
    },
    {
      number: 2,
      title: "Half Life / Half Dead",
      file: "./audio/01-half-dead.mp3",
      scene: "./assets/scenes/scene-wall.jpg",
      duration: 149.81,
      credits: "",
      // Paroles fournies par l'artiste mais sans .srt : pas de timing reel
      // disponible -> texte simple non synchronise (pas de surlignage
      // karaoke tant qu'un vrai fichier de sous-titres n'est pas fourni).
      lyrics:
        "Half alive, half dead...\n" +
        "Depends where you're looking from.\n" +
        "J'ai laissé mon ombre à l'entrée,\n" +
        "Ma face passe encore, agent discret.\n" +
        "La nuit me croit encore,\n" +
        "Mais j'entends plus ce qui se passe dehors.\n" +
        "Quatre heures du mat', j'me dis que tu dors.\n" +
        "Deux heures de lumière sur la peau,\n" +
        "Une nuit de plus passée sur le dos.\n" +
        "Je marche droit, personne ne veut voir ça :\n" +
        "Chaque pas me ramène au même endroit.\n" +
        "Half alive, half dead,\n" +
        "Depends where you're looking from.\n" +
        "Un œil ouvert, l'autre sous terre,\n" +
        "J'ai la paix fragile, prêt à te refaire la guerre.\n" +
        "This is my life,\n" +
        "This ease my life,\n" +
        "My life, from where you're looking from.\n" +
        "Ils me voient debout, donc ils me croient vivant,\n" +
        "Mais y a des morts qui respirent mieux que moi en ce moment.\n" +
        "On m'appelle frère quand il faut quelque chose,\n" +
        "On m'appelle moins quand la lumière se pose.\n" +
        "Les mains sales connaissent mon prix,\n" +
        "Les belles âmes connaissent mon vrai nom la nuit.\n" +
        "J'ai pas peur des coups.\n" +
        "Méfie-toi du mal sous le calme,\n" +
        "Du sourire avant qu'on sorte les armes.\n" +
        "Je tiens ma parole comme on tient une lame,\n" +
        "Toujours par le mauvais côté...\n" +
        "Et ça jusqu'à la putain de première larme.\n" +
        "Le premier sang.\n" +
        "Half alive, half dead,\n" +
        "Depends where you're looking from.\n" +
        "Un pied dehors, l'autre devant...\n" +
        "C'est ça, la semi.\n" +
        "Ils veulent tous savoir où j'en suis.\n" +
        "This is my life,\n" +
        "This ease my life,\n" +
        "My life, half-life, high five.\n" +
        "Moi, je veux savoir ce qu'il restera de moi\n" +
        "Quand tout sera fini.",
    },
    {
      number: 3,
      title: "Backlash",
      file: "./audio/03-backlash.mp3",
      scene: "./assets/scenes/scene-gun.jpg",
      duration: 157.2,
      credits: "",
      lyrics:
        "[00:00.32] Under moonlight we burn, we fight, chasing one clean win at every turn\n" +
        "[00:05.53] Love on hold, my life, my heart on credit, falling for the flash, but the bill comes with it\n" +
        "[00:14.88] Backlash, bones break the same, backlash, everybody plays my game\n" +
        "[00:20.90] Love or money, that line gets blurred, when every promise has a price attached to every word\n" +
        "[00:30.01] Under pressure, hey, my killing moon, you learn that the good things leave too soon\n" +
        "[00:48.33] Is it the belt, the money, the praise? One bad step and the whole ring caves\n" +
        "[00:54.32] High guard, low blows, still I ride the wave, every round's a gamble, every deal makes a slave\n" +
        "[01:02.01] Trading punches, trading chances, the pulse runs through my veins, that's where I take my chances\n" +
        "[01:09.20] Friends and hearts, they break the same, one in the ring, one outside the frame\n" +
        "[01:15.70] Love or money, the lines get blurred, in the end, what are we really fighting for?\n" +
        "[01:53.36] Backlash, blood on the floor, win one round, they ask for more\n" +
        "[02:12.08] Love or money, the lines get blurred, in the end, what are we really fighting for?",
    },
    {
      number: 4,
      title: "Living Proof",
      file: "./audio/06-living-proof.mp3",
      scene: "./assets/scenes/scene-pill.jpg",
      duration: 154.56,
      credits: "",
      lyrics:
        "[00:00.20] Je vais baisser le son sans vraiment l'éteindre\n" +
        "[00:03.60] Faut que j'entende son coeur quand même\n" +
        "[00:06.16] C'est peut-être mieux comme ça\n" +
        "[00:09.60] Je sais pas\n" +
        "[00:13.48] Tu dors à moitié\n" +
        "[00:15.05] Ta main est tombée sur moi\n" +
        "[00:16.17] Je l'ai pas bougée, y'a un truc qui cogne dehors\n" +
        "[00:18.76] Putain ça cogne fort\n" +
        "[00:20.65] Ou alors c'est moi, j'suis pas sûr\n" +
        "[00:22.33] Je tourne en rond, un soleil à faible lueur\n" +
        "[00:24.88] On a pas bougé depuis un bail\n" +
        "[00:26.74] C'est pas un choix, c'est juste qu'on est bien juste là\n" +
        "[00:29.37] J'vois qu'on flotte, j'crois qu'on flotte\n" +
        "[00:32.09] Toi tu dors à moitié, moi en horaire éclatée\n" +
        "[00:34.82] Les semaines ont compté les heures\n" +
        "[00:36.82] À chacun sa croix, à chacun son leurre\n" +
        "[00:38.81] Reste encore un peu, juste le temps que\n" +
        "[00:43.20] Non je sais pas le temps de quoi\n" +
        "[00:46.02] T'as dit un truc dans ton sommeil\n" +
        "[00:47.62] J'ai pas compris lequel, je l'ai gardé près de mon coeur\n" +
        "[00:49.38] Un lapin dans les phares, foudroyé par la peur\n" +
        "[00:51.13] Mais ma main a glissé sur ton ventre\n" +
        "[00:53.14] Et j'ai pensé à tout ce qui vient\n" +
        "[00:54.73] Un trésor pour toujours en commun\n" +
        "[00:56.49] Et si dehors quelqu'un crie ou quelqu'un rit\n" +
        "[00:59.06] C'est presque la même chose\n" +
        "[01:00.74] Car tout s'embrouille, avec le temps tout rouille\n" +
        "[01:03.61] Vas-y viens on dort\n" +
        "[01:04.90] Tu devais aussi arrêter de fumer\n" +
        "[01:06.42] Mais moi ce que je sais\n" +
        "[01:07.53] C'est qu'on finit jamais rien\n" +
        "[01:09.13] Et c'est pas grave\n" +
        "[01:11.53] Norah, tout ça flotte, putain j'crois que tout ça flotte\n" +
        "[01:14.02] Entre ce que je promets et ce que j'arrive à faire\n" +
        "[01:16.10] Mais en pointillé, aide-moi à retenir nos heures\n" +
        "[01:18.73] À chacun tes choix, à chacun son coeur\n" +
        "[01:20.73] Mais l'amour au centre ici\n" +
        "[01:22.49] Si proche, plus tendre, reste encore un peu\n" +
        "[01:26.01] Juste le temps que\n" +
        "[01:28.88] Non je sais pas le temps, de quoi, quoi, quoi\n" +
        "[01:32.58] Si demain n'arrivait plus\n" +
        "[01:34.42] Si plus rien n'advenait\n" +
        "[01:36.17] On serait là pareil\n" +
        "[01:38.17] Le canal de l'Ourcq nous tient\n" +
        "[01:39.77] Ta respiration\n" +
        "[01:41.45] Sous la ligne de flottaison, floating point\n" +
        "[01:43.29] Bon, bon, bon, bon, bon, bon\n" +
        "[01:45.86] Viens on tient\n" +
        "[01:46.81] Après nous, à tout ce qui vient\n" +
        "[01:48.57] Ton souffle et moi, toi\n" +
        "[01:50.26] On est pareil, presque\n" +
        "[01:52.39] Ça gronde encore\n" +
        "[01:53.86] Ou c'est le système qui sombre\n" +
        "[01:55.62] J'ai pas les idées claires\n" +
        "[01:57.30] Reste encore un peu",
    },
    {
      number: 5,
      title: "Fast (feat. Trace)",
      file: "./audio/05-fast-feat-trace.mp3",
      scene: "./assets/scenes/scene-booking.jpg",
      duration: 443.4,
      credits: "",
      lyrics:
        "[00:00.09] Cash crash, cash crash\n" +
        "[00:04.09] Coach says I'm fast, he's right\n" +
        "[00:06.49] Cash crash, the problem is, so is my life\n" +
        "[00:11.09] Yeah\n" +
        "[00:13.00] Coach says I'm fast\n" +
        "[00:16.09] He says it like it's a good thing\n" +
        "[00:19.09] Fast, getting off the line\n" +
        "[00:22.10] Fast, pulling my head back\n" +
        "[00:26.09] Fast enough to see the punch\n" +
        "[00:29.09] Half a second before it lands\n" +
        "[00:32.09] Half a second is a long time\n" +
        "[00:35.09] You can close your eyes, you can change your mind\n" +
        "[00:38.09] You can miss a call, you can lose a fight\n" +
        "[00:41.10] I spend the whole day running\n" +
        "[00:43.09] So I can get locked up on time\n" +
        "[00:46.10] I think that's kinda funny\n" +
        "[00:48.09] Well, not funny like a joke\n" +
        "[00:50.09] Funny like when everybody spoke\n" +
        "[00:53.10] But nobody understand anything\n" +
        "[00:58.00] Cash crash, time throws the first punch\n" +
        "[01:02.09] Cash crash, I'm coming right behind it\n" +
        "[01:05.10] I move fast, I live fast\n" +
        "[01:08.09] I move fast, I fuck you\n" +
        "[01:10.09] But your time is already here\n" +
        "[01:19.01] Nora asked me if I'm okay\n" +
        "[01:22.09] I say yes, I say no\n" +
        "[01:24.10] I'm shameless because it would take too long\n" +
        "[01:28.09] Then she looks at me like she's waiting for the rest\n" +
        "[01:32.09] There's always a test\n" +
        "[01:33.09] Another session, another fav\n" +
        "[01:35.09] Another kind suck\n" +
        "[01:36.10] Another guy saying, standing, pretending\n" +
        "[01:38.10] Don't worry, it'll be quick\n" +
        "[01:39.09] Everything's quick now\n" +
        "[01:40.09] The money, the punches, the apologies\n" +
        "[01:43.10] Even mistakes happen before you decide to make them\n" +
        "[01:47.09] You're right to be sorry\n" +
        "[01:49.10] Your life will end here, my dear\n" +
        "[01:53.00] Cash crash, time throws the first punch\n" +
        "[01:57.10] Cash crash, I'm coming right behind it\n" +
        "[02:00.09] I move fast, I live fast\n" +
        "[02:03.10] I move fast, I fuck you\n" +
        "[02:05.09] I want you to hit me as fast as you can\n" +
        "[02:11.00] But the hour's already here\n" +
        "[02:15.10] You're lost\n" +
        "[02:18.00] Jose says\n" +
        "[02:21.00] Be smart as fast as you are\n" +
        "[02:23.09] So I think\n" +
        "[02:25.09] Before the punch\n" +
        "[02:26.09] Before the question\n" +
        "[02:28.10] Before Nora notices\n" +
        "[02:30.09] I'm checking the time again\n" +
        "[02:33.10] I leave so early\n" +
        "[02:36.09] Sometimes I wonder\n" +
        "[02:39.09] If I was ever really here\n" +
        "[02:43.00] Cash crash, cash crash\n" +
        "[02:46.10] Everybody wants to save time\n" +
        "[02:48.09] Cash crash\n" +
        "[02:49.09] Nobody knows where they're going\n" +
        "[02:51.09] I move fast\n" +
        "[02:53.10] I think fast\n" +
        "[02:55.09] I move fast\n" +
        "[02:56.09] Pull guys in neutral\n" +
        "[02:58.09] To get in\n" +
        "[03:00.10] To get out\n" +
        "[03:02.09] To end up in the same place\n" +
        "[03:09.00] Coach says I'm fast\n" +
        "[03:11.10] He's right\n" +
        "[03:13.10] The problem is\n" +
        "[03:15.09] So is my life\n" +
        "[03:31.00] Coach says I'm fast\n" +
        "[03:38.01] Coach says I'm fast\n" +
        "[03:41.00] Cash crash\n" +
        "[03:44.99] Coach says I'm fast\n" +
        "[03:48.00] He says it like it's a good thing\n" +
        "[03:51.10] Fast, getting off the line\n" +
        "[03:54.09] Fast, pulling my head back\n" +
        "[03:57.99] Fast enough to see the punch\n" +
        "[04:01.09] Half a second before it lands\n" +
        "[04:04.09] Half a second is a long time\n" +
        "[04:07.09] You can close your eyes\n" +
        "[04:09.10] You can change your mind\n" +
        "[04:11.09] You can miss a call\n" +
        "[04:13.09] You can lose a fight\n" +
        "[04:15.10] I spend a whole day running\n" +
        "[04:17.09] So I can get locked up on time\n" +
        "[04:20.09] I think that's kind of funny\n" +
        "[04:22.10] Well, not funny, like a joke\n" +
        "[04:24.09] Funny like when everybody spoke\n" +
        "[04:27.10] But nobody understand anything\n" +
        "[04:32.00] Cash crash\n" +
        "[04:34.10] Time throws the first punch\n" +
        "[04:36.09] Cash crash\n" +
        "[04:38.09] I'm coming right behind it\n" +
        "[04:40.10] I move fast\n" +
        "[04:41.10] I live fast\n" +
        "[04:42.09] I live fast\n" +
        "[04:43.09] I move fast\n" +
        "[04:44.09] I fuck you\n" +
        "[04:46.10] But your time is already here\n" +
        "[04:48.10] Nora asks me if I'm okay\n" +
        "[04:50.09] I say yes\n" +
        "[04:51.09] I say no\n" +
        "[04:52.10] I'm shameless\n" +
        "[04:54.10] Because it would take too long\n" +
        "[04:56.09] Then she looks at me\n" +
        "[04:58.09] Like she's waiting for the rest\n" +
        "[05:00.10] There's always a test\n" +
        "[05:02.09] Another session\n" +
        "[05:03.09] Another favor\n" +
        "[05:04.09] Another favor\n" +
        "[05:05.10] Another kind sucker\n" +
        "[05:06.10] Another guy saying standing\n" +
        "[05:08.09] Pretending\n" +
        "[05:09.09] Don't worry, it'll be quick\n" +
        "[05:11.10] Everything's quick now\n" +
        "[05:13.10] The money\n" +
        "[05:14.09] The punches\n" +
        "[05:15.09] The apologies\n" +
        "[05:16.09] Even mistakes happen before you\n" +
        "[05:19.10] Decide to make them\n" +
        "[05:20.09] You're right to be sorry\n" +
        "[05:23.09] Your life will end here, my dear\n" +
        "[05:28.00] Cash crash\n" +
        "[05:29.09] Time throws the first punch\n" +
        "[05:31.10] Cash crash\n" +
        "[05:33.09] I'm coming right behind it\n" +
        "[05:35.09] I move fast\n" +
        "[05:36.09] I live fast\n" +
        "[05:37.10] I live fast\n" +
        "[05:38.10] I move fast\n" +
        "[05:39.09] I fuck you\n" +
        "[05:40.09] But your time is already here\n" +
        "[05:42.09] Nora asks me if I'm okay\n" +
        "[05:45.10] I say yes\n" +
        "[05:46.09] I say no\n" +
        "[05:47.09] I'm shameless\n" +
        "[05:48.09] Because it would take too long\n" +
        "[05:51.10] Then she looks at me\n" +
        "[05:52.09] Like she's waiting for the rest\n" +
        "[05:55.09] There's always a test\n" +
        "[05:57.10] Another session\n" +
        "[05:58.09] Another favor\n" +
        "[05:59.09] Another kind sucker\n" +
        "[06:00.09] Another guy saying standing\n" +
        "[06:03.10] Pretending\n" +
        "[06:04.10] Don't worry, it'll be quick\n" +
        "[06:06.09] Everything's quick now\n" +
        "[06:08.10] The money\n" +
        "[06:09.10] The punches\n" +
        "[06:10.10] The apologies\n" +
        "[06:11.09] Even mistakes happen before you\n" +
        "[06:14.09] Decide to make them\n" +
        "[06:16.10] You're right to be sorry\n" +
        "[06:18.09] Your life will end here, my dear\n" +
        "[06:23.01] Cash crash\n" +
        "[06:24.09] Time throws the first punch\n" +
        "[06:27.10] Cash crash\n" +
        "[06:28.10] I'm coming right behind it\n" +
        "[06:30.09] I move fast\n" +
        "[06:31.09] I live fast\n" +
        "[06:32.09] I live fast\n" +
        "[06:33.09] I move fast\n" +
        "[06:34.10] I move fast\n" +
        "[06:35.10] I fuck you\n" +
        "[06:36.09] But your time is already here\n" +
        "[06:38.09] Nora asks me if I'm okay\n" +
        "[06:40.10] I say yes\n" +
        "[06:42.10] I say no\n" +
        "[06:43.09] I'm shameless\n" +
        "[06:44.09] Because it would take too long\n" +
        "[06:47.10] Then she looks at me\n" +
        "[06:48.10] Like she's waiting for the rest\n" +
        "[06:51.09] There's always a test\n" +
        "[06:53.10] Another session\n" +
        "[06:54.10] Another favor\n" +
        "[06:55.09] Another kind sucker\n" +
        "[06:56.09] Another guy saying standing\n" +
        "[06:58.09] Pretending\n" +
        "[06:59.10] Don't worry, it'll be quick\n" +
        "[07:01.10] Everything's quick now\n" +
        "[07:02.09] The money\n" +
        "[07:03.09] The punches\n" +
        "[07:04.09] The apologies\n" +
        "[07:05.10] Even mistakes happen before you\n" +
        "[07:08.09] Decide to make them\n" +
        "[07:09.09] You're right to be sorry\n" +
        "[07:11.09] Your life will end here, my dear\n" +
        "[07:17.00] Cash crash\n" +
        "[07:18.10] Time throws the first punch\n" +
        "[07:21.09] Cash crash\n" +
        "[07:22.09] I'm coming right behind it",
    },
    {
      number: 6,
      title: "Living Proof (Live)",
      file: "./audio/02-living-proof-live.mp3",
      scene: "./assets/scenes/scene-lighter.jpg",
      duration: 184.32,
      credits: "",
      // Timing propre a cette prise live (fichier .srt dedie, distinct de la
      // version studio).
      lyrics:
        "[00:00.09] Je veux baisser le son, sans vraiment l'éteindre\n" +
        "[00:05.80] Faut que j'entende son coeur quand même\n" +
        "[00:10.01] C'est peut-être mieux comme ça\n" +
        "[00:20.00] Tu dors à moitié, ta main est tombée sur moi\n" +
        "[00:23.09] Je l'ai pas bougé, y'a un truc qui cogne dehors\n" +
        "[00:25.09] Putain ça cogne fort\n" +
        "[00:27.10] Ou alors c'est moi, je suis pas sûr\n" +
        "[00:29.09] Je tourne en rond, un soleil à faible lueur\n" +
        "[00:31.09] On a pas bougé depuis un bail\n" +
        "[00:33.10] C'est pas un choix, c'est juste qu'on est bien juste là\n" +
        "[00:36.10] Je vois qu'on flotte, je crois qu'on flotte\n" +
        "[00:38.10] Toi tu dors à moitié, moi en horaire éclatée\n" +
        "[00:41.10] Des semaines à compter les heures\n" +
        "[00:43.09] À chacun sa croix, à chacun son leurre\n" +
        "[00:45.09] Reste encore un peu, juste le temps que\n" +
        "[00:50.01] Non je sais pas le temps de quoi\n" +
        "[01:00.00] Je sais pas le temps de quoi\n" +
        "[01:02.09] T'as dit un truc dans ton sommeil\n" +
        "[01:04.10] J'ai pas compris lequel, je l'ai gardé près de mon coeur\n" +
        "[01:06.09] Un lapin dans les phares, foudroyé par la peur\n" +
        "[01:08.09] Mais ma main a glissé sur ton ventre\n" +
        "[01:10.10] Et j'ai pensé à tout ce qui vient\n" +
        "[01:12.09] Un trésor pour toujours en commun\n" +
        "[01:15.09] Et si dehors, quelqu'un crie ou quelqu'un rit\n" +
        "[01:18.09] C'est presque la même chose\n" +
        "[01:20.09] Car tout s'embrouille, avec le temps tout rouille\n" +
        "[01:23.09] Vas-y viens, on dort\n" +
        "[01:30.00] Tu peux aussi arrêter de fumer, mais moi ce que je sais\n" +
        "[01:33.10] C'est qu'on finit jamais rien et c'est pas grave\n" +
        "[01:36.10] Nora, tout ça flotte, putain je crois que tout ça flotte\n" +
        "[01:39.10] Entre ce que je promets et ce que j'arrive à faire\n" +
        "[01:41.09] Mais en pointillé, aide-moi à retenir nos heures\n" +
        "[01:44.09] À chacun de tes choix, à chacun son coeur\n" +
        "[01:46.09] Mets l'amour au centre, ici\n" +
        "[01:50.00] Reste encore un peu, juste le temps que\n" +
        "[01:53.10] Mets l'amour au centre, ici\n" +
        "[01:55.09] Plus, reste encore un peu\n" +
        "[01:57.09] Juste le temps que\n" +
        "[02:00.00] Non je sais pas le temps de quoi\n" +
        "[02:04.00] Si demain n'arrivait plus\n" +
        "[02:07.00] On serait là, pareil\n" +
        "[02:09.09] Canal de l'Ourcq nous tient\n" +
        "[02:13.00] Sous la ligne de flottaison\n" +
        "[02:16.99] Après nous\n" +
        "[02:19.10] Ton souffle et moi à toi\n" +
        "[02:23.00] Presque, ça gronde encore\n" +
        "[02:25.10] Ou c'est le système qui sombre\n" +
        "[02:27.09] J'ai pas les idées claires\n" +
        "[02:29.09] Reste encore un peu\n" +
        "[02:39.00] Je sais pas le temps de quoi\n" +
        "[02:53.00] Je sais pas le temps de quoi\n" +
        "[02:59.00] Reste encore un peu",
    },
    {
      number: 7,
      title: "Dance Around",
      file: "./audio/07-dance-around.mp3",
      scene: "./assets/scenes/scene-morgue.jpg",
      duration: 185.71,
      credits: "",
      // Fichier audio remplace le 30/07 (~4s plus court que l'original) ; le
      // calage des paroles ci-dessous vient de l'ancien fichier et n'a pas pu
      // etre reverifie a l'oreille sur celui-ci — a confirmer.
      lyrics:
        "[00:00.42] Dance as long as you can dance, dance around the earth\n" +
        "[00:24.96] Free as a man, one day left before the gate turns\n" +
        "[00:30.29] Light as the wind that dances through the jail's trees\n" +
        "[00:34.85] Or the ropes of a ring that dance beneath the blow\n" +
        "[00:42.17] Dance as long as you can dance, on the canvas, on the tar\n" +
        "[00:45.06] On a burnt ground, in the shadow of a master\n" +
        "[00:50.33] Come, let yourself be carried by every kind of music\n" +
        "[00:55.13] Rising from a speaker or a kid's playing bow\n" +
        "[01:01.14] Dance as long as you can dance, dance around the earth\n" +
        "[01:06.25] Dance in the arms of your mother, or Norah and Jo\n" +
        "[01:11.45] Dance to find love again, and madness too\n" +
        "[01:16.74] Dance to dazzle your soul, when it's bored and blue\n" +
        "[01:22.41] Dance as long as you can dance, dance around the earth\n" +
        "[01:48.01] So you no longer carry the count and the trials on your back\n" +
        "[01:50.81] And you will see in plain sight, summer burst through the light\n" +
        "[01:53.45] Pray for torrents of joy running loose under your skin\n" +
        "[01:58.98] Dance as long as you can dance, dance around the earth\n" +
        "[02:04.09] Dance so a brand-new day may bloom behind the wall\n" +
        "[02:09.37] Dance the way we fight, dance the way we love\n" +
        "[02:14.56] Dance the way we write our names upon the walls\n" +
        "[02:20.16] Dance as long as you can dance, dance around the earth\n" +
        "[02:25.70] Dance as long as you can dance, come, the round is open\n" +
        "[02:30.73] Dance as long as you can dance, dance around the earth\n" +
        "[02:35.93] Dance as long as you can dance, come, the round is open\n" +
        "[02:41.37] Dance as long as you can dance, dance as long as you can dance\n" +
        "[02:45.29] Dance around the earth, dance as long as you can dance\n" +
        "[02:49.69] Come, the round is open",
    },
  ],
};
