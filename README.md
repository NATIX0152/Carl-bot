# 🤖 Bot Discord — Shop de boost Brawl Stars

Bot Discord (discord.js v14) : tickets, vouch, PayPal/LTC, modération, arrivées/départs.

## Installation
1. Crée une application sur https://discord.com/developers/applications → onglet **Bot** → copie le token.
2. Dans **Bot**, active les 2 intents privilégiés : **Server Members Intent** et **Message Content Intent**.
3. Invite le bot via **OAuth2 → URL Generator** : scopes `bot` + `applications.commands`, permission **Administrateur** (le plus simple).
4. Installe Node.js 18.17+ puis dans le dossier :
   ```bash
   npm install
   cp .env.example .env   # puis remplis DISCORD_TOKEN (et GUILD_ID conseillé)
   npm start
   ```
5. **Important** : place le rôle du bot **au-dessus** des rôles « Vouch N » et des membres à modérer (Paramètres du serveur → Rôles).

## Commandes
| Commande | Qui | Description |
|---|---|---|
| `/panelticket` | Admin | Panel de ticket (titre, description, bouton, couleur via formulaire ; options : `role_staff`, `categorie`, `salon`) |
| `/ajouterticket membre` | Staff / auteur du ticket | Ajoute un membre au ticket |
| `/paypaldefinir email` | Tout le monde | Définit TON PayPal |
| `/definirltc adresse` | Tout le monde | Définit TON adresse LTC |
| `/paypalafficher membre` | Tout le monde | Affiche le PayPal du membre mentionné |
| `/ltcafficher membre` | Tout le monde | Affiche l'adresse LTC du membre mentionné |
| `+vouch @membre [message]` | Tout le monde | Ajoute un vouch ; rôle `Vouch 5`, `Vouch 10`, `Vouch 15`… par tranche de 5 (créé automatiquement, l'ancien est retiré) |
| `/say message [salon]` | Gérer les messages | Fait parler le bot (`\n` = saut de ligne) |
| `/arwelegit [role_staff] [categorie] [salon]` | Admin | Envoie « Are we legit ? » avec ✅ ❌ ; cliquer ❌ ouvre un ticket « Nous ne sommes pas legit : donne des preuves sinon ban » |
| `/clear nombre` | Gérer les messages | Supprime 1 à 100 messages |
| `/arriverconfigurer` | Admin | `salon`, `message`, `role` (auto), `desactiver` |
| `/departconfigurer` | Admin | `salon`, `message`, `desactiver` |
| `/ban membre [raison]` | Bannir | Bannit |
| `/expulser membre [raison]` | Expulser | Expulse |

Variables pour arrivées/départs : `{user}` `{username}` `{server}` `{count}`.

Anti-abus vouch : pas d'auto-vouch, 1 vouch par personne et par cible toutes les 24h (`VOUCH_COOLDOWN_HOURS`).

## Données
Tout est stocké dans `data/db.json` (sauvegarde ce fichier ; sur un hébergeur, garde le dossier `data/` persistant).
