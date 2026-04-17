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

        this.weapon = null;
        this.armor = null;
    }

    getAttack() {
        return this.attack + (this.weapon?.attack || 0);
    }

    getDefense() {
        return this.defense + (this.armor?.defense || 0);
    }

    takeDamage(dmg) {
        const real = Math.max(0, dmg - this.getDefense());
        this.hp -= real;
        return real;
    }
}

module.exports = Player;
