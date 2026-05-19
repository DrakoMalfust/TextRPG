// gameController.js
const readline = require("readline-sync");
const Player = require("../models/player");
const { getRandomEnemy } = require("../data/enemies");
const { getRandomItem } = require("../models/items");
const ui = require("../views/ui");
const { saveGame, loadGame } = require("../utils/saveLoad");
const { d20, rollDice } = require("../utils/dice");

let player;

// ===================== START =====================
function startGame() {
    ui.info("=== Text-RPG Souls Edition ===");

    const save = loadGame();
    if (save && readline.question("Загрузить сохранение? y/n: ") === "y") {
        player = save;
    } else {
        player = new Player(readline.question("Введите ваше имя: "));
    }

    mainMenu();
}

// ===================== MENU =====================
function mainMenu() {
    ui.log("\nВыберите действие:");
    ui.log("1/e. Исследовать подземелье");
    ui.log("2/s. Посмотреть статистику");
    ui.log("3/i. Открыть инвентарь");
    ui.log("4/g. Сохранить игру");
    ui.log("5/q. Выход");

    const choice = readline.question("> ").toLowerCase();

    switch (choice) {
        case '1':
        case 'e':
            exploreDungeon();
            break;
        case '2':
        case 's':
            ui.displayStats(player);
            readline.question("\nНажмите Enter для возврата...");
            mainMenu();
            break;
        case '3':
        case 'i':
            handleInventory();
            break;
        case '4':
        case 'g':
            saveGame(player);
            ui.success("Игра сохранена!");
            mainMenu();
            break;
        case '5':
        case 'q':
            const confirm = readline.question("Вы уверены, что хотите выйти? (y/n): ");
            if (confirm.toLowerCase() === 'y') {
                ui.log("Спасибо за игру! До встречи.");
                process.exit();
            } else {
                ui.info("Продолжаем игру.");
                mainMenu();
            }
            break;
        default:
            ui.danger("Неверный выбор!");
            mainMenu();
    }
}

// ========== ИНВЕНТАРЬ ==========
function handleInventory() {
    ui.displayInventory(player);
    ui.log("\nУправление инвентарем:");
    ui.log("1. Экипировать предмет из рюкзака");
    ui.log("2. Снять экипированный предмет");
    ui.log("3. Вернуться в меню");

    const choice = readline.question("> ");

    switch (choice) {
        case '1':
            equipItem();
            break;
        case '2':
            unequipItemMenu();
            break;
        case '3':
            mainMenu();
            break;
        default:
            ui.danger("Неверный выбор!");
            handleInventory();
    }
}

function equipItem() {
    if (player.backpack.length === 0) {
        ui.danger("Рюкзак пуст!");
        return handleInventory();
    }

    ui.log("\nВыберите предмет для экипировки:");
    player.backpack.forEach((item, idx) => {
        ui.log(`${idx + 1}. ${item.name} (${item.type}) | Атака: ${item.attack || 0} | Защита: ${item.defense || 0}`);
    });
    ui.log("0. Назад");

    const idx = parseInt(readline.question("> ")) - 1;
    if (isNaN(idx) || idx < -1) return equipItem();
    if (idx === -1) return handleInventory();

    if (idx >= 0 && idx < player.backpack.length) {
        player.equipItemFromBackpack(idx);
    } else {
        ui.danger("Неверный номер!");
    }
    handleInventory();
}

