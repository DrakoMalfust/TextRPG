const fs = require("fs");

function saveGame(player) {
    const saveData = {
        ...player,
        inventory: player.inventory,
        stats: player.stats
    };
    fs.writeFileSync("save.json", JSON.stringify(saveData, null, 2));
}

function loadGame() {
    if (fs.existsSync("save.json")) {
        const data = JSON.parse(fs.readFileSync("save.json"));
        return new Player(data.name, data);
    }
    return null;
}

module.exports = { saveGame, loadGame };
