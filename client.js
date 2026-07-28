// ... (весь предыдущий код до объявления state) ...

// Добавляем в createInitialState поля таймеров
function createInitialState() {
    return {
        seriesStarted: false, currentGame: 1,
        availableHeroes: { strength:[], agility:[], intelligence:[], universal:[] },
        phase: 'ban', step: 0, currentTurn: 'radiant',
        bans: { radiant:[], dire:[] }, picks: { radiant:[], dire:[] },
        currentGameBans: [], currentGamePicks: [],
        seriesBannedHeroes: [],
        seriesHistory: [],
        radiantScore: 0, direScore: 0,
        waitingForWinner: false,
        mainTimer: 30,
        reserveTimers: { radiant: 130, dire: 130 }
    };
}

// В serializeState и deserializeState добавить эти поля
function serializeState() {
    return {
        // ... все поля ...
        mainTimer: state.mainTimer,
        reserveTimers: { radiant: state.reserveTimers.radiant, dire: state.reserveTimers.dire }
    };
}

function deserializeState(s) {
    // ... все поля ...
    state.mainTimer = s.mainTimer !== undefined ? s.mainTimer : 30;
    state.reserveTimers = s.reserveTimers || { radiant: 130, dire: 130 };
}

// Глобальные переменные таймера
let turnTimerInterval = null;
let currentTimerTeam = null; // 'radiant' или 'dire'

function startTurnTimer(team) {
    stopTurnTimer();
    currentTimerTeam = team;
    // Запускаем только если это наш ход и мы капитан этой команды (или если играем без капитанов)
    const isOurTurn = state.currentTurn === team;
    const isLocalCaptain = !state.captains[team] || state.captains[team].id === 'local';
    if (!isOurTurn || !isLocalCaptain) {
        // Просто отображаем таймер, но не отсчитываем
        updateTimerDisplay();
        return;
    }

    turnTimerInterval = setInterval(() => {
        if (state.phase === 'complete' || state.waitingForWinner) {
            stopTurnTimer();
            return;
        }

        if (state.mainTimer > 0) {
            state.mainTimer--;
        } else {
            // Основное время вышло, тратим резерв
            if (state.reserveTimers[team] > 0) {
                state.reserveTimers[team]--;
            } else {
                // Резерв тоже кончился — авто-выбор
                stopTurnTimer();
                forceRandomAction(team);
                return;
            }
        }
        updateTimerDisplay();
        // Каждую секунду синхронизируем состояние с сервером
        if (roomCode && state.mainTimer % 5 === 0) {
            syncGameState();
        }
    }, 1000);
}

function stopTurnTimer() {
    if (turnTimerInterval) {
        clearInterval(turnTimerInterval);
        turnTimerInterval = null;
    }
}

function forceRandomAction(team) {
    const availableHeroes = [];
    for (const attr of ['strength', 'agility', 'intelligence', 'universal']) {
        const heroes = state.availableHeroes[attr] || [];
        heroes.forEach(hero => availableHeroes.push({ hero, attribute: attr }));
    }
    if (availableHeroes.length === 0) return;

    const randomPick = availableHeroes[Math.floor(Math.random() * availableHeroes.length)];
    if (state.phase === 'ban') {
        // Отправляем бан от имени команды
        applyBanLocally(randomPick.hero, randomPick.attribute, team);
        broadcastAction({ type: 'ban', hero: randomPick.hero, attribute: randomPick.attribute, team, isAuto: true });
        syncGameState();
        showToast(`Авто-бан: ${randomPick.hero}`, 'info');
    } else {
        applyPickLocally(randomPick.hero, randomPick.attribute, team);
        broadcastAction({ type: 'pick', hero: randomPick.hero, attribute: randomPick.attribute, team, isAuto: true });
        syncGameState();
        showToast(`Авто-пик: ${randomPick.hero}`, 'info');
    }
}

function updateTimerDisplay() {
    const timerMain = document.getElementById('timerMain');
    const timerReserve = document.getElementById('timerReserve');
    const timerContainer = document.getElementById('timerContainer');
    const turnInfo = document.getElementById('turnInfo');

    if (!state.seriesStarted || state.phase === 'complete') {
        timerContainer.style.display = 'none';
        turnInfo.style.display = 'block';
        return;
    }

    timerContainer.style.display = 'flex';
    turnInfo.style.display = 'none';

    const team = state.currentTurn;
    const reserve = state.reserveTimers[team] || 0;

    const mainMin = Math.floor(Math.max(0, state.mainTimer) / 60);
    const mainSec = Math.max(0, state.mainTimer) % 60;
    timerMain.textContent = `${String(mainMin).padStart(2, '0')}:${String(mainSec).padStart(2, '0')}`;

    const resMin = Math.floor(reserve / 60);
    const resSec = reserve % 60;
    timerReserve.textContent = `+${resMin}:${String(resSec).padStart(2, '0')}`;

    timerContainer.classList.remove('warning', 'danger');
    if (state.mainTimer <= 10 && state.mainTimer > 0) {
        timerContainer.classList.add('warning');
    } else if (state.mainTimer === 0) {
        timerContainer.classList.add('danger');
    }
}

// Модифицируем updateTurnDisplay, чтобы запускать таймер при смене хода
function updateTurnDisplay() {
    // ... (существующий код) ...
    // В конце вызываем запуск таймера для текущего хода
    if (state.seriesStarted && state.phase !== 'complete') {
        startTurnTimer(state.currentTurn);
    } else {
        stopTurnTimer();
        updateTimerDisplay();
    }
}

// Модифицируем applyBanLocally и applyPickLocally, чтобы сбрасывать таймер после действия
function applyBanLocally(hero, attribute, team) {
    // ... существующий код ...
    state.currentGameBans.push({hero, attribute, team});
    state.bans[team].push(hero);
    state.availableHeroes[attribute] = state.availableHeroes[attribute].filter(h => h !== hero);
    state.step++;

    if (state.step >= totalBans()) {
        state.phase = 'pick'; state.step = 0; state.currentTurn = config.pickOrder[0];
    } else {
        state.currentTurn = getBanStepTeam(state.step);
    }

    // Сбросить таймер
    state.mainTimer = 30;
    renderAll(); updateUI();
    startTurnTimer(state.currentTurn);
}

function applyPickLocally(hero, attribute, team) {
    // ... существующий код ...
    state.currentGamePicks.push({hero, attribute, team});
    state.picks[team].push(hero);
    state.availableHeroes[attribute] = state.availableHeroes[attribute].filter(h => h !== hero);
    state.step++;

    if (state.step >= totalPicks()) {
        state.phase = 'complete'; state.waitingForWinner = true;
        stopTurnTimer();
    } else {
        state.currentTurn = getPickStepTeam(state.step);
        state.mainTimer = 30;
    }

    renderAll(); updateUI();
    if (!state.waitingForWinner) startTurnTimer(state.currentTurn);
}

// При отмене тоже перезапускаем таймер
function applyUndoLocally() {
    // ... существующий код ...
    // В конце:
    state.mainTimer = 30;
    startTurnTimer(state.currentTurn);
}

// При старте новой игры или следующей игры таймер запускается через updateTurnDisplay

// Добавим очистку таймера при остановке игры
function stopAllTimers() {
    stopTurnTimer();
}

// Вызов при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // ... существующий код ...
    // Инициализация таймера при первой загрузке
    updateTimerDisplay();
});
