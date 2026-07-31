# SEMI — lecteur d'album

Site statique pour ecouter un album depuis un telephone ou un ordinateur.
Aucun serveur, aucune base de donnees, aucun abonnement. Se publie tel quel sur
GitHub Pages.

- Lecteur base sur l'element `<audio>` natif (le systeme reconnait la lecture).
- La lecture continue ecran eteint / telephone verrouille / autre application.
- Pochette, titre, artiste et album sur l'ecran verrouille (Media Session API).
- Chaque morceau a son propre plan large ("scene") en fond de page : recadre
  en vertical, il pan lentement (facon Ken Burns) pendant la lecture, et fond
  enchaine vers la scene suivante au changement de morceau.
- Paroles karaoke synchronisees (facultatif) dans la page.
- Installable comme application (PWA), fonctionne aussi hors-ligne pour l'interface.
- Deux modes de lecture : un fichier par morceau, ou un seul fichier continu.

Les fichiers actuels contiennent des morceaux et des scenes **placeholders**
(marques "PLACEHOLDER" / "A REMPLACER"), a remplacer par les vrais.

---

## 1. Structure du projet

```
/
├── index.html            Page unique
├── manifest.webmanifest  PWA
├── service-worker.js     Cache hors-ligne (interface uniquement)
├── assets/
│   ├── cover-1200.jpg    Pochette (grand affichage)
│   ├── cover-512.jpg     Pochette (ecran verrouille / icone PWA)
│   ├── icon-192.png      Icone PWA
│   ├── icon-512.png      Icone PWA
│   └── scenes/
│       ├── scene-01.jpg  Plan large de la piste 1 (fond anime pendant la lecture)
│       ├── scene-02.jpg  ...
│       └── ...
├── audio/
│   ├── 01.mp3
│   ├── 02.mp3
│   └── album-complet.mp3 Album en un seul fichier (pour le mode continu)
├── css/styles.css
└── js/
    ├── album-data.js     >>> LE SEUL FICHIER A MODIFIER <<<
    ├── player.js         Moteur de lecture
    └── app.js            Interface + scene cinema
```

Aucune etape de build. Il suffit d'ouvrir le site depuis un serveur HTTP statique.

---

## 2. Mettre ton propre album

Tout se passe dans **`js/album-data.js`**. Le reste n'a pas besoin d'etre touche.

### a. Les fichiers audio

