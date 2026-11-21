const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const db = require('../db');

const data = new SlashCommandBuilder()
  .setName('paypaldefinir')
  .setDescription('Définir ton adresse mail PayPal')
  .addStringOption((o) => o.setName('email').setDescription('Ton adresse mail PayPal').setRequired(true));

async function execute(interaction) {
  const email = interaction.options.getString('email').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return interaction.reply({ content: '❌ Adresse mail invalide.', flags: MessageFlags.Ephemeral });
  }
  db.user(interaction.user.id).paypal = email;
  db.save();
  await interaction.reply({ content: `✅ Ton PayPal est défini sur \`${email}\``, flags: MessageFlags.Ephemeral });
}

module.exports = { data, execute };
