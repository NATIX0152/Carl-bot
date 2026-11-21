const { Events } = require('discord.js');
const db = require('../db');
const { formatTemplate } = require('../utils/format');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(client, member) {
    const cfg = db.data.guilds[member.guild.id]?.welcome;
    if (!cfg) return;
    if (cfg.roleId) await member.roles.add(cfg.roleId, 'Rôle d\'arrivée').catch((e) => console.error('[arrivée] rôle', e.message));
    const channel = member.guild.channels.cache.get(cfg.channelId);
    await channel?.send({ content: formatTemplate(cfg.message, member), allowedMentions: { users: [member.id] } });
  },
};
