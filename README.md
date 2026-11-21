# Carl-bot

Bot Discord pour un serveur de boosts Brawl Stars (Prestige & Ranked), paiements PayPal / Litecoin (validation manuelle par le staff).

## Installation
```bash
npm install
cp .env.example .env   # puis remplis les valeurs (le .env n'est jamais commité)
npm start
```

## Configuration (.env)
`DISCORD_TOKEN`, `GUILD_ID`, `STAFF_ROLE_ID`, `TICKET_CATEGORY_ID`, `LOG_CHANNEL_ID`, `PAYPAL_EMAIL`, `LITECOIN_ADDRESS`.
Les tarifs se modifient directement sur Discord avec `/setprix` (sauvegardés dans `data/prices.json`). Les prix par défaut sont dans `src/catalog.js`.

## Commandes
- `/panel` — poste le panneau de commande (staff)
- `/setprix` — change le prix d'un boost (staff)
- `/prix` — affiche les tarifs
- `/close` — ferme un ticket (staff)
