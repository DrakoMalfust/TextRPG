const readline = require("readline-sync");
const Player = require("../models/player");
const Enemy = require("../models/enemy");
const { getRandomItem } = require("../models/items");
const ui = require("../views/ui");
const { saveGame, loadGame } = require("../utils/saveLoad");


let player;

// ===================== START =====================
function startGame() {
    ui.info("=== Text-RPG Souls Edition ===");

    const save = loadGame();
    if (save && readline.question("Загрузить сохранение? y/n: ") === "y") {
        player = Object.assign(new Player(), save);
    } else {
        player = new Player(readline.question("Введите ваше имя: "));
    }

    mainMenu();
}

// ===================== MENU =====================
function mainMenu() {
    ui.log(`\nHP:${player.hp} ST:${player.stamina} GOLD:${player.gold}`);

    console.log("1. Бой");
    console.log("2. Босс");
    console.log("3. Сохранение");
    console.log("4. Exit");

    const c = readline.question("> ");

    if (c === "1") fight();
    if (c === "2") bossFight();
    if (c === "3") {
        saveGame(player);
        mainMenu();
    }
    if (c === "4") process.exit();
}

// ===================== FIGHT =====================
function fight() {
    let enemy = new Enemy(
        "Воин",
        60,
        10,
        Math.random() > 0.5 ? "aggressive" : "defensive"
    );

    while (enemy.hp > 0 && player.hp > 0) {
        ui.log(`\nHP:${player.hp} ST:${player.stamina}`);
        ui.log(`${enemy.name}`)
        ui.log(`Enemy:${enemy.hp}`);

        console.log("1. Light");
        console.log("2. Heavy");
        console.log("3. Dodge");

        let choice = readline.question("> ");
        let dodged = false;

        if (choice === "1" && player.stamina >= 10) {
            enemy.hp -= player.getAttack();
            player.stamina -= 10;
        }

        if (choice === "2" && player.stamina >= 20) {
            enemy.hp -= player.getAttack() * 2;
            player.stamina -= 20;
        }

        if (choice === "3") {
            dodged = Math.random() > 0.5;
            player.stamina -= 15;
        }

        // 🧠 enemy AI
        if (enemy.hp > 0) {
            const act = enemy.act(player);

            if (act === "attack" && !dodged) {
                const dmg = player.takeDamage(enemy.attack);
                ui.danger(`-${dmg}`);
            } else {
                ui.success("Enemy waits...");
            }
        }

        player.stamina = Math.min(50, player.stamina + 5);
    }

    if (player.hp <= 0) {
        console.log("Ты умер 💀");
        process.exit();
    }

    console.log("Победа!");

    // 🎒 loot + equip
    const loot = getRandomItem();
    console.log("Лут:", loot.name);

    if (loot.attack && readline.question("Equip weapon? y/n ") === "y") {
        player.weapon = loot;
    }

    if (loot.defense && readline.question("Equip armor? y/n ") === "y") {
        player.armor = loot;
    }

    mainMenu();
}

// ===================== BOSS (SOULS PHASES) =====================
function bossFight() {
    let boss = {
        name: "Падший рыцарь",
        hp: 120,
        attack: 12,
        phase: 1
    };

    console.log("\n🔥 BOSS:", boss.name);

    while (boss.hp > 0 && player.hp > 0) {
        ui.log(`HP:${player.hp} ST:${player.stamina}`);
        ui.log(`BOSS:${boss.hp} PHASE:${boss.phase}`);

        console.log("1. Light");
        console.log("2. Heavy");
        console.log("3. Dodge");

        let choice = readline.question("> ");
        let dodged = false;

        if (choice === "1") {
            boss.hp -= player.getAttack();
            player.stamina -= 10;
        }

        if (choice === "2") {
            boss.hp -= player.getAttack() * 2;
            player.stamina -= 20;
        }

        if (choice === "3") {
            dodged = Math.random() > 0.5;
            player.stamina -= 15;
        }

        // ⚡ PHASE CHANGE
        if (boss.hp < 60 && boss.phase === 1) {
            boss.phase = 2;
            boss.attack += 8;
            console.log("🔥 БОСС ВХОДИТ В 2 ФАЗУ!");
        }

        if (boss.hp > 0 && !dodged) {
            const dmg = player.takeDamage(boss.attack);
            ui.danger(`-${dmg}`);
        }

        player.stamina = Math.min(50, player.stamina + 5);
    }

    if (player.hp <= 0) {
        console.log("Ты умер 💀");
        process.exit();
    }

    console.log("🏆 БОСС ПОВЕРЖЕН!");
    player.gold += 100;

    mainMenu();
}

module.exports = { startGame };
