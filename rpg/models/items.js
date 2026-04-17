const items = [
    { name: "Меч новичка", attack: 5, rarity: "common" },
    { name: "Редкий клинок", attack: 10, rarity: "rare" },
    { name: "Кожаная броня", defense: 5, rarity: "common" }
];

function getRandomItem() {
    return items[Math.floor(Math.random() * items.length)];
}

module.exports = { getRandomItem };
