const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const catalog = require('../catalog');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Poster le panneau des tarifs (staff)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const lines = ['Prestige', 'Ranked'].map((cat) =>
      `**${cat}**\n` + catalog.filter((o) => o.category === cat).map((o) => `• ${o.label} — ${o.price} €`).join('\n'));
    const embed = new EmbedBuilder()
      .setTitle('🌟 Boosts Brawl Stars')
      .setDescription(lines.join('\n\n') + '\n\nPaiement accepté : **PayPal** et **Litecoin**.\n\n👉 Pour commander, tape **/commander**')
      .setColor(0xf1c40f);
    await interaction.channel.send({ embeds: [embed] });
    await interaction.reply({ content: 'Panneau posté ✅', ephemeral: true });
  },
};
