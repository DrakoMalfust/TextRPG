// views/ui.js
const chalk = require("chalk");

module.exports = {
    log: console.log,
    info: (t) => console.log(chalk.blue(t)),
    success: (t) => console.log(chalk.green(t)),
    danger: (t) => console.log(chalk.red(t)),

    // ========== UI для боя ==========
    displayBattleLog(log,) {
        if (!log.length) return;
        this.log(chalk.gray('═'.repeat(40)));
        this.log(chalk.gray('История боя:'));
        const lastLines = log.slice(-5);
        lastLines.forEach(entry => {
            const color = entry.type === 'danger' ? 'red' : (entry.type === 'success' ? 'green' : 'gray');
            this.log(chalk[color](`> ${entry.text}`));
        });
        this.log(chalk.gray('═'.repeat(40)));
    },
    displayBattleUI(player, enemy, log) {
        this.displayBattleLog(log);
        this.log(`\n--------------------------------`);
        this.log(`👥 ${player.name}`);
        this.log(`❤️  ${this.getHealthBar(player.hp, player.maxHp)} ${player.hp}/${player.maxHp}  🛡️ AC: ${player.getArmorClass()}\n`);
        this.log(`👿 ${enemy.name}`);
        this.log(`💀 ${this.getHealthBar(enemy.currentHp, enemy.hp)} ${enemy.currentHp}/${enemy.hp}  🛡️ AC: ${enemy.ac}\n`);
        this.log(`🎯 Шанс крита: 5% (20 на d20)`);
        this.log(`⚔️  Ваш бонус атаки: +${player.getAttackModifier()}`);
        this.drawStatusBar('battle');
        this.log(`--------------------------------`);
    },

    // ========== UI для статистики ==========
    displayStats(player) {
        // Формируем строки содержимого
        const lines = [
            `Имя: ${player.name}`,
            `Уровень: ${player.level}`,
            `❤️ ${this.getHealthBar(player.hp, player.maxHp, 15)} ${player.hp}/${player.maxHp}`,
            `Класс брони (AC): ${player.getArmorClass()}`,
            `Модификатор атаки: +${player.getAttackModifier()}`,
            `Золото: ${player.gold}`,
            `EXP: ${Math.floor(player.exp)}/${player.nextLevelExp}`,
            `Сила: ${player.strength} (${Math.floor((player.strength - 10) / 2)})`,
            `Ловкость: ${player.dexterity} (${Math.floor((player.dexterity - 10) / 2)})`
        ];

        // Находим максимальную длину строки (учитываем, что эмодзи считаются за 1 символ)
        const maxLen = Math.max(...lines.map(l => l.length), 25);
        const horizontal = '─'.repeat(maxLen + 2);

        this.log(`┌${horizontal}┐`);
        this.log(`│ ${'СТАТИСТИКА'.padEnd(maxLen)} │`);
        this.log(`├${horizontal}┤`);
        for (let line of lines) {
            this.log(`│ ${line.padEnd(maxLen)} │`);
        }
        this.log(`└${horizontal}┘`);
    },

    // ========== UI для инвентаря ==========
    displayInventory(player, page = 0, perPage = 7) {
        this.log(`\n--- Инвентарь ---`);
        this.log(`Шлем: ${player.inventory.head?.name || 'Нет'}`);
        this.log(`Броня: ${player.inventory.armor?.name || 'Нет'}`);
        this.log(`Ботинки: ${player.inventory.boots?.name || 'Нет'}`);
        this.log(`Кольца: ${player.inventory.rings.map(r => r.name).join(', ') || 'Нет'}`);
        this.log(`Оружие: ${player.inventory.weapons.map(w => w.name).join(', ') || 'Нет'}`);

        this.log(`\n🎒 Рюкзак (страница ${page + 1}/${Math.ceil(player.backpack.length / perPage) || 1}):`);
        if (player.backpack.length === 0) {
            this.log(`  (пусто)`);
        } else {
            const start = page * perPage;
            const end = start + perPage;
            const slice = player.backpack.slice(start, end);
            slice.forEach((item, idx) => {
                this.log(`  ${start + idx + 1}. ${item.name} (${item.type}) | Атака: ${item.attack || 0} | Защита: ${item.defense || 0}`);
            });
            if (player.backpack.length > perPage) {
                this.log(chalk.cyan(`   [N] следующая страница  [P] предыдущая`));
            }
        }
    },

    // ========== UI для взлома замка ==========
    displayLockUI(patternCurrent, attempts, totalLength) {
        const display = patternCurrent.map(p => p === undefined ? '-' : p).join(' ');
        this.log("\n--- Взлом замка ---");
        this.log(`Попыток осталось: ${attempts}`);
        this.log(`Состояние замка: ${display}`);
        this.log(`Всего позиций: ${totalLength}`);
    },

    // ============= UI HP bar ================
    getHealthBar(current, max, length = 20) {
        const percent = current / max;
        const filled = Math.round(length * percent);
        const empty = length - filled;
        const bar = '█'.repeat(filled) + '▒'.repeat(empty);
        const color = percent > 0.6 ? 'green' : (percent > 0.3 ? 'yellow' : 'red');
        return chalk[color](bar);
    },



    // ================== UI for UX

    makeBox(title, contentLines, width = 50) {
        const line = '─'.repeat(width);
        let output = `┌${line}┐\n`;
        if (title) output += `│ ${chalk.bold(title)}${' '.repeat(width - title.length - 2)}│\n`;
        output += `├${line}┤\n`;
        contentLines.forEach(line => {
            const padding = width - line.length;
            output += `│ ${line}${' '.repeat(padding - 1)}│\n`;
        });
        output += `└${line}┘`;
        return output;
    },

    drawStatusBar(context) {
        this.log(chalk.gray('─'.repeat(50)));
        if (context === 'battle') {
            this.log(chalk.cyan('  [1/A] Атака\n  [2/H] Лечение\n  [3/D] Защита\n  [4/E] Побег'));
        } else if (context === 'main') {
            this.log(chalk.bgBlack.red('                       ⢀⣀⣀⣀⣀⡀                          '))
            this.log(chalk.bgBlack.red('                   ⣀⢤⣶⣿⣿⣿⣿⣿⣿⣿⣿⣶⣦⣄                      '))
            this.log(chalk.bgBlack.red('                 ⢠⣾⣿⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣄                    '))
            this.log(chalk.bgBlack.red('                ⢠⣿⣿⣿⣿⣟⣿⣿⣿⣿⣿⣿⣿⣿⣻⣿⣿⣿⣿                    '))
            this.log(chalk.bgBlack.red('                ⠹⣿⣿⣿⣿⣿⣽⣿⣿⣿⣿⣿⣿⣯⣿⣿⣿⣿⣿⠏                   '))
            this.log(chalk.bgBlack.red('               ⢀⣾⣏⣿⣿⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣹⣷⡄                  '))
            this.log(chalk.bgBlack.red('               ⣿⣿⣿⡿⠋⠁⠙⠿⢿⣿⣿⣿⣿⡿⠿⠋⠉⠙⢿⣿⣿⣿                  '))
            this.log(chalk.bgBlack.red('               ⢸⣿⡏⢧⠀⠀⠀⠀⠀⣹⣿⣿⣏⠀⠀⠀⠀⠀⡼⢹⣿⡟                  '))
            this.log(chalk.bgBlack.red('                ⠙⡟⠈⠻⣶⣶⣤⣾⡿⠏⠹⢿⣷⣤⣶⣶⠟⠁⢻⠋                   '))
            this.log(chalk.bgBlack.red('                ⢤⣇⣀⣤⡟⣿⣿⣻⡇⢀⡀⢸⣝⣿⢿⢻⣤⣀⣸⡤                   '))
            this.log(chalk.bgBlack.red('                 ⠻⣟⣋⡉⠹⡿⣿⣿⣿⣿⣿⣿⢿⠏⢉⣙⣻⠟                    '))
            this.log(chalk.bgBlack.red('                  ⠈⠹⡇⠆⠇⠹⠏⣿⣿⠻⠏⠸⠰⢸⡏⠁                     '))
            this.log(chalk.bgBlack.red('                    ⢿⠈⠚⣷⣷⡸⢇⣾⣾⠓⠁⡿                       '))
            this.log(chalk.cyan('  [1/E] Исследовать подземелье\n  [2/S] Статистика персонажа\n  [3/I] Инвентарь\n  [4/G] Сохранить игру\n  [5/Q] Выйти из игры'));
        } else if (context === 'inventory') {
            this.log(chalk.cyan('  [1] Экипировать предмет\n  [2] Снять предмет\n  [3] Назад в главное меню\n  [N/P] Страницы'));
        }
        this.log(chalk.gray('─'.repeat(50)));
    },
};