1. Encode tes morceaux en **MP3, 192 ou 256 kbit/s, 44,1 kHz, stereo**.
   (Ne mets pas les WAV d'origine : trop lourds.)
2. Copie-les dans le dossier `audio/`.
3. Attention a la **limite GitHub de 100 Mo par fichier**.

### b. Declarer les morceaux

Dans `album-data.js`, adapte le tableau `tracks` :

```js
tracks: [
  {
    number: 1,
    title: "Nom du morceau",
    file: "./audio/01-nom-du-morceau.mp3",
    scene: "./assets/scenes/scene-01.jpg",  // plan large affiche pendant ce morceau
    duration: 218.5, // duree en secondes (affichee dans la playlist)
    start: 0.0,      // utile seulement en mode continu
    end: 218.5,      // utile seulement en mode continu
    credits: "",     // facultatif
    lyricsFile: "./lyrics/01-nom-du-morceau.lrc",  // facultatif (voir section 3)
  },
  // ...
]
```

Renseigne aussi en haut du fichier : `title`, `artist`, `year`, `description`,
et les `links` (laisse `""` pour masquer un lien).

Les champs facultatifs peuvent rester vides : le site fonctionne sans.

---

## 3. Paroles (fichiers .lrc)

Les paroles vivent dans des fichiers **`.lrc` separes**, un par morceau, dans le
dossier `lyrics/`. Le morceau les reference via `lyricsFile` :

```js
lyricsFile: "./lyrics/04-la-semi.lrc",
```

Laisse `lyricsFile: ""` (ou retire le champ) pour un morceau sans paroles.

Format **LRC** standard : chaque ligne commence par son temps
`[minute:seconde.centieme]`, **relatif au debut du morceau**.

```
[00:12.40]Premiere ligne
[00:16.90]Deuxieme ligne
[00:21.10]Troisieme ligne
```

Pour mettre a jour les paroles d'un morceau, il suffit de remplacer son fichier
`.lrc` : aucun code a toucher.

### Apartes et voix secondaires

Deux lignes qui portent **exactement le meme timestamp** sont affichees
**ensemble**, et restent a l'ecran jusqu'au timestamp suivant. C'est la
convention utilisee pour les apartes : la ligne **entre parentheses** (une voix
differente) est ecrite sur le meme temps que la phrase qu'elle accompagne, et
s'affiche en retrait au-dessus d'elle.

```
[00:18.19](genre a moitié heureux ca existe?)
[00:18.19]T'es dehors avec une montre comme seule idee pour tout gerer.
```

Les marqueurs de mise en forme parfois laisses par les outils d'export
(`**gras**`, `# titre`) sont retires automatiquement a l'affichage.

Les paroles s'affichent dans le panneau du lecteur **deplie** (accordeon), une
ligne a la fois, en suivant la lecture.

> Limite importante : les paroles s'affichent **dans la page**, quand l'ecran est
> allume. Elles n'apparaissent **pas** sur l'ecran verrouille : aucun navigateur
> mobile n'expose les paroles au systeme. L'ecran verrouille montre uniquement la
> pochette, le titre, l'artiste et l'album (voir section 9).

---

## 4. Remplacer la pochette

1. Prepare une image **carree**.
2. Exporte deux versions JPG :
   - `assets/cover-1200.jpg` (1200 x 1200, pour l'affichage) ;
   - `assets/cover-512.jpg` (512 x 512, pour l'ecran verrouille et la PWA).
3. Garde les memes noms de fichier : rien d'autre a changer.
   (Sinon, mets a jour `cover` et `artwork512` dans `album-data.js`.)

Garde bien une source **carree** : c'est ce format qu'utilisent l'ecran
verrouille et la PWA.

Le **bandeau du haut** est une image separee (champ `headerImage` dans
`album-data.js`), en **21:9**, qui ne doit PAS contenir de texte incruste : le
mot de l'album est ecrit par-dessus en vraie typo (Archivo Black, embarquee
dans `assets/fonts/`), donc toujours entier quelle que soit la taille d'ecran.

---

## 4 bis. Harmoniser le volume entre les morceaux

Si un morceau parait beaucoup plus fort ou plus faible que les autres, c'est
que les masters n'ont pas le meme niveau percu. Chaque piste accepte un champ
`gain` (entre 0 et 1) applique a la lecture :

```js
gain: 0.598,
```

On ne peut qu'**attenuer** (le volume d'un `<audio>` plafonne a 1) : la cible
est donc le niveau du morceau le plus faible, et les autres sont baisses
jusqu'a lui. Ce gain est independant du curseur de volume : l'utilisateur garde
la main, son reglage ne bouge pas d'un morceau a l'autre.

Pour recalculer les valeurs, mesure le **LUFS integre** (norme EBU R128) de
chaque piste — c'est le niveau *percu*, bien plus fiable qu'un simple volume
moyen — puis pour chaque morceau :

```
gain = 10 ^ ((LUFS_du_plus_faible - LUFS_du_morceau) / 20)
```

Verifie ensuite que `crete x gain` reste sous 1.0 pour chaque piste.

---

## 5. Remplacer les scenes (fond anime par morceau)

1. Prepare une image **large / panoramique** par morceau (format cinema, ex.
   21:9 ou 2.4:1 — plus l'image est large par rapport a un ecran de telephone
   en vertical, plus le pan a de la place pour se deplacer).
2. Exporte-la en JPG raisonnable pour le web (~1600-2400px de large, qualite
   ~80-85 ; ce sont des fonds de page charges a chaque morceau, pas des images
   pleine resolution).
3. Place-la dans `assets/scenes/`, et reference-la dans le champ `scene` du
   morceau correspondant dans `album-data.js`.
4. Si un morceau n'a pas de `scene`, la derniere scene affichee reste a l'ecran.

Le pan (vitesse, easing) se regle dans `css/styles.css`, propriete
`animation` de `.scene-layer` (`scene-pan`).

---

## 6. Mode album continu (facultatif)

Utile surtout pour ameliorer la fiabilite sur iPhone ecran verrouille : un seul
fichier audio au lieu d'un par morceau, jamais remplace pendant la lecture.

Pour l'activer, dans `album-data.js` :

```js
playbackMode: "continuous",
continuousFile: "./audio/album-complet.mp3",
```

Chaque morceau doit alors avoir un `start` et un `end` (en secondes) qui reperent
sa position dans le fichier continu. Le fichier `audio/album-complet.mp3` fourni
correspond deja aux deux morceaux de demo.

### Obtenir les `start` / `end` de tes morceaux

Si tu fabriques ton propre fichier continu, les bornes sont les durees cumulees :
`start` d'un morceau = somme des durees des precedents ; `end` = `start` + sa duree.
Un outil comme `ffprobe` (ou n'importe quel editeur audio) te donne la duree exacte
de chaque piste.

---

## 7. Publier sur GitHub Pages

1. Cree un depot GitHub (public) et pousse ces fichiers a la racine.
2. Sur GitHub : **Settings > Pages**.
3. **Source** : `GitHub Actions` (le workflow `.github/workflows/deploy-pages.yml`
   deploie automatiquement a chaque push sur `main` ou la branche de dev).
5. Patiente une minute : le site est publie sur
   `https://ton-utilisateur.github.io/nom-du-depot/`.

Tous les chemins du projet sont **relatifs** : le site fonctionne aussi bien a la
racine (`https://ton-utilisateur.github.io/`) que dans un sous-dossier
(`https://ton-utilisateur.github.io/nom-du-depot/`).

### Nom de domaine personnalise (plus tard)

Dans **Settings > Pages > Custom domain**, saisis ton domaine, puis cree chez ton
hebergeur un enregistrement DNS (CNAME vers `ton-utilisateur.github.io`, ou les
enregistrements A de GitHub Pages). GitHub ajoute un fichier `CNAME` au depot.
Active "Enforce HTTPS" une fois le domaine valide.

---

## 8. Tester en local

Il faut un petit serveur HTTP (ouvrir le fichier en `file://` empeche le service
worker et certaines fonctions). Par exemple :

```bash
# Python 3
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

Pour tester sur ton telephone sur le meme reseau Wi-Fi, ouvre
`http://IP-DE-TON-ORDI:8000`. (La lecture ecran verrouille se teste vraiment une
fois le site en HTTPS, donc de preference apres publication sur GitHub Pages.)

---

## 9. Limitations iOS a connaitre

- La lecture en arriere-plan / ecran verrouille repose sur l'element `<audio>`
  natif et la Media Session API. C'est fiable, mais iOS reste plus capricieux
  que la lecture d'une appli native : garde la page ouverte (ne ferme pas
  l'onglet Safari), et privilegie le **mode continu** si tu constates des coupures
  ecran verrouille.
- La **premiere lecture** doit toujours etre declenchee par un appui de
  l'utilisateur (regle des navigateurs). Aucune lecture automatique au chargement.
- Les boutons suivant / precedent de l'ecran verrouille dependent du navigateur ;
  ils fonctionnent quand celui-ci les autorise.
- Les **paroles** ne s'affichent que dans la page (ecran allume), jamais sur
  l'ecran verrouille (aucun navigateur ne l'expose au systeme).

