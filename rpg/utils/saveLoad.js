// utils/saveLoad.js
const fs = require("fs");
const Player = require("../models/player");

function saveGame(player) {
    const saveData = {
        name: player.name,
        hp: player.hp,
        maxHp: player.maxHp,
        strength: player.strength,
        dexterity: player.dexterity,
        proficiencyBonus: player.proficiencyBonus,
        attackBonus: player.attackBonus,
        stamina: player.stamina,
        gold: player.gold,
        level: player.level,
        exp: player.exp,
        nextLevelExp: player.nextLevelExp,
        stats: player.stats,
        inventory: player.inventory,
        backpack: player.backpack,
        armorBonus: player.armorBonus,
        shieldBonus: player.shieldBonus,
        baseArmor: player.baseArmor
    };
    fs.writeFileSync("save.json", JSON.stringify(saveData, null, 2));
}

function loadGame() {
    if (fs.existsSync("save.json")) {
        const data = JSON.parse(fs.readFileSync("save.json"));
        const player = new Player(data.name);
        // Копируем все сохранённые поля, но не перезаписываем методы
        Object.assign(player, data);
        // Пересчитываем AC после загрузки брони
        if (player.recalculateArmor) player.recalculateArmor();
        return player;
    }
    return null;
}

module.exports = { saveGame, loadGame };