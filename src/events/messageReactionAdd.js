const { Events } = require('discord.js');
const db = require('../db');
const { createTicket } = require('../utils/tickets');

module.exports = {
  name: Events.MessageReactionAdd,
  async execute(client, reaction, user) {
    if (user.bot) return;
    if (reaction.partial) reaction = await reaction.fetch().catch(() => null);
    if (!reaction) return;
    if (user.partial) user = await user.fetch().catch(() => null);
    if (!user) return;

    const cfg = db.data.legit[reaction.message.id];
    if (!cfg || reaction.emoji.name !== '❌') return;

    // On retire la réaction pour que le membre puisse recliquer plus tard
    await reaction.users.remove(user.id).catch(() => {});

    const guild = client.guilds.cache.get(cfg.guildId);
    if (!guild) return;
    const { channel, existed } = await createTicket({
      guild,
      user,
      reason: 'Nous ne sommes pas legit : donne des preuves sinon ban.',
      staffRoleId: cfg.staffRoleId,
      categoryId: cfg.categoryId,
    });
    if (existed) console.log(`[legit] ${user.tag} a déjà un ticket (${channel.name})`);
  },
};
