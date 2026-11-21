const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const config = require('./config');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

for (const file of fs.readdirSync(path.join(__dirname, 'commands'))) {
  const cmd = require(`./commands/${file}`);
  client.commands.set(cmd.data.name, cmd);
}
for (const file of fs.readdirSync(path.join(__dirname, 'events'))) {
  const ev = require(`./events/${file}`);
  client[ev.once ? 'once' : 'on'](ev.name, (...args) => ev.execute(...args, client));
}

client.login(config.token);
