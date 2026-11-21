const { SlashCommandBuilder } = require('discord.js');
const { isStaff } = require('../utils/staff');
const { setStatus } = require('../utils/ticket');

module.exports = {
  data: new SlashCommandBuilder().setName('termine').setDescription('Marquer la commande comme terminée (staff, dans un ticket)'),
  async execute(interaction) {
    if (!isStaff(interaction.member)) return interaction.reply({ content: 'Réservé au staff.', ephemeral: true });
    const info = await setStatus(interaction.channel, 'done');
    if (!info) return interaction.reply({ content: "Ce salon n'est pas un ticket.", ephemeral: true });
    await interaction.reply(`🏆 <@${info.userId}>, ta commande **${info.offer.label}** est terminée ! Merci de ta confiance. Fais \`/close\` quand tout est bon.`);
  },
};
