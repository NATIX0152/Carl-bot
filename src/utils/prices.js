const fs = require('node:fs');
const path = require('node:path');
const catalog = require('../catalog');

const FILE = path.join(__dirname, '..', '..', 'data', 'prices.json');

function load() {
  try {
    const saved = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    for (const o of catalog) if (typeof saved[o.id] === 'number') o.price = saved[o.id];
  } catch { /* pas encore de fichier : prix par défaut */ }
}

function setPrice(offerId, price) {
  const offer = catalog.find((o) => o.id === offerId);
  if (!offer) return null;
  offer.price = price;
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(Object.fromEntries(catalog.map((o) => [o.id, o.price])), null, 2));
  return offer;
}

module.exports = { load, setPrice };
