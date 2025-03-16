const { 
  Client, 
  GatewayIntentBits, 
  Partials, 
  Collection 
} = require('discord.js');
const config = require('../config.json');
const { loadEvents } = require('./handlers/eventHandler');
const { loadCommands } = require('./handlers/commandHandler');
const logger = require('./utils/logger');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [
    Partials.Channel, 
    Partials.Message,
    Partials.User,
    Partials.GuildMember
  ]
});

client.commands = new Collection();
client.tickets = new Collection();

process.on('unhandledRejection', error => {
  logger.error('Unhandled promise rejection:', error);
});

(async () => {
  try {
    logger.info('Starting bot...');
    
    await loadEvents(client);
    logger.info('Events loaded successfully');
    
    await loadCommands(client);
    logger.info('Commands loaded successfully');
    
    await client.login(config.token);
    logger.success('Bot is now online!');
  } catch (error) {
    logger.error('Error starting bot:', error);
    process.exit(1);
  }
})();