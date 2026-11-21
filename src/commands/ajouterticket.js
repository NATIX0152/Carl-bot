const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { parseTopic, isStaff } = require('../utils/tickets');

const data = new SlashCommandBuilder()
  .setName('ajouterticket')
  .setDescription('Ajouter un membre au ticket actuel')
  .setContexts(0)
  .addUserOption((o) => o.setName('membre').setDescription('Membre à ajouter').setRequired(true));

async function execute(interaction) {
  const info = parseTopic(interaction.channel);
  if (!info) return interaction.reply({ content: '❌ Cette commande ne fonctionne que dans un ticket.', flags: MessageFlags.Ephemeral });
  if (!isStaff(interaction.member, interaction.channel) && interaction.user.id !== info.ownerId) {
    return interaction.reply({ content: '❌ Tu ne peux pas ajouter quelqu\'un à ce ticket.', flags: MessageFlags.Ephemeral });
  }
  const member = interaction.options.getMember('membre');
  if (!member) return interaction.reply({ content: '❌ Membre introuvable sur le serveur.', flags: MessageFlags.Ephemeral });

  await interaction.channel.permissionOverwrites.edit(member.id, {
    ViewChannel: true, SendMessages: true, ReadMessageHistory: true, AttachFiles: true,
  });
  await interaction.reply({ content: `✅ <@${member.id}> a été ajouté au ticket.`, allowedMentions: { users: [member.id] } });
}

module.exports = { data, execute };
