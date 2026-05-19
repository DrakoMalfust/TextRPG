const ui = require("../views/ui");

class Player {
    constructor(name) {
        this.name = name;
        this.hp = 100;
        this.maxHp = 100;
        this.strength = 12;          // модификатор +1
        this.dexterity = 12;         // модификатор +1
        this.proficiencyBonus = 2;   // бонус мастерства (растёт с уровнем)
        this.attackBonus = 0;        // дополнительный бонус атаки от предметов/уровня
        this.stamina = 50;
        this.gold = 50;
        this.level = 1;
        this.exp = 0;
        this.nextLevelExp = 100;

        // Класс брони (AC)
        this.baseArmor = 10;
        this.armorBonus = 0;    // от брони
        this.shieldBonus = 0;   // от щита (пока 0)

        this.stats = {
            hpBonus: 0,
            attackBonus: 0,
            expMultiplier: 1,
            goldMultiplier: 1
        };

        this.inventory = {
            head: null,
            armor: null,
            boots: null,
            rings: [],
            weapons: []
        };
        this.backpack = [];
    }

    // ========== ХАРАКТЕРИСТИКИ И БОЕВЫЕ МЕТОДЫ ==========
    getArmorClass() {
        let dexMod = Math.floor((this.dexterity - 10) / 2);
        return this.baseArmor + dexMod + this.armorBonus + this.shieldBonus;
    }

    getAttackModifier() {
        let strMod = Math.floor((this.strength - 10) / 2);
        return strMod + this.proficiencyBonus + this.attackBonus;
    }

    recalculateArmor() {
        this.armorBonus = this.inventory.armor?.defense || 0;
        // shieldBonus пока 0, но можно добавить позже
    }

    // ========== ПРОКАЧКА ==========
    levelUp() {
        this.level++;
        this.stats.hpBonus += 10;
        this.attackBonus += 1;
        this.stats.expMultiplier += 0.1;
        this.stats.goldMultiplier += 0.1;
        this.maxHp += 10;
        this.hp = this.maxHp;
        if (this.level >= 5) this.proficiencyBonus = 3;
        if (this.level >= 9) this.proficiencyBonus = 4;
        ui.success(`Уровень повышен! Теперь уровень ${this.level}`);
    }

    addExp(amount) {
        this.exp += amount * this.stats.expMultiplier;
        while (this.exp >= this.nextLevelExp) {
            this.levelUp();
            this.nextLevelExp = Math.floor(this.nextLevelExp * 1.5);
        }
    }

    // ========== ИНВЕНТАРЬ ==========
    addItem(item) {
        this.backpack.push(item);
        ui.success(`Вы получили: ${item.name}`);
        if (item.type === 'armor') this.recalculateArmor();
    }

    removeItem(index) {
        if (index >= 0 && index < this.backpack.length) {
            return this.backpack.splice(index, 1)[0];
        }
        return null;
    }

    equipItemFromBackpack(index) {
        const item = this.removeItem(index);
        if (!item) return false;

        switch(item.type) {
            case 'head':
                if (this.inventory.head) this.backpack.push(this.inventory.head);
                this.inventory.head = item;
                break;
            case 'armor':
                if (this.inventory.armor) this.backpack.push(this.inventory.armor);
                this.inventory.armor = item;
                this.recalculateArmor();
                break;
            case 'boots':
                if (this.inventory.boots) this.backpack.push(this.inventory.boots);
                this.inventory.boots = item;
                break;
            case 'ring':
                if (this.inventory.rings.length < 3) {
                    this.inventory.rings.push(item);
                } else {
                    ui.danger("У вас уже надето 3 кольца! Сначала снимите одно.");
                    this.backpack.push(item);
                    return false;
                }
                break;
            case 'weapon':
                if (this.inventory.weapons.length < 2) {
                    this.inventory.weapons.push(item);
                } else {
                    ui.danger("Вы можете носить только 2 оружия! Сначала снимите одно.");
                    this.backpack.push(item);
                    return false;
                }
                break;
            default:
                this.backpack.push(item);
                return false;
        }
        ui.success(`${item.name} экипирован.`);
        return true;
    }

    unequipItem(type, slotIndex = 0) {
        let item = null;
        switch(type) {
            case 'head':
                if (this.inventory.head) {
                    item = this.inventory.head;
                    this.inventory.head = null;
                }
                break;
            case 'armor':
                if (this.inventory.armor) {
                    item = this.inventory.armor;
                    this.inventory.armor = null;
                    this.recalculateArmor();
                }
                break;
            case 'boots':
                if (this.inventory.boots) {
                    item = this.inventory.boots;
                    this.inventory.boots = null;
                }
                break;
            case 'ring':
                if (slotIndex >= 0 && slotIndex < this.inventory.rings.length) {
                    item = this.inventory.rings.splice(slotIndex, 1)[0];
                }
                break;
            case 'weapon':
                if (slotIndex >= 0 && slotIndex < this.inventory.weapons.length) {
                    item = this.inventory.weapons.splice(slotIndex, 1)[0];
                }
                break;
        }
        if (item) {
            this.backpack.push(item);
            ui.success(`${item.name} снят и положен в рюкзак.`);
        } else {
            ui.danger("Нечего снимать!");
        }
    }
}

module.exports = Player;