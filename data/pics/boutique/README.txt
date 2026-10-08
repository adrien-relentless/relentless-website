Photos de la boutique.

Le nom de chaque fichier doit correspondre a la colonne "image" de data/boutique.csv :
  ebook-force.jpg, ebook-hypertrophie.jpg, ebook-pack.jpg,
  sweat-navy.jpg, tshirt-rouge.jpg, tshirt-noir.jpg, tshirt-blanc.jpg,
  tshirt-og.jpg, tshirt-a7.jpg

Format conseille : carre, 800x800 px environ, JPG.
Si une photo manque, une vignette texte s'affiche a la place.

Colonne "statut" de data/boutique.csv :
  disponible = en vente
  rupture    = affiche, bouton "Indisponible"
  masque     = n'apparait pas sur le site

Colonne "mise_en_avant" de data/boutique.csv :
  vide            = normal
  oui             = produit place en premier + lisere rouge
  autre texte     = idem + ce texte affiche en badge (ex. Meilleure offre)

Colonne "nom" de data/boutique.csv :
  | = saut de ligne force dans le titre affiche sur le site
      ex. Pack Force +|Hypertrophie  ->  Pack Force +
                                        Hypertrophie
