require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');

if (!process.env.DISCORD_TOKEN) {
  console.error('❌ DISCORD_TOKEN manquant. Copie .env.example en .env et remplis-le.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,        // intent privilégié (arrivées/départs)
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,      // intent privilégié (+vouch)
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User],
});

client.commands = new Collection();
for (const file of fs.readdirSync(path.join(__dirname, 'commands')).filter((f) => f.endsWith('.js'))) {
  const mod = require(path.join(__dirname, 'commands', file));
  for (const cmd of [].concat(mod)) client.commands.set(cmd.data.name, cmd);
}

for (const file of fs.readdirSync(path.join(__dirname, 'events')).filter((f) => f.endsWith('.js'))) {
  const ev = require(path.join(__dirname, 'events', file));
  client[ev.once ? 'once' : 'on'](ev.name, (...args) => {
    Promise.resolve(ev.execute(client, ...args)).catch((e) => console.error(`[${ev.name}]`, e));
  });
}

process.on('unhandledRejection', (e) => console.error('[unhandledRejection]', e));
client.login(process.env.DISCORD_TOKEN);
