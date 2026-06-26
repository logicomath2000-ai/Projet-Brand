# ŒIL STUDIO

Site de présentation (one-page) pour **Œil Studio** — un studio fictif de
**scénographie et de direction artistique** dédié aux maisons premium :
vitrines, espaces de vente et récits de collection.

> *« L'art d'être vu. »*

## Le concept

- **Animation d'entrée** : un œil fermé qui s'ouvre, suit le curseur, puis nous
  avale en zoomant dans la pupille pour révéler le site (clic ou « Entrer » pour
  accélérer ; passe automatiquement après quelques secondes).
- **Direction artistique** : palette *encre / os / iris ambré / iris indigo*,
  typographie éditoriale (Fraunces) ponctuée de libellés techniques (Space Mono),
  grain de film et halos d'iris.
- **Sections** : Studio (manifeste + œil vivant qui suit la souris),
  Savoir-faire, Œuvres choisies, Méthode, Artistes & complices, Contact.

## Structure

| Fichier | Rôle |
|---|---|
| `index.html` | Contenu & structure (SVG de l'œil inclus) |
| `styles.css` | Direction artistique, mise en page, animations |
| `script.js` | Séquence de l'œil, curseur, reveal au scroll, parallaxe, œil-traqueur |
| `og.svg` | Visuel de partage social |
| `archive/vespertine/` | Ancien site, conservé |

## Lancer

Aucune dépendance. Ouvrir `index.html`, ou servir le dossier :

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

L'animation respecte `prefers-reduced-motion`.

## Note

Œil Studio est un **concept fictif** réalisé à des fins de démonstration.
Les fondateurs (Gaétan Gibert Roussel & Noé Loisy Delattre), les artistes et
les projets sont imaginaires.
Les marques réelles citées (Chrome Hearts, BAPE) appartiennent à leurs
propriétaires respectifs et ne sont mentionnées qu'à titre illustratif.
