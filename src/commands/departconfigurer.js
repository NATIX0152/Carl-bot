const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } = require('discord.js');
const db = require('../db');

const data = new SlashCommandBuilder()
  .setName('departconfigurer')
  .setDescription('Configurer le message de départ')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setContexts(0)
  .addChannelOption((o) => o.setName('salon').setDescription('Salon des départs').addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement))
  .addStringOption((o) => o.setName('message').setDescription('Variables : {user} {username} {server} {count} (\\n = saut de ligne)').setMaxLength(1500))
  .addBooleanOption((o) => o.setName('desactiver').setDescription('Désactiver le système de départ'));

async function execute(interaction) {
  const g = db.guild(interaction.guildId);
  if (interaction.options.getBoolean('desactiver')) {
    delete g.leave;
    db.save();
    return interaction.reply({ content: '✅ Système de départ désactivé.', flags: MessageFlags.Ephemeral });
  }
  const channel = interaction.options.getChannel('salon');
  if (!channel && !g.leave) {
    return interaction.reply({ content: '❌ Indique un `salon` pour la première configuration.', flags: MessageFlags.Ephemeral });
  }
  const message = interaction.options.getString('message')?.replaceAll('\\n', '\n');
  g.leave = {
    channelId: channel?.id ?? g.leave.channelId,
    message: message ?? g.leave?.message ?? '**{username}** a quitté **{server}** 👋',
  };
  db.save();
  await interaction.reply({
    content: `✅ Départs configurés dans <#${g.leave.channelId}>.\nMessage : ${g.leave.message}`,
    flags: MessageFlags.Ephemeral,
    allowedMentions: { parse: [] },
  });
}

module.exports = { data, execute };
