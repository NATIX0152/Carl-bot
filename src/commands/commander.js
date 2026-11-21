const { SlashCommandBuilder } = require('discord.js');
const catalog = require('../catalog');
const config = require('../config');
const { createTicket } = require('../utils/ticket');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('commander')
    .setDescription('Commander un boost')
    .addStringOption((o) => o.setName('boost').setDescription('Le boost voulu').setRequired(true).setAutocomplete(true))
    .addStringOption((o) => o.setName('paiement').setDescription('Moyen de paiement').setRequired(true)
      .addChoices(...Object.entries(config.payments).map(([value, p]) => ({ name: p.label, value })))),
  async autocomplete(interaction) {
    const q = interaction.options.getFocused().toLowerCase();
    await interaction.respond(
      catalog.filter((o) => o.label.toLowerCase().includes(q)).slice(0, 25)
        .map((o) => ({ name: `${o.label} — ${o.price} €`, value: o.id })),
    );
  },
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const offerId = interaction.options.getString('boost');
    if (!catalog.some((o) => o.id === offerId)) return interaction.editReply('Boost introuvable, choisis-en un dans la liste.');
    const res = await createTicket(interaction, offerId, interaction.options.getString('paiement'));
    await interaction.editReply(res.existing ? `Tu as déjà un ticket ouvert : ${res.existing}` : `Ticket créé : ${res.channel} ✅`);
  },
};