---

## 10. Checklist de tests manuels

### iPhone (Safari)
- [ ] Lancer un morceau.
- [ ] Verrouiller l'ecran : la musique continue.
- [ ] Pochette, titre et artiste visibles sur l'ecran verrouille.
- [ ] Pause / lecture depuis l'ecran verrouille.
- [ ] Morceau suivant depuis l'ecran verrouille.
- [ ] Attendre la fin d'un morceau : passage automatique au suivant.
- [ ] Revenir dans Safari : l'interface est synchronisee.
- [ ] Deplier le lecteur (clic sur un titre ou sur la vignette) : le spectre
      defile et la ligne de paroles suit la musique.

### Android (Chrome)
- [ ] Memes tests que ci-dessus.

### Ordinateur (Chrome, Safari, Firefox)
- [ ] Lecture / pause, changement de piste.
- [ ] Deplacement dans la barre de progression.
- [ ] Volume et bouton muet.
- [ ] Navigation au clavier (Tab, Entree, barre espace, fleches sur la barre).
- [ ] Recharger la page : le morceau et la position sont restaures (sans
      demarrer tout seul).
- [ ] Changement de morceau : la scene en fond fond-enchaine et pan.

---

## 11. En cas de probleme

- Un message lisible s'affiche en haut de la page en cas d'erreur (fichier
  introuvable, format non supporte, lecture bloquee...). Les details techniques
  vont dans la console du navigateur.
- Si un morceau ne se lance pas : verifie le chemin dans `album-data.js` et que
  le fichier existe bien dans `audio/` (attention aux majuscules : GitHub Pages
  est sensible a la casse).
- Si le service worker sert une vieille version apres une mise a jour : change
  `CACHE` dans `service-worker.js` (par ex. `semi-v2`).
