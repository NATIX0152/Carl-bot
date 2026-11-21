const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } = require('discord.js');
const db = require('../db');

const TEXT = `# **Are we legit ?**

> ✅ = *Legit*

> ❌ = *Ban* **( without proof )**`;

const data = new SlashCommandBuilder()
  .setName('arwelegit')
  .setDescription('Envoyer le message "Are we legit ?"')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setContexts(0)
  .addRoleOption((o) => o.setName('role_staff').setDescription('Rôle du staff qui verra les tickets ❌'))
  .addChannelOption((o) =>
    o.setName('categorie').setDescription('Catégorie où créer les tickets ❌').addChannelTypes(ChannelType.GuildCategory))
  .addChannelOption((o) =>
    o.setName('salon').setDescription('Salon cible (défaut : ici)').addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement));

async function execute(interaction) {
  const channel = interaction.options.getChannel('salon') ?? interaction.channel;
  let msg;
  try {
    msg = await channel.send(TEXT);
    await msg.react('✅');
    await msg.react('❌');
  } catch {
    return interaction.reply({ content: '❌ Je ne peux pas écrire / réagir dans ce salon.', flags: MessageFlags.Ephemeral });
  }
  db.data.legit[msg.id] = {
    guildId: interaction.guildId,
    staffRoleId: interaction.options.getRole('role_staff')?.id ?? null,
    categoryId: interaction.options.getChannel('categorie')?.id ?? null,
  };
  db.save();
  await interaction.reply({ content: '✅ Message envoyé.', flags: MessageFlags.Ephemeral });
}

module.exports = { data, execute };
