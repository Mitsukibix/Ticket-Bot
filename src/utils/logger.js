const chalk = require('chalk');
const moment = require('moment');

const getTimestamp = () => moment().format('YYYY-MM-DD HH:mm:ss');

module.exports = {
  info: (...args) => {
    console.log(chalk.blue(`[${getTimestamp()}] [INFO]`), ...args);
  },
  success: (...args) => {
    console.log(chalk.green(`[${getTimestamp()}] [SUCCESS]`), ...args);
  },
  warn: (...args) => {
    console.log(chalk.yellow(`[${getTimestamp()}] [WARN]`), ...args);
  },
  error: (...args) => {
    console.log(chalk.red(`[${getTimestamp()}] [ERROR]`), ...args);
  }
};