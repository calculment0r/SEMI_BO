# Polices embarquees

## Archivo Black (`archivo-black-latin.woff2`)

Utilisee pour le mot **SEMI** en haut de la page.

- Auteur : Omnibus-Type
- Licence : SIL Open Font License 1.1 (voir `OFL.txt`) — utilisation libre,
  y compris commerciale, embarquement autorise.
- Source : Google Fonts (https://fonts.google.com/specimen/Archivo+Black),
  sous-ensemble « latin ».

La police est **servie depuis le depot**, pas depuis Google Fonts : le site
reste entierement autonome (fonctionne hors-ligne via le service worker) et
n'envoie aucune requete a un serveur tiers.

Pour la remplacer : deposer le nouveau `.woff2` ici, mettre a jour le
`@font-face` dans `css/styles.css` et le chemin dans `service-worker.js`.
