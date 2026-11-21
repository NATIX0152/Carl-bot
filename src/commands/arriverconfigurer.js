const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } = require('discord.js');
const db = require('../db');

const data = new SlashCommandBuilder()
  .setName('arriverconfigurer')
  .setDescription('Configurer le message d\'arrivée')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setContexts(0)
  .addChannelOption((o) => o.setName('salon').setDescription('Salon des arrivées').addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement))
  .addStringOption((o) => o.setName('message').setDescription('Variables : {user} {username} {server} {count} (\\n = saut de ligne)').setMaxLength(1500))
  .addRoleOption((o) => o.setName('role').setDescription('Rôle donné automatiquement aux nouveaux'))
  .addBooleanOption((o) => o.setName('desactiver').setDescription('Désactiver le système d\'arrivée'));

async function execute(interaction) {
  const g = db.guild(interaction.guildId);
  if (interaction.options.getBoolean('desactiver')) {
    delete g.welcome;
    db.save();
    return interaction.reply({ content: '✅ Système d\'arrivée désactivé.', flags: MessageFlags.Ephemeral });
  }
  const channel = interaction.options.getChannel('salon');
  if (!channel && !g.welcome) {
    return interaction.reply({ content: '❌ Indique un `salon` pour la première configuration.', flags: MessageFlags.Ephemeral });
  }
  const message = interaction.options.getString('message')?.replaceAll('\\n', '\n');
  const role = interaction.options.getRole('role');
  g.welcome = {
    channelId: channel?.id ?? g.welcome.channelId,
    message: message ?? g.welcome?.message ?? 'Bienvenue {user} sur **{server}** ! Nous sommes {count} membres 🎉',
    roleId: role?.id ?? g.welcome?.roleId ?? null,
  };
  db.save();
  await interaction.reply({
    content: `✅ Arrivées configurées dans <#${g.welcome.channelId}>${g.welcome.roleId ? ` (rôle auto : <@&${g.welcome.roleId}>)` : ''}.\nMessage : ${g.welcome.message}`,
    flags: MessageFlags.Ephemeral,
    allowedMentions: { parse: [] },
  });
}

module.exports = { data, execute };