function unequipItemMenu() {
    ui.log("\nЧто снять?");
    ui.log("1. Шлем");
    ui.log("2. Броня");
    ui.log("3. Ботинки");
    ui.log("4. Кольцо");
    ui.log("5. Оружие");
    ui.log("0. Назад");

    const choice = readline.question("> ");
    if (choice === "0") return handleInventory();

    let type = "";
    switch (choice) {
        case "1": type = "head"; break;
        case "2": type = "armor"; break;
        case "3": type = "boots"; break;
        case "4": type = "ring"; break;
        case "5": type = "weapon"; break;
        default: ui.danger("Неверно!"); return unequipItemMenu();
    }

    if (type === "ring" && player.inventory.rings.length > 0) {
        ui.log("Выберите кольцо:");
        player.inventory.rings.forEach((r, i) => ui.log(`${i + 1}. ${r.name}`));
        const ringIdx = parseInt(readline.question("> ")) - 1;
        if (!isNaN(ringIdx) && ringIdx >= 0 && ringIdx < player.inventory.rings.length) {
            player.unequipItem("ring", ringIdx);
        }
    } else if (type === "weapon" && player.inventory.weapons.length > 0) {
        ui.log("Выберите оружие:");
        player.inventory.weapons.forEach((w, i) => ui.log(`${i + 1}. ${w.name}`));
        const weapIdx = parseInt(readline.question("> ")) - 1;
        if (!isNaN(weapIdx) && weapIdx >= 0 && weapIdx < player.inventory.weapons.length) {
            player.unequipItem("weapon", weapIdx);
        }
    } else {
        player.unequipItem(type);
    }
    handleInventory();
}

// ===================== БОЕВЫЕ ФУНКЦИИ =====================
let turnsSinceLastHeal = 3;

function playerAttack(attacker, defender, enemyObj) {
    const attackRoll = d20() + attacker.getAttackModifier();
    ui.log(`🎲 Бросок атаки: ${attackRoll} (нужно ${defender.ac})`);

    if (attackRoll === 20) {
        ui.success("КРИТИЧЕСКОЕ ПОПАДАНИЕ!");
        const damageRoll = rollDice(defender.damageDice) + defender.damageBonus;
        const critDamage = damageRoll + rollDice(defender.damageDice);
        defender.currentHp -= critDamage;
        ui.danger(`${attacker.name} наносит ${critDamage} критического урона!`);
        return;
    }

    if (attackRoll >= defender.ac) {
        const damage = rollDice(defender.damageDice) + defender.damageBonus;
        defender.currentHp -= damage;
        ui.danger(`${attacker.name} наносит ${damage} урона!`);
    } else {
        ui.info("Промах!");
    }
}

function enemyAttack(enemy, playerObj) {
    const enemyAttackBonus = 3;
    const attackRoll = d20() + enemyAttackBonus;
    ui.log(`🎲 Враг атакует: ${attackRoll} (нужно ${playerObj.getArmorClass()})`);

    if (attackRoll === 20) {
        ui.danger("КРИТИЧЕСКОЕ ПОПАДАНИЕ ОТ ВРАГА!");
        const damageRoll = rollDice(enemy.damageDice) + enemy.damageBonus;
        const critDamage = damageRoll + rollDice(enemy.damageDice);
        playerObj.hp -= critDamage;
        ui.danger(`${enemy.name} наносит ${critDamage} критического урона!`);
        return;
    }

    if (attackRoll >= playerObj.getArmorClass()) {
        const damage = rollDice(enemy.damageDice) + enemy.damageBonus;
        playerObj.hp -= damage;
        ui.danger(`${enemy.name} наносит ${damage} урона!`);
    } else {
        ui.info("Вы увернулись!");
    }
}

function healPlayer() {
    if (turnsSinceLastHeal >= 2) {
        const healAmount = Math.floor(player.maxHp * 0.3);
        player.hp = Math.min(player.maxHp, player.hp + healAmount);
        ui.success(`Вы восстановили ${healAmount} HP.`);
        turnsSinceLastHeal = 0;
    } else {
        ui.danger(`Лечение будет доступно через ${3 - turnsSinceLastHeal} ход(а).`);
    }
}

function tryEscape() {
    if (Math.random() > 0.5) {
        ui.success("Вы сбежали!");
        return true;
    }
    ui.danger("Побег не удался!");
    return false;
}

