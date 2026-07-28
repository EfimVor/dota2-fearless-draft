/**
 * Dota 2 — Fearless Draft Client (v11 — полностью исправлен)
 * Мультиплеер через WebSocket. Таймеры 30с + 2:10 резерв.
 */

// ==================== HERO DATABASE ====================
var ALL_HEROES = {
    strength: ["Abaddon","Alchemist","Axe","Bristleback","Centaur Warrunner","Chaos Knight","Dawnbreaker","Doom","Dragon Knight","Earth Spirit","Earthshaker","Elder Titan","Huskar","Kunkka","Legion Commander","Lifestealer","Mars","Night Stalker","Ogre Magi","Omniknight","Primal Beast","Pudge","Sand King","Slardar","Sven","Tidehunter","Timbersaw","Tiny","Treant Protector","Tusk","Underlord","Undying","Wraith King"],
    agility: ["Anti-Mage","Arc Warden","Bloodseeker","Bounty Hunter","Clinkz","Drow Ranger","Ember Spirit","Faceless Void","Gyrocopter","Hoodwink","Juggernaut","Kez","Luna","Medusa","Meepo","Monkey King","Morphling","Muerta","Naga Siren","Nyx Assassin","Phantom Assassin","Phantom Lancer","Razor","Riki","Shadow Fiend","Slark","Sniper","Spectre","Templar Assassin","Terrorblade","Troll Warlord","Ursa","Viper","Weaver"],
    intelligence: ["Ancient Apparition","Crystal Maiden","Death Prophet","Disruptor","Enchantress","Grimstroke","Invoker","Jakiro","Keeper of the Light","Leshrac","Lich","Lina","Lion","Nature's Prophet","Necrophos","Oracle","Outworld Destroyer","Puck","Pugna","Queen of Pain","Ringmaster","Rubick","Shadow Demon","Shadow Shaman","Silencer","Skywrath Mage","Storm Spirit","Tinker","Warlock","Witch Doctor","Zeus"],
    universal: ["Bane","Batrider","Beastmaster","Brewmaster","Broodmother","Chen","Clockwerk","Dark Seer","Dark Willow","Dazzle","Enigma","Io","Lone Druid","Lycan","Magnus","Marci","Mirana","Pangolier","Phoenix","Snapfire","Spirit Breaker","Techies","Vengeful Spirit","Venomancer","Void Spirit","Windranger","Winter Wyvern"]
};

var HERO_IMAGE_KEYS = {
    "Abaddon":"abaddon","Alchemist":"alchemist","Ancient Apparition":"ancient_apparition","Anti-Mage":"antimage","Arc Warden":"arc_warden","Axe":"axe","Bane":"bane","Batrider":"batrider","Beastmaster":"beastmaster","Bloodseeker":"bloodseeker","Bounty Hunter":"bounty_hunter","Brewmaster":"brewmaster","Bristleback":"bristleback","Broodmother":"broodmother","Centaur Warrunner":"centaur","Chaos Knight":"chaos_knight","Chen":"chen","Clinkz":"clinkz","Clockwerk":"rattletrap","Crystal Maiden":"crystal_maiden","Dark Seer":"dark_seer","Dark Willow":"dark_willow","Dawnbreaker":"dawnbreaker","Dazzle":"dazzle","Death Prophet":"death_prophet","Disruptor":"disruptor","Doom":"doom_bringer","Dragon Knight":"dragon_knight","Drow Ranger":"drow_ranger","Earth Spirit":"earth_spirit","Earthshaker":"earthshaker","Elder Titan":"elder_titan","Ember Spirit":"ember_spirit","Enchantress":"enchantress","Enigma":"enigma","Faceless Void":"faceless_void","Grimstroke":"grimstroke","Gyrocopter":"gyrocopter","Hoodwink":"hoodwink","Huskar":"huskar","Invoker":"invoker","Io":"wisp","Jakiro":"jakiro","Juggernaut":"juggernaut","Keeper of the Light":"keeper_of_the_light","Kez":"kez","Kunkka":"kunkka","Legion Commander":"legion_commander","Leshrac":"leshrac","Lich":"lich","Lifestealer":"life_stealer","Lina":"lina","Lion":"lion","Lone Druid":"lone_druid","Luna":"luna","Lycan":"lycan","Magnus":"magnataur","Marci":"marci","Mars":"mars","Medusa":"medusa","Meepo":"meepo","Mirana":"mirana","Monkey King":"monkey_king","Morphling":"morphling","Muerta":"muerta","Naga Siren":"naga_siren","Nature's Prophet":"furion","Necrophos":"necrolyte","Night Stalker":"night_stalker","Nyx Assassin":"nyx_assassin","Ogre Magi":"ogre_magi","Omniknight":"omniknight","Oracle":"oracle","Outworld Destroyer":"obsidian_destroyer","Pangolier":"pangolier","Phantom Assassin":"phantom_assassin","Phantom Lancer":"phantom_lancer","Phoenix":"phoenix","Primal Beast":"primal_beast","Puck":"puck","Pudge":"pudge","Pugna":"pugna","Queen of Pain":"queenofpain","Razor":"razor","Riki":"riki","Ringmaster":"ringmaster","Rubick":"rubick","Sand King":"sand_king","Shadow Demon":"shadow_demon","Shadow Fiend":"nevermore","Shadow Shaman":"shadow_shaman","Silencer":"silencer","Skywrath Mage":"skywrath_mage","Slardar":"slardar","Slark":"slark","Snapfire":"snapfire","Sniper":"sniper","Spectre":"spectre","Spirit Breaker":"spirit_breaker","Storm Spirit":"storm_spirit","Sven":"sven","Techies":"techies","Templar Assassin":"templar_assassin","Terrorblade":"terrorblade","Tidehunter":"tidehunter","Timbersaw":"shredder","Tinker":"tinker","Tiny":"tiny","Treant Protector":"treant","Troll Warlord":"troll_warlord","Tusk":"tusk","Underlord":"abyssal_underlord","Undying":"undying","Ursa":"ursa","Vengeful Spirit":"vengeful_spirit","Venomancer":"venomancer","Viper":"viper","Void Spirit":"void_spirit","Warlock":"warlock","Weaver":"weaver","Windranger":"windrunner","Winter Wyvern":"winter_wyvern","Witch Doctor":"witch_doctor","Wraith King":"skeleton_king","Zeus":"zeus"
};

