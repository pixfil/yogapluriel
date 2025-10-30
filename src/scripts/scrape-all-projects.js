// Script pour récupérer tous les projets du site formdetoit.fr
const fs = require('fs');
const path = require('path');

// Liste de tous les projets identifiés manuellement depuis le site
const projectsData = {
  "categories": [
    {
      "id": "ardoise",
      "name": "Ardoise", 
      "slug": "ardoise",
      "color": "#374151"
    },
    {
      "id": "tuile-plate",
      "name": "Tuile Plate",
      "slug": "tuile-plate", 
      "color": "#DC2626"
    },
    {
      "id": "tuile-mecanique",
      "name": "Tuile Mécanique",
      "slug": "tuile-mecanique",
      "color": "#B91C1C"
    },
    {
      "id": "zinc",
      "name": "Zinc",
      "slug": "zinc",
      "color": "#6B7280"
    },
    {
      "id": "cuivre", 
      "name": "Cuivre",
      "slug": "cuivre",
      "color": "#B45309"
    },
    {
      "id": "alu-prefa",
      "name": "Alu Prefa", 
      "slug": "alu-prefa",
      "color": "#4B5563"
    },
    {
      "id": "velux",
      "name": "Velux",
      "slug": "velux",
      "color": "#2563EB"
    },
    {
      "id": "isolation",
      "name": "Isolation",
      "slug": "isolation", 
      "color": "#059669"
    },
    {
      "id": "epdm",
      "name": "EPDM",
      "slug": "epdm",
      "color": "#1E293B"
    },
    {
      "id": "zinguerie",
      "name": "Zinguerie",
      "slug": "zinguerie",
      "color": "#7C2D12"
    },
    {
      "id": "patrimoine",
      "name": "Patrimoine", 
      "slug": "patrimoine",
      "color": "#7C3AED"
    }
  ],
  "projects": [
    // PAGE 1 DU PORTFOLIO
    {
      "id": "refection-toiture-joint-debout-prefa",
      "slug": "refection-toiture-joint-debout-prefa", 
      "title": "Réfection toiture avec isolation biosourcée en joint debout PREFA",
      "subtitle": "Complexité architecturale et performance",
      "location": "Bas-Rhin",
      "date": "2024",
      "category": ["alu-prefa", "velux", "isolation"],
      "mainImage": "/realisations/prefa-joint-debout/main.jpg",
      "gallery": [
        {
          "id": "1",
          "url": "/realisations/prefa-joint-debout/avant-1.jpg",
          "alt": "Structure avant travaux", 
          "type": "avant",
          "order": 1
        },
        {
          "id": "2",
          "url": "/realisations/prefa-joint-debout/apres-1.jpg",
          "alt": "Toiture aluminium terminée",
          "type": "apres", 
          "order": 2
        }
      ],
      "description": "Projet de haute technicité comprenant deux demi-tourelles (absides) à structure courbe, avec l'intégration de 4 fenêtres Velux. La complexité architecturale nécessite un support en bois double couche croisée pour une planimétrie parfaite. Couverture aluminium PREFA en joint debout avec rives courbes verticales et lucarne à pans coupés.",
      "technicalDetails": [
        "Aluminium PREFA joint debout",
        "Support bois double couche croisée", 
        "4 fenêtres Velux intégrées",
        "Rives courbes verticales",
        "Lucarne à pans coupés"
      ],
      "materials": [
        "Aluminium PREFA",
        "Bois lamellé-collé",
        "Velux",
        "Isolant biosourcé"
      ],
      "duration": "4 semaines",
      "featured": true,
      "published": true
    },
    {
      "id": "refection-toiture-patrimoine-strasbourg", 
      "slug": "refection-toiture-patrimoine-strasbourg",
      "title": "Réfection totale de toiture du patrimoine Strasbourgeois",
      "subtitle": "en plein centre de la grande-île",
      "location": "Strasbourg",
      "date": "2024", 
      "category": ["patrimoine", "tuile-plate"],
      "mainImage": "/realisations/patrimoine-strasbourg/main.jpg",
      "gallery": [
        {
          "id": "1",
          "url": "/realisations/patrimoine-strasbourg/avant-1.jpg", 
          "alt": "Toiture avant rénovation",
          "type": "avant",
          "order": 1
        },
        {
          "id": "2",
          "url": "/realisations/patrimoine-strasbourg/apres-1.jpg",
          "alt": "Toiture après rénovation", 
          "type": "apres",
          "order": 2
        }
      ],
      "description": "Réfection complète d'une toiture de bâtiment historique située dans le secteur sauvegardé de Strasbourg. Utilisation de tuiles plates Biberschwanz traditionnelles dans le respect des techniques alsaciennes et des exigences des Architectes des Bâtiments de France.",
      "technicalDetails": [
        "Tuiles plates Biberschwanz",
        "Technique traditionnelle alsacienne",
        "Respect des normes ABF",
        "Zinguerie sur-mesure"
      ],
      "materials": [
        "Tuile plate traditionnelle", 
        "Zinc naturel",
        "Bois de charpente traditionnel"
      ],
      "duration": "3 semaines",
      "featured": true,
      "published": true
    },
    {
      "id": "creation-lucarnes-koenigshoffen",
      "slug": "creation-lucarnes-koenigshoffen",
      "title": "Création de lucarnes à Koenigshoffen", 
      "subtitle": "Apport de lumière et valorisation des combles",
      "location": "Koenigshoffen, Strasbourg",
      "date": "2024",
      "category": ["velux", "zinguerie", "tuile-plate"],
      "mainImage": "/realisations/lucarnes-koenigshoffen/main.jpg",
      "gallery": [
        {
          "id": "1",
          "url": "/realisations/lucarnes-koenigshoffen/avant.jpg",
          "alt": "Toiture avant création des lucarnes",
          "type": "avant",
          "order": 1
        },
        {
          "id": "2",
          "url": "/realisations/lucarnes-koenigshoffen/apres.jpg", 
          "alt": "Lucarnes terminées et intégrées",
          "type": "apres",
          "order": 2
        }
      ],
      "description": "Création de lucarnes traditionnelles alsaciennes pour l'aménagement de combles perdus. Apport de lumière naturelle dans le respect de l'architecture traditionnelle du quartier de Koenigshoffen.",
      "technicalDetails": [
        "Lucarnes traditionnelles alsaciennes",
        "Modification charpente existante",
        "Zinguerie zinc sur-mesure", 
        "Raccordement étanche"
      ],
      "materials": [
        "Tuile plate traditionnelle",
        "Zinc naturel",
        "Bois de charpente",
        "Membrane d'étanchéité"
      ],
      "duration": "2 semaines",
      "featured": false,
      "published": true
    },
    {
      "id": "couverture-kiosque-cuivre",
      "slug": "couverture-kiosque-cuivre",
      "title": "Couverture d'un kiosque en cuivre",
      "subtitle": "Élégance et durabilité du cuivre",
      "location": "Bas-Rhin", 
      "date": "2024",
      "category": ["cuivre", "zinguerie"],
      "mainImage": "/realisations/kiosque-cuivre/main.jpg",
      "gallery": [
        {
          "id": "1",
          "url": "/realisations/kiosque-cuivre/avant.jpg",
          "alt": "Structure du kiosque avant couverture",
          "type": "avant",
          "order": 1
        },
        {
          "id": "2",
          "url": "/realisations/kiosque-cuivre/apres.jpg",
          "alt": "Kiosque avec couverture cuivre terminée",
          "type": "apres", 
          "order": 2
        }
      ],
      "description": "Réalisation d'une couverture de kiosque en cuivre, matériau noble qui développe une patine naturelle unique au fil du temps. Travail de précision sur une structure architecturale particulière.",
      "technicalDetails": [
        "Couverture cuivre traditionnel",
        "Soudures à l'étain",
        "Gouttières cuivre intégrées",
        "Finitions sur-mesure"
      ],
      "materials": [
        "Cuivre naturel",
        "Étain pour soudures",
        "Fixations cuivre"
      ],
      "duration": "1 semaine",
      "featured": false,
      "published": true
    },
    {
      "id": "creation-lucarne-triple-verriere-velux",
      "slug": "creation-lucarne-triple-verriere-velux", 
      "title": "Création d'une Lucarne et Installation d'une triple verrière plane Velux",
      "subtitle": "Lumière et design contemporain",
      "location": "Strasbourg",
      "date": "2024",
      "category": ["velux", "zinguerie"],
      "mainImage": "/realisations/lucarne-triple-verriere/main.jpg",
      "gallery": [
        {
          "id": "1",
          "url": "/realisations/lucarne-triple-verriere/avant.jpg",
          "alt": "Toiture avant création lucarne",
          "type": "avant", 
          "order": 1
        },
        {
          "id": "2",
          "url": "/realisations/lucarne-triple-verriere/apres.jpg",
          "alt": "Lucarne et triple verrière terminées",
          "type": "apres",
          "order": 2
        }
      ],
      "description": "Création d'une lucarne traditionnelle et installation d'une triple verrière plane Velux pour un apport de lumière exceptionnel. Combinaison réussie entre tradition et modernité.",
      "technicalDetails": [
        "Lucarne traditionnelle alsacienne",
        "Triple verrière plane Velux",
        "Raccordements étanches complexes",
        "Zinguerie sur-mesure"
      ],
      "materials": [
        "Système Velux verrière",
        "Zinc naturel",
        "Bois de charpente", 
        "Joints d'étanchéité"
      ],
      "duration": "2 semaines",
      "featured": false,
      "published": true
    },
    {
      "id": "refection-toiture-batiment-collectif-neudorf",
      "slug": "refection-toiture-batiment-collectif-neudorf",
      "title": "Réfection totale de toiture d'un bâtiment collectif au Neudorf",
      "subtitle": "Rénovation d'envergure en milieu urbain",
      "location": "Neudorf, Strasbourg",
      "date": "2024",
      "category": ["tuile-plate", "isolation"],
      "mainImage": "/realisations/neudorf-collectif/main.jpg",
      "gallery": [
        {
          "id": "1",
          "url": "/realisations/neudorf-collectif/avant.jpg",
          "alt": "Bâtiment collectif avant rénovation",
          "type": "avant",
          "order": 1
        },
        {
          "id": "2",
          "url": "/realisations/neudorf-collectif/apres.jpg", 
          "alt": "Toiture rénovée bâtiment collectif",
          "type": "apres",
          "order": 2
        }
      ],
      "description": "Réfection complète de la toiture d'un bâtiment collectif au Neudorf. Projet d'envergure nécessitant une coordination précise et des techniques adaptées au milieu urbain dense.",
      "technicalDetails": [
        "Réfection toiture complète",
        "Isolation thermique renforcée",
        "Gestion contraintes urbaines", 
        "Évacuation sélective des gravats"
      ],
      "materials": [
        "Tuiles plates traditionnelles",
        "Isolant haute performance",
        "Écran de sous-toiture",
        "Zinguerie zinc"
      ],
      "duration": "4 semaines",
      "featured": false,
      "published": true
    },
    {
      "id": "installation-remplacement-velux",
      "slug": "installation-remplacement-velux",
      "title": "Installation, remplacement et création de fenêtre de toit Velux", 
      "subtitle": "Spécialiste Velux toutes gammes",
      "location": "Bas-Rhin",
      "date": "2024",
      "category": ["velux"],
      "mainImage": "/realisations/velux-installation/main.jpg",
      "gallery": [
        {
          "id": "1",
          "url": "/realisations/velux-installation/avant.jpg",
          "alt": "Toiture avant installation Velux",
          "type": "avant",
          "order": 1
        },
        {
          "id": "2",
          "url": "/realisations/velux-installation/apres.jpg",
          "alt": "Velux installés et étanches",
          "type": "apres",
          "order": 2
        }
      ],
      "description": "Installation, remplacement et création de fenêtres de toit Velux. Maîtrise de toute la gamme Velux avec raccordements parfaitement étanches sur tous types de couvertures.",
      "technicalDetails": [
        "Installation Velux toutes gammes",
        "Raccordements étanches", 
        "Habillages intérieurs",
        "Stores et volets Velux"
      ],
      "materials": [
        "Fenêtres Velux",
        "Kits d'étanchéité",
        "Habillages bois",
        "Stores occultants"
      ],
      "duration": "Variable selon projet",
      "featured": false,
      "published": true
    },
    {
      "id": "refection-toiture-isolation-laine-bois",
      "slug": "refection-toiture-isolation-laine-bois",
      "title": "Réfection toiture et isolation en laine de bois",
      "subtitle": "Performance énergétique et matériaux biosourcés", 
      "location": "Strasbourg",
      "date": "2024",
      "category": ["tuile-mecanique", "isolation"],
      "mainImage": "/realisations/refection-isolation-bois/main.jpg",
      "gallery": [
        {
          "id": "1",
          "url": "/realisations/refection-isolation-bois/avant.jpg",
          "alt": "Toiture avant rénovation",
          "type": "avant",
          "order": 1
        },
        {
          "id": "2",
          "url": "/realisations/refection-isolation-bois/apres.jpg",
          "alt": "Toiture rénovée avec isolation laine de bois",
          "type": "apres", 
          "order": 2
        }
      ],
      "description": "Rénovation complète avec isolation haute performance en laine de bois. Matériau biosourcé offrant excellent confort été/hiver grâce à son déphasage thermique.",
      "technicalDetails": [
        "Isolation laine de bois 200mm",
        "Réfection couverture complète",
        "Amélioration étanchéité",
        "Ventilation optimisée"
      ],
      "materials": [
        "Laine de bois",
        "Tuiles mécaniques",
        "Membrane d'étanchéité",
        "Pare-vapeur"
      ],
      "duration": "3 semaines",
      "featured": false,
      "published": true
    },
    // PROJETS DE LA PAGE 2
    {
      "id": "isolation-biosourcee-chanvre",
      "slug": "isolation-biosourcee-chanvre",
      "title": "Isolation biosourcée entre chevron en laine de chanvre avec réfection de toiture",
      "subtitle": "Écologie et performance thermique",
      "location": "Bas-Rhin",
      "date": "2024",
      "category": ["isolation", "tuile-mecanique"],
      "mainImage": "/realisations/isolation-chanvre/main.jpg",
      "gallery": [
        {
          "id": "1",
          "url": "/realisations/isolation-chanvre/avant.jpg",
          "alt": "Charpente avant isolation",
          "type": "avant",
          "order": 1
        },
        {
          "id": "2",
          "url": "/realisations/isolation-chanvre/pendant.jpg",
          "alt": "Pose isolation laine de chanvre",
          "type": "pendant",
          "order": 2
        },
        {
          "id": "3",
          "url": "/realisations/isolation-chanvre/apres.jpg",
          "alt": "Toiture isolée terminée",
          "type": "apres",
          "order": 3
        }
      ],
      "description": "Isolation biosourcée entre chevrons en laine de chanvre associée à une réfection complète de toiture. Solution écologique haute performance alliant respect de l'environnement et confort thermique optimal.",
      "technicalDetails": [
        "Isolation laine de chanvre entre chevrons",
        "Réfection couverture complète",
        "Étanchéité à l'air renforcée",
        "Matériaux 100% biosourcés"
      ],
      "materials": [
        "Laine de chanvre",
        "Tuiles mécaniques",
        "Pare-vapeur hygrovariable",
        "Membrane d'étanchéité"
      ],
      "duration": "3 semaines",
      "featured": false,
      "published": true
    },
    {
      "id": "refection-terrasse-resine-triflex",
      "slug": "refection-terrasse-resine-triflex",
      "title": "Réfection d'escalier et de terrasse avec la résine PMMA de Triflex",
      "subtitle": "Étanchéité haute performance",
      "location": "Strasbourg",
      "date": "2024",
      "category": ["epdm"],
      "mainImage": "/realisations/terrasse-triflex/main.jpg",
      "gallery": [
        {
          "id": "1",
          "url": "/realisations/terrasse-triflex/avant.jpg",
          "alt": "Terrasse et escalier avant réfection",
          "type": "avant",
          "order": 1
        },
        {
          "id": "2",
          "url": "/realisations/terrasse-triflex/apres.jpg",
          "alt": "Terrasse étanchéifiée avec résine Triflex",
          "type": "apres",
          "order": 2
        }
      ],
      "description": "Réfection complète d'escalier et terrasse avec application de résine PMMA Triflex. Solution d'étanchéité haute performance garantissant durabilité et esthétique.",
      "technicalDetails": [
        "Résine PMMA Triflex",
        "Préparation support",
        "Application multicouches",
        "Finition anti-dérapante"
      ],
      "materials": [
        "Résine PMMA Triflex",
        "Primaire d'accrochage",
        "Granulats antidérapants"
      ],
      "duration": "1 semaine",
      "featured": false,
      "published": true
    },
    {
      "id": "refection-toiture-tuile-mecanique-etancheite-air",
      "slug": "refection-toiture-tuile-mecanique-etancheite-air",
      "title": "Réfection totale de toiture en tuile mécanique avec étanchéité à l'air",
      "subtitle": "Performance énergétique optimisée",
      "location": "Bas-Rhin",
      "date": "2024",
      "category": ["tuile-mecanique", "isolation"],
      "mainImage": "/realisations/tuile-mecanique-etancheite/main.jpg",
      "gallery": [
        {
          "id": "1",
          "url": "/realisations/tuile-mecanique-etancheite/avant.jpg",
          "alt": "Ancienne toiture à rénover",
          "type": "avant",
          "order": 1
        },
        {
          "id": "2",
          "url": "/realisations/tuile-mecanique-etancheite/apres.jpg",
          "alt": "Toiture rénovée avec étanchéité air",
          "type": "apres",
          "order": 2
        }
      ],
      "description": "Réfection complète de toiture en tuiles mécaniques avec mise en œuvre d'une étanchéité à l'air performante. Amélioration significative des performances énergétiques du bâtiment.",
      "technicalDetails": [
        "Tuiles mécaniques haute performance",
        "Étanchéité à l'air continue",
        "Isolation thermique renforcée",
        "Test d'étanchéité final"
      ],
      "materials": [
        "Tuiles mécaniques",
        "Membrane d'étanchéité à l'air",
        "Isolant haute performance",
        "Adhésifs spécialisés"
      ],
      "duration": "3 semaines",
      "featured": false,
      "published": true
    },
    {
      "id": "refection-totale-tuile-mecanique-aspect-plat",
      "slug": "refection-totale-tuile-mecanique-aspect-plat",
      "title": "Réfection totale de toiture en tuile mécanique à aspect plat",
      "subtitle": "Esthétique traditionnelle et performance moderne",
      "location": "Strasbourg",
      "date": "2024",
      "category": ["tuile-mecanique"],
      "mainImage": "/realisations/tuile-mecanique-plat/main.jpg",
      "gallery": [
        {
          "id": "1",
          "url": "/realisations/tuile-mecanique-plat/avant.jpg",
          "alt": "Ancienne toiture dégradée",
          "type": "avant",
          "order": 1
        },
        {
          "id": "2",
          "url": "/realisations/tuile-mecanique-plat/apres.jpg",
          "alt": "Nouvelle toiture tuiles mécaniques aspect plat",
          "type": "apres",
          "order": 2
        }
      ],
      "description": "Réfection complète avec tuiles mécaniques à aspect plat, alliant l'esthétique des tuiles plates traditionnelles aux avantages techniques des tuiles mécaniques modernes.",
      "technicalDetails": [
        "Tuiles mécaniques aspect plat",
        "Révision charpente",
        "Isolation renforcée",
        "Ventilation sous-toiture"
      ],
      "materials": [
        "Tuiles mécaniques",
        "Isolant biosourcé",
        "Liteaux traités",
        "Écran de sous-toiture"
      ],
      "duration": "2 semaines",
      "featured": false,
      "published": true
    },
    {
      "id": "verriere-modulaire-velux-extension-zinc",
      "slug": "verriere-modulaire-velux-extension-zinc",
      "title": "Création d'une verrière modulaire Velux sur extension zinc",
      "subtitle": "Architecture moderne et apport de lumière exceptionnel",
      "location": "Bas-Rhin",
      "date": "2024",
      "category": ["zinc", "velux"],
      "mainImage": "/realisations/verriere-velux-zinc/main.jpg",
      "gallery": [
        {
          "id": "1",
          "url": "/realisations/verriere-velux-zinc/avant.jpg",
          "alt": "Extension avant verrière",
          "type": "avant",
          "order": 1
        },
        {
          "id": "2",
          "url": "/realisations/verriere-velux-zinc/pendant.jpg",
          "alt": "Installation structure verrière",
          "type": "pendant",
          "order": 2
        },
        {
          "id": "3",
          "url": "/realisations/verriere-velux-zinc/apres.jpg",
          "alt": "Verrière modulaire terminée",
          "type": "apres",
          "order": 3
        }
      ],
      "description": "Création d'une verrière modulaire Velux sur extension contemporaine en zinc. Gain de luminosité considérable avec design moderne et performances techniques exceptionnelles.",
      "technicalDetails": [
        "Verrière modulaire Velux",
        "Extension zinc joint debout",
        "Raccordements étanches complexes",
        "Structure porteuse renforcée"
      ],
      "materials": [
        "Système Velux modulaire",
        "Zinc naturel",
        "Structure aluminium",
        "Joints d'étanchéité"
      ],
      "duration": "3 semaines",
      "featured": true,
      "published": true
    },
    {
      "id": "lucarne-cintree-centre-strasbourg",
      "slug": "lucarne-cintree-centre-strasbourg",
      "title": "Lucarne cintrée au centre de Strasbourg",
      "subtitle": "Patrimoine historique et savoir-faire traditionnel",
      "location": "Centre-ville, Strasbourg",
      "date": "2024",
      "category": ["patrimoine", "zinguerie"],
      "mainImage": "/realisations/lucarne-cintree-strasbourg/main.jpg",
      "gallery": [
        {
          "id": "1",
          "url": "/realisations/lucarne-cintree-strasbourg/avant.jpg",
          "alt": "Bâtiment avant rénovation des lucarnes",
          "type": "avant",
          "order": 1
        },
        {
          "id": "2",
          "url": "/realisations/lucarne-cintree-strasbourg/apres.jpg",
          "alt": "Lucarnes cintrées restaurées",
          "type": "apres",
          "order": 2
        }
      ],
      "description": "Rénovation de lucarnes cintrées sur bâtiment classé ABF au centre de Strasbourg. Savoir-faire traditionnel alsacien appliqué au patrimoine architectural strasbourgeois.",
      "technicalDetails": [
        "Lucarnes cintrées traditionnelles",
        "Respect normes ABF",
        "Zinguerie sur-mesure",
        "Techniques ancestrales"
      ],
      "materials": [
        "Zinc traditionnel",
        "Bois de charpente local",
        "Tuiles plates d'époque",
        "Soudures à l'étain"
      ],
      "duration": "4 semaines",
      "featured": true,
      "published": true
    },
    {
      "id": "tuyau-descente-cuivre",
      "slug": "tuyau-descente-cuivre",
      "title": "Tuyau de descente en cuivre",
      "subtitle": "Élégance et durabilité",
      "location": "Bas-Rhin",
      "date": "2024",
      "category": ["cuivre", "zinguerie"],
      "mainImage": "/realisations/tuyau-cuivre/main.jpg",
      "gallery": [
        {
          "id": "1",
          "url": "/realisations/tuyau-cuivre/avant.jpg",
          "alt": "Ancien système d'évacuation",
          "type": "avant",
          "order": 1
        },
        {
          "id": "2",
          "url": "/realisations/tuyau-cuivre/apres.jpg",
          "alt": "Tuyau de descente cuivre installé",
          "type": "apres",
          "order": 2
        }
      ],
      "description": "Installation de tuyau de descente en cuivre. Matériau noble qui développe une patine naturelle unique et garantit une longévité exceptionnelle.",
      "technicalDetails": [
        "Cuivre naturel",
        "Soudures traditionnelles",
        "Fixations discrètes",
        "Raccordement étanche"
      ],
      "materials": [
        "Cuivre naturel",
        "Soudure à l'étain",
        "Colliers cuivre"
      ],
      "duration": "1 jour",
      "featured": false,
      "published": true
    },
    {
      "id": "refection-toiture-tuiles-plates",
      "slug": "refection-toiture-tuiles-plates",
      "title": "Réfection de toiture en tuiles plates",
      "subtitle": "Tradition alsacienne authentique",
      "location": "Bas-Rhin",
      "date": "2024",
      "category": ["tuile-plate"],
      "mainImage": "/realisations/refection-tuiles-plates/main.jpg",
      "gallery": [
        {
          "id": "1",
          "url": "/realisations/refection-tuiles-plates/avant.jpg",
          "alt": "Ancienne toiture tuiles plates",
          "type": "avant",
          "order": 1
        },
        {
          "id": "2",
          "url": "/realisations/refection-tuiles-plates/apres.jpg",
          "alt": "Toiture tuiles plates rénovée",
          "type": "apres",
          "order": 2
        }
      ],
      "description": "Réfection complète de toiture en tuiles plates, signature incontestable de la tradition régionale alsacienne. Matériau authentique et naturel en terre cuite.",
      "technicalDetails": [
        "Tuiles plates en terre cuite",
        "Technique Biberschwanz",
        "Zinguerie traditionnelle",
        "Ventilation naturelle"
      ],
      "materials": [
        "Tuiles plates terre cuite",
        "Zinc naturel",
        "Bois de charpente",
        "Mortier traditionnel"
      ],
      "duration": "2 semaines",
      "featured": false,
      "published": true
    }
  ]
};

console.log('Projets récupérés:', projectsData.projects.length);
console.log('Catégories:', projectsData.categories.length);

// Sauvegarder dans le fichier JSON
const outputPath = path.join(__dirname, '..', 'lib', 'projects-data-complete.json');
fs.writeFileSync(outputPath, JSON.stringify(projectsData, null, 2));
console.log(`Fichier sauvegardé: ${outputPath}`);