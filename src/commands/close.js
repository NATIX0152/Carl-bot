const { SlashCommandBuilder } = require('discord.js');
const { isStaff } = require('../utils/staff');
const { sendTranscript } = require('../utils/ticket');

module.exports = {
  data: new SlashCommandBuilder().setName('close').setDescription('Fermer le ticket actuel (staff)'),
  async execute(interaction) {
    if (!interaction.channel.topic?.startsWith('ticket:')) {
      return interaction.reply({ content: "Ce salon n'est pas un ticket.", ephemeral: true });
    }
    if (!isStaff(interaction.member)) {
      return interaction.reply({ content: 'Réservé au staff.', ephemeral: true });
    }
    await interaction.reply('Fermeture du ticket dans 5 secondes…');
    await sendTranscript(interaction.channel).catch(console.error);
    setTimeout(() => interaction.channel.delete().catch(console.error), 5000);
  },
};
