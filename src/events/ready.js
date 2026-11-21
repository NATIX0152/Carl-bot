const { Events } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    const body = client.commands.map((c) => c.data.toJSON());
    if (process.env.GUILD_ID) {
      await client.guilds.cache.get(process.env.GUILD_ID)?.commands.set(body);
      console.log(`✅ ${body.length} commandes enregistrées sur le serveur ${process.env.GUILD_ID}`);
    } else {
      await client.application.commands.set(body);
      console.log(`✅ ${body.length} commandes globales enregistrées`);
    }
    console.log(`🤖 Connecté en tant que ${client.user.tag}`);
  },
};
