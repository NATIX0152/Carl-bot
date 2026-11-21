const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');

function isStaff(member) {
  if (!member) return false;
  if (member.permissions.has(PermissionFlagsBits.ManageChannels)) return true;
  return config.staffRoleId ? member.roles.cache.has(config.staffRoleId) : false;
}

module.exports = { isStaff };
