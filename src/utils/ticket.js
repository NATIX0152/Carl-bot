const {
  AttachmentBuilder, ChannelType, EmbedBuilder, PermissionFlagsBits,
} = require('discord.js');
const config = require('../config');
const catalog = require('../catalog');

const STATUS = {
  pending: { text: '⏳ En attente de paiement', color: 0xf1c40f },
  paid: { text: '✅ Payé — en cours', color: 0x3498db },
  done: { text: '🏆 Terminé', color: 0x2ecc71 },
};

function ticketEmbed(offer, method, userId, status = 'pending') {
  const pay = config.payments[method];
  return new EmbedBuilder()
    .setTitle(`Commande : ${offer.label}`)
    .setColor(STATUS[status].color)
    .addFields(
      { name: 'Client', value: `<@${userId}>`, inline: true },
      { name: 'Prix', value: `${offer.price} €`, inline: true },
      { name: 'Statut', value: STATUS[status].text, inline: true },
      { name: `Paiement ${pay.emoji} ${pay.label}`, value: pay.details },
    )
    .setFooter({ text: 'Après paiement, envoie une preuve dans ce salon. Le staff valide avec /paye.' });
}

async function createTicket(interaction, offerId, method) {
  const offer = catalog.find((o) => o.id === offerId);
  if (!offer || !config.payments[method]) throw new Error('Offre ou moyen de paiement invalide');
  const { guild, user } = interaction;

  const existing = guild.channels.cache.find((c) => c.topic?.startsWith(`ticket:${user.id}:`));
  if (existing) return { existing };

  const overwrites = [
    { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
    { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.ReadMessageHistory] },
    { id: guild.members.me.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] },
  ];
  if (config.staffRoleId) {
    overwrites.push({ id: config.staffRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] });
  }

  const channel = await guild.channels.create({
    name: `commande-${user.username}`.slice(0, 90),
    type: ChannelType.GuildText,
    parent: config.ticketCategoryId || undefined,
    topic: `ticket:${user.id}:${offer.id}:${method}`,
    permissionOverwrites: overwrites,
  });

  const staffPing = config.staffRoleId ? `<@&${config.staffRoleId}> ` : '';
  await channel.send({
    content: `${staffPing}<@${user.id}>`,
    embeds: [ticketEmbed(offer, method, user.id)],
  });
  return { channel };
}

async function sendTranscript(channel) {
  if (!config.logChannelId) return;
  const logChannel = await channel.guild.channels.fetch(config.logChannelId).catch(() => null);
  if (!logChannel) return;
  let all = [];
  let before;
  for (;;) {
    const batch = await channel.messages.fetch({ limit: 100, before });
    if (!batch.size) break;
    all = all.concat([...batch.values()]);
    before = batch.last().id;
  }
  all.reverse();
  const text = all
    .map((m) => `[${m.createdAt.toISOString()}] ${m.author.tag}: ${m.content}${m.attachments.size ? ' ' + [...m.attachments.values()].map((a) => a.url).join(' ') : ''}`)
    .join('\n');
  await logChannel.send({
    content: `Transcription de **#${channel.name}**`,
    files: [new AttachmentBuilder(Buffer.from(text || '(vide)', 'utf8'), { name: `${channel.name}.txt` })],
  });
}

function parseTopic(channel) {
  if (!channel.topic?.startsWith('ticket:')) return null;
  const [, userId, offerId, method] = channel.topic.split(':');
  const offer = catalog.find((o) => o.id === offerId);
  return offer && config.payments[method] ? { userId, offer, method } : null;
}

// Met à jour le message d'origine du ticket (le premier du salon)
async function setStatus(channel, status) {
  const info = parseTopic(channel);
  if (!info) return false;
  const [first] = [...(await channel.messages.fetch({ after: '0', limit: 1 })).values()];
  if (first?.author.id === channel.client.user.id) {
    await first.edit({ embeds: [ticketEmbed(info.offer, info.method, info.userId, status)] });
  }
  return info;
}

async function closeTicket(interaction) {
  await interaction.reply('Fermeture du ticket dans 5 secondes…');
  await sendTranscript(interaction.channel).catch(console.error);
  setTimeout(() => interaction.channel.delete().catch(console.error), 5000);
}

module.exports = { createTicket, ticketEmbed, parseTopic, setStatus, closeTicket };
