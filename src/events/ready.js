module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity('Destek Talepleri', { type: 'WATCHING' });
  }
};