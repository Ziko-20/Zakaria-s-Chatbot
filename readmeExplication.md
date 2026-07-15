# 📖 Explication Détaillée du Projet — Zakaria's Chatbot

> Ce document explique **en profondeur** le fonctionnement du projet, fichier par fichier, ligne par ligne.

---

## 📋 Table des matières

1. [Vue d'ensemble du projet](#1--vue-densemble-du-projet)
2. [Architecture et flux de données](#2--architecture-et-flux-de-données)
3. [Structure des fichiers](#3--structure-des-fichiers)
4. [Fichiers de configuration](#4--fichiers-de-configuration)
   - [package.json](#41-packagejson)
   - [.env](#42-env)
   - [.gitignore](#43-gitignore)
   - [vercel.json](#44-verceljson)
5. [Backend — Serveur Express](#5--backend--serveur-express)
   - [server.js](#51-serverjs--serveur-principal-développement-local)
   - [api/chat.js](#52-apichatjs--fonction-serverless-vercel)
6. [Frontend — Interface utilisateur](#6--frontend--interface-utilisateur)
   - [public/index.html](#61-publicindexhtml--structure-html)
   - [JavaScript inline (dans index.html)](#62-javascript-inline-dans-indexhtml)
   - [public/script.js](#63-publicscriptjs--ancien-script-frontend)
   - [public/style.css](#64-publicstylecss--styles-css)
7. [Flux complet d'un message](#7--flux-complet-dun-message--de-la-saisie-à-la-réponse)
8. [Déploiement sur Vercel](#8--déploiement-sur-vercel)
9. [Points importants et sécurité](#9--points-importants-et-sécurité)

---

## 1. 🔭 Vue d'ensemble du projet

**Zakaria's Chatbot** est une application web de type chatbot (assistant IA) qui permet à un utilisateur de converser en temps réel avec un modèle d'intelligence artificielle.

### Principe de fonctionnement

```
Utilisateur (navigateur) ──► Serveur Express (Node.js) ──► API Groq (LLaMA 3.3 70B)
         ◄── Réponse IA ◄──        ◄── Réponse JSON ◄──
```

L'utilisateur tape un message dans l'interface → le message est envoyé au serveur backend → le serveur transmet le message à l'API Groq → Groq génère une réponse avec le modèle LLaMA 3.3 70B → la réponse revient au navigateur et s'affiche dans le chat.

### Technologies utilisées

| Technologie | Rôle | Version |
|---|---|---|
| **Node.js** | Runtime JavaScript côté serveur | — |
| **Express** | Framework web pour créer le serveur HTTP | v5.2.1 |
| **dotenv** | Chargement des variables d'environnement depuis `.env` | v17.4.2 |
| **Groq API** | Fournisseur d'IA (modèle LLaMA 3.3 70B) | — |
| **HTML/CSS/JS** | Interface utilisateur (frontend) | Vanilla |
| **Font Awesome** | Bibliothèque d'icônes | v6.4.0 |
| **Vercel** | Plateforme de déploiement (serverless) | — |

---

## 2. 🏗 Architecture et flux de données

```
┌──────────────────────────────────────────────────────────────────┐
│                       NAVIGATEUR (Client)                        │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────────┐ │
│  │ index.html  │  │  style.css  │  │ JavaScript (inline +     │ │
│  │ (structure) │  │  (design)   │  │ script.js)  (logique)    │ │
│  └─────────────┘  └─────────────┘  └──────────┬───────────────┘ │
│                                                │                 │
│                            fetch POST /api/chat │                │
│                            { message: "..." }   │                │
└────────────────────────────────────────────────┼─────────────────┘
                                                 │
                                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                     SERVEUR (Node.js / Express)                  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │  server.js (développement local)                            ││
│  │  OU                                                         ││
│  │  api/chat.js (Vercel serverless)                            ││
│  │                                                             ││
│  │  → Reçoit le message                                       ││
│  │  → Appelle l'API Groq                                      ││
│  │  → Renvoie la réponse au client                            ││
│  └──────────────────────────────────────┬───────────────────────┘│
└─────────────────────────────────────────┼────────────────────────┘
                                          │
                              HTTPS POST  │
                                          ▼
┌──────────────────────────────────────────────────────────────────┐
│                        API GROQ (Externe)                        │
│                                                                  │
│  URL : https://api.groq.com/openai/v1/chat/completions          │
│  Modèle : llama-3.3-70b-versatile                               │
│  → Génère la réponse IA                                         │
│  → Renvoie un JSON avec choices[0].message.content              │
└──────────────────────────────────────────────────────────────────┘
```

Le projet a **deux modes** de fonctionnement :
- **Développement local** : utilise `server.js` avec Express (écoute sur le port 3000)
- **Production (Vercel)** : utilise `api/chat.js` comme fonction serverless

---

## 3. 📁 Structure des fichiers

```
my-chatbot/
├── .env                  ← Clé API secrète (NE PAS partager)
├── .gitignore            ← Fichiers à ignorer par Git
├── package.json          ← Configuration npm, dépendances
├── package-lock.json     ← Versions exactes des dépendances (auto-généré)
├── server.js             ← Serveur Express pour le développement local
├── vercel.json           ← Configuration de déploiement Vercel
├── Readme.md             ← Documentation du projet (résumé)
├── readmeExplication.md  ← CE FICHIER — explication détaillée
│
├── api/
│   └── chat.js           ← Fonction serverless pour Vercel
│
├── public/
│   ├── index.html        ← Page HTML de l'interface de chat
│   ├── script.js         ← Ancien script frontend (non utilisé par index.html actuel)
│   └── style.css         ← Feuille de styles complète
│
└── node_modules/         ← Dépendances installées (auto-généré par npm)
```

---

## 4. ⚙️ Fichiers de configuration

### 4.1 `package.json`

Ce fichier est le **cœur de la configuration npm**. Il décrit le projet et ses dépendances.

```json
{
  "name": "my-chatbot",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs",
  "dependencies": {
    "@anthropic-ai/sdk": "^0.104.1",
    "@google/generative-ai": "^0.24.1",
    "dotenv": "^17.4.2",
    "express": "^5.2.1"
  }
}
```

**Explication ligne par ligne :**

| Champ | Explication |
|---|---|
| `"name": "my-chatbot"` | Nom du projet npm |
| `"version": "1.0.0"` | Version sémantique du projet |
| `"main": "index.js"` | Point d'entrée par défaut (non utilisé ici, le vrai est `server.js`) |
| `"type": "commonjs"` | Utilise le système de modules CommonJS (`require()` / `module.exports`) au lieu de ES Modules (`import` / `export`) |
| `"dependencies"` | Les paquets nécessaires au fonctionnement : |
| → `@anthropic-ai/sdk` | SDK Anthropic (installé mais **non utilisé** dans le code actuel) |
| → `@google/generative-ai` | SDK Google AI (installé mais **non utilisé** dans le code actuel) |
| → `dotenv` | Charge les variables d'environnement depuis le fichier `.env` |
| → `express` | Framework web Node.js pour créer le serveur HTTP et les routes |

> **Note :** Les dépendances `@anthropic-ai/sdk` et `@google/generative-ai` sont installées mais ne sont pas utilisées dans le code actuel. Seule l'API Groq est utilisée. Elles ont probablement été testées lors du développement.

---

### 4.2 `.env`

Ce fichier contient les **variables d'environnement secrètes** :

```
GROQ_API_KEY = 'gsk_...'
```

| Variable | Explication |
|---|---|
| `GROQ_API_KEY` | Clé d'authentification pour l'API Groq. Elle commence par `gsk_` et est obtenue sur [console.groq.com](https://console.groq.com). Cette clé permet au serveur d'envoyer des requêtes à l'API Groq. |

> ⚠️ **SÉCURITÉ** : Ce fichier ne doit **JAMAIS** être poussé sur GitHub. Il est listé dans `.gitignore` pour éviter cela.

---

### 4.3 `.gitignore`

Ce fichier indique à Git quels fichiers/dossiers **ignorer** lors des commits :

```
.env
```

Cela signifie que le fichier `.env` (contenant la clé API secrète) ne sera jamais versionné ni envoyé sur GitHub.

> **Remarque** : Il manque `node_modules/` dans ce `.gitignore`. Il serait recommandé de l'ajouter pour éviter de pousser les milliers de fichiers de dépendances.

---

### 4.4 `vercel.json`

Ce fichier configure le **déploiement sur Vercel** :

```json
{
  "version": 2,
  "builds": [
    {
      "src": "public/**",
      "use": "@vercel/static"
    },
    {
      "src": "api/chat.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/chat",
      "dest": "/api/chat.js"
    },
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ]
}
```

**Explication détaillée :**

| Section | Explication |
|---|---|
| `"version": 2` | Version de la configuration Vercel (v2 est la norme actuelle) |
| **builds** | Définit comment construire chaque partie du projet |
| → `"src": "public/**"` avec `@vercel/static` | Tous les fichiers dans `public/` sont servis comme fichiers statiques (HTML, CSS, JS) |
| → `"src": "api/chat.js"` avec `@vercel/node` | Le fichier `api/chat.js` est traité comme une **fonction serverless** Node.js |
| **routes** | Définit le routage des URLs |
| → `"/api/chat"` → `"/api/chat.js"` | Les requêtes à `/api/chat` sont dirigées vers la fonction serverless |
| → `"/(.*)"` → `"/public/$1"` | Toutes les autres requêtes sont redirigées vers les fichiers statiques dans `public/` (ex: `/` → `/public/index.html`) |

**En résumé** : sur Vercel, les fichiers statiques sont servis depuis `public/` et l'API est gérée par une fonction serverless dans `api/chat.js`.

---

## 5. 🖥 Backend — Serveur Express

### 5.1 `server.js` — Serveur principal (développement local)

Ce fichier crée le serveur Express pour le **développement local**.

```javascript
require('dotenv').config();
```
**Ligne 1** — Importe et exécute `dotenv`. Cela lit le fichier `.env` à la racine du projet et charge toutes les variables d'environnement (comme `GROQ_API_KEY`) dans `process.env`.

```javascript
const express = require('express');
const app = express();
```
**Lignes 2-3** — Importe le framework Express et crée une instance d'application. `app` est l'objet principal qui gère les routes et le middleware.

```javascript
app.use(express.json());
```
**Ligne 5** — Active le **middleware JSON**. Cela permet à Express de parser automatiquement le corps des requêtes POST qui ont le header `Content-Type: application/json`. Sans cela, `req.body` serait `undefined`.

```javascript
app.use(express.static('public'));
```
**Ligne 6** — Active le **middleware de fichiers statiques**. Express sert automatiquement tous les fichiers du dossier `public/` (HTML, CSS, JS, images). Quand un utilisateur accède à `http://localhost:3000`, Express sert `public/index.html`.

```javascript
app.post('/api/chat', async (req, res) => {
```
**Ligne 8** — Définit une **route POST** sur `/api/chat`. C'est le point d'entrée de l'API. La fonction est `async` car elle contient des opérations asynchrones (appel à l'API Groq).

```javascript
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message manquant' });
```
**Lignes 9-10** :
- **Déstructuration** : Extrait la propriété `message` du corps de la requête
- **Validation** : Si `message` est vide ou absent, renvoie une erreur HTTP 400 (Bad Request) avec un message d'erreur en JSON

```javascript
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: message }],
        max_tokens: 1000
      })
    });
```
**Lignes 12-23** — **Appel à l'API Groq** :

| Paramètre | Explication |
|---|---|
| `fetch(...)` | Utilise l'API `fetch` native de Node.js (v18+) pour faire une requête HTTP |
| `method: 'POST'` | Requête de type POST (envoi de données) |
| `'Content-Type': 'application/json'` | Indique que le corps de la requête est en JSON |
| `'Authorization': 'Bearer ...'` | Authentification via la clé API Groq (token Bearer) |
| `model: 'llama-3.3-70b-versatile'` | Le modèle IA utilisé — LLaMA 3.3 avec 70 milliards de paramètres |
| `messages: [{ role: 'user', content: message }]` | Format OpenAI : tableau de messages avec le rôle (`user`) et le contenu |
| `max_tokens: 1000` | Limite la réponse à 1000 tokens maximum (≈ 750 mots) |

```javascript
    const data = await response.json();
    console.log('Réponse Groq:', JSON.stringify(data));
    const reply = data?.choices?.[0]?.message?.content || 'Erreur';
    res.json({ reply });
```
**Lignes 26-29** :
- **Ligne 26** : Parse la réponse HTTP en JSON
- **Ligne 27** : Affiche la réponse complète dans la console du serveur (pour le debug)
- **Ligne 28** : Extrait le texte de la réponse. L'opérateur `?.` (optional chaining) évite les erreurs si une propriété est `undefined`. Le `|| 'Erreur'` fournit une valeur par défaut
- **Ligne 29** : Renvoie la réponse au client (navigateur) en JSON : `{ "reply": "texte de la réponse" }`

La structure de la réponse Groq ressemble à :
```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Bonjour ! Comment puis-je vous aider ?"
      }
    }
  ]
}
```

```javascript
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
```
**Lignes 31-34** — **Gestion des erreurs** : Si l'appel à l'API Groq échoue (réseau, clé invalide, etc.), le serveur :
1. Affiche l'erreur dans la console
2. Renvoie une erreur HTTP 500 (Internal Server Error) au client

```javascript
app.listen(3000, () => console.log('Serveur lancé sur http://localhost:3000'));
```
**Ligne 37** — **Démarre le serveur** sur le port 3000. Une fois lancé, il affiche un message de confirmation dans la console. L'application est alors accessible à `http://localhost:3000`.

---

### 5.2 `api/chat.js` — Fonction serverless (Vercel)

Ce fichier est la **version Vercel** de l'API. Sur Vercel, on n'utilise pas Express ; chaque fichier dans `api/` devient automatiquement un endpoint serverless.

```javascript
const Groq = require("groq-sdk");
```
**Ligne 1** — Importe le SDK officiel Groq.

> ⚠️ **Note importante** : `groq-sdk` n'est **pas** listé dans `package.json`. Pour que ce fichier fonctionne sur Vercel, il faudrait l'ajouter aux dépendances (`npm install groq-sdk`).

```javascript
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
```
**Ligne 3** — Crée une instance du client Groq avec la clé API. Sur Vercel, les variables d'environnement sont configurées dans le dashboard (pas besoin de `.env`).

```javascript
module.exports = async (req, res) => {
```
**Ligne 5** — Exporte une **fonction handler** qui sera appelée par Vercel à chaque requête sur `/api/chat`. Les paramètres `req` (requête) et `res` (réponse) sont similaires à ceux d'Express.

```javascript
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
```
**Lignes 6-8** — **Vérification de la méthode HTTP**. Seules les requêtes POST sont acceptées. Les requêtes GET, PUT, DELETE, etc. reçoivent une erreur 405 (Method Not Allowed).

```javascript
  const { message } = req.body;
```
**Ligne 10** — Extrait le message du corps de la requête.

```javascript
  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: message }],
      model: "llama-3.3-70b-versatile",
    });

    const reply = completion.choices[0].message.content;
    res.status(200).json({ reply });
```
**Lignes 12-19** — **Appel à l'API Groq via le SDK** :
- Utilise la méthode `groq.chat.completions.create()` du SDK (plus propre que `fetch`)
- Même modèle (`llama-3.3-70b-versatile`) et même format de messages
- Extrait la réponse et la renvoie avec le statut HTTP 200 (OK)

```javascript
  } catch (err) {
    res.status(500).json({ error: "Groq API error", details: err.message });
  }
```
**Lignes 20-22** — **Gestion des erreurs** : En cas d'erreur, renvoie le détail de l'erreur au client.

**Différence entre `server.js` et `api/chat.js` :**

| Aspect | `server.js` | `api/chat.js` |
|---|---|---|
| Utilisation | Développement local | Déploiement Vercel |
| Framework | Express | Serverless (Vercel) |
| Client API | `fetch` natif | SDK `groq-sdk` |
| Port | 3000 | Géré par Vercel |
| Fichiers statiques | `express.static('public')` | `@vercel/static` |

---

## 6. 🎨 Frontend — Interface utilisateur

### 6.1 `public/index.html` — Structure HTML

Ce fichier définit toute la **structure visuelle** du chatbot.

#### En-tête HTML (lignes 1-9)

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zakaria's Chatbot</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
```

| Ligne | Explication |
|---|---|
| `<!DOCTYPE html>` | Déclare que c'est un document HTML5 |
| `<html lang="fr">` | Langue de la page : français |
| `<meta charset="UTF-8">` | Encodage UTF-8 pour supporter les caractères spéciaux (accents, emojis) |
| `<meta name="viewport" ...>` | Active le responsive design pour les écrans mobiles |
| `<title>` | Titre affiché dans l'onglet du navigateur |
| `<link ... style.css>` | Charge la feuille de styles CSS |
| `<link ... font-awesome>` | Charge la bibliothèque d'icônes Font Awesome (via CDN) |

#### Structure du corps (lignes 10-89)

L'application est organisée en **3 zones** :

```
┌──────────────────────────────────────────┐
│              TOPBAR (header)             │  ← Liens Portfolio / GitHub
├──────────────────────────────────────────┤
│                                          │
│           CHAT-AREA (main)               │  ← Messages du chat
│                                          │
│   🤖 Bonjour ! Comment puis-je vous...  │
│                              Salut ! 👤  │
│   🤖 Je peux vous aider avec...         │
│                                          │
├──────────────────────────────────────────┤
│           INPUT-AREA (footer)            │  ← Zone de saisie
│  [📎] [🌐] [Envoyer un message...] [↑]  │
│  "Zakaria's Chatbot peut faire des..."   │
└──────────────────────────────────────────┘
```

**Sidebar (commentée)** — Lignes 15-26 :
```html
<!--   <aside class="sidebar">
    ...
</aside> -->
```
Une sidebar était prévue pour afficher les conversations récentes (comme ChatGPT), mais elle est actuellement **commentée** et donc invisible.

**Topbar** — Lignes 32-43 :
```html
<header class="topbar">
    <div class="topbar-right">
        <a href="https://portfolio-..." class="icon-btn">
            <i class="fa-solid fa-briefcase"></i> Portfolio
        </a>
        <a href="https://github.com/Ziko-20" class="icon-btn">
            <i class="fa-brands fa-github"></i> GitHub
        </a>
    </div>
</header>
```
Contient deux liens (Portfolio et GitHub) affichés comme boutons avec des icônes.

**Zone de chat** — Lignes 46-60 :
```html
<main class="chat-area" id="chat-area">
    <div class="msg-row bot">
        <div class="msg-avatar bot-av">
            <i class="fa-solid fa-robot"></i>
        </div>
        <div class="msg-body">
            <div class="msg-bubble">Bonjour ! Je suis l'assistant de Zakaria...</div>
            <div class="msg-meta">10:00</div>
            <div class="msg-actions">
                <button class="act-btn" title="Copier">...</button>
                <button class="act-btn" title="Régénérer">...</button>
            </div>
        </div>
    </div>
</main>
```
Contient un **message de bienvenue** par défaut du bot. Chaque message est structuré ainsi :
- `msg-row` : La ligne complète du message (alignement gauche pour le bot, droite pour l'utilisateur)
- `msg-avatar` : L'avatar (icône robot pour le bot, initiales "ZL" pour l'utilisateur)
- `msg-body` : Le conteneur du message
  - `msg-bubble` : Le texte du message
  - `msg-meta` : L'heure du message
  - `msg-actions` : Boutons d'action (copier, régénérer) — uniquement pour les messages du bot

**Zone de saisie** — Lignes 63-86 :
```html
<footer class="input-area">
    <div class="input-wrapper">
        <textarea id="user-input" placeholder="Envoyer un message…" rows="1"></textarea>
        <div class="input-footer">
            <div class="input-tools">
                <button class="tool-btn" title="Joindre un fichier">📎</button>
                <button class="tool-btn" title="Recherche web">🌐</button>
            </div>
            <button id="send-btn" disabled>↑</button>
        </div>
    </div>
    <p class="disclaimer">Zakaria's Chatbot peut faire des erreurs...</p>
</footer>
```
- `textarea` : Zone de saisie multi-lignes (auto-expansible)
- Boutons d'outils : paperclip (joindre fichier) et globe (recherche web) — **décoratifs**, non fonctionnels
- `send-btn` : Bouton d'envoi, **désactivé par défaut** (activé quand l'utilisateur tape du texte)
- `disclaimer` : Avertissement que le chatbot peut faire des erreurs

---

### 6.2 JavaScript inline (dans index.html)

Le script principal est intégré directement dans `index.html` (lignes 91-214).

#### Initialisation (lignes 92-94)

```javascript
const input   = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const chatArea = document.getElementById('chat-area');
```
Récupère les 3 éléments HTML principaux par leur ID pour les manipuler en JavaScript.

#### Auto-resize du textarea et activation du bouton (lignes 97-101)

```javascript
input.addEventListener('input', () => {
    sendBtn.disabled = input.value.trim() === '';
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
});
```
À chaque frappe clavier :
1. **Active/Désactive** le bouton d'envoi selon que le textarea est vide ou non
2. **Redimensionne** automatiquement le textarea selon son contenu (max 120px de hauteur)

Le `trim()` supprime les espaces au début et à la fin pour éviter qu'un message contenant uniquement des espaces soit envoyé.

#### Envoi avec la touche Entrée (lignes 104-109)

```javascript
input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled) sendMessage();
    }
});
```
- **Entrée** seule → envoie le message
- **Shift + Entrée** → ajoute un retour à la ligne (ne bloque pas)
- `e.preventDefault()` empêche le retour à la ligne par défaut quand on appuie sur Entrée

#### Événement click du bouton d'envoi (ligne 111)

```javascript
sendBtn.addEventListener('click', sendMessage);
```
Associe la fonction `sendMessage()` au clic sur le bouton d'envoi.

#### Fonction `getTime()` (lignes 114-116)

```javascript
function getTime() {
    return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}
```
Retourne l'heure actuelle au format français (`14:30`, `09:15`, etc.).

#### Fonction `appendMsg(role, text)` (lignes 118-157)

```javascript
function appendMsg(role, text) {
    const isBot = role === 'bot';
    const row   = document.createElement('div');
    row.className = `msg-row ${role}`;
    // ...
}
```
Cette fonction **crée et ajoute** un message au chat. Elle :

1. **Détermine** si c'est un message bot ou utilisateur
2. **Crée** la structure HTML du message :
   - `msg-row` : conteneur principal
   - `msg-avatar` : avatar (icône robot ou initiales "ZL")
   - `msg-body` : corps du message
     - `msg-bubble` : texte du message
     - `msg-meta` : heure
     - `msg-actions` : boutons copier/régénérer (bot seulement)
3. **Ordonne** les éléments différemment selon le rôle :
   - Bot : `[avatar] [corps]` (avatar à gauche)
   - User : `[corps] [avatar]` (avatar à droite)
4. **Scroll** automatiquement vers le bas pour montrer le dernier message

#### Fonction `showTyping()` (lignes 159-176)

```javascript
function showTyping() {
    const row = document.createElement('div');
    row.className = 'msg-row bot';
    row.id = 'typing-row';
    row.innerHTML = `
        <div class="msg-avatar bot-av"><i class="fa-solid fa-robot"></i></div>
        <div class="msg-body">
            <div class="msg-bubble">
                <div class="typing-indicator">
                    <span class="dot"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                </div>
            </div>
        </div>`;
    chatArea.appendChild(row);
    chatArea.scrollTop = chatArea.scrollHeight;
}
```
Affiche un **indicateur de frappe** (3 points animés qui rebondissent) pendant que le serveur attend la réponse de l'API Groq. L'ID `typing-row` permet de le retrouver et le supprimer ensuite.

#### Fonction `removeTyping()` (lignes 178-181)

```javascript
function removeTyping() {
    const el = document.getElementById('typing-row');
    if (el) el.remove();
}
```
Supprime l'indicateur de frappe du DOM.

#### Fonction `sendMessage()` — Le cœur du frontend (lignes 184-208)

```javascript
async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    appendMsg('user', text);        // 1. Affiche le message de l'utilisateur
    input.value = '';                // 2. Vide le textarea
    input.style.height = 'auto';    // 3. Réinitialise la hauteur
    sendBtn.disabled = true;         // 4. Désactive le bouton d'envoi
    showTyping();                    // 5. Affiche l'indicateur de frappe

    try {
        const res = await fetch('/api/chat', {    // 6. Envoie le message au serveur
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        const data = await res.json();            // 7. Parse la réponse JSON
        removeTyping();                            // 8. Retire l'indicateur de frappe
        const reply = data?.reply || 'Désolé, une erreur est survenue.';
        appendMsg('bot', reply);                   // 9. Affiche la réponse du bot
    } catch {
        removeTyping();                            // 10. En cas d'erreur réseau
        appendMsg('bot', 'Erreur de connexion. Réessayez.');
    }
}
```

**Étapes détaillées :**

| Étape | Action | But |
|---|---|---|
| 1 | `appendMsg('user', text)` | Affiche immédiatement le message de l'utilisateur dans le chat |
| 2 | `input.value = ''` | Vide le champ de saisie |
| 3 | `input.style.height = 'auto'` | Réinitialise la hauteur du textarea |
| 4 | `sendBtn.disabled = true` | Empêche d'envoyer un autre message pendant le traitement |
| 5 | `showTyping()` | Affiche les 3 points animés pour indiquer que le bot "réfléchit" |
| 6 | `fetch('/api/chat', ...)` | Envoie une requête POST au serveur avec le message en JSON |
| 7 | `res.json()` | Parse la réponse du serveur |
| 8 | `removeTyping()` | Retire les 3 points animés |
| 9 | `appendMsg('bot', reply)` | Affiche la réponse du bot dans le chat |
| 10 | `catch` | Si la connexion échoue, affiche un message d'erreur |

#### Fonction `clearChat()` (lignes 210-213)

```javascript
function clearChat() {
    chatArea.innerHTML = '';
    appendMsg('bot', 'Nouvelle conversation démarrée. Comment puis-je vous aider ?');
}
```
Efface tous les messages et affiche un nouveau message de bienvenue. Cette fonction est appelée par le bouton "Nouvelle conversation" de la sidebar (actuellement commentée).

---

### 6.3 `public/script.js` — Ancien script frontend

Ce fichier est un **script alternatif** qui n'est **pas chargé** par le `index.html` actuel. Il semble être une version antérieure du code JavaScript.

Il contient les mêmes fonctionnalités que le script inline mais avec des sélecteurs différents (`.chat-box`, `.input-form`) qui correspondent à une ancienne version de l'interface HTML.

> Ce fichier pourrait être supprimé car il n'est plus utilisé.

---

### 6.4 `public/style.css` — Styles CSS

Le fichier CSS est organisé en **sections bien séparées** et contient 468 lignes.

#### Variables CSS (`:root`) — Lignes 7-24

```css
:root {
    --bg-main:        #f5f5f5;      /* Fond principal gris clair */
    --bg-sidebar:     #efefef;      /* Fond de la sidebar */
    --bg-surface:     #ffffff;      /* Fond des surfaces (bulles, input) */
    --bg-hover:       #e8e8e8;      /* Fond au survol */
    --bg-active:      #e0e0e0;      /* Fond de l'élément actif */
    --border:         #d0d0d0;      /* Couleur des bordures */
    --border-light:   #d0d0d0;      /* Bordure légère */
    --text-primary:   #1a1a1a;      /* Texte principal (quasi-noir) */
    --text-muted:     #555555;      /* Texte secondaire (gris foncé) */
    --text-hint:      #aaaaaa;      /* Texte léger (gris clair) */
    --accent-gradient: linear-gradient(135deg, #6c4fcc, #4a90e2); /* Dégradé violet→bleu */
    --send-bg:        #1a1a1a;      /* Fond du bouton d'envoi */
    --send-color:     #ffffff;      /* Couleur du bouton d'envoi */
    --send-hover:     #333333;      /* Fond du bouton d'envoi au survol */
    --code-bg:        #efefef;      /* Fond des blocs de code */
    --code-color:     #6c4fcc;      /* Couleur du texte code (violet) */
}
```
Les **variables CSS** (custom properties) centralisent toutes les couleurs et styles du design. Cela permet de modifier le thème entier en changeant quelques valeurs ici.

#### Sections principales du CSS

| Section | Lignes | Rôle |
|---|---|---|
| **Reset** | 1-5 | Réinitialise les marges, padding, et active `box-sizing: border-box` |
| **Layout** | 36-40 | Flexbox plein écran (`height: 100vh`) avec `overflow: hidden` |
| **Sidebar** | 42-83 | Styles de la barre latérale (240px, scroll vertical) |
| **Main** | 85-94 | Zone principale flexible |
| **Topbar** | 96-173 | Barre supérieure (flexbox, bordure en bas, boutons stylisés) |
| **Chat area** | 175-203 | Zone des messages (scroll personnalisé, padding) |
| **Messages** | 196-294 | Structure des messages (lignes, avatars, bulles, métadonnées) |
| **Code inline** | 296-304 | Style pour les blocs `<code>` (fond gris, texte violet) |
| **Typing indicator** | 306-328 | Animation des 3 points rebondissants |
| **Input area** | 330-447 | Zone de saisie (textarea auto-resize, boutons) |
| **Responsive** | 449-468 | Adaptations pour les écrans ≤ 640px |

#### Animation des points de frappe (lignes 325-328)

```css
@keyframes bounce {
    0%, 60%, 100% { transform: translateY(0);   opacity: 0.4; }
    30%            { transform: translateY(-6px); opacity: 1;   }
}
```
Chaque point rebondit vers le haut de 6px avec un délai décalé (`0s`, `0.2s`, `0.4s`) pour créer un effet de vague.

#### Design des messages

- **Messages bot** : Fond transparent, pas de bordure (texte simple)
- **Messages utilisateur** : Fond blanc, bordure subtile, coins arrondis (`16px 16px 4px 16px`) — le coin en bas à droite est plus petit pour indiquer la direction
- **Avatars** : Ronds (30×30px), le bot a un fond gris avec une icône robot, l'utilisateur a un dégradé violet→bleu avec les initiales "ZL"

#### Responsive (lignes 452-468)

```css
@media (max-width: 640px) {
    .sidebar { display: none; }
    .msg-row { padding: 6px 12px; }
    .input-area { padding: 10px 12px 14px; }
    .topbar { padding: 10px 14px; }
}
```
Sur les écrans de moins de 640px (mobiles) :
- La sidebar est cachée
- Les paddings sont réduits pour gagner de l'espace

---

## 7. 🔄 Flux complet d'un message — De la saisie à la réponse

Voici le parcours complet d'un message, **étape par étape** :

```
┌─────────────────────────────────────────────────────────────────┐
│  ÉTAPE 1 — L'utilisateur tape "Salut" dans le textarea         │
│            → L'événement 'input' active le bouton d'envoi      │
│                                                                 │
│  ÉTAPE 2 — L'utilisateur appuie sur Entrée ou clique ↑         │
│            → sendMessage() est appelée                          │
│                                                                 │
│  ÉTAPE 3 — Le message "Salut" est affiché côté utilisateur     │
│            → appendMsg('user', 'Salut')                         │
│            → Le textarea est vidé                               │
│            → Les 3 points animés apparaissent                   │
│                                                                 │
│  ÉTAPE 4 — Le frontend envoie une requête au serveur           │
│            → fetch POST /api/chat { message: "Salut" }         │
│                                                                 │
│  ÉTAPE 5 — Le serveur reçoit la requête                        │
│            → server.js : route app.post('/api/chat')            │
│            → Extrait le message du body                         │
│                                                                 │
│  ÉTAPE 6 — Le serveur appelle l'API Groq                       │
│            → POST https://api.groq.com/openai/v1/...           │
│            → Avec le modèle llama-3.3-70b-versatile            │
│            → Avec le message de l'utilisateur                   │
│                                                                 │
│  ÉTAPE 7 — Groq génère une réponse avec LLaMA 3.3 70B         │
│            → Renvoie un JSON avec la réponse                    │
│                                                                 │
│  ÉTAPE 8 — Le serveur extrait la réponse                       │
│            → data.choices[0].message.content                    │
│            → Renvoie { reply: "..." } au client                 │
│                                                                 │
│  ÉTAPE 9 — Le frontend reçoit la réponse                       │
│            → Les 3 points animés disparaissent                  │
│            → La réponse du bot est affichée                     │
│            → appendMsg('bot', reply)                            │
│            → Le chat scrolle vers le bas                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. 🚀 Déploiement sur Vercel

### Comment ça fonctionne

Sur Vercel, le projet ne fonctionne **pas** avec `server.js`. Vercel utilise :

1. **Fichiers statiques** (`public/`) → servis directement
2. **Fonctions serverless** (`api/chat.js`) → exécutées à la demande

### Différences avec le local

| Aspect | Local | Vercel |
|---|---|---|
| Serveur | Express (`server.js`) | Serverless (`api/chat.js`) |
| Variables d'env | Fichier `.env` | Dashboard Vercel |
| Port | 3000 | Automatique |
| Fichiers statiques | `express.static()` | `@vercel/static` |
| SDK Groq | `fetch` natif | `groq-sdk` |

### Configuration requise sur Vercel

1. Connecter le repo GitHub
2. Ajouter la variable `GROQ_API_KEY` dans **Settings > Environment Variables**
3. Vercel déploie automatiquement à chaque push

---

## 9. 🔒 Points importants et sécurité

### ✅ Ce qui est bien fait

- La clé API est stockée dans `.env` et ignorée par Git
- Le serveur valide que le message n'est pas vide
- Les erreurs sont gérées avec des try/catch
- L'interface est responsive (mobile-friendly)
- L'indicateur de frappe améliore l'expérience utilisateur

### ⚠️ Points à améliorer

| Problème | Solution recommandée |
|---|---|
| `node_modules/` absent du `.gitignore` | Ajouter `node_modules/` au `.gitignore` |
| `groq-sdk` utilisé dans `api/chat.js` mais absent de `package.json` | Exécuter `npm install groq-sdk` |
| Dépendances inutilisées (`@anthropic-ai/sdk`, `@google/generative-ai`) | Les retirer avec `npm uninstall` |
| Pas d'historique de conversation (chaque message est envoyé seul) | Stocker l'historique côté client et l'envoyer avec chaque requête |
| `public/script.js` n'est plus utilisé | Le supprimer ou le réintégrer |
| Boutons "Copier" et "Régénérer" non fonctionnels | Implémenter `navigator.clipboard.writeText()` et un mécanisme de régénération |
| Boutons "Joindre fichier" et "Recherche web" décoratifs | Implémenter ou les retirer |
| Pas de `start` script dans `package.json` | Ajouter `"start": "node server.js"` |

---

> **Auteur** : Zakaria Lemchaouri  
> **GitHub** : [github.com/Ziko-20](https://github.com/Ziko-20)  
> **Portfolio** : [portfolio-zakaria-lemchaouri.vercel.app](https://portfolio-zakaria-lemchaouri.vercel.app)
