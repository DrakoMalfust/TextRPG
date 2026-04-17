const fs = require("fs");

function saveGame(player) {
    fs.writeFileSync("save.json", JSON.stringify(player, null, 2));
}

function loadGame() {
    if (fs.existsSync("save.json")) {
        return JSON.parse(fs.readFileSync("save.json"));
    }
    return null;
}

module.exports = { saveGame, loadGame };
