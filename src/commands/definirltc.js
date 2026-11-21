const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const db = require('../db');

const data = new SlashCommandBuilder()
  .setName('definirltc')
  .setDescription('Définir ton adresse Litecoin (LTC)')
  .addStringOption((o) => o.setName('adresse').setDescription('Ton adresse LTC').setRequired(true));

const LTC_RE = /^([LM3][a-km-zA-HJ-NP-Z1-9]{25,34}|ltc1[a-z0-9]{38,60})$/;

async function execute(interaction) {
  const addr = interaction.options.getString('adresse').trim();
  if (!LTC_RE.test(addr)) {
    return interaction.reply({ content: '❌ Adresse LTC invalide.', flags: MessageFlags.Ephemeral });
  }
  db.user(interaction.user.id).ltc = addr;
  db.save();
  await interaction.reply({ content: `✅ Ton adresse LTC est définie sur \`${addr}\``, flags: MessageFlags.Ephemeral });
}

module.exports = { data, execute };
