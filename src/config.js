require('dotenv').config();

const required = ['DISCORD_TOKEN'];
for (const k of required) {
  if (!process.env[k]) throw new Error(`Variable manquante dans .env : ${k}`);
}

module.exports = {
  token: process.env.DISCORD_TOKEN,
  guildId: process.env.GUILD_ID || null,
  staffRoleId: process.env.STAFF_ROLE_ID || null,
  ticketCategoryId: process.env.TICKET_CATEGORY_ID || null,
  logChannelId: process.env.LOG_CHANNEL_ID || null,
  payments: {
    paypal: {
      label: 'PayPal',
      emoji: '💳',
      details: process.env.PAYPAL_EMAIL
        ? `Envoie le paiement en **Amis & Famille** à : \`${process.env.PAYPAL_EMAIL}\``
        : "L'adresse PayPal sera communiquée par le staff.",
    },
    litecoin: {
      label: 'Litecoin (LTC)',
      emoji: '🪙',
      details: process.env.LITECOIN_ADDRESS
        ? `Envoie le montant équivalent en LTC à l'adresse :\n\`${process.env.LITECOIN_ADDRESS}\``
        : "L'adresse LTC sera communiquée par le staff.",
    },
  },
};