// ===================== ИВЕНТЫ =====================
function createCombatEvent() {
    const enemy = getRandomEnemy();
    return {
        name: "Бой с монстрами",
        trigger: (playerObj) => {
            let escaped = false;
            turnsSinceLastHeal = 3;
            let tempACBonus = 0;

            while (enemy.currentHp > 0 && playerObj.hp > 0 && !escaped) {
                ui.displayBattleUI(playerObj, enemy);
                const choice = readline.question("> ");

                switch (choice) {
                    case '1':
                        playerAttack(playerObj, enemy, enemy);
                        break;
                    case '2':
                        healPlayer();
                        break;
                    case '3':
                        ui.info("Вы приготовились защищаться (+2 AC до следующего хода)");
                        tempACBonus = 2;
                        break;
                    case '4':
                        if (tryEscape()) escaped = true;
                        break;
                    default:
                        ui.danger("Неверный выбор!");
                }

                if (enemy.currentHp > 0 && !escaped && playerObj.hp > 0) {
                    const originalGetAC = playerObj.getArmorClass;
                    if (tempACBonus > 0) {
                        playerObj.getArmorClass = () => originalGetAC.call(playerObj) + tempACBonus;
                    }
                    enemyAttack(enemy, playerObj);
                    if (tempACBonus > 0) {
                        playerObj.getArmorClass = originalGetAC;
                        tempACBonus = 0;
                    }
                }
                turnsSinceLastHeal++;
            }

            if (!escaped && enemy.currentHp <= 0) {
                ui.success("Победа!");
                const expGain = enemy.expDrop;
                const goldGain = enemy.goldDrop;
                playerObj.addExp(expGain);
                playerObj.gold += goldGain;
                ui.success(`Получено ${expGain} опыта и ${goldGain} золота`);
                if (Math.random() < 0.6) {
                    const item = getRandomItem();
                    if (item) playerObj.addItem(item);
                }
            }
        }
    };
}

function createHealingWellEvent() {
    return {
        name: "Целебный колодец",
        trigger: (playerObj) => {
            const healAmount = Math.floor(playerObj.maxHp * 0.2);
            playerObj.hp = Math.min(playerObj.maxHp, playerObj.hp + healAmount);
            ui.success(`Вы восстановили ${healAmount} HP!`);
            playerObj.addExp(25);
        }
    };
}

function createLockPickingEvent(difficulty = 'medium') {
    let pattern = [];
    switch (difficulty) {
        case 'easy': pattern = [1, 0, 1]; break;
        case 'medium': pattern = [1, 0, 1, 0, 1]; break;
        case 'hard': pattern = [1, 0, 1, 0, 1, 0, 1]; break;
        default: pattern = [1, 0, 1, 0, 1];
    }
    const originalPattern = [...pattern];
    let currentIndex = 0;
    let attempts = 3;

    return {
        name: "Взлом замка",
        trigger: (playerObj) => {
            let solved = false;
            while (attempts > 0 && !solved) {
                const display = originalPattern.map((_, idx) => idx < currentIndex ? originalPattern[idx] : undefined);
                ui.displayLockUI(display, attempts, originalPattern.length);
                const move = readline.question("Выберите движение (1 - вправо, 0 - влево): ");
                const userMove = move === "1" ? 1 : (move === "0" ? 0 : null);

                if (userMove === null) {
                    ui.danger("Введите 1 или 0!");
                    continue;
                }

                if (userMove === originalPattern[currentIndex]) {
                    ui.success("Правильно!");
                    currentIndex++;
                    if (currentIndex === originalPattern.length) {
                        solved = true;
                        ui.success("Замок открыт! Вы нашли сокровище.");
                        playerObj.addExp(75);
                        playerObj.gold += 50;
                    }
                } else {
                    attempts--;
                    ui.danger(`Неверно! Осталось попыток: ${attempts}`);
                    if (attempts === 0) {
                        ui.danger("Вы сломали замок... Ничего не получено.");
                    }
                }
            }
        }
    };
}

const eventFactories = [
    () => createCombatEvent(),
    () => createLockPickingEvent('medium'),
    () => createHealingWellEvent()
];

function exploreDungeon() {
    let continueExploring = true;
    while (continueExploring && player.hp > 0) {
        const randomFactory = eventFactories[Math.floor(Math.random() * eventFactories.length)];
        const event = randomFactory();
        ui.log(`\nВы натыкаетесь на: ${event.name}`);
        event.trigger(player);

        if (player.hp <= 0) {
            ui.danger("Вы погибли...");
            process.exit();
        }

        continueExploring = readline.question("Продолжить исследование? (y/n): ") === 'y';
    }
    mainMenu();
}

module.exports = { startGame };