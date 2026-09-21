# GoldenTicket Concierge — guide de mise en ligne

Le site est autonome : aucun compte ChatGPT, aucune API OpenAI et aucune dépendance à chatgpt.site. Il contient une page adaptée aux téléphones et un serveur qui transmet les demandes à Discord. Tous les éléments visuels sont locaux ; aucun service de police, traçage ou image externe n'est appelé.

## La voie simple : Render

1. Décompressez le dossier. Dans un nouveau dépôt GitHub privé, ajoutez son **contenu** : `package.json`, `server.mjs`, `public`, etc. Ces fichiers doivent se trouver à la racine du dépôt. N'ajoutez jamais votre fichier `.env`.
2. Sur [Render](https://render.com), choisissez **New → Web Service**, connectez GitHub et sélectionnez ce dépôt. Choisissez l'environnement **Node**.
3. Indiquez **Build Command** : `npm install` ; **Start Command** : `npm start`. Choisissez la région et l'offre qui vous conviennent après consultation du tarif affiché. Une offre qui se met en veille peut rendre le premier envoi plus lent.
4. Dans **Environment**, ajoutez `NODE_ENV` = `production` et `NODE_VERSION` = `22`.
5. Créez un NOUVEAU webhook dans Discord : ouvrez un **salon textuel privé**, puis ses paramètres → Intégrations → Webhooks → Nouveau webhook. Copiez son URL dans la variable d'environnement Render **`DISCORD_WEBHOOK_URL`**. Ne la mettez pas dans GitHub, dans le formulaire ou dans un message public. N'utilisez pas l'ancien webhook.
6. Déployez le service. Render vous attribue une adresse HTTPS se terminant par `.onrender.com`. Copiez cette adresse dans une seconde variable **`PUBLIC_ORIGIN`**, sans `/` final ni chemin. Exemple : `https://goldenticket-concierge.onrender.com` (exemple uniquement, pas une adresse réservée). Enregistrez et redéployez. Tant que cette variable manque, le formulaire refuse les envois.
7. Ouvrez l'adresse du site et envoyez une demande avec des données fictives. Vérifiez le message dans Discord et la référence de confirmation sur le site. Vous pouvez alors partager cette nouvelle adresse sur Instagram.

Vous pouvez ensuite acheter un nom de domaine chez le fournisseur de votre choix et le rattacher au service. Après connexion du domaine, remplacez `PUBLIC_ORIGIN` par votre adresse HTTPS définitive. Utilisez une seule adresse canonique ; les envois depuis d'autres domaines sont refusés.

Documentation officielle : [services web Render](https://render.com/docs/web-services), [variables et secrets](https://render.com/docs/configure-environment-variables), [version de Node](https://render.com/docs/node-version).

## Ce que reçoit Discord

Un message avec le nom/prénom, le contact, l'événement, la ville, la date, le nombre de places, la catégorie, le budget maximum par place en euros, le commentaire et une référence. Le serveur attend la confirmation de Discord avant d'annoncer la réussite. Les mentions automatiques sont désactivées.

## Essai sur votre ordinateur (facultatif)

Installez Node.js 22 ou une version LTS ultérieure. Ouvrez un terminal dans le dossier du site :

```text
npm test
npm start
```

Ouvrez `http://localhost:3000`. Sans secret, le site s'affiche, mais l'envoi indique qu'il est indisponible. Pour un véritable essai local, copiez `.env.example` vers `.env`, renseignez un nouveau webhook et définissez `PUBLIC_ORIGIN=http://localhost:3000`, puis lancez :

```text
node --env-file=.env server.mjs
```

Le `.env` n'est pas chargé automatiquement par `npm start` ; sur Render, les variables sont injectées directement par l'hébergeur. Ne double-cliquez pas simplement sur `index.html` : le formulaire a besoin du serveur.

## Autre hébergeur

Ce projet n'a aucune dépendance npm externe. Un hébergeur compatible Node.js 22+, qui lance `npm start`, suffit. Réglez les deux variables `DISCORD_WEBHOOK_URL` et `PUBLIC_ORIGIN`, ainsi que `NODE_ENV=production`. L'hébergeur doit fournir HTTPS et permettre des connexions sortantes HTTPS vers Discord. Le serveur écoute le port `PORT` fourni par l'hébergeur (3000 par défaut). `/health` est le contrôle de disponibilité du serveur, pas un test de Discord.

Un `Dockerfile` est également fourni :

```text
docker build -t goldenticket .
docker run --env-file .env -e NODE_ENV=production -p 3000:3000 goldenticket
```

Pour une publication par Docker, configurez HTTPS via l'hébergeur ou un proxy. Un hébergement de fichiers statiques seul, tel que GitHub Pages, ne peut pas exécuter le serveur.

## Exploitation

- Le secret reste côté serveur. Seul `public/` est accessible aux visiteurs ; le serveur ne publie ni sources, ni `.env`.
- La saisie est vérifiée dans le navigateur et sur le serveur. Les envois sont limités en taille, en fréquence et en durée. Un champ invisible sert de piège à robots.
- La limitation est volontairement simple : 30 tentatives / 10 minutes par adresse de connexion et 100 au total. Derrière un proxy, plusieurs visiteurs peuvent partager la même limite. Le serveur n'accorde pas de confiance aux adresses déclarées par le visiteur. Pour un trafic important, ajouter une protection anti-abus chez l'hébergeur et un limiteur partagé configuré pour son proxy.
- Les doublons confirmés sont évités pendant une heure dans la mémoire du processus. La protection disparaît au redémarrage et ne se partage pas entre plusieurs instances. Utiliser une seule instance pour cette version. Une coupure après réception par Discord peut toujours produire un doublon lors d'une nouvelle tentative : aucune garantie de livraison exactement une fois.
- Les demandes ne sont pas enregistrées dans une base de données. Les messages restent dans Discord selon les suppressions effectuées par l'équipe. La mémoire temporaire de dédoublonnage contient les champs pendant au maximum une heure (nettoyage au prochain envoi), puis est effacée ; aucun contenu de formulaire ni secret n'est écrit par l'application dans les journaux.
- Avant l'ouverture commerciale, compléter les informations de l'entreprise, un contact pour les questions de confidentialité et les conditions de vente applicables à votre activité. Ces informations n'ont pas été inventées. Limitez l'accès au salon Discord aux personnes qui traitent les demandes et définissez votre durée de conservation.

## En cas de problème

**Formulaire indisponible** : vérifier le nouveau webhook et `PUBLIC_ORIGIN`, puis redéployer.

**Origine non autorisée** : l'adresse ouverte doit correspondre exactement à `PUBLIC_ORIGIN` (HTTPS, domaine, port éventuel, aucun `/` final).

**Envoi non confirmé** : vérifier que le webhook existe encore, le salon choisi est textuel, et le serveur peut accéder à Discord. Attendre avant de réessayer ; les champs restent remplis.

**Trop de tentatives** : patienter dix minutes.

## Validation livrée

Les tests utilisent une simulation de Discord : aucun message réel n'est envoyé et aucun secret réel n'est inclus. Ils couvrent les champs transmis, les erreurs, les limitations, la protection du secret, les délais et les doublons. Un dernier essai réel est nécessaire après ajout de votre nouveau webhook chez l'hébergeur.

Référence technique : [exécution des webhooks Discord](https://docs.discord.com/developers/resources/webhook#execute-webhook).
