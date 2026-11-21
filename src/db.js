const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'db.json');
const DEFAULT = { users: {}, vouches: {}, vouchLog: {}, guilds: {}, legit: {} };

let data = { ...DEFAULT };
try {
  if (fs.existsSync(FILE)) data = { ...DEFAULT, ...JSON.parse(fs.readFileSync(FILE, 'utf8')) };
} catch (e) {
  console.error('[db] Lecture impossible, base vide utilisée :', e.message);
}

let timer = null;
function save() {
  if (timer) return;
  timer = setTimeout(() => {
    timer = null;
    try {
      fs.mkdirSync(path.dirname(FILE), { recursive: true });
      fs.writeFileSync(FILE + '.tmp', JSON.stringify(data, null, 2));
      fs.renameSync(FILE + '.tmp', FILE);
    } catch (e) {
      console.error('[db] Sauvegarde impossible :', e.message);
    }
  }, 200);
}

const user = (id) => (data.users[id] ??= {});
const guild = (id) => (data.guilds[id] ??= {});

module.exports = { data, save, user, guild };
