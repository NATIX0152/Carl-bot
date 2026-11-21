const { SlashCommandBuilder } = require('discord.js');
const { isStaff } = require('../utils/staff');
const { setStatus } = require('../utils/ticket');

module.exports = {
  data: new SlashCommandBuilder().setName('paye').setDescription('Marquer le paiement comme reçu (staff, dans un ticket)'),
  async execute(interaction) {
    if (!isStaff(interaction.member)) return interaction.reply({ content: 'Réservé au staff.', ephemeral: true });
    const info = await setStatus(interaction.channel, 'paid');
    if (!info) return interaction.reply({ content: "Ce salon n'est pas un ticket.", ephemeral: true });
    await interaction.reply(`✅ Paiement reçu — <@${info.userId}>, ta commande **${info.offer.label}** est en cours !`);
  },
};
