# site web dynamique d'une auto école

- **Téchnologie frontend:** next js avec tailwind, shadcn, daysi ui frontend
- **Téchnologie backend:** laravel dernière version

Faire un projet de site web dynamique d'une auto-école. 
- le site se présentera sous 3 sections, un site présentant les formations et à propos de l'auto-école, et inscription en ligne sur les différentes formations existantes.
- un espace étudiant
- et un espace administrateur.
- l'étudiant intéréssé consulte et cherche des formations dans le site de présentation, 
- il pourra choisir son formation et y postuler, il devra fournir tous les informations nécessaires demandées.il peut s'incrire qu'à une seule formation à la fois
- l'admin confirme son inscription et donne accès à un compte étudiant. après la vérification des informations de l'individu qui a postuler, l'individu reçois un email, indiquant que son inscription et valider où pas, si c'est valider il reçoit un email qui le redirigera vers la page de connexion avec un code d'accès.
- dans l'espace client:
  - l'étudiant aura la possibilité de consulter leurs cours , un lecteur pdf sera mise à disposition.
  - si l'étudiant a fini un certain pourcent des leçons en ligne, on lui proposera de faire une similation en ligne d'éxamen QCM
  - on présentera l'emploi du temps relatif à sa formation
  - présentation des sessions d'examen avec rappel de leurs examen
  - on proposera une séction pour voir le resultat de leurs session d'examen si c'est disponible

- l'admin:
  - responsable de gérer l'inscription des individus, gestion des compte utilisateurs étudiant, validation, disponibilité.
  - publication des formations, gestion des formations
  - partages des cours relatif au formation, pdf
  - publication des sessions d'éxamen
  - gestion des resultats des examens
  - il sera  notifier s'il y a un nouvel individu qui s'est inscrit.
  - gestion des emploi du temps des formations.


### partie admin
- gestion de l'inscription : nouveau insciption (notification), ajouter, supprimer, modifier, afficher liste complet, liste des personnes en attente de validation, validation réfusée et à supprimer automatiquement après 2 semaines.
- gestion des formations, examen, résultat.
- gestion emploi de temps des formations


## Table 
### TABLE : CATEGORIES_DE_PERMIS
Liste les différentes catégories de permis et leurs prérequis.

- id_permis (int, clé primaire)
- Nom_categorie (varchar) → Nom de la catégorie de permis
- Description (text) → Explication de la catégorie
- prerequis (peut etre null)
- age_min

### TABLE : ADMINISTRATEUR

### TABLE : ETUDIANTS
Stocke les informations des étudiants

* id_etu (int, clé primaire)
* Nom (varchar)
* Prénom (varchar), pas obligatoire
* Email (varchar, unique), obligatoire
* Téléphone (varchar), obligatoire
* CIN (varchar, unique) → Numéro de carte d’identité nationale, pas obligatoire pour mineur
* Photo_etu, obligatoire
* CertificatResidance (photo), obligatoire
* Mot_de_passe (varchar, hashé), null au début
* Permis_antécédant, null par défaut
* Bordereau (photo), obligatoire
* id_formation
* Statut (enum: "en attente", "validé", "réfusé"), en attente par défaut

### TABLE : FORMATIONS
Liste les formations proposées par l’auto-école.

* ID_formation (int, clé primaire)
* Nom (varchar)
* Description (text)
* Date_debut
* Durée (int) → En semaines
* Prix (decimal)
* Emploi_du_temps → Contient les horaires des cours et examens
* id_catpermis


### TABLE : COURS
Stocke les cours accessibles aux étudiants.

* ID_cours (int, clé primaire)
* Nom (varchar)
* Type (enum: "commun", "spécifique")
* Fichier_PDF (varchar) →   fichier uploader

### TABLE : FORMATION_COURS
Relation entre les formations et les cours. si cours est de type commun, tous formation aura un accès, pas besoin de passé ici je crois, c'est seulement quand c'est spécifique que ça doit être rattaché au une formation.

* ID (int, clé primaire)
* Formation_ID (int, clé étrangère vers Formations.ID)
* Cours_ID (int, clé étrangère vers Cours.ID)

### TABLE : EXAMENS
Liste des examens programmés pour chaque formation.

* ID_exam (int, clé primaire)
* Formation_ID (int, clé étrangère vers Formations.ID)
* Nom (varchar)
* Date (date)
* Heure (time)
* Statut (enum: "prévu", "terminé")

### TABLE : RESULTATS

Stocke les notes des étudiants après un examen.

* ID_res (int, clé primaire)
* Examen_ID (int, clé étrangère vers Examens.ID)
* Utilisateur_ID (int, clé étrangère vers Utilisateurs.ID)
* Note (decimal)
* Statut (enum: "réussi", "échoué")

### TABLE : NOTIFICATIONS

Stocke les notifications envoyées aux groupe d' étudiants inscrit à une formation et administrateurs.

* ID_notif (int, clé primaire)
* id_formation ( null si admin)
* Message (text)
* Date (datetime)
* lue