function getHeroImageUrl(n) {
    var k = HERO_IMAGE_KEYS[n];
    if (k) {
        return "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/" + k + ".png";
    }
    return "";
}

function getAttrBg(a) {
    var colors = { strength: "#1a100e", agility: "#0e1a12", intelligence: "#0e141a", universal: "#160e1a" };
    return colors[a] || "#111";
}

function getAttrLabel(a) {
    var labels = { strength: "Сила", agility: "Ловкость", intelligence: "Интеллект", universal: "Универсал" };
    return labels[a] || a;
}

// ==================== CONFIG ====================
var DEFAULT_CONFIG = {
    heroesPerAttribute: 10,
    bansPerTeam: 3,
    picksPerTeam: 5,
    banOrder: [],
    pickOrder: []
};

var config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

function setOrderByStartingTeam(startingTeam) {
    if (startingTeam === "radiant") {
        config.banOrder = ["radiant","dire","radiant","dire","radiant","dire"];
        config.pickOrder = ["radiant","dire","dire","radiant","radiant","dire","dire","radiant","radiant","dire"];
    } else {
        config.banOrder = ["dire","radiant","dire","radiant","dire","radiant"];
        config.pickOrder = ["dire","radiant","radiant","dire","dire","radiant","radiant","dire","dire","radiant"];
    }
}
setOrderByStartingTeam("radiant");

// ==================== WEBSOCKET ====================
var ws = null;
var roomCode = null;
var serverCaptains = { radiant: null, dire: null };
var isRemoteAction = false;

function getServerUrl() {
    var protocol = location.protocol === "https:" ? "wss:" : "ws:";
    return protocol + "//" + location.host;
}

function connectWebSocket() {
    if (ws && ws.readyState === WebSocket.OPEN) return;
    var url = getServerUrl();
    updateConnectionStatus("connecting", "Подключение...");
    try {
        ws = new WebSocket(url);
        ws.onopen = function() {
            updateConnectionStatus("connected", "Подключен к серверу");
            var params = new URLSearchParams(location.search);
            var roomFromUrl = params.get("room");
            if (roomFromUrl && !roomCode) {
                joinRoom(roomFromUrl);
            }
        };
        ws.onmessage = function(e) {
            handleServerMessage(JSON.parse(e.data));
        };
        ws.onclose = function() {
            updateConnectionStatus("disconnected", "Соединение потеряно");
            ws = null;
            setTimeout(connectWebSocket, 3000);
        };
        ws.onerror = function() {
            updateConnectionStatus("disconnected", "Ошибка соединения");
        };
    } catch(e) {
        updateConnectionStatus("disconnected", "Сервер недоступен");
        setTimeout(connectWebSocket, 5000);
    }
}

function handleServerMessage(msg) {
    switch(msg.type) {
        case "ROOM_CREATED":
        case "ROOM_JOINED":
            roomCode = msg.roomCode;
            serverCaptains = msg.captains || { radiant: null, dire: null };
            document.getElementById("roomCodeDisplay").textContent = roomCode;
            document.getElementById("connInfo").style.display = "flex";
            syncCaptainsFromServer();
            if (msg.state) {
                isRemoteAction = true;
                deserializeState(msg.state);
                isRemoteAction = false;
                renderAll();
                updateUI();
            }
            updateConnectionStatus("connected", "Комната " + roomCode);
            var toastText = msg.type === "ROOM_CREATED" ? "Комната создана! Отправьте код сопернику." : "Подключились к комнате!";
            showToast(toastText, "success");
            break;
        case "CAPTAIN_CLAIMED":
            serverCaptains[msg.team] = msg.name;
            syncCaptainsFromServer();
            renderAll();
            showToast(msg.name + " стал капитаном " + (msg.team === "radiant" ? "Radiant" : "Dire") + "!", "info");
            break;
        case "CAPTAIN_LEFT":
            serverCaptains[msg.team] = null;
            syncCaptainsFromServer();
            renderAll();
            break;
        case "STATE_SYNC":
            serverCaptains = msg.captains || serverCaptains;
            if (msg.state) {
                isRemoteAction = true;
                deserializeState(msg.state);
                isRemoteAction = false;
                renderAll();
                updateUI();
            }
            break;
        case "GAME_ACTION":
            isRemoteAction = true;
            handleRemoteAction(msg.action);
            isRemoteAction = false;
            if (msg.captains) {
                serverCaptains = msg.captains;
            }
            renderAll();
            updateUI();
            break;
        case "TIMER_TICK":
            if (msg.timerData) {
                state.mainTimer = msg.timerData.mainTimer;
                if (msg.timerData.reserveTimers) {
                    state.reserveTimers = msg.timerData.reserveTimers;
                }
                updateTimerDisplay();
            }
            break;
        case "PLAYER_JOINED":
            showToast("Игрок подключился к комнате", "info");
            break;
        case "PLAYER_LEFT":
            showToast("Игрок отключился", "info");
            break;
        case "ERROR":
            showToast(msg.message, "error");
            break;
    }
}

function sendMessage(msg) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(msg));
    }
}

function syncGameState() {
    if (!roomCode) return;
    sendMessage({ type: "SYNC_STATE", state: serializeState() });
}

function broadcastAction(action) {
    if (!roomCode || isRemoteAction) return;
    sendMessage({ type: "GAME_ACTION", action: action });
    syncGameState();
}

function handleRemoteAction(action) {
    switch(action.type) {
        case "ban":
            applyBanLocally(action.hero, action.attribute, action.team);
            break;
        case "pick":
            applyPickLocally(action.hero, action.attribute, action.team);
            break;
        case "undo":
            applyUndoLocally();
            break;
        case "new_series":
            setOrderByStartingTeam(action.startingTeam);
            applyNewSeriesLocally(action.serializedState);
            break;
        case "next_game":
            applyNextGameLocally();
            break;
    }
}

// ==================== CONNECTION UI ====================
function updateConnectionStatus(status, text) {
    var dot = document.querySelector(".conn-dot");
    var textEl = document.getElementById("connText");
    if (dot) {
        dot.className = "conn-dot " + status;
    }
    if (textEl) {
        textEl.textContent = text;
    }
}

