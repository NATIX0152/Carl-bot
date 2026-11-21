const { Events } = require('discord.js');
const db = require('../db');
const { formatTemplate } = require('../utils/format');

module.exports = {
  name: Events.GuildMemberRemove,
  async execute(client, member) {
    const cfg = db.data.guilds[member.guild.id]?.leave;
    if (!cfg) return;
    const channel = member.guild.channels.cache.get(cfg.channelId);
    await channel?.send({ content: formatTemplate(cfg.message, member), allowedMentions: { parse: [] } });
  },
};
