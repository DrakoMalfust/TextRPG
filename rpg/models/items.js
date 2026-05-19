// models/items.js
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
            new Item("Меч новичка", "weapon", 5, 0, "common"),
            new Item("Кожаные сапоги", "boots", 0, 2, "common"),
            new Item("Кольцо силы", "ring", 3, 0, "uncommon"),
            new Item("Стальной шлем", "head", 0, 3, "common"),
            new Item("Кольчуга", "armor", 0, 5, "common"),
            new Item("Деревянный щит", "armor", 0, 4, "common"),
            new Item("Кольцо выносливости", "ring", 0, 2, "common"),
        ];
    }

    getRandomItem() {
        return this.items[Math.floor(Math.random() * this.items.length)];
    }
}

const itemManager = new ItemManager();

// Исправленный экспорт: привязываем метод к экземпляру
module.exports = { 
    getRandomItem: itemManager.getRandomItem.bind(itemManager),
    Item,
    ItemManager
};