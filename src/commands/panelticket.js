const {
  SlashCommandBuilder, PermissionFlagsBits, ChannelType, ModalBuilder, TextInputBuilder,
  TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, MessageFlags,
} = require('discord.js');
const { COLOR } = require('../utils/tickets');

const data = new SlashCommandBuilder()
  .setName('panelticket')
  .setDescription('Créer un panel de ticket personnalisable')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setContexts(0)
  .addRoleOption((o) => o.setName('role_staff').setDescription('Rôle du staff qui verra les tickets'))
  .addChannelOption((o) =>
    o.setName('categorie').setDescription('Catégorie où créer les tickets').addChannelTypes(ChannelType.GuildCategory))
  .addChannelOption((o) =>
    o.setName('salon').setDescription('Salon où envoyer le panel (défaut : ici)').addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement));

async function execute(interaction) {
  const channel = interaction.options.getChannel('salon') ?? interaction.channel;
  const role = interaction.options.getRole('role_staff')?.id ?? '0';
  const cat = interaction.options.getChannel('categorie')?.id ?? '0';

  const modal = new ModalBuilder().setCustomId(`panel:${channel.id}:${role}:${cat}`).setTitle('Panel de ticket');
  const field = (id, label, style, required, max, placeholder) =>
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId(id).setLabel(label).setStyle(style).setRequired(required).setMaxLength(max).setPlaceholder(placeholder),
    );
  modal.addComponents(
    field('titre', 'Titre', TextInputStyle.Short, true, 100, 'Ex : Boost Brawl Stars'),
    field('description', 'Description (tu peux faire des sauts de ligne)', TextInputStyle.Paragraph, true, 3500, 'Ex : Clique sur le bouton pour commander ton boost...'),
    field('bouton', 'Texte du bouton', TextInputStyle.Short, false, 80, 'Ouvrir un ticket'),
    field('couleur', 'Couleur hexadécimale', TextInputStyle.Short, false, 7, '#5865F2'),
  );
  await interaction.showModal(modal);
}

async function handleModal(interaction) {
  const [, channelId, roleId, catId] = interaction.customId.split(':');
  const titre = interaction.fields.getTextInputValue('titre');
  const description = interaction.fields.getTextInputValue('description');
  const bouton = interaction.fields.getTextInputValue('bouton') || 'Ouvrir un ticket';
  const couleur = interaction.fields.getTextInputValue('couleur');
  const color = /^#?[0-9a-f]{6}$/i.test(couleur) ? parseInt(couleur.replace('#', ''), 16) : COLOR;

  const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
  if (!channel?.isTextBased()) {
    return interaction.reply({ content: '❌ Salon introuvable.', flags: MessageFlags.Ephemeral });
  }
  const embed = new EmbedBuilder().setColor(color).setTitle(titre).setDescription(description);
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`ticket_open:${roleId}:${catId}`).setLabel(bouton).setEmoji('🎫').setStyle(ButtonStyle.Primary),
  );
  try {
    await channel.send({ embeds: [embed], components: [row] });
  } catch {
    return interaction.reply({ content: `❌ Je ne peux pas écrire dans <#${channelId}>.`, flags: MessageFlags.Ephemeral });
  }
  await interaction.reply({ content: `✅ Panel envoyé dans <#${channelId}>.`, flags: MessageFlags.Ephemeral });
}

module.exports = { data, execute, handleModal };
