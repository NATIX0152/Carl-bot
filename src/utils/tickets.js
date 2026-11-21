const {
  ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, PermissionFlagsBits,
} = require('discord.js');

const COLOR = 0x5865f2;

function parseTopic(channel) {
  const m = channel?.topic?.match(/^ticket:(\d+):(\d+)$/);
  return m ? { ownerId: m[1], staffRoleId: m[2] === '0' ? null : m[2] } : null;
}

function isStaff(member, channel) {
  const info = parseTopic(channel);
  if (!info) return false;
  return (
    member.permissions.has(PermissionFlagsBits.ManageChannels) ||
    (info.staffRoleId && member.roles.cache.has(info.staffRoleId))
  );
}

async function createTicket({ guild, user, reason, staffRoleId, categoryId }) {
  const existing = guild.channels.cache.find((c) => c.topic?.startsWith(`ticket:${user.id}:`));
  if (existing) return { channel: existing, existed: true };

  const staff = staffRoleId && guild.roles.cache.has(staffRoleId) ? staffRoleId : null;
  const parent = categoryId && guild.channels.cache.get(categoryId)?.type === ChannelType.GuildCategory ? categoryId : null;

  const base = [
    PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles,
  ];
  const overwrites = [
    { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
    { id: user.id, allow: base },
    { id: guild.members.me.id, allow: [...base, PermissionFlagsBits.ManageChannels] },
  ];
  if (staff) overwrites.push({ id: staff, allow: base });

  const slug = user.username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20) || 'membre';
  const channel = await guild.channels.create({
    name: `ticket-${slug}`,
    type: ChannelType.GuildText,
    parent,
    topic: `ticket:${user.id}:${staff ?? '0'}`,
    permissionOverwrites: overwrites,
    reason: `Ticket ouvert par ${user.tag ?? user.username}`,
  });

  const embed = new EmbedBuilder()
    .setColor(COLOR)
    .setTitle('🎫 Ticket ouvert')
    .setDescription(`Bienvenue <@${user.id}> !\nUn membre du staff va te répondre rapidement.`)
    .addFields({ name: 'Raison', value: reason.slice(0, 1000) })
    .setTimestamp();
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket_close').setLabel('Fermer le ticket').setEmoji('🔒').setStyle(ButtonStyle.Danger),
  );
  await channel.send({
    content: `<@${user.id}>${staff ? ` <@&${staff}>` : ''}`,
    embeds: [embed],
    components: [row],
    allowedMentions: { users: [user.id], roles: staff ? [staff] : [] },
  });
  return { channel, existed: false };
}

module.exports = { createTicket, parseTopic, isStaff, COLOR };
