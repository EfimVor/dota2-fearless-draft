// В обработчике сообщений добавим поддержку TIMEOUT
// ... (предыдущий код) ...

case 'TIMEOUT': {
    if (!currentRoom || !currentRoom.state) {
        ws.send(JSON.stringify({ type: 'ERROR', message: 'Нет активной игры' }));
        return;
    }
    const s = currentRoom.state;
    // Проверяем, что действие ещё не выполнено (step совпадает)
    if (s.step !== msg.step || s.phase !== msg.phase) {
        return; // игнорируем устаревший таймаут
    }
    // Проверяем, что герой доступен
    const pool = s.availableHeroes[msg.attribute];
    if (!pool || !pool.includes(msg.hero)) {
        return;
    }
    // Выполняем действие
    if (msg.action === 'ban') {
        s.currentGameBans = s.currentGameBans || [];
        s.currentGameBans.push({hero: msg.hero, attribute: msg.attribute, team: msg.team});
        s.bans[msg.team] = s.bans[msg.team] || [];
        s.bans[msg.team].push(msg.hero);
        s.availableHeroes[msg.attribute] = pool.filter(h => h !== msg.hero);
        s.step++;
        if (s.step >= s.totalBans) {
            s.phase = 'pick'; s.step = 0; s.currentTurn = s.pickOrder[0];
        } else {
            s.currentTurn = s.banOrder[s.step];
        }
    } else if (msg.action === 'pick') {
        s.currentGamePicks = s.currentGamePicks || [];
        s.currentGamePicks.push({hero: msg.hero, attribute: msg.attribute, team: msg.team});
        s.picks[msg.team] = s.picks[msg.team] || [];
        s.picks[msg.team].push(msg.hero);
        s.availableHeroes[msg.attribute] = pool.filter(h => h !== msg.hero);
        s.step++;
        if (s.step >= s.totalPicks) {
            s.phase = 'complete'; s.waitingForWinner = true;
        } else {
            s.currentTurn = s.pickOrder[s.step];
        }
    }
    // Сбросить таймер
    s.mainTimer = 30;
    currentRoom.state = s;
    broadcastToRoom(currentRoom, { type: 'STATE_SYNC', state: s, captains: currentRoom.captains });
    break;
}

// Остальной код без изменений