function createRoom() {
    sendMessage({ type: "CREATE_ROOM" });
}

function joinRoom(code) {
    if (!code) {
        code = document.getElementById("joinRoomInput").value.trim();
    }
    if (!code || code.length !== 6) {
        showToast("Введите 6-значный код комнаты", "error");
        return;
    }
    sendMessage({ type: "JOIN_ROOM", roomCode: code });
    var newUrl = new URL(location);
    newUrl.searchParams.set("room", code);
    history.replaceState({}, "", newUrl);
}

function copyInviteLink() {
    if (!roomCode) return;
    var link = location.origin + location.pathname + "?room=" + roomCode;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(function() {
            showToast("Ссылка скопирована! Отправьте её сопернику.", "success");
        }).catch(function() {
            fallbackCopy(link);
        });
    } else {
        fallbackCopy(link);
    }
}

function fallbackCopy(text) {
    var helper = document.getElementById("copyHelper");
    helper.value = text;
    helper.select();
    document.execCommand("copy");
    showToast("Ссылка скопирована!", "success");
}

// ==================== CAPTAINS & SPECTATOR ====================
var captains = { radiant: null, dire: null };

function syncCaptainsFromServer() {
    if (serverCaptains.radiant && (!captains.radiant || captains.radiant.id !== "local")) {
        captains.radiant = { name: serverCaptains.radiant, id: "remote" };
    } else if (!serverCaptains.radiant && captains.radiant && captains.radiant.id !== "local") {
        captains.radiant = null;
    }
    if (serverCaptains.dire && (!captains.dire || captains.dire.id !== "local")) {
        captains.dire = { name: serverCaptains.dire, id: "remote" };
    } else if (!serverCaptains.dire && captains.dire && captains.dire.id !== "local") {
        captains.dire = null;
    }
}

function isMyCaptain(team) {
    if (!captains[team]) return true;
    return captains[team].id !== "remote";
}

function isLocalCaptain() {
    return (captains.radiant && captains.radiant.id === "local") || (captains.dire && captains.dire.id === "local");
}

function isSpectator() {
    return !isLocalCaptain();
}

function updateSpectatorUI() {
    var claimRadiant = document.getElementById("btnClaimRadiant");
    var claimDire = document.getElementById("btnClaimDire");
    if (isSpectator() && roomCode) {
        if (captains.radiant && captains.dire) {
            if (claimRadiant) claimRadiant.style.display = "none";
            if (claimDire) claimDire.style.display = "none";
            showToast("Вы зритель 👁️", "info");
        }
    } else {
        if (claimRadiant) claimRadiant.style.display = "";
        if (claimDire) claimDire.style.display = "";
    }
}

// ==================== GAME STATE ====================
function createInitialState() {
    return {
        seriesStarted: false,
        currentGame: 1,
        availableHeroes: { strength: [], agility: [], intelligence: [], universal: [] },
        phase: "ban",
        step: 0,
        currentTurn: "radiant",
        bans: { radiant: [], dire: [] },
        picks: { radiant: [], dire: [] },
        currentGameBans: [],
        currentGamePicks: [],
        seriesBannedHeroes: [],
        seriesHistory: [],
        radiantScore: 0,
        direScore: 0,
        mainTimer: 30,
        reserveTimers: { radiant: 130, dire: 130 }
    };
}

var state = createInitialState();

function serializeState() {
    return {
        seriesStarted: state.seriesStarted,
        currentGame: state.currentGame,
        availableHeroes: JSON.parse(JSON.stringify(state.availableHeroes)),
        phase: state.phase,
        step: state.step,
        currentTurn: state.currentTurn,
        bans: JSON.parse(JSON.stringify(state.bans)),
        picks: JSON.parse(JSON.stringify(state.picks)),
        currentGameBans: state.currentGameBans.slice(),
        currentGamePicks: state.currentGamePicks.slice(),
        seriesBannedHeroes: state.seriesBannedHeroes.slice(),
        seriesHistory: JSON.parse(JSON.stringify(state.seriesHistory)),
        radiantScore: state.radiantScore,
        direScore: state.direScore,
        mainTimer: state.mainTimer,
        reserveTimers: { radiant: state.reserveTimers.radiant, dire: state.reserveTimers.dire }
    };
}

function deserializeState(s) {
    if (!s) return;
    state.seriesStarted = s.seriesStarted;
    state.currentGame = s.currentGame;
    state.availableHeroes = s.availableHeroes;
    state.phase = s.phase;
    state.step = s.step;
    state.currentTurn = s.currentTurn;
    state.bans = s.bans;
    state.picks = s.picks;
    state.currentGameBans = s.currentGameBans;
    state.currentGamePicks = s.currentGamePicks;
    state.seriesBannedHeroes = s.seriesBannedHeroes || [];
    state.seriesHistory = s.seriesHistory;
    state.radiantScore = s.radiantScore;
    state.direScore = s.direScore;
    state.mainTimer = s.mainTimer !== undefined ? s.mainTimer : 30;
    state.reserveTimers = s.reserveTimers || { radiant: 130, dire: 130 };
}

// ==================== TIMER ====================
var turnTimerInterval = null;

