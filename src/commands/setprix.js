const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const catalog = require('../catalog');
const { setPrice } = require('../utils/prices');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setprix')
    .setDescription('Modifier le prix d’un boost (staff)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((o) => o.setName('boost').setDescription('Le boost').setRequired(true).setAutocomplete(true))
    .addNumberOption((o) => o.setName('prix').setDescription('Nouveau prix en €').setRequired(true).setMinValue(0)),
  async autocomplete(interaction) {
    const q = interaction.options.getFocused().toLowerCase();
    await interaction.respond(
      catalog.filter((o) => o.label.toLowerCase().includes(q)).slice(0, 25)
        .map((o) => ({ name: `${o.label} (${o.price} €)`, value: o.id })),
    );
  },
  async execute(interaction) {
    const offer = setPrice(interaction.options.getString('boost'), interaction.options.getNumber('prix'));
    if (!offer) return interaction.reply({ content: 'Boost introuvable.', ephemeral: true });
    await interaction.reply({
      content: `✅ **${offer.label}** est maintenant à **${offer.price} €**.\nRepose \`/panel\` pour mettre à jour l'affichage du panneau.`,
      ephemeral: true,
    });
  },
};
