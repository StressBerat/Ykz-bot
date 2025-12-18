
// Minn Store Bot V2
console.log('🟣 Minn Store Bot V2 sedang dijalankan...');

const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
const path   = require('path');
const fs     = require('fs');
const config = require('./config.json');

/* ───── Inisialisasi Client ───── */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands  = new Collection();
client.cooldowns = new Collection();

/* ───── Utils (status & error monitor) ───── */
require('./utils/statusMonitor')(client);
require('./utils/errorMonitor')(client);

/* ───── Loader Command ───── */
const loadCommands = (baseDir) => {
  const folders = fs.readdirSync(baseDir);

  for (const folder of folders) {
    if (folder === 'event') continue; // ⚠️  abaikan folder event

    const folderPath = path.join(baseDir, folder);
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));

    for (const file of files) {
      const cmd = require(path.join(folderPath, file));
      if ('data' in cmd && 'execute' in cmd) {
        client.commands.set(cmd.data.name, cmd);
        console.log(`📁 Command dimuat: ${folder}/${file}`);
      } else {
        console.warn(`⚠️  Melewati file: ${folder}/${file} (bukan command valid)`);
      }
    }
  }
};
loadCommands(path.join(__dirname, 'core'));

/* ───── Loader Event ───── */
const eventDir  = path.join(__dirname, 'core/event');
const eventFiles = fs.readdirSync(eventDir).filter(f => f.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(path.join(eventDir, file));
  const type  = event.once ? 'once' : 'on';
  client[type](event.name, (...args) => event.execute(...args, client));
  console.log(`🔔 Event terhubung: ${file}`);
}

/* ───── Registrasi Slash Command ke Discord ───── */
const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  try {
    await rest.put(
      Routes.applicationCommands(config.clientId),
      { body: client.commands.map(c => c.data.toJSON()) }
    );
    console.log('✅ Semua perintah telah tersedia di server.');
  } catch (err) {
    console.error('❌ Gagal mendaftarkan perintah:', err);
  }
})();

/* ───── Login Bot ───── */
client.login(config.token)
  .then(() => console.log('🟢 Bot telah terhubung ke Discord.'))
  .catch(err => console.error('❌ Gagal login ke Discord:', err));