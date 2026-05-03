class Item {
    constructor(name, type, attack = 0, defense = 0, rarity) {
        this.name = name;
        this.type = type;
        this.attack = attack;
        this.defense = defense;
        this.rarity = rarity;
    }
}

class ItemManager {
    constructor() {
        this.items = [
            new Item("Меч новичка", "weapon", 5, null, "common"),
            new Item("Кожаные сапоги", "boots", null, 2, "common"),
            new Item("Кольцо силы", "ring", 3, null, "uncommon"),
            // Добавить больше предметов
        ];
    }

    getRandomItem() {
        return this.items[Math.floor(Math.random() * this.items.length)];
    }
}

// Создаем экземпляр менеджера предметов
const itemManager = new ItemManager();

// Экспортируем функцию получения случайного предмета
module.exports = { 
    getRandomItem: itemManager.getRandomItem,
    Item,
    ItemManager
};
