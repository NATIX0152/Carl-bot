const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } = require('discord.js');

const data = new SlashCommandBuilder()
  .setName('say')
  .setDescription('Faire parler le bot')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .setContexts(0)
  .addStringOption((o) => o.setName('message').setDescription('Message à envoyer (\\n = saut de ligne)').setRequired(true).setMaxLength(2000))
  .addChannelOption((o) => o.setName('salon').setDescription('Salon cible (défaut : ici)').addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement));

async function execute(interaction) {
  const channel = interaction.options.getChannel('salon') ?? interaction.channel;
  const content = interaction.options.getString('message').replaceAll('\\n', '\n');
  try {
    await channel.send({ content, allowedMentions: { parse: ['users', 'roles'] } });
  } catch {
    return interaction.reply({ content: '❌ Je ne peux pas écrire dans ce salon.', flags: MessageFlags.Ephemeral });
  }
  await interaction.reply({ content: '✅ Message envoyé.', flags: MessageFlags.Ephemeral });
}

module.exports = { data, execute };
