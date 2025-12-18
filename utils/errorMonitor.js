module.exports = (client) => {
  process.on('unhandledRejection', err => console.error('[UnhandledRejection]', err));
  process.on('uncaughtException',  err => console.error('[UncaughtException]', err));
};