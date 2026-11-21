const { Events, EmbedBuilder } = require('discord.js');
const db = require('../db');
const { updateVouchRole, TRANCHE } = require('../utils/vouch');

const COOLDOWN_MS = (Number(process.env.VOUCH_COOLDOWN_HOURS) || 24) * 3600 * 1000;

module.exports = {
  name: Events.MessageCreate,
  async execute(client, message) {
    if (message.author.bot || !message.guild) return;
    const m = message.content.match(/^\+vouch\s+<@!?(\d+)>\s*([\s\S]*)$/i);
    if (!m) return;

    const reply = (text) => message.reply({ content: text, allowedMentions: { repliedUser: false, parse: [] } });
    const target = await message.guild.members.fetch(m[1]).catch(() => null);
    if (!target) return reply('❌ Membre introuvable.');
    if (target.user.bot) return reply('❌ Tu ne peux pas vouch un bot.');
    if (target.id === message.author.id) return reply('❌ Tu ne peux pas te vouch toi-même.');

    const key = `${message.guild.id}:${message.author.id}:${target.id}`;
    const last = db.data.vouchLog[key] ?? 0;
    if (Date.now() - last < COOLDOWN_MS) {
      return reply(`⏳ Tu as déjà vouch ce membre récemment (1 vouch / ${COOLDOWN_MS / 3600000}h par personne).`);
    }
    db.data.vouchLog[key] = Date.now();

    const counts = (db.data.vouches[message.guild.id] ??= {});
    const count = (counts[target.id] = (counts[target.id] ?? 0) + 1);
    db.save();

    let roleLine = '';
    try {
      const role = await updateVouchRole(target, count);
      if (role && count % TRANCHE === 0) roleLine = `\n🏅 Nouveau palier ! <@${target.id}> reçoit le rôle **${role.name}**.`;
    } catch (e) {
      console.error('[vouch] rôle', e.message);
      roleLine = '\n⚠️ Je n\'ai pas pu donner le rôle (permission « Gérer les rôles » / hiérarchie).';
    }

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle('✅ Vouch enregistré')
      .setDescription(
        `<@${message.author.id}> a vouch <@${target.id}>${m[2].trim() ? `\n> ${m[2].trim().slice(0, 300)}` : ''}\n\n` +
        `📊 **${count}** vouch${count > 1 ? 's' : ''} au total${roleLine}`,
      )
      .setTimestamp();
    await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false, parse: [] } });
  },
};
