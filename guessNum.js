const readline = require("readline-sync");
const chalk = require("chalk");

console.log(chalk.blue("🎮 Добро пожаловать в игру 'Угадай число'!"));

const randomNumber = Math.floor(Math.random() * 100) + 1;
let attempts = 0;
let guessed = false;

while (!guessed) {
    let userInput = readline.question("Введите число от 1 до 100: ");
    let guess = Number(userInput);

    attempts++;

    if (guess < randomNumber) {
        console.log(chalk.yellow("⬆️ Больше!"));
    } else if (guess > randomNumber) {
        console.log(chalk.yellow("⬇️ Меньше!"));
    } else if (guess === randomNumber) {
        console.log(chalk.green(`🎉 Ты угадал за ${attempts} попыток!`));
        guessed = true;
    } else {
        console.log(chalk.red("❌ Введи нормальное число"));
    }
}
