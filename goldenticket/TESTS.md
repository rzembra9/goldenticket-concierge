# Compte rendu de vérification

Vérifié le 21 septembre 2026 avec Node.js 22.18.0.

- 8 tests automatisés réussis (`npm test`), aucune erreur.
- Vérification des neuf champs du message Discord, y compris les accents.
- Refus des champs manquants, des nombres invalides, des dates invalides/passées et du consentement absent.
- Refus des origines étrangères, du mauvais format et des demandes trop volumineuses.
- Absence de secret ou configuration incorrecte : envoi refusé.
- Discord répond 429/500, réponse sans confirmation ou délai dépassé : aucune fausse confirmation.
- Limitation des tentatives, dédoublonnage d'une demande confirmée et refus d'une clé réutilisée pour un autre contenu.
- Sources du serveur et fichiers secrets inaccessibles par HTTP.
- Vérification visuelle dans le navigateur, largeur habituelle et largeur mobile de 390 px, sans débordement horizontal observé.
- Essai navigateur sans secret : erreur visible et champs conservés.
- Essai navigateur contre un serveur de test avec Discord simulé : confirmation avec référence, puis réinitialisation du formulaire.

Le serveur de simulation n'est pas inclus dans le site livré. Aucun webhook réel n'a été utilisé. Le déploiement, le domaine et la réception réelle dans votre salon Discord restent à vérifier une fois les variables configurées.
