// utils/dice.js
function roll(sides, count = 1) {
    let total = 0;
    for (let i = 0; i < count; i++) {
        total += Math.floor(Math.random() * sides) + 1;
    }
    return total;
}

function d20() {
    return roll(20);
}

// Парсинг строки типа "2d6" -> бросок
function rollDice(diceString) {
    if (typeof diceString === 'number') return diceString;
    let parts = diceString.split('d');
    let count = parseInt(parts[0]) || 1;
    let sides = parseInt(parts[1]);
    return roll(sides, count);
}

module.exports = { roll, d20, rollDice };