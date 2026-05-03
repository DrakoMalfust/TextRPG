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
    
    ui.log("\nВыберите действие:");
    ui.log("1. Исследовать подземелье");
    ui.log("2. Посмотреть статистику");
    ui.log("3. Открыть инвентарь");
    ui.log("4. Сохранить игру");
    ui.log("5. Выход");
    
    const choice = readline.question("> ");
    
    switch(choice) {
        case '1': 
            exploreDungeon(player);
            break;
        case '2': 
            displayStats();
            readline.question("\nНажмите Enter для возврата...");
            mainMenu();
            break;
        case '3': 
            displayInventory();
            handleInventory();
            break;
        case '4':
            saveGame(player);
            ui.success("Игра сохранена!");
            mainMenu();
            break;
        case '5':
            process.exit();
            break;
        default:
            ui.danger("Неверный выбор!");
            mainMenu();
    }
}

function handleInventory() {
    ui.log("\nУправление инвентарем:");
    ui.log("1. Экипировать предмет");
    ui.log("2. Снять предмет");
    ui.log("3. Вернуться в меню");
    
    const choice = readline.question("> ");
    
    switch(choice) {
        case '1': 
            equipItem();
            break;
        case '2': 
            unequipItem();
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
    // Логика экипировки предметов
    // TODO: Реализовать выбор предмета из инвентаря
    // TODO: Проверка ограничений на экипировку
    handleInventory();
}

function unequipItem() {
    // Логика снятия предметов
    // TODO: Реализовать выбор предмета для снятия
    handleInventory();
}



// =================Ui=============================
function displayBattleUI(turn, player, enemy) {
    ui.log(`\nХод: ${turn}`);
    ui.log(`--------------------------------`);
    ui.log(`👥 ${player.name}`);
    ui.log(`🧠 HP: ${player.hp}/${player.maxHp}`);
    ui.log(`--------------------------------`);
    ui.log(`👿 ${enemy.name}`);
    ui.log(`💀 HP: ${enemy.hp}`);
    ui.log(`--------------------------------`);
    
    ui.log('\nВыберите действие:');
    ui.log('1. Ударить');
    ui.log('2. Похилиться');
    ui.log('3. Защититься');
    ui.log('4. Сбежать');
}


function displayStats() {
    ui.log(`\n--- Статистика ---`);
    ui.log(`Имя: ${player.name}`);
    ui.log(`Уровень: ${player.level}`);
    ui.log(`HP: ${player.hp}/${player.maxHp}`);
    ui.log(`Атака: ${player.getAttack()}`);
    ui.log(`Защита: ${player.getDefense()}`);
    ui.log(`Золото: ${player.gold}`);
    ui.log(`EXP: ${player.exp}/${player.nextLevelExp}`);
}

function displayInventory() {
    ui.log(`\n--- Инвентарь ---`);
    ui.log(`Шлем: ${player.inventory.head?.name || 'Нет'}`);
    ui.log(`Броня: ${player.inventory.armor?.name || 'Нет'}`);
    ui.log(`Ботинки: ${player.inventory.boots?.name || 'Нет'}`);
    ui.log(`Кольца: ${player.inventory.rings.map(r => r.name).join(', ') || 'Нет'}`);
    ui.log(`Оружие: ${player.inventory.weapons.map(w => w.name).join(', ') || 'Нет'}`);
}

function displayLockUI(pattern, attempts) {
    ui.log("\n--- Взлом замка ---");
    ui.log(`Попытки осталось: ${attempts}`);
    ui.log(`Состояние замка: ${pattern.join(' ')}`);
}
//==================================================


// ===================== FIGHT =====================
class DungeonEvent {
    constructor(name) {
        this.name = name;
    }

    trigger(player) {
        throw new Error("Метод должен быть переопределен");
    }
}

class CombatEvent extends DungeonEvent {
    constructor() {
        super("Бой с монстрами");
        this.enemy = new Enemy(
            "Случайный монстр",
            Math.floor(Math.random() * 50) + 50,
            Math.floor(Math.random() * 5) + 5,
            Math.floor(Math.random() * 3),
            Math.random() > 0.5 ? "aggressive" : "defensive"
        );
    }

    trigger(player) {
        // Логика боя
        while (this.enemy.hp > 0 && player.hp > 0) {
            // UI отображение
            displayBattleUI(player, this.enemy);
            
            const choice = readline.question("> ");
            
            switch(choice) {
                case '1': // Атака
                    attack(player, this.enemy);
                    break;
                case '2': // Отдых
                    player.hp += Math.floor(player.maxHp * 0.1);
                    break;
                case '3': // Защита
                    const dice = Math.floor(Math.random() * 20) + 1;
                    if (dice <= 10) {
                        // Не защитился
                        this.enemy.act(player);
                    } else if (dice <= 16) {
                        // Успешная защита
                    } else if (dice <= 19) {
                        // Парировал и атаковал
                        attack(player, this.enemy);
                    } else {
                        // Смертельный удар
                        this.enemy.hp = 0;
                    }
                    break;
            }
            
            if (this.enemy.hp > 0) {
                this.enemy.act(player);
            }
        }
        
        if (this.enemy.hp <= 0) {
            ui.success("Победа!");
            player.addExp(this.enemy.hp * 2);
            player.gold += Math.floor(this.enemy.hp / 2);
        }
    }
}
class RunePuzzleEvent extends DungeonEvent {
    constructor() {
        super("Ребус с рунами");
        this.word = ["Г", "О", "Л", "Д"];
    }

    trigger(player) {
        let guessed = false;
        let attempts = 3;
        
        while (attempts > 0 && !guessed) {
            const guess = readline.question("Угадайте букву: ").toUpperCase();
            
            if (this.word.includes(guess)) {
                ui.success("Правильно!");
                guessed = true;
                player.addExp(50);
            } else {
                attempts--;
                ui.danger("Неверно!");
                player.hp -= 10;
            }
        }
    }
}

class LockPickingEvent extends DungeonEvent {
    constructor(difficulty) {
        super("Взлом замка");
        this.pattern = [];
        this.difficulty = difficulty;
        
        switch(difficulty) {
            case 'easy': 
                this.pattern = [1, 0, 1];
                break;
            case 'medium': 
                this.pattern = [1, 0, 1, 0, 1];
                break;
            case 'hard': 
                this.pattern = [1, 0, 1, 0, 1, 0, 1];
                break;
        }
    }

    trigger(player) {
        let attempts = 3;
        let solved = false;
        const uiPattern = new Array(this.pattern.length).fill('-');
        
        while (attempts > 0 && !solved) {
            // Передаем attempts в функцию отображения
            displayLockUI(uiPattern, attempts);
            const move = readline.question("Выберите действие (1 - вправо, 0 - влево): ");
            
            if (move === this.pattern[0]) {
                uiPattern[0] = move;
                this.pattern.shift();
                if (this.pattern.length === 0) {
                    solved = true;
                    ui.success("Замок открыт!");
                    player.addExp(75);
                }
            } else {
                attempts--;
                ui.danger("Неверное движение!");
            }
        }
        
        if (!solved) {
            ui.danger("Вы потратили все попытки!");
        }
    }
}


class HealingWellEvent extends DungeonEvent {
    constructor() {
        super("Целебный колодец");
    }

    trigger(player) {
        const healAmount = Math.floor(player.maxHp * 0.2);
        player.hp = Math.min(player.maxHp, player.hp + healAmount);
        ui.success(`Вы восстановили ${healAmount} HP!`);
        player.addExp(25);
    }
}


class Dungeon {
    constructor() {
        this.events = [
            new CombatEvent(),
            new RunePuzzleEvent(),
            new LockPickingEvent('easy'),
            new HealingWellEvent()
        ];
    }

    generateEvent() {
        const randomEvent = this.events[Math.floor(Math.random() * this.events.length)];
        return randomEvent;
    }
}

function exploreDungeon(player) {
    const dungeon = new Dungeon();
    let continueExploring = true;
    
    while (continueExploring && player.hp > 0) {
        const event = dungeon.generateEvent();
        ui.log(`\nВы натыкаетесь на: ${event.name}`);
        event.trigger(player);
        
        continueExploring = readline.question("Продолжить исследование? (y/n): ") === 'y';
    }
    
    if (player.hp <= 0) {
        ui.danger("Вы погибли...");
        process.exit();
    }
    
    mainMenu();
}



function attack(attacker, defender) {
    let damage;
    
    if (attacker instanceof Player) {
        damage = attacker.getAttack();
    } else if (attacker instanceof Enemy) {
        damage = attacker.attack; // Используем базовую атаку врага
    } else {
        throw new Error("Неизвестный атакующий");
    }
    
    defender.hp -= damage;
    ui.danger(`${attacker.name} наносит ${damage} урона!`);
}

function heal(player) {
    if (player.gold >= 10) {
        player.gold -= 10;
        const healAmount = Math.floor(player.maxHp * 0.2);
        player.hp = Math.min(player.maxHp, player.hp + healAmount);
        ui.success(`Восстановление ${healAmount} HP`);
    } else {
        ui.danger('Недостаточно золота для лечения!');
    }
}

function defend(player) {
    player.defense += 2;
    ui.info('Вы перешли в защитную стойку!');
}

function tryEscape(player, enemy) {
    const escapeChance = Math.random();
    if (escapeChance > 0.5) {
        ui.success('Вам удалось сбежать!');
        return mainMenu();
    } else {
        ui.danger('Побег не удался!');
        return false;
    }
}


function enemyTurn(enemy, player) {
    const action = enemy.act(player);
    switch(action) {
        case 'attack':
            attack(enemy, player); // Теперь используем общую функцию атаки
            break;
        case 'wait':
            ui.info('Враг медлит...');
            break;
    }
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
