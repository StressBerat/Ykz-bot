const fs   = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const config = require('../config.json');

/* ───── Kumpulkan command ───── */
const commands = [];
const corePath = path.join(__dirname, '../core');

for (const folder of fs.readdirSync(corePath)) {
  if (folder === 'event') continue;            // folder event bukan command

  const folderPath = path.join(corePath, folder);
  const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));

  for (const file of files) {
    const cmd = require(path.join(folderPath, file));
    if ('data' in cmd && 'execute' in cmd) {
      commands.push(cmd.data.toJSON());
      console.log(`📦  Siap deploy: ${folder}/${file}`);
    }
  }
}

/* ───── Endpoint pilihan ───── */
const rest = new REST({ version: '10' }).setToken(config.token);
const route = config.guildId && config.guildId !== ''
  ? Routes.applicationGuildCommands(config.clientId, config.guildId)   // deploy instan ke guild
  : Routes.applicationCommands(config.clientId);                        // deploy global

/* ───── Upload ke Discord ───── */
(async () => {
  try {
    console.log(`🌐  Mengunggah ${commands.length} perintah ke Discord API...`);
    await rest.put(route, { body: commands });
    console.log('✅  Perintah berhasil terdaftar.');
  } catch (err) {
    console.error('❌  Gagal mendaftarkan perintah:', err);
  }
})();