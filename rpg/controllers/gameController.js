// gameController.js
const readline = require("readline-sync");
const Player = require("../models/player");
const { getRandomEnemy } = require("../data/enemies");
const { getRandomItem } = require("../models/items");
const ui = require("../views/ui");
const { saveGame, loadGame } = require("../utils/saveLoad");
const { d20, rollDice } = require("../utils/dice");

let battleLog = [];         // массив строк лога
const MAX_LOG = 5;          // сколько строк показывать

function addToLog(message, type = 'info') {
    battleLog.push({ text: message, type });
    if (battleLog.length > 20) battleLog.shift(); // не храним больше 20
}

function clearLog() {
    battleLog = [];
}

let player;

// ===================== START =====================
function startGame() {
    ui.info(`⚔️=== Legend's of Eretrium ===⚔️`);

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
    ui.drawStatusBar('main');

    const choice = readline.question("> ").toLowerCase();

    switch (choice) {
        case '1':
        case 'E':
        case 'e':
            exploreDungeon();
            break;
        case '2':
        case 'S':
        case 's':
            ui.displayStats(player);
            readline.question("\nНажмите Enter для возврата...");
            mainMenu();
            break;
        case '3':
        case 'I':
        case 'i':
            handleInventory();
            break;
        case '4':
        case 'G':
        case 'g':
            saveGame(player);
            ui.success("Игра сохранена!");
            mainMenu();
            break;
        case '5':
        case 'Q':
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
    const perPage = 7;
    let inventoryPage = 0
    ui.displayInventory(player, inventoryPage, perPage);

    ui.drawStatusBar('inventory');
    const choice = readline.question("> ").toLowerCase();

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
        case 'n':
            if ((inventoryPage + 1) * perPage < player.backpack.length) {
                inventoryPage++;
                handleInventory();
            } else {
                ui.danger("Это последняя страница!");
                handleInventory();
            }
            break;
        case 'p':
            if (inventoryPage > 0) {
                inventoryPage--;
                handleInventory();
            } else {
                ui.danger("Это первая страница!");
                handleInventory();
            }
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
    const logMsg = `🎲 Бросок атаки: ${attackRoll} (нужно ${defender.ac})`;

    addToLog(logMsg, 'info');
    ui.log(logMsg);   // выводим в консоль

    if (attackRoll === 20) {
        addToLog("КРИТИЧЕСКОЕ ПОПАДАНИЕ!", 'success');
        ui.success("КРИТИЧЕСКОЕ ПОПАДАНИЕ!");
        const damageRoll = rollDice(defender.damageDice) + defender.damageBonus;
        const critDamage = damageRoll + rollDice(defender.damageDice);
        defender.currentHp -= critDamage;
        const critMsg = `${attacker.name} наносит ${critDamage} критического урона!`;
        addToLog(critMsg, 'danger');
        ui.danger(critMsg);

    } else if (attackRoll >= defender.ac) {
        const damage = rollDice(defender.damageDice) + defender.damageBonus;
        defender.currentHp -= damage;
        const hitMsg = `${attacker.name} наносит ${damage} урона!`;
        addToLog(hitMsg, 'danger');
        ui.danger(hitMsg);

    } else {
        addToLog("Промах!", 'info');
        ui.info("Промах!");
    }
}

function enemyAttack(enemy, playerObj) {
    const enemyAttackBonus = 3;
    const attackRoll = d20() + enemyAttackBonus;
    const logMsg = `🎲 Враг атакует: ${attackRoll} (нужно ${playerObj.getArmorClass()})`;
    addToLog(logMsg, 'info')
    ui.log(logMsg)

    if (attackRoll === 20) {
        ui.danger("КРИТИЧЕСКОЕ ПОПАДАНИЕ ОТ ВРАГА!");
        const damageRoll = rollDice(enemy.damageDice) + enemy.damageBonus;
        const critDamage = damageRoll + rollDice(enemy.damageDice);
        playerObj.hp -= critDamage;
        const critMsg = `${enemy.name} наносит ${critDamage} критического урона!`;
        addToLog(critMsg, 'danger')
        ui.log(critMsg)
        return;
    }

    if (attackRoll >= playerObj.getArmorClass()) {
        const damage = rollDice(enemy.damageDice) + enemy.damageBonus;
        playerObj.hp -= damage;
        const hitMsg = `${enemy.name} наносит ${damage} урона!`;
        addToLog(hitMsg, 'danger')
        ui.danger(hitMsg)
    } else {
        addToLog("Промах!", 'info');
        ui.info("Промах!");
    }
}

function healPlayer() {
    if (turnsSinceLastHeal >= 3) {
        const healAmount = Math.floor(player.maxHp * 0.2);
        player.hp = Math.min(player.maxHp, player.hp + healAmount);
        const msg = `Вы восстановили ${healAmount} HP.`;
        addToLog(msg, 'success');
        ui.success(msg);
        turnsSinceLastHeal = 0;
    } else {
        const msg = `Лечение будет доступно через ${3 - turnsSinceLastHeal} ход(а).`;
        addToLog(msg, 'danger');
        ui.danger(msg);
    }
}

function tryEscape() {
    if (Math.random() > 0.5) {
        addToLog("Вы сбежали!", 'success');
        ui.success("Вы сбежали!");
        return true;
    } else {
        addToLog("Побег не удался!", 'danger');
        ui.danger("Побег не удался!");
        return false;
    }
}

// ===================== ИВЕНТЫ =====================
function createCombatEvent() {
    const enemy = getRandomEnemy();
    return {
        name: "Бой с монстрами",
        trigger: (playerObj) => {
            clearLog();

            let escaped = false;
            turnsSinceLastHeal = 3;
            let tempACBonus = 0;

            while (enemy.currentHp > 0 && playerObj.hp > 0 && !escaped) {
                ui.displayBattleUI(playerObj, enemy, battleLog);
                const choice = readline.question("> ");

                switch (choice) {
                    case '1':
                    case 'A':
                    case 'a':
                        playerAttack(playerObj, enemy, enemy);
                        break;
                    case '2':
                    case 'H':
                    case 'h':
                        healPlayer();
                        break;
                    case '3':
                    case 'D':
                        ui.info("Вы приготовились защищаться (+2 AC до следующего хода)");
                        tempACBonus = 2;
                        break;
                    case '4':
                    case 'E':
                    case 'e':
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
                addToLog("Победа!", 'success');
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
    // Определяем длину и количество попыток в зависимости от сложности
    let length, baseAttempts;
    switch (difficulty) {
        case 'easy': length = 3; baseAttempts = 4; break;
        case 'medium': length = 4; baseAttempts = 3; break;
        case 'hard': length = 5; baseAttempts = 2; break;
        default: length = 4; baseAttempts = 3;
    }

    // Генерируем случайную последовательность из 0 и 1 заданной длины
    const pattern = [];
    for (let i = 0; i < length; i++) {
        pattern.push(Math.random() < 0.5 ? 0 : 1);
    }

    // Количество попыток зависит от ловкости игрока (бонус к попыткам)
    let attempts = baseAttempts;
    let currentIndex = 0;

    return {
        name: "Взлом замка",
        trigger: (playerObj) => {
            // Добавляем бонусные попытки за ловкость (модификатор +1 попытка за каждые 2 пункта выше 10)
            const dexMod = Math.floor((playerObj.dexterity - 10) / 2);
            let totalAttempts = attempts + Math.max(0, dexMod); // минимум baseAttempts, но можно увеличить
            ui.info(`Ваша ловкость даёт +${Math.max(0, dexMod)} дополнительных попыток.`);

            let solved = false;
            let remainingAttempts = totalAttempts;

            while (remainingAttempts > 0 && !solved) {
                const display = pattern.map((_, idx) => idx < currentIndex ? pattern[idx] : '?');
                ui.displayLockUI(display, remainingAttempts, pattern.length);
                const move = readline.question("Выберите движение (1 - вправо, 0 - влево): ");
                const userMove = move === "1" ? 1 : (move === "0" ? 0 : null);

                if (userMove === null) {
                    ui.danger("Введите 1 или 0!");
                    continue;
                }

                if (userMove === pattern[currentIndex]) {
                    ui.success("Правильно!");
                    currentIndex++;
                    if (currentIndex === pattern.length) {
                        solved = true;
                        ui.success("Замок открыт! Вы нашли сокровище.");
                        playerObj.addExp(75);
                        playerObj.gold += 50;
                        // Доп. награда за оставшиеся попытки
                        if (remainingAttempts > 0) {
                            const bonusGold = remainingAttempts * 10;
                            playerObj.gold += bonusGold;
                            ui.success(`Премия за мастерство: +${bonusGold} золота!`);
                        }
                    }
                } else {
                    remainingAttempts--;
                    ui.danger(`Неверно! Осталось попыток: ${remainingAttempts}`);
                    if (remainingAttempts === 0) {
                        ui.danger("Вы сломали замок... Ничего не получено.");
                        // Можно добавить штраф: урон или вызов монстра
                        const damage = Math.floor(playerObj.maxHp * 0.1);
                        playerObj.hp -= damage;
                        ui.danger(`Взрыв механизма наносит ${damage} урона!`);
                    }
                }
            }
        }
    };
}

const eventFactories = [
    () => createCombatEvent(),
    () => {
        const difficulties = ['easy', 'medium', 'hard'];
        const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
        return createLockPickingEvent(randomDifficulty);
    },
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