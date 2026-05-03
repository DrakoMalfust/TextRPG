class Player {
    constructor(name) {
        this.name = name;
        this.hp = 100;
        this.maxHp = 100;
        this.attack = 10;
        this.defense = 2;
        this.stamina = 50;
        this.gold = 50;
        this.level = 1;
        this.exp = 0;
        this.nextLevelExp = 100;
        
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
    }

    // Методы для системы прокачки
    levelUp() {
        this.level++;
        this.stats.hpBonus += 10;
        this.stats.attackBonus += 2;
        this.stats.expMultiplier += 0.1;
        this.stats.goldMultiplier += 0.1;
        this.maxHp += 10;
        this.hp = this.maxHp;
        ui.success(`Уровень повышен! Теперь уровень ${this.level}`);
    }

    addExp(amount) {
        this.exp += amount * this.stats.expMultiplier;
        while (this.exp >= this.nextLevelExp) {
            this.levelUp();
            this.nextLevelExp *= 1.5;
        }
    }

    // Методы для инвентаря
    equipItem(item) {
        switch(item.type) {
            case 'head': this.inventory.head = item; break;
            case 'armor': this.inventory.armor = item; break;
            case 'boots': this.inventory.boots = item; break;
            case 'ring': 
                if (this.inventory.rings.length < 3) this.inventory.rings.push(item);
                break;
            case 'weapon': 
                if (this.inventory.weapons.length < 2) this.inventory.weapons.push(item);
                break;
        }
    }

    getAttack() {
        let baseAttack = this.attack + this.stats.attackBonus;
        return baseAttack + this.inventory.weapons.reduce((sum, w) => sum + (w?.attack || 0), 0);
    }

    getDefense() {
        return this.defense + 
            (this.inventory.head?.defense || 0) +
            (this.inventory.armor?.defense || 0) +
            (this.inventory.boots?.defense || 0) +
            this.inventory.rings.reduce((sum, r) => sum + (r?.defense || 0), 0);
    }
}


module.exports = Player;
