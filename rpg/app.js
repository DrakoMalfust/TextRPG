if (process.platform === 'win32') {
  process.stdout.write('\x1B[?8m'); // Отключаем режим совместимости
  process.stdout.setEncoding('utf8');
}
const { startGame } = require("./controllers/gameController");
startGame();
