const { Routes } = require('discord.js');
const config = require('../config');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    const body = [...client.commands.values()].map((c) => c.data.toJSON());
    const route = config.guildId
      ? Routes.applicationGuildCommands(client.user.id, config.guildId)
      : Routes.applicationCommands(client.user.id);
    await client.rest.put(route, { body });
    console.log(`Connecté en tant que ${client.user.tag} — ${body.length} commandes enregistrées`);
  },
};
