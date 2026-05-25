// data/enemies.js
// Список монстров с весами появления
const enemies = [
    {
        name: "Гоблин-неудачник",
        hp: 12,
        ac: 13,
        damageDice: "1d4",   // урон 1d4
        damageBonus: 1,
        goldDrop: 5,
        expDrop: 25,
        weight: 1           // 60% шанс
    },
    {
        name: "Скелет-стражник", 
        hp: 20,
        ac: 14,
        damageDice: "1d6",
        damageBonus: 2,
        goldDrop: 10,
        expDrop: 50,
        weight: 2
    },
    {
        name: "Орк-берсерк",
        hp: 35,
        ac: 12,
        damageDice: "1d8",
        damageBonus: 3,
        goldDrop: 20,
        expDrop: 100,
        weight: 3
    },
    {
        name: "Призрачный рыцарь",
        hp: 50,
        ac: 16,
        damageDice: "1d10",
        damageBonus: 4,
        goldDrop: 50,
        expDrop: 200,
        weight: 4
    },
    {
        name: "Древний дракончик",
        hp: 80,
        ac: 20,
        damageDice: "3d8",
        damageBonus: 5,
        goldDrop: 200,
        expDrop: 500,
        weight: 100
    }
];

// Функция выбора монстра по весам
function getRandomEnemy() {
    let totalWeight = enemies.reduce((sum, e) => sum + e.weight, 0);
    let random = Math.random() * totalWeight;
    let accum = 0;
    for (let enemy of enemies) {
        accum += enemy.weight;
        if (random <= accum) {
            // Клонируем объект, чтобы не менять оригинал (например, текущее HP)
            return { ...enemy, currentHp: enemy.hp };
        }
    }
    return { ...enemies[0], currentHp: enemies[0].hp };
}

module.exports = { enemies, getRandomEnemy };