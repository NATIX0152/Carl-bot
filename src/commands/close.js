const { SlashCommandBuilder } = require('discord.js');
const { isStaff } = require('../utils/staff');
const { parseTopic, closeTicket } = require('../utils/ticket');

module.exports = {
  data: new SlashCommandBuilder().setName('close').setDescription('Fermer le ticket actuel (staff)'),
  async execute(interaction) {
    if (!parseTopic(interaction.channel)) return interaction.reply({ content: "Ce salon n'est pas un ticket.", ephemeral: true });
    if (!isStaff(interaction.member)) return interaction.reply({ content: 'Réservé au staff.', ephemeral: true });
    await closeTicket(interaction);
  },
};
