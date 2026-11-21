// Fabrique /paypalafficher et /ltcafficher
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const db = require('../db');

function make({ name, key, label, emoji, color, hint }) {
  const data = new SlashCommandBuilder()
    .setName(name)
    .setDescription(`Afficher ${hint} d'un membre`)
    .addUserOption((o) => o.setName('membre').setDescription('Membre concerné (mentionne-le)').setRequired(true));

  async function execute(interaction) {
    const target = interaction.options.getUser('membre');
    const value = db.data.users[target.id]?.[key];
    if (!value) {
      return interaction.reply({ content: `❌ <@${target.id}> n'a pas défini ${hint}.`, flags: MessageFlags.Ephemeral, allowedMentions: { parse: [] } });
    }
    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`${emoji} ${label}`)
      .setDescription(`De <@${target.id}>\n\`\`\`${value}\`\`\``)
      .setTimestamp();
    await interaction.reply({ embeds: [embed], allowedMentions: { parse: [] } });
  }
  return { data, execute };
}

module.exports = [
  make({ name: 'paypalafficher', key: 'paypal', label: 'Adresse PayPal', emoji: '💳', color: 0x0070ba, hint: 'son adresse PayPal' }),
  make({ name: 'ltcafficher', key: 'ltc', label: 'Adresse Litecoin (LTC)', emoji: '🪙', color: 0xbebebe, hint: 'son adresse LTC' }),
];
