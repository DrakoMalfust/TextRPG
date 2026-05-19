// views/ui.js
const chalk = require("chalk");

module.exports = {
    log: console.log,
    info: (t) => console.log(chalk.blue(t)),
    success: (t) => console.log(chalk.green(t)),
    danger: (t) => console.log(chalk.red(t)),

    // ========== UI для боя ==========
    displayBattleUI(player, enemy) {
        this.log(`\n--------------------------------`);
        this.log(`👥 ${player.name}   ❤️ HP: ${player.hp}/${player.maxHp}  🛡️ AC: ${player.getArmorClass()}`); 
        this.log(`👿 ${enemy.name}   💀 HP: ${enemy.currentHp}  🛡️ AC: ${enemy.ac}`);
        this.log(`🎯 Шанс крита: 5% (20 на d20)`);
        this.log(`⚔️ Бонус атаки: +${player.getAttackModifier()}`);
        this.log(`--------------------------------`);
        this.log('\nВыберите действие:');
        this.log('1. Ударить');
        this.log('2. Похилиться (1 раз в 3 хода)');
        this.log('3. Защититься (+2 AC на ход)');
        this.log('4. Сбежать');
    },

    // ========== UI для статистики ==========
    displayStats(player) {
        this.log(`\n--- Статистика ---`);
        this.log(`Имя: ${player.name}`);
        this.log(`Уровень: ${player.level}`);
        this.log(`HP: ${player.hp}/${player.maxHp}`);
        this.log(`Класс брони (AC): ${player.getArmorClass()}`);
        this.log(`Модификатор атаки: +${player.getAttackModifier()}`);
        this.log(`Золото: ${player.gold}`);
        this.log(`EXP: ${player.exp}/${player.nextLevelExp}`);
        // Доп. информация о характеристиках (опционально)
        this.log(`Сила: ${player.strength} (${Math.floor((player.strength-10)/2)})`);
        this.log(`Ловкость: ${player.dexterity} (${Math.floor((player.dexterity-10)/2)})`);
    },

    // ========== UI для инвентаря ==========
    displayInventory(player) {
        this.log(`\n--- Инвентарь ---`);
        this.log(`Шлем: ${player.inventory.head?.name || 'Нет'}`);
        this.log(`Броня: ${player.inventory.armor?.name || 'Нет'}`);
        this.log(`Ботинки: ${player.inventory.boots?.name || 'Нет'}`);
        this.log(`Кольца: ${player.inventory.rings.map(r => r.name).join(', ') || 'Нет'}`);
        this.log(`Оружие: ${player.inventory.weapons.map(w => w.name).join(', ') || 'Нет'}`);
        this.log(`\n🎒 Рюкзак:`);
        if (player.backpack.length === 0) this.log(`  (пусто)`);
        else player.backpack.forEach((item, idx) => this.log(`  ${idx+1}. ${item.name} (${item.type})`));
    },

    // ========== UI для взлома замка ==========
    displayLockUI(patternCurrent, attempts, totalLength) {
        const display = patternCurrent.map(p => p === undefined ? '-' : p).join(' ');
        this.log("\n--- Взлом замка ---");
        this.log(`Попыток осталось: ${attempts}`);
        this.log(`Состояние замка: ${display}`);
        this.log(`Всего позиций: ${totalLength}`);
    }
};