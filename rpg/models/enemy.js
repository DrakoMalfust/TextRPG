class Enemy {
    constructor(name, hp, attack, style) {
        this.name = name;
        this.hp = hp;
        this.attack = attack;
        this.style = style;
    }

    act(player) {
        // 🧠 агрессивный AI
        if (this.style === "aggressive") {
            return "attack";
        }

        // 🧠 защитный AI
        if (this.style === "defensive") {
            if (this.hp < 20) return "wait";
            return Math.random() > 0.5 ? "attack" : "wait";
        }

        return "attack";
    }
}

module.exports = Enemy;