function startTurnTimer(team) {
    stopTurnTimer();
    updateTimerDisplay();
    if (!state.seriesStarted || state.phase === "complete") return;
    var isOurTurn = state.currentTurn === team;
    var isLocalCaptain = !captains[team] || captains[team].id === "local";
    if (!isOurTurn || !isLocalCaptain) return;

    turnTimerInterval = setInterval(function() {
        if (state.phase === "complete") {
            stopTurnTimer();
            return;
        }
        if (state.mainTimer > 0) {
            state.mainTimer--;
        } else {
            if (state.reserveTimers[team] > 0) {
                state.reserveTimers[team]--;
            } else {
                stopTurnTimer();
                forceRandomAction(team);
                return;
            }
        }
        updateTimerDisplay();
        if (roomCode && !isRemoteAction) {
            sendMessage({
                type: "TIMER_SYNC",
                timerData: {
                    mainTimer: state.mainTimer,
                    reserveTimers: state.reserveTimers
                }
            });
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
    var availableHeroes = [];
    var attrs = ["strength","agility","intelligence","universal"];
    for (var a = 0; a < attrs.length; a++) {
        var attr = attrs[a];
        var heroes = state.availableHeroes[attr] || [];
        for (var i = 0; i < heroes.length; i++) {
            var hero = heroes[i];
            var isBanned = state.currentGameBans.some(function(b) { return b.hero === hero; });
            var isPicked = state.currentGamePicks.some(function(p) { return p.hero === hero; });
            if (!isBanned && !isPicked) {
                availableHeroes.push({ hero: hero, attribute: attr });
            }
        }
    }
    if (availableHeroes.length === 0) return;
    var randomPick = availableHeroes[Math.floor(Math.random() * availableHeroes.length)];
    if (state.phase === "ban") {
        applyBanLocally(randomPick.hero, randomPick.attribute, team);
        broadcastAction({ type: "ban", hero: randomPick.hero, attribute: randomPick.attribute, team: team });
        syncGameState();
        showToast("Авто-бан: " + randomPick.hero, "info");
    } else {
        applyPickLocally(randomPick.hero, randomPick.attribute, team);
        broadcastAction({ type: "pick", hero: randomPick.hero, attribute: randomPick.attribute, team: team });
        syncGameState();
        showToast("Авто-пик: " + randomPick.hero, "info");
    }
}

function updateTimerDisplay() {
    var timerMain = document.getElementById("timerMain");
    var timerReserve = document.getElementById("timerReserve");
    var timerContainer = document.getElementById("timerContainer");
    var turnInfo = document.getElementById("turnInfo");
    if (!state.seriesStarted || state.phase === "complete") {
        if (timerContainer) timerContainer.style.display = "none";
        if (turnInfo) turnInfo.style.display = "block";
        return;
    }
    if (timerContainer) timerContainer.style.display = "flex";
    if (turnInfo) turnInfo.style.display = "none";
    var team = state.currentTurn;
    var reserve = state.reserveTimers[team] || 0;
    var mainMin = Math.floor(Math.max(0, state.mainTimer) / 60);
    var mainSec = Math.max(0, state.mainTimer) % 60;
    if (timerMain) timerMain.textContent = (mainMin < 10 ? "0" : "") + mainMin + ":" + (mainSec < 10 ? "0" : "") + mainSec;
    var resMin = Math.floor(reserve / 60);
    var resSec = reserve % 60;
    if (timerReserve) timerReserve.textContent = "+" + resMin + ":" + (resSec < 10 ? "0" : "") + resSec;
    if (timerContainer) {
        timerContainer.classList.remove("warning", "danger");
        if (state.mainTimer <= 10 && state.mainTimer > 0) {
            timerContainer.classList.add("warning");
        } else if (state.mainTimer === 0) {
            timerContainer.classList.add("danger");
        }
    }
}

// ==================== HELPERS ====================
function shuffleArray(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = a[i];
        a[i] = a[j];
        a[j] = temp;
    }
    return a;
}

function getAvailablePool(attr) {
    var all = ALL_HEROES[attr] || [];
    return all.filter(function(h) {
        return state.seriesBannedHeroes.indexOf(h) === -1;
    });
}

function generateHeroPool() {
    var pool = { strength: [], agility: [], intelligence: [], universal: [] };
    var attrs = ["strength","agility","intelligence","universal"];
    for (var i = 0; i < attrs.length; i++) {
        var attr = attrs[i];
        var available = getAvailablePool(attr);
        pool[attr] = shuffleArray(available).slice(0, config.heroesPerAttribute);
    }
    return pool;
}

function getBanStepTeam(s) {
    return config.banOrder[s] || (s % 2 === 0 ? "radiant" : "dire");
}

function getPickStepTeam(s) {
    return config.pickOrder[s] || (s % 2 === 0 ? "radiant" : "dire");
}

function totalBans() {
    return config.bansPerTeam * 2;
}

function totalPicks() {
    return config.picksPerTeam * 2;
}

// ==================== GAME ACTIONS ====================
function claimCaptain(team) {
    if (!roomCode) {
        showToast("Сначала подключитесь к комнате!", "error");
        return;
    }
    if (serverCaptains[team]) {
        showToast("Капитан " + (team === "radiant" ? "Radiant" : "Dire") + " уже выбран!", "error");
        return;
    }
    pendingCaptainTeam = team;
    document.getElementById("captainNameModal").classList.remove("hidden");
    document.getElementById("captainNameInput").value = "";
    document.getElementById("captainNameInput").focus();
}

var pendingCaptainTeam = null;

function confirmCaptainName() {
    var input = document.getElementById("captainNameInput");
    var name = input.value.trim() || ("Капитан " + (pendingCaptainTeam === "radiant" ? "Radiant" : "Dire"));
    var team = pendingCaptainTeam;
    document.getElementById("captainNameModal").classList.add("hidden");
    pendingCaptainTeam = null;
    captains[team] = { name: name, id: "local" };
    sendMessage({ type: "CLAIM_CAPTAIN", team: team, name: name });
    serverCaptains[team] = name;
    renderAll();
    updateUI();
    showToast("Вы стали капитаном " + (team === "radiant" ? "Radiant" : "Dire") + "!", "success");
}

function leaveCaptain(team) {
    if (captains[team] && captains[team].id === "remote") return;
    captains[team] = null;
    sendMessage({ type: "LEAVE_CAPTAIN", team: team });
    serverCaptains[team] = null;
    renderAll();
    updateUI();
}

function startNewSeries() {
    if (!isLocalCaptain() && state.seriesStarted) {
        showToast("Только капитан может начать новую серию", "error");
        return;
    }
    if (!state.seriesStarted || state.phase === "complete") {
        document.getElementById("startSideModal").classList.remove("hidden");
    } else {
        doStartNewSeries(config.banOrder[0]);
    }
}

function doStartNewSeries(startingTeam) {
    setOrderByStartingTeam(startingTeam);
    state = createInitialState();
    state.seriesStarted = true;
    state.availableHeroes = generateHeroPool();
    state.phase = "ban";
    state.step = 0;
    state.currentTurn = config.banOrder[0];
    renderAll();
    updateUI();
    broadcastAction({ type: "new_series", startingTeam: startingTeam, serializedState: serializeState() });
    syncGameState();
    var starter = startingTeam === "radiant" ? "Radiant" : "Dire";
    showToast("Новая серия началась! " + starter + " начинает ⚔️", "success");
}

function applyNewSeriesLocally(ss) {
    if (ss) {
        deserializeState(ss);
    } else {
        state = createInitialState();
        state.seriesStarted = true;
        state.availableHeroes = generateHeroPool();
        state.phase = "ban";
        state.step = 0;
        state.currentTurn = config.banOrder[0];
    }
    renderAll();
    updateUI();
}

function banHero(hero, attribute) {
    if (!isLocalCaptain()) {
        showToast("Только капитаны могут банить", "error");
        return;
    }
    if (state.phase !== "ban") {
        showToast("Сейчас фаза пиков!", "error");
        return;
    }
    if (!state.seriesStarted) {
        showToast("Начните новую серию!", "error");
        return;
    }
    var team = getBanStepTeam(state.step);
    if (state.bans[team].length >= config.bansPerTeam) {
        showToast("Команда сделала все баны!", "error");
        return;
    }
    if (!isMyCaptain(team)) {
        showToast("Это не ваш бан!", "error");
        return;
    }
    var alreadyUsed = state.currentGameBans.some(function(b) { return b.hero === hero; }) ||
                      state.currentGamePicks.some(function(p) { return p.hero === hero; });
    if (alreadyUsed) {
        showToast("Герой уже выбран", "error");
        return;
    }
    applyBanLocally(hero, attribute, team);
    broadcastAction({ type: "ban", hero: hero, attribute: attribute, team: team });
    syncGameState();
}

function applyBanLocally(hero, attribute, team) {
    state.currentGameBans.push({ hero: hero, attribute: attribute, team: team });
    state.bans[team].push(hero);
    state.step++;
    if (state.step >= totalBans()) {
        state.phase = "pick";
        state.step = 0;
        state.currentTurn = config.pickOrder[0];
    } else {
        state.currentTurn = getBanStepTeam(state.step);
    }
    state.mainTimer = 30;
    renderAll();
    updateUI();
    startTurnTimer(state.currentTurn);
}

function pickHero(hero, attribute) {
    if (!isLocalCaptain()) {
        showToast("Только капитаны могут пикать", "error");
        return;
    }
    if (state.phase !== "pick") {
        showToast("Сейчас фаза банов!", "error");
        return;
    }
    if (!state.seriesStarted) {
        showToast("Начните новую серию!", "error");
        return;
    }
    var team = getPickStepTeam(state.step);
    if (state.picks[team].length >= config.picksPerTeam) {
        showToast("Команда набрала всех героев!", "error");
        return;
    }
    if (!isMyCaptain(team)) {
        showToast("Это не ваш пик!", "error");
        return;
    }
    var alreadyUsed = state.currentGameBans.some(function(b) { return b.hero === hero; }) ||
                      state.currentGamePicks.some(function(p) { return p.hero === hero; });
    if (alreadyUsed) {
        showToast("Герой уже выбран", "error");
        return;
    }
    applyPickLocally(hero, attribute, team);
    broadcastAction({ type: "pick", hero: hero, attribute: attribute, team: team });
    syncGameState();
}

function applyPickLocally(hero, attribute, team) {
    state.currentGamePicks.push({ hero: hero, attribute: attribute, team: team });
    state.picks[team].push(hero);
    state.step++;
    if (state.step >= totalPicks()) {
        state.phase = "complete";
        stopTurnTimer();
        addCurrentGameToHistory();
        syncGameState();
    } else {
        state.currentTurn = getPickStepTeam(state.step);
        state.mainTimer = 30;
    }
    renderAll();
    updateUI();
    if (state.phase !== "complete") {
        startTurnTimer(state.currentTurn);
        checkSkipFullTeam();
    }
}

function checkSkipFullTeam() {
    var team = state.currentTurn;
    if (state.picks[team].length >= config.picksPerTeam) {
        state.step++;
        if (state.step >= totalPicks()) {
            state.phase = "complete";
            stopTurnTimer();
            addCurrentGameToHistory();
            syncGameState();
        } else {
            state.currentTurn = getPickStepTeam(state.step);
            state.mainTimer = 30;
        }
        renderAll();
        updateUI();
        if (state.phase !== "complete") {
            startTurnTimer(state.currentTurn);
            checkSkipFullTeam();
        }
    }
}

function addCurrentGameToHistory() {
    var exists = state.seriesHistory.some(function(g) {
        return g.gameNumber === state.currentGame;
    });
    if (exists) return;
    state.seriesHistory.push({
        gameNumber: state.currentGame,
        bans: JSON.parse(JSON.stringify(state.bans)),
        picks: JSON.parse(JSON.stringify(state.picks))
    });
}

function undoLastAction() {
    if (!isLocalCaptain()) {
        showToast("Только капитаны могут отменять действия", "error");
        return;
    }
    if (!state.seriesStarted) return;
    if (state.phase === "complete") {
        showToast("Игра завершена, отмена невозможна.", "error");
        return;
    }
    var hasBans = state.currentGameBans.length > 0;
    var hasPicks = state.currentGamePicks.length > 0;
    if (!hasBans && !hasPicks) {
        showToast("Нечего отменять!", "error");
        return;
    }
    applyUndoLocally();
    broadcastAction({ type: "undo" });
    syncGameState();
}

function applyUndoLocally() {
    if (state.phase === "pick" && state.currentGamePicks.length > 0) {
        var last = state.currentGamePicks.pop();
        state.picks[last.team].pop();
        state.step--;
        state.currentTurn = getPickStepTeam(state.step);
    } else if (state.phase === "ban" && state.currentGameBans.length > 0) {
        var last = state.currentGameBans.pop();
        state.bans[last.team].pop();
        state.step--;
        state.currentTurn = getBanStepTeam(state.step);
    } else if (state.phase === "pick" && state.currentGamePicks.length === 0 && state.currentGameBans.length > 0) {
        var last = state.currentGameBans.pop();
        state.bans[last.team].pop();
        state.phase = "ban";
        state.step = totalBans() - 1;
        state.currentTurn = getBanStepTeam(state.step);
    }
    state.mainTimer = 30;
    renderAll();
    updateUI();
    startTurnTimer(state.currentTurn);
    showToast("Действие отменено ↩", "info");
}

function nextGame() {
    if (!isLocalCaptain()) {
        showToast("Только капитаны могут перейти к следующей игре", "error");
        return;
    }
    if (state.phase !== "complete") {
        showToast("Сначала завершите драфт!", "error");
        return;
    }
    applyNextGameLocally();
    broadcastAction({ type: "next_game" });
    syncGameState();
}

function applyNextGameLocally() {
    var currentBanned = state.seriesBannedHeroes.slice();
    state.currentGamePicks.forEach(function(p) {
        if (currentBanned.indexOf(p.hero) === -1) {
            currentBanned.push(p.hero);
        }
    });
    var nextGameNum = state.currentGame + 1;
    state = createInitialState();
    state.currentGame = nextGameNum;
    state.seriesBannedHeroes = currentBanned;
    state.availableHeroes = generateHeroPool();
    state.phase = "ban";
    state.step = 0;
    state.currentTurn = config.banOrder[0];
    state.seriesStarted = true;
    renderAll();
    updateUI();
    showToast("Игра " + state.currentGame + " началась! Фаза банов", "info");
}

// ==================== RENDER ====================
function renderAll() {
    renderHeroPool();
    renderTeamBans("radiant");
    renderTeamBans("dire");
    renderTeamPicks("radiant");
    renderTeamPicks("dire");
    renderHistoryPanel();
    updateAttrCounts();
    updateGameBadge();
    updatePhaseBadge();
    updateScoreDisplay();
    renderCaptainBar();
    updateButtons();
    updateTimerDisplay();
    updateSpectatorUI();
}

function renderHeroPool() {
    var grids = { strength: "strengthGrid", agility: "agilityGrid", intelligence: "intelligenceGrid", universal: "universalGrid" };
    for (var attr in grids) {
        if (!grids.hasOwnProperty(attr)) continue;
        var grid = document.getElementById(grids[attr]);
        if (!grid) continue;
        var heroes = state.availableHeroes[attr] || [];
        grid.innerHTML = "";
        if (!state.seriesStarted) {
            grid.innerHTML = '<div class="text-muted" style="grid-column:1/-1;padding:12px;font-size:0.65rem;">Начните серию</div>';
            continue;
        }
        if (heroes.length === 0) {
            grid.innerHTML = '<div class="text-muted" style="grid-column:1/-1;padding:12px;font-size:0.65rem;">Нет героев</div>';
            continue;
        }
        for (var i = 0; i < heroes.length; i++) {
            (function(hero) {
                var card = document.createElement("div");
                var isBanned = state.currentGameBans.some(function(b) { return b.hero === hero; });
                var isPicked = state.currentGamePicks.some(function(p) { return p.hero === hero; });
                var isSeriesBanned = state.seriesBannedHeroes.indexOf(hero) !== -1;
                var cls = "hero-card " + attr;
                if (isSeriesBanned) cls += " series-banned";
                else if (isPicked) cls += " picked";
                else if (isBanned) cls += " banned";
                card.className = cls;
                var imgUrl = getHeroImageUrl(hero);
                if (imgUrl) {
                    card.style.backgroundImage = "url(" + imgUrl + ")";
                } else {
                    card.style.backgroundColor = getAttrBg(attr);
                }
                var inner = '<div class="hero-info"><span class="hero-name">' + hero + '</span><span class="hero-attr-badge">' + getAttrLabel(attr) + '</span></div>';
                if (isBanned && !isSeriesBanned && !isPicked) {
                    inner += '<span class="banned-overlay">🚫</span>';
                }
                card.innerHTML = inner;
                if (!isSeriesBanned && !isPicked && !isBanned) {
                    if (state.phase === "ban") {
                        card.onclick = function() { banHero(hero, attr); };
                    } else if (state.phase === "pick") {
                        card.onclick = function() { pickHero(hero, attr); };
                    }
                }
                grid.appendChild(card);
            })(heroes[i]);
        }
        var needed = config.heroesPerAttribute - heroes.length;
        for (var j = 0; j < needed; j++) {
            var empty = document.createElement("div");
            empty.className = "hero-card series-banned";
            empty.innerHTML = '<div class="hero-info"><span class="hero-name" style="color:#333;">Заблокирован</span></div>';
            grid.appendChild(empty);
        }
    }
}

function renderTeamBans(team) {
    var container = document.getElementById(team + "BanSlots");
    if (!container) return;
    var bans = state.bans[team] || [];
    container.innerHTML = "";
    for (var i = 0; i < config.bansPerTeam; i++) {
        var slot = document.createElement("div");
        slot.className = "ban-slot";
        if (i < bans.length) {
            slot.className += " filled";
            var imgUrl = getHeroImageUrl(bans[i]);
            if (imgUrl) {
                slot.style.backgroundImage = "url(" + imgUrl + ")";
                slot.style.backgroundSize = "cover";
                slot.style.backgroundPosition = "center 20%";
            } else {
                slot.style.background = getAttrBg("strength");
            }
            slot.title = bans[i];
        } else {
            slot.className += " empty";
        }
        container.appendChild(slot);
    }
}

function renderTeamPicks(team) {
    var container = document.getElementById(team + "Picks");
    if (!container) return;
    var picks = state.picks[team] || [];
    container.innerHTML = "";
    for (var i = 0; i < config.picksPerTeam; i++) {
        var slot = document.createElement("div");
        slot.className = "pick-slot";
        if (i < picks.length) {
            slot.className += " filled " + team + "-pick";
            var imgUrl = getHeroImageUrl(picks[i]);
            if (imgUrl) slot.style.backgroundImage = "url(" + imgUrl + ")";
            slot.innerHTML = "<span>" + picks[i] + "</span>";
            slot.title = picks[i];
        } else {
            slot.className += " empty";
            slot.textContent = "ПУСТО";
        }
        slot.dataset.slot = team + "-" + i;
        container.appendChild(slot);
    }
}

function renderHistoryPanel() {
    var list = document.getElementById("historyList");
    if (!list) return;
    if (state.seriesHistory.length === 0) {
        list.innerHTML = '<p class="text-muted">Нет завершённых игр</p>';
        return;
    }
    var html = "";
    var reversed = state.seriesHistory.slice().reverse();
    for (var i = 0; i < reversed.length; i++) {
        var game = reversed[i];
        html += '<div class="history-game"><div class="history-game-number">Игра ' + game.gameNumber + '</div>';
        if (game.picks && game.picks.radiant && game.picks.radiant.length > 0) {
            html += '<div class="history-team-row"><span class="history-team-label radiant">R</span>';
            for (var j = 0; j < game.picks.radiant.length; j++) {
                var hero = game.picks.radiant[j];
                var img = getHeroImageUrl(hero);
                html += '<div class="history-hero-icon" style="background-image:url(' + img + ')" title="' + hero + '"></div>';
            }
            html += '</div>';
        }
        if (game.picks && game.picks.dire && game.picks.dire.length > 0) {
            html += '<div class="history-team-row"><span class="history-team-label dire">D</span>';
            for (var k = 0; k < game.picks.dire.length; k++) {
                var hero = game.picks.dire[k];
                var img = getHeroImageUrl(hero);
                html += '<div class="history-hero-icon" style="background-image:url(' + img + ')" title="' + hero + '"></div>';
            }
            html += '</div>';
        }
        html += '</div>';
    }
    list.innerHTML = html;
}

function renderCaptainBar() {
    var rEmpty = document.getElementById("radiantCaptainEmpty");
    var rFilled = document.getElementById("radiantCaptainFilled");
    var rName = document.getElementById("radiantCaptainName");
    var dEmpty = document.getElementById("direCaptainEmpty");
    var dFilled = document.getElementById("direCaptainFilled");
    var dName = document.getElementById("direCaptainName");

    if (captains.radiant) {
        rEmpty.classList.add("hidden");
        rFilled.classList.remove("hidden");
        rName.textContent = captains.radiant.name;
    } else {
        rEmpty.classList.remove("hidden");
        rFilled.classList.add("hidden");
    }
    if (captains.dire) {
        dEmpty.classList.add("hidden");
        dFilled.classList.remove("hidden");
        dName.textContent = captains.dire.name;
    } else {
        dEmpty.classList.remove("hidden");
        dFilled.classList.add("hidden");
    }
    updateSpectatorUI();
}

function updateAttrCounts() {
    var map = { strCount: "strength", agiCount: "agility", intCount: "intelligence", uniCount: "universal" };
    for (var id in map) {
        if (!map.hasOwnProperty(id)) continue;
        var attr = map[id];
        var heroes = state.availableHeroes[attr] || [];
        var selectable = heroes.filter(function(h) {
            var banned = state.currentGameBans.some(function(b) { return b.hero === h; });
            var picked = state.currentGamePicks.some(function(p) { return p.hero === h; });
            return !banned && !picked;
        }).length;
        var el = document.getElementById(id);
        if (el) el.textContent = selectable + "/" + config.heroesPerAttribute;
    }
}

function updateGameBadge() {
    document.getElementById("gameBadge").textContent = "Игра " + state.currentGame;
}

function updatePhaseBadge() {
    var b = document.getElementById("phaseBadge");
    if (!state.seriesStarted) {
        b.textContent = "Ожидание";
        b.className = "phase-badge waiting";
        return;
    }
    if (state.phase === "ban") {
        b.textContent = "Фаза банов";
        b.className = "phase-badge ban-phase";
    } else if (state.phase === "pick") {
        b.textContent = "Фаза пиков";
        b.className = "phase-badge pick-phase";
    } else {
        b.textContent = "Завершено";
        b.className = "phase-badge complete";
    }
}

function updateScoreDisplay() {
    document.getElementById("radiantScore").textContent = state.radiantScore;
    document.getElementById("direScore").textContent = state.direScore;
}

function updateUI() {
    updateTurnDisplay();
    updateButtons();
    updateGameBadge();
    updatePhaseBadge();
    updateScoreDisplay();
    updateTimerDisplay();
}

function updateTurnDisplay() {
    var rT = document.getElementById("radiantTurn");
    var dT = document.getElementById("direTurn");
    var tI = document.getElementById("turnInfo");
    if (!state.seriesStarted) {
        if (rT) rT.classList.add("hidden");
        if (dT) dT.classList.add("hidden");
        if (tI) {
            tI.textContent = "Подключитесь к комнате для начала";
            tI.className = "turn-info";
        }
        resetPanelGlows();
        return;
    }
    if (state.phase === "complete") {
        if (rT) rT.classList.add("hidden");
        if (dT) dT.classList.add("hidden");
        if (tI) {
            tI.textContent = "Драфт завершён";
            tI.className = "turn-info";
        }
        resetPanelGlows();
        return;
    }
    var isR = state.currentTurn === "radiant";
    if (rT) rT.classList.toggle("hidden", !isR);
    if (dT) dT.classList.toggle("hidden", isR);
    var rP = document.getElementById("radiantPanel");
    var dP = document.getElementById("direPanel");
    if (rP && dP) {
        rP.style.boxShadow = isR ? "0 0 25px var(--radiant-glow)" : "none";
        dP.style.boxShadow = !isR ? "0 0 25px var(--dire-glow)" : "none";
    }
    startTurnTimer(state.currentTurn);
}

function resetPanelGlows() {
    var r = document.getElementById("radiantPanel");
    var d = document.getElementById("direPanel");
    if (r) r.style.boxShadow = "none";
    if (d) d.style.boxShadow = "none";
}

function updateButtons() {
    var u = document.getElementById("btnUndo");
    var n = document.getElementById("btnNextGame");
    var hasActions = (state.phase === "ban" && state.currentGameBans.length > 0) ||
                     (state.phase === "pick" && (state.currentGamePicks.length > 0 || state.currentGameBans.length > 0));
    if (u) u.disabled = !state.seriesStarted || !hasActions || state.phase === "complete" || !isLocalCaptain();
    if (n) n.disabled = !state.seriesStarted || state.phase !== "complete" || !isLocalCaptain();
}

// ==================== MODALS ====================
function showSettingsModal() {
    document.getElementById("settingHeroesPerAttr").value = config.heroesPerAttribute;
    document.getElementById("settingBansPerTeam").value = config.bansPerTeam;
    document.getElementById("settingPicksPerTeam").value = config.picksPerTeam;
    document.getElementById("settingBanOrder").value = config.banOrder.join(",");
    document.getElementById("settingPickOrder").value = config.pickOrder.join(",");
    document.getElementById("settingsModal").classList.remove("hidden");
}

function hideSettingsModal() {
    document.getElementById("settingsModal").classList.add("hidden");
}

function applySettings() {
    var hpa = Math.max(5, Math.min(15, parseInt(document.getElementById("settingHeroesPerAttr").value) || 10));
    var bpt = Math.max(1, Math.min(5, parseInt(document.getElementById("settingBansPerTeam").value) || 3));
    var ppt = Math.max(3, Math.min(5, parseInt(document.getElementById("settingPicksPerTeam").value) || 5));
    var banRaw = (document.getElementById("settingBanOrder").value || "R,D,R,D,R,D").split(",").map(function(s) { return s.trim().toLowerCase(); });
    var pickRaw = (document.getElementById("settingPickOrder").value || "R,D,D,R,R,D,D,R,R,D").split(",").map(function(s) { return s.trim().toLowerCase(); });
    var parseTeam = function(s) {
        if (s === "r" || s === "radiant") return "radiant";
        if (s === "d" || s === "dire") return "dire";
        return null;
    };
    var banOrder = banRaw.map(parseTeam).filter(Boolean);
    var pickOrder = pickRaw.map(parseTeam).filter(Boolean);
    if (banOrder.length !== bpt * 2) {
        showToast("Порядок банов: ровно " + (bpt * 2) + " элементов!", "error");
        return;
    }
    if (pickOrder.length !== ppt * 2) {
        showToast("Порядок пиков: ровно " + (ppt * 2) + " элементов!", "error");
        return;
    }
    config.heroesPerAttribute = hpa;
    config.bansPerTeam = bpt;
    config.picksPerTeam = ppt;
    config.banOrder = banOrder;
    config.pickOrder = pickOrder;
    hideSettingsModal();
    if (state.seriesStarted) startNewSeries();
    showToast("Настройки применены!", "success");
}

function showHistoryModal() {
    var content = document.getElementById("historyContent");
    if (!content) return;
    if (state.seriesHistory.length === 0 && state.currentGameBans.length === 0 && state.currentGamePicks.length === 0) {
        content.innerHTML = '<p class="text-muted">Серия ещё не начата.</p>';
    } else {
        var html = '<div style="display:flex;flex-direction:column;gap:14px;">';
        for (var i = 0; i < state.seriesHistory.length; i++) {
            var g = state.seriesHistory[i];
            html += '<div style="border:1px solid var(--border-color);border-radius:8px;padding:12px;">' +
                    '<h4 style="margin-bottom:8px;">Игра ' + g.gameNumber + '</h4>' +
                    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
                    '<div><strong style="color:var(--radiant-color);">🏛️ Radiant</strong>' +
                    '<div style="font-size:0.7rem;margin-top:4px;"><span class="phase-tag ban">БАН</span> ' + (g.bans && g.bans.radiant ? g.bans.radiant.join(", ") : "—") + '</div>' +
                    '<div style="font-size:0.75rem;margin-top:2px;"><span class="phase-tag pick">ПИК</span> ' + (g.picks && g.picks.radiant ? g.picks.radiant.join(", ") : "—") + '</div></div>' +
                    '<div><strong style="color:var(--dire-color);">💀 Dire</strong>' +
                    '<div style="font-size:0.7rem;margin-top:4px;"><span class="phase-tag ban">БАН</span> ' + (g.bans && g.bans.dire ? g.bans.dire.join(", ") : "—") + '</div>' +
                    '<div style="font-size:0.75rem;margin-top:2px;"><span class="phase-tag pick">ПИК</span> ' + (g.picks && g.picks.dire ? g.picks.dire.join(", ") : "—") + '</div></div>' +
                    '</div></div>';
        }
        if ((state.currentGameBans.length > 0 || state.currentGamePicks.length > 0) &&
            !state.seriesHistory.some(function(g) { return g.gameNumber === state.currentGame; })) {
            html += '<div style="border:1px solid var(--accent-blue);border-radius:8px;padding:12px;opacity:0.8;">' +
                    '<h4 style="margin-bottom:8px;">Игра ' + state.currentGame + ' (текущая)</h4>' +
                    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
                    '<div><strong style="color:var(--radiant-color);">🏛️ Radiant</strong>' +
                    '<div style="font-size:0.7rem;margin-top:4px;"><span class="phase-tag ban">БАН</span> ' + state.bans.radiant.join(", ") + '</div>' +
                    '<div style="font-size:0.75rem;margin-top:2px;"><span class="phase-tag pick">ПИК</span> ' + state.picks.radiant.join(", ") + '</div></div>' +
                    '<div><strong style="color:var(--dire-color);">💀 Dire</strong>' +
                    '<div style="font-size:0.7rem;margin-top:4px;"><span class="phase-tag ban">БАН</span> ' + state.bans.dire.join(", ") + '</div>' +
                    '<div style="font-size:0.75rem;margin-top:2px;"><span class="phase-tag pick">ПИК</span> ' + state.picks.dire.join(", ") + '</div></div>' +
                    '</div></div>';
        }
        html += '</div>';
        content.innerHTML = html;
    }
    document.getElementById("historyModal").classList.remove("hidden");
}

function hideHistoryModal() {
    document.getElementById("historyModal").classList.add("hidden");
}

function showSeriesBannedModal() {
    var content = document.getElementById("seriesBannedContent");
    if (!content) return;
    if (state.seriesBannedHeroes.length === 0) {
        content.innerHTML = '<p class="text-muted">Пока нет заблокированных героев.</p>';
    } else {
        var html = '<div class="series-banned-grid">';
        var sorted = state.seriesBannedHeroes.slice().sort();
        for (var i = 0; i < sorted.length; i++) {
            var hero = sorted[i];
            var imgUrl = getHeroImageUrl(hero);
            var found
