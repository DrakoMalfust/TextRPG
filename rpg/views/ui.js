const chalk = require("chalk");

module.exports = {
    log: console.log,
    info: (t) => console.log(chalk.blue(t)),
    success: (t) => console.log(chalk.green(t)),
    danger: (t) => console.log(chalk.red(t))
};
