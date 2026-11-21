const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const catalog = require('../catalog');

module.exports = {
  data: new SlashCommandBuilder().setName('prix').setDescription('Voir les tarifs des boosts'),
  async execute(interaction) {
    const embed = new EmbedBuilder().setTitle('Tarifs').setColor(0xf1c40f)
      .setDescription(catalog.map((o) => `**${o.label}** — ${o.price} € _(${o.category})_`).join('\n'));
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
