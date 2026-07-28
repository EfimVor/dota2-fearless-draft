/* Dota 2 Fearless Draft Client v12 - полностью переписан */

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
    return k ? ("https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/" + k + ".png") : "";
}

function getAttrBg(a) {
    var c = { strength:"#1a100e", agility:"#0e1a12", intelligence:"#0e141a", universal:"#160e1a" };
    return c[a] || "#111";
}

function getAttrLabel(a) {
    var l = { strength:"Сила", agility:"Ловкость", intelligence:"Интеллект", universal:"Универсал" };
    return l[a] || a;
}

// ==================== CONFIG ====================
var CONFIG = {
    heroesPerAttribute: 10,
    bansPerTeam: 3,
    picksPerTeam: 5,
    banOrder: ["radiant","dire","radiant","dire","radiant","dire"],
    pickOrder: ["radiant","dire","dire","radiant","radiant","dire","dire","radiant","radiant","dire"]
};

// ==================== NETWORKING ====================
var ws = null;
var roomCode = null;
var serverCaptains = { radiant: null, dire: null };
var isRemoteAction = false;

function connect() {
    if (ws && ws.readyState === WebSocket.OPEN) return;
    var url = (location.protocol === "https:" ? "wss:" : "ws:") + "//" + location.host;
    setStatus("connecting", "Подключение...");
    try {
        ws = new WebSocket(url);
        ws.onopen = onOpen;
        ws.onmessage = onMessage;
        ws.onclose = onClose;
        ws.onerror = onError;
    } catch(e) {
        setStatus("disconnected", "Сервер недоступен");
        setTimeout(connect, 5000);
    }
}

function onOpen() {
    setStatus("connected", "Подключен к серверу");
    var p = new URLSearchParams(location.search);
    var r = p.get("room");
    if (r && !roomCode) joinRoom(r);
}

function onClose() {
    setStatus("disconnected", "Соединение потеряно");
    ws = null;
    setTimeout(connect, 3000);
}

function onError() {
    setStatus("disconnected", "Ошибка соединения");
}

function onMessage(e) {
    var msg = JSON.parse(e.data);
    switch(msg.type) {
        case "ROOM_CREATED":
        case "ROOM_JOINED":
            roomCode = msg.roomCode;
            serverCaptains = msg.captains || { radiant: null, dire: null };
            document.getElementById("roomCodeDisplay").textContent = roomCode;
            document.getElementById("connInfo").style.display = "flex";
            syncCaptainsFromServer();
            if (msg.state) { isRemoteAction = true; loadState(msg.state); isRemoteAction = false; refresh(); }
            setStatus("connected", "Комната " + roomCode);
            toast(msg.type === "ROOM_CREATED" ? "Комната создана! Отправьте код." : "Подключились к комнате!", "success");
            break;
        case "CAPTAIN_CLAIMED":
            serverCaptains[msg.team] = msg.name; syncCaptainsFromServer(); refresh();
            toast(msg.name + " — капитан " + (msg.team === "radiant" ? "Radiant" : "Dire") + "!", "info");
            break;
        case "CAPTAIN_LEFT":
            serverCaptains[msg.team] = null; syncCaptainsFromServer(); refresh(); break;
        case "STATE_SYNC":
            serverCaptains = msg.captains || serverCaptains;
            if (msg.state) { isRemoteAction = true; loadState(msg.state); isRemoteAction = false; refresh(); }
            break;
        case "GAME_ACTION":
            isRemoteAction = true; remoteAction(msg.action); isRemoteAction = false;
            if (msg.captains) serverCaptains = msg.captains;
            refresh(); break;
        case "TIMER_TICK":
            if (msg.timerData) {
                game.mainTimer = msg.timerData.mainTimer;
                if (msg.timerData.reserveTimers) game.reserveTimers = msg.timerData.reserveTimers;
                updateTimerDisplay();
            }
            break;
        case "PLAYER_JOINED": toast("Игрок подключился", "info"); break;
        case "PLAYER_LEFT": toast("Игрок отключился", "info"); break;
        case "ERROR": toast(msg.message, "error"); break;
    }
}

function send(m) { if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(m)); }
function syncState() { if (roomCode) send({ type:"SYNC_STATE", state: saveState() }); }
function broadcastAction(a) { if (roomCode && !isRemoteAction) { send({ type:"GAME_ACTION", action: a }); syncState(); } }

function remoteAction(a) {
    switch(a.type) {
        case "ban": applyBanLocally(a.hero, a.attribute, a.team); break;
        case "pick": applyPickLocally(a.hero, a.attribute, a.team); break;
        case "undo": undoLocal(); break;
        case "new_series": applyNewSeriesLocally(a.serializedState); break;
        case "next_game": nextGameLocal(); break;
    }
}

// ==================== UI HELPERS ====================
function setStatus(s, t) {
    var d = document.querySelector(".conn-dot");
    var e = document.getElementById("connText");
    if (d) d.className = "conn-dot " + s;
    if (e) e.textContent = t;
}

function createRoom() { send({ type:"CREATE_ROOM" }); }

function joinRoom(code) {
    if (!code) code = document.getElementById("joinRoomInput").value.trim();
    if (!code || code.length !== 6) { toast("Введите 6-значный код", "error"); return; }
    send({ type:"JOIN_ROOM", roomCode: code });
    var u = new URL(location);
    u.searchParams.set("room", code);
    history.replaceState({}, "", u);
}

function copyLink() {
    if (!roomCode) return;
    var link = location.origin + location.pathname + "?room=" + roomCode;
    navigator.clipboard.writeText(link).then(function() { toast("Ссылка скопирована!", "success"); }).catch(function() {
        var h = document.getElementById("copyHelper");
        h.value = link; h.select(); document.execCommand("copy"); toast("Ссылка скопирована!", "success");
    });
}

// ==================== CAPTAINS ====================
var captains = { radiant: null, dire: null };

function syncCaptainsFromServer() {
    if (serverCaptains.radiant && (!captains.radiant || captains.radiant.id !== "local")) captains.radiant = { name: serverCaptains.radiant, id: "remote" };
    else if (!serverCaptains.radiant && captains.radiant && captains.radiant.id !== "local") captains.radiant = null;
    if (serverCaptains.dire && (!captains.dire || captains.dire.id !== "local")) captains.dire = { name: serverCaptains.dire, id: "remote" };
    else if (!serverCaptains.dire && captains.dire && captains.dire.id !== "local") captains.dire = null;
}

function isMyCaptain(team) { return !captains[team] || captains[team].id !== "remote"; }
function isLocalCaptain() { return (captains.radiant && captains.radiant.id === "local") || (captains.dire && captains.dire.id === "local"); }
function isSpectator() { return !isLocalCaptain(); }

function updateSpectatorUI() {
    var cr = document.getElementById("btnClaimRadiant");
    var cd = document.getElementById("btnClaimDire");
    if (isSpectator() && roomCode && captains.radiant && captains.dire) {
        if (cr) cr.style.display = "none";
        if (cd) cd.style.display = "none";
        toast("Вы зритель 👁️", "info");
    } else {
        if (cr) cr.style.display = "";
        if (cd) cd.style.display = "";
    }
}

// ==================== GAME STATE ====================
function freshState() {
    return {
        seriesStarted: false, currentGame: 1,
        availableHeroes: { strength:[], agility:[], intelligence:[], universal:[] },
        phase: "ban", step: 0, currentTurn: "radiant",
        bans: { radiant:[], dire:[] }, picks: { radiant:[], dire:[] },
        currentGameBans: [], currentGamePicks: [],
        seriesBannedHeroes: [],
        seriesHistory: [],
        radiantScore: 0, direScore: 0,
        mainTimer: 30,
        reserveTimers: { radiant:130, dire:130 }
    };
}
var game = freshState();

function saveState() {
    return {
        seriesStarted: game.seriesStarted, currentGame: game.currentGame,
        availableHeroes: JSON.parse(JSON.stringify(game.availableHeroes)),
        phase: game.phase, step: game.step, currentTurn: game.currentTurn,
        bans: JSON.parse(JSON.stringify(game.bans)), picks: JSON.parse(JSON.stringify(game.picks)),
        currentGameBans: game.currentGameBans.slice(), currentGamePicks: game.currentGamePicks.slice(),
        seriesBannedHeroes: game.seriesBannedHeroes.slice(),
        seriesHistory: JSON.parse(JSON.stringify(game.seriesHistory)),
        radiantScore: game.radiantScore, direScore: game.direScore,
        mainTimer: game.mainTimer,
        reserveTimers: { radiant:game.reserveTimers.radiant, dire:game.reserveTimers.dire }
    };
}

function loadState(s) {
    if (!s) return;
    game.seriesStarted = s.seriesStarted;
    game.currentGame = s.currentGame;
    game.availableHeroes = s.availableHeroes;
    game.phase = s.phase;
    game.step = s.step;
    game.currentTurn = s.currentTurn;
    game.bans = s.bans;
    game.picks = s.picks;
    game.currentGameBans = s.currentGameBans || [];
    game.currentGamePicks = s.currentGamePicks || [];
    game.seriesBannedHeroes = s.seriesBannedHeroes || [];
    game.seriesHistory = s.seriesHistory || [];
    game.radiantScore = s.radiantScore || 0;
    game.direScore = s.direScore || 0;
    game.mainTimer = s.mainTimer !== undefined ? s.mainTimer : 30;
    game.reserveTimers = s.reserveTimers || { radiant:130, dire:130 };
}

// ==================== TIMER ====================
var timerInterval = null;

function startTurnTimer(team) {
    stopTurnTimer();
    updateTimerDisplay();
    if (!game.seriesStarted || game.phase === "complete") return;
    if (game.currentTurn !== team || (captains[team] && captains[team].id !== "local")) return;
    timerInterval = setInterval(function() {
        if (game.phase === "complete") { stopTurnTimer(); return; }
        if (game.mainTimer > 0) { game.mainTimer--; }
        else if (game.reserveTimers[team] > 0) { game.reserveTimers[team]--; }
        else { stopTurnTimer(); forceRandomAction(team); return; }
        updateTimerDisplay();
        if (roomCode && !isRemoteAction) {
            send({ type:"TIMER_SYNC", timerData: { mainTimer: game.mainTimer, reserveTimers: game.reserveTimers } });
        }
    }, 1000);
}

function stopTurnTimer() { if (timerInterval) { clearInterval(timerInterval); timerInterval = null; } }

function forceRandomAction(team) {
    var pool = [];
    var attrs = ["strength","agility","intelligence","universal"];
    for (var i = 0; i < attrs.length; i++) {
        var heroes = game.availableHeroes[attrs[i]] || [];
        for (var j = 0; j < heroes.length; j++) {
            var h = heroes[j];
            var banned = game.currentGameBans.some(function(b) { return b.hero === h; });
            var picked = game.currentGamePicks.some(function(p) { return p.hero === h; });
            if (!banned && !picked) pool.push({ hero: h, attribute: attrs[i] });
        }
    }
    if (pool.length === 0) return;
    var pick = pool[Math.floor(Math.random() * pool.length)];
    if (game.phase === "ban") {
        applyBanLocally(pick.hero, pick.attribute, team);
        broadcastAction({ type:"ban", hero: pick.hero, attribute: pick.attribute, team: team });
    } else {
        applyPickLocally(pick.hero, pick.attribute, team);
        broadcastAction({ type:"pick", hero: pick.hero, attribute: pick.attribute, team: team });
    }
    syncState();
    toast("Авто-" + (game.phase === "ban" ? "бан: " : "пик: ") + pick.hero, "info");
}

function updateTimerDisplay() {
    var mainEl = document.getElementById("timerMain");
    var reserveEl = document.getElementById("timerReserve");
    var container = document.getElementById("timerContainer");
    var info = document.getElementById("turnInfo");
    if (!game.seriesStarted || game.phase === "complete") {
        if (container) container.style.display = "none";
        if (info) info.style.display = "block";
        return;
    }
    if (container) container.style.display = "flex";
    if (info) info.style.display = "none";
    var team = game.currentTurn;
    var reserve = game.reserveTimers[team] || 0;
    var mm = Math.floor(Math.max(0, game.mainTimer) / 60);
    var ms = Math.max(0, game.mainTimer) % 60;
    if (mainEl) mainEl.textContent = (mm < 10 ? "0" : "") + mm + ":" + (ms < 10 ? "0" : "") + ms;
    var rm = Math.floor(reserve / 60);
    var rs = reserve % 60;
    if (reserveEl) reserveEl.textContent = "+" + rm + ":" + (rs < 10 ? "0" : "") + rs;
    if (container) {
        container.classList.remove("warning", "danger");
        if (game.mainTimer <= 10 && game.mainTimer > 0) container.classList.add("warning");
        else if (game.mainTimer === 0) container.classList.add("danger");
    }
}

// ==================== HELPERS ====================
function shuffle(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function availableInAttr(attr) { return (ALL_HEROES[attr] || []).filter(function(h) { return game.seriesBannedHeroes.indexOf(h) === -1; }); }
function generatePool() { var p = { strength:[], agility:[], intelligence:[], universal:[] }; var attrs = ["strength","agility","intelligence","universal"]; for (var i = 0; i < attrs.length; i++) { p[attrs[i]] = shuffle(availableInAttr(attrs[i])).slice(0, CONFIG.heroesPerAttribute); } return p; }
function banStepTeam(s) { return CONFIG.banOrder[s] || (s % 2 === 0 ? "radiant" : "dire"); }
function pickStepTeam(s) { return CONFIG.pickOrder[s] || (s % 2 === 0 ? "radiant" : "dire"); }
function totalBans() { return CONFIG.bansPerTeam * 2; }
function totalPicks() { return CONFIG.picksPerTeam * 2; }

// ==================== GAME ACTIONS ====================
function claimCaptain(team) {
    if (!roomCode) { toast("Сначала подключитесь к комнате!", "error"); return; }
    if (serverCaptains[team]) { toast("Капитан уже выбран", "error"); return; }
    pendingCaptain = team;
    document.getElementById("captainNameModal").classList.remove("hidden");
    document.getElementById("captainNameInput").value = "";
    document.getElementById("captainNameInput").focus();
}
var pendingCaptain = null;

function confirmCaptainName() {
    var input = document.getElementById("captainNameInput");
    var name = input.value.trim() || ("Капитан " + (pendingCaptain === "radiant" ? "Radiant" : "Dire"));
    var team = pendingCaptain;
    document.getElementById("captainNameModal").classList.add("hidden");
    pendingCaptain = null;
    captains[team] = { name: name, id: "local" };
    send({ type:"CLAIM_CAPTAIN", team: team, name: name });
    serverCaptains[team] = name;
    refresh();
    toast("Вы стали капитаном " + (team === "radiant" ? "Radiant" : "Dire") + "!", "success");
}

function leaveCaptain(team) {
    if (captains[team] && captains[team].id === "remote") return;
    captains[team] = null;
    send({ type:"LEAVE_CAPTAIN", team: team });
    serverCaptains[team] = null;
    refresh();
}

function startNewSeries() {
    if (!isLocalCaptain() && game.seriesStarted) { toast("Только капитан может начать", "error"); return; }
    if (!game.seriesStarted || game.phase === "complete") {
        document.getElementById("startSideModal").classList.remove("hidden");
    } else {
        doStartNewSeries(CONFIG.banOrder[0]);
    }
}

function doStartNewSeries(side) {
    if (side === "dire") {
        CONFIG.banOrder = ["dire","radiant","dire","radiant","dire","radiant"];
        CONFIG.pickOrder = ["dire","radiant","radiant","dire","dire","radiant","radiant","dire","dire","radiant"];
    } else {
        CONFIG.banOrder = ["radiant","dire","radiant","dire","radiant","dire"];
        CONFIG.pickOrder = ["radiant","dire","dire","radiant","radiant","dire","dire","radiant","radiant","dire"];
    }
    game = freshState();
    game.seriesStarted = true;
    game.availableHeroes = generatePool();
    game.phase = "ban"; game.step = 0; game.currentTurn = CONFIG.banOrder[0];
    refresh();
    broadcastAction({ type:"new_series", startingTeam: side, serializedState: saveState() });
    syncState();
    toast("Новая серия началась! " + (side === "radiant" ? "Radiant" : "Dire") + " начинает ⚔️", "success");
}

function applyNewSeriesLocally(s) {
    if (s) { loadState(s); } else { game = freshState(); game.seriesStarted = true; game.availableHeroes = generatePool(); game.currentTurn = CONFIG.banOrder[0]; }
    refresh();
}

function banHero(hero, attr) {
    if (!isLocalCaptain()) { toast("Только капитаны могут банить", "error"); return; }
    if (game.phase !== "ban") { toast("Сейчас фаза пиков!", "error"); return; }
    if (!game.seriesStarted) { toast("Начните новую серию!", "error"); return; }
    var team = banStepTeam(game.step);
    if (game.bans[team].length >= CONFIG.bansPerTeam) { toast("Все баны сделаны", "error"); return; }
    if (!isMyCaptain(team)) { toast("Не ваш бан", "error"); return; }
    if (game.currentGameBans.some(function(b){return b.hero===hero;}) || game.currentGamePicks.some(function(p){return p.hero===hero;})) { toast("Герой уже выбран", "error"); return; }
    applyBanLocally(hero, attr, team);
    broadcastAction({ type:"ban", hero:hero, attribute:attr, team:team });
    syncState();
}

function applyBanLocally(hero, attr, team) {
    game.currentGameBans.push({ hero:hero, attribute:attr, team:team });
    game.bans[team].push(hero);
    game.step++;
    if (game.step >= totalBans()) { game.phase = "pick"; game.step = 0; game.currentTurn = CONFIG.pickOrder[0]; }
    else { game.currentTurn = banStepTeam(game.step); }
    game.mainTimer = 30;
    refresh();
    startTurnTimer(game.currentTurn);
}

function pickHero(hero, attr) {
    if (!isLocalCaptain()) { toast("Только капитаны могут пикать", "error"); return; }
    if (game.phase !== "pick") { toast("Сейчас фаза банов!", "error"); return; }
    if (!game.seriesStarted) { toast("Начните новую серию!", "error"); return; }
    var team = pickStepTeam(game.step);
    if (game.picks[team].length >= CONFIG.picksPerTeam) { toast("Все пики сделаны", "error"); return; }
    if (!isMyCaptain(team)) { toast("Не ваш пик", "error"); return; }
    if (game.currentGameBans.some(function(b){return b.hero===hero;}) || game.currentGamePicks.some(function(p){return p.hero===hero;})) { toast("Герой уже выбран", "error"); return; }
    applyPickLocally(hero, attr, team);
    broadcastAction({ type:"pick", hero:hero, attribute:attr, team:team });
    syncState();
}

function applyPickLocally(hero, attr, team) {
    game.currentGamePicks.push({ hero:hero, attribute:attr, team:team });
    game.picks[team].push(hero);
    game.step++;
    if (game.step >= totalPicks()) { game.phase = "complete"; stopTurnTimer(); addGameToHistory(); syncState(); }
    else { game.currentTurn = pickStepTeam(game.step); game.mainTimer = 30; }
    refresh();
    if (game.phase !== "complete") { startTurnTimer(game.currentTurn); skipIfFull(); }
}

function skipIfFull() {
    if (game.picks[game.currentTurn].length >= CONFIG.picksPerTeam) {
        game.step++;
        if (game.step >= totalPicks()) { game.phase = "complete"; stopTurnTimer(); addGameToHistory(); syncState(); }
        else { game.currentTurn = pickStepTeam(game.step); game.mainTimer = 30; }
        refresh();
        if (game.phase !== "complete") { startTurnTimer(game.currentTurn); skipIfFull(); }
    }
}

function addGameToHistory() {
    if (game.seriesHistory.some(function(g){return g.gameNumber===game.currentGame;})) return;
    game.seriesHistory.push({ gameNumber: game.currentGame, bans: JSON.parse(JSON.stringify(game.bans)), picks: JSON.parse(JSON.stringify(game.picks)) });
}

function undoLastAction() {
    if (!isLocalCaptain()) { toast("Только капитаны могут отменять", "error"); return; }
    if (!game.seriesStarted) return;
    if (game.phase === "complete") { toast("Игра завершена", "error"); return; }
    if (game.currentGameBans.length === 0 && game.currentGamePicks.length === 0) { toast("Нечего отменять", "error"); return; }
    undoLocal();
    broadcastAction({ type:"undo" });
    syncState();
}

function undoLocal() {
    if (game.phase === "pick" && game.currentGamePicks.length > 0) {
        var last = game.currentGamePicks.pop(); game.picks[last.team].pop(); game.step--; game.currentTurn = pickStepTeam(game.step);
    } else if (game.phase === "ban" && game.currentGameBans.length > 0) {
        var last = game.currentGameBans.pop(); game.bans[last.team].pop(); game.step--; game.currentTurn = banStepTeam(game.step);
    } else if (game.phase === "pick" && game.currentGamePicks.length === 0 && game.currentGameBans.length > 0) {
        var last = game.currentGameBans.pop(); game.bans[last.team].pop(); game.phase = "ban"; game.step = totalBans() - 1; game.currentTurn = banStepTeam(game.step);
    }
    game.mainTimer = 30; refresh(); startTurnTimer(game.currentTurn); toast("Отменено", "info");
}

function nextGame() {
    if (!isLocalCaptain()) { toast("Только капитаны могут перейти дальше", "error"); return; }
    if (game.phase !== "complete") { toast("Сначала завершите драфт!", "error"); return; }
    nextGameLocal();
    broadcastAction({ type:"next_game" });
    syncState();
}

function nextGameLocal() {
    var banned = game.seriesBannedHeroes.slice();
    game.currentGamePicks.forEach(function(p) { if (banned.indexOf(p.hero) === -1) banned.push(p.hero); });
    var nextNum = game.currentGame + 1;
    game = freshState();
    game.currentGame = nextNum;
    game.seriesBannedHeroes = banned;
    game.availableHeroes = generatePool();
    game.phase = "ban"; game.step = 0; game.currentTurn = CONFIG.banOrder[0];
    game.seriesStarted = true;
    refresh();
    toast("Игра " + game.currentGame + " началась! Фаза банов", "info");
}

// ==================== RENDER ====================
function refresh() {
    renderHeroPool();
    renderTeamBans("radiant"); renderTeamBans("dire");
    renderTeamPicks("radiant"); renderTeamPicks("dire");
    renderHistoryPanel();
    updateAttrCounts(); updateGameBadge(); updatePhaseBadge(); updateScoreDisplay();
    renderCaptainBar(); updateButtons(); updateTimerDisplay(); updateSpectatorUI();
}

function renderHeroPool() {
    var grids = { strength:"strengthGrid", agility:"agilityGrid", intelligence:"intelligenceGrid", universal:"universalGrid" };
    for (var attr in grids) {
        if (!grids.hasOwnProperty(attr)) continue;
        var grid = document.getElementById(grids[attr]);
        if (!grid) continue;
        var heroes = game.availableHeroes[attr] || [];
        grid.innerHTML = "";
        if (!game.seriesStarted) { grid.innerHTML = '<div class="text-muted" style="grid-column:1/-1;padding:12px;font-size:0.65rem;">Начните серию</div>'; continue; }
        if (heroes.length === 0) { grid.innerHTML = '<div class="text-muted" style="grid-column:1/-1;padding:12px;font-size:0.65rem;">Нет героев</div>'; continue; }
        for (var i = 0; i < heroes.length; i++) {
            (function(hero, attr) {
                var card = document.createElement("div");
                var banned = game.currentGameBans.some(function(b){return b.hero===hero;});
                var picked = game.currentGamePicks.some(function(p){return p.hero===hero;});
                var seriesBanned = game.seriesBannedHeroes.indexOf(hero) !== -1;
                var cls = "hero-card " + attr;
                if (seriesBanned) cls += " series-banned";
                else if (picked) cls += " picked";
                else if (banned) cls += " banned";
                card.className = cls;
                var img = getHeroImageUrl(hero);
                if (img) card.style.backgroundImage = "url(" + img + ")";
                else card.style.backgroundColor = getAttrBg(attr);
                var inner = '<div class="hero-info"><span class="hero-name">' + hero + '</span><span class="hero-attr-badge">' + getAttrLabel(attr) + '</span></div>';
                if (banned && !seriesBanned && !picked) inner += '<span class="banned-overlay">🚫</span>';
                card.innerHTML = inner;
                if (!seriesBanned && !picked && !banned) {
                    if (game.phase === "ban") card.onclick = function() { banHero(hero, attr); };
                    else if (game.phase === "pick") card.onclick = function() { pickHero(hero, attr); };
                }
                grid.appendChild(card);
            })(heroes[i], attr);
        }
        var needed = CONFIG.heroesPerAttribute - heroes.length;
        for (var j = 0; j < needed; j++) {
            var e = document.createElement("div"); e.className = "hero-card series-banned";
            e.innerHTML = '<div class="hero-info"><span class="hero-name" style="color:#333;">Заблокирован</span></div>';
            grid.appendChild(e);
        }
    }
}

function renderTeamBans(team) {
    var c = document.getElementById(team + "BanSlots"); if (!c) return;
    var bans = game.bans[team] || []; c.innerHTML = "";
    for (var i = 0; i < CONFIG.bansPerTeam; i++) {
        var s = document.createElement("div"); s.className = "ban-slot";
        if (i < bans.length) {
            s.className += " filled";
            var img = getHeroImageUrl(bans[i]);
            if (img) { s.style.backgroundImage = "url(" + img + ")"; s.style.backgroundSize = "cover"; s.style.backgroundPosition = "center 20%"; }
            else s.style.background = getAttrBg("strength");
            s.title = bans[i];
        } else s.className += " empty";
        c.appendChild(s);
    }
}

function renderTeamPicks(team) {
    var c = document.getElementById(team + "Picks"); if (!c) return;
    var picks = game.picks[team] || []; c.innerHTML = "";
    for (var i = 0; i < CONFIG.picksPerTeam; i++) {
        var s = document.createElement("div"); s.className = "pick-slot";
        if (i < picks.length) {
            s.className += " filled " + team + "-pick";
            var img = getHeroImageUrl(picks[i]);
            if (img) s.style.backgroundImage = "url(" + img + ")";
            s.innerHTML = "<span>" + picks[i] + "</span>"; s.title = picks[i];
        } else { s.className += " empty"; s.textContent = "ПУСТО"; }
        s.dataset.slot = team + "-" + i;
        c.appendChild(s);
    }
}

function renderHistoryPanel() {
    var list = document.getElementById("historyList"); if (!list) return;
    if (game.seriesHistory.length === 0) { list.innerHTML = '<p class="text-muted">Нет завершённых игр</p>'; return; }
    var html = "";
    var reversed = game.seriesHistory.slice().reverse();
    for (var i = 0; i < reversed.length; i++) {
        var g = reversed[i];
        html += '<div class="history-game"><div class="history-game-number">Игра ' + g.gameNumber + '</div>';
        if (g.picks && g.picks.radiant && g.picks.radiant.length > 0) {
            html += '<div class="history-team-row"><span class="history-team-label radiant">R</span>';
            for (var j = 0; j < g.picks.radiant.length; j++) {
                var img = getHeroImageUrl(g.picks.radiant[j]);
                html += '<div class="history-hero-icon" style="background-image:url(' + img + ')" title="' + g.picks.radiant[j] + '"></div>';
            }
            html += '</div>';
        }
        if (g.picks && g.picks.dire && g.picks.dire.length > 0) {
            html += '<div class="history-team-row"><span class="history-team-label dire">D</span>';
            for (var k = 0; k < g.picks.dire.length; k++) {
                var img = getHeroImageUrl(g.picks.dire[k]);
                html += '<div class="history-hero-icon" style="background-image:url(' + img + ')" title="' + g.picks.dire[k] + '"></div>';
            }
            html += '</div>';
        }
        html += '</div>';
    }
    list.innerHTML = html;
}

function renderCaptainBar() {
    var rE = document.getElementById("radiantCaptainEmpty"), rF = document.getElementById("radiantCaptainFilled"), rN = document.getElementById("radiantCaptainName");
    var dE = document.getElementById("direCaptainEmpty"), dF = document.getElementById("direCaptainFilled"), dN = document.getElementById("direCaptainName");
    if (captains.radiant) { rE.classList.add("hidden"); rF.classList.remove("hidden"); rN.textContent = captains.radiant.name; }
    else { rE.classList.remove("hidden"); rF.classList.add("hidden"); }
    if (captains.dire) { dE.classList.add("hidden"); dF.classList.remove("hidden"); dN.textContent = captains.dire.name; }
    else { dE.classList.remove("hidden"); dF.classList.add("hidden"); }
}

function updateAttrCounts() {
    var map = { strCount:"strength", agiCount:"agility", intCount:"intelligence", uniCount:"universal" };
    for (var id in map) {
        if (!map.hasOwnProperty(id)) continue;
        var attr = map[id];
        var heroes = game.availableHeroes[attr] || [];
        var selectable = heroes.filter(function(h) {
            return !game.currentGameBans.some(function(b){return b.hero===h;}) && !game.currentGamePicks.some(function(p){return p.hero===h;});
        }).length;
        var el = document.getElementById(id);
        if (el) el.textContent = selectable + "/" + CONFIG.heroesPerAttribute;
    }
}

function updateGameBadge() { document.getElementById("gameBadge").textContent = "Игра " + game.currentGame; }
function updatePhaseBadge() {
    var b = document.getElementById("phaseBadge");
    if (!game.seriesStarted) { b.textContent = "Ожидание"; b.className = "phase-badge waiting"; return; }
    if (game.phase === "ban") { b.textContent = "Фаза банов"; b.className = "phase-badge ban-phase"; }
    else if (game.phase === "pick") { b.textContent = "Фаза пиков"; b.className = "phase-badge pick-phase"; }
    else { b.textContent = "Завершено"; b.className = "phase-badge complete"; }
}
function updateScoreDisplay() { document.getElementById("radiantScore").textContent = game.radiantScore; document.getElementById("direScore").textContent = game.direScore; }

function updateUI() { updateTurnDisplay(); updateButtons(); updateGameBadge(); updatePhaseBadge(); updateScoreDisplay(); updateTimerDisplay(); }

function updateTurnDisplay() {
    var rT = document.getElementById("radiantTurn"), dT = document.getElementById("direTurn"), tI = document.getElementById("turnInfo");
    if (!game.seriesStarted) {
        if (rT) rT.classList.add("hidden"); if (dT) dT.classList.add("hidden");
        if (tI) { tI.textContent = "Подключитесь к комнате для начала"; tI.className = "turn-info"; }
        resetGlows(); return;
    }
    if (game.phase === "complete") {
        if (rT) rT.classList.add("hidden"); if (dT) dT.classList.add("hidden");
        if (tI) { tI.textContent = "Драфт завершён"; tI.className = "turn-info"; }
        resetGlows(); return;
    }
    var isR = game.currentTurn === "radiant";
    if (rT) rT.classList.toggle("hidden", !isR);
    if (dT) dT.classList.toggle("hidden", isR);
    var rP = document.getElementById("radiantPanel"), dP = document.getElementById("direPanel");
    if (rP && dP) { rP.style.boxShadow = isR ? "0 0 25px var(--radiant-glow)" : "none"; dP.style.boxShadow = !isR ? "0 0 25px var(--dire-glow)" : "none"; }
    startTurnTimer(game.currentTurn);
}
function resetGlows() { var r = document.getElementById("radiantPanel"), d = document.getElementById("direPanel"); if (r) r.style.boxShadow = "none"; if (d) d.style.boxShadow = "none"; }

function updateButtons() {
    var u = document.getElementById("btnUndo"), n = document.getElementById("btnNextGame");
    var has = (game.phase === "ban" && game.currentGameBans.length > 0) || (game.phase === "pick" && (game.currentGamePicks.length > 0 || game.currentGameBans.length > 0));
    if (u) u.disabled = !game.seriesStarted || !has || game.phase === "complete" || !isLocalCaptain();
    if (n) n.disabled = !game.seriesStarted || game.phase !== "complete" || !isLocalCaptain();
}

// ==================== MODALS ====================
function showSettings() {
    document.getElementById("settingHeroesPerAttr").value = CONFIG.heroesPerAttribute;
    document.getElementById("settingBansPerTeam").value = CONFIG.bansPerTeam;
    document.getElementById("settingPicksPerTeam").value = CONFIG.picksPerTeam;
    document.getElementById("settingBanOrder").value = CONFIG.banOrder.join(",");
    document.getElementById("settingPickOrder").value = CONFIG.pickOrder.join(",");
    document.getElementById("settingsModal").classList.remove("hidden");
}
function hideSettings() { document.getElementById("settingsModal").classList.add("hidden"); }
function applySettings() {
    var hpa = Math.max(5, Math.min(15, parseInt(document.getElementById("settingHeroesPerAttr").value) || 10));
    var bpt = Math.max(1, Math.min(5, parseInt(document.getElementById("settingBansPerTeam").value) || 3));
    var ppt = Math.max(3, Math.min(5, parseInt(document.getElementById("settingPicksPerTeam").value) || 5));
    var br = (document.getElementById("settingBanOrder").value || "R,D,R,D,R,D").split(",").map(function(s) { var t = s.trim().toLowerCase(); if (t==="r"||t==="radiant") return "radiant"; if (t==="d"||t==="dire") return "dire"; return null; }).filter(Boolean);
    var pr = (document.getElementById("settingPickOrder").value || "R,D,D,R,R,D,D,R,R,D").split(",").map(function(s) { var t = s.trim().toLowerCase(); if (t==="r"||t==="radiant") return "radiant"; if (t==="d"||t==="dire") return "dire"; return null; }).filter(Boolean);
    if (br.length !== bpt*2) { toast("Баны: ровно " + (bpt*2) + " элементов!", "error"); return; }
    if (pr.length !== ppt*2) { toast("Пики: ровно " + (ppt*2) + " элементов!", "error"); return; }
    CONFIG.heroesPerAttribute = hpa; CONFIG.bansPerTeam = bpt; CONFIG.picksPerTeam = ppt; CONFIG.banOrder = br; CONFIG.pickOrder = pr;
    hideSettings();
    if (game.seriesStarted) startNewSeries();
    toast("Настройки применены!", "success");
}

function showHistory() {
    var c = document.getElementById("historyContent"); if (!c) return;
    if (game.seriesHistory.length === 0 && game.currentGameBans.length === 0 && game.currentGamePicks.length === 0) {
        c.innerHTML = '<p class="text-muted">Серия ещё не начата.</p>';
    } else {
        var h = '<div style="display:flex;flex-direction:column;gap:14px;">';
        for (var i = 0; i < game.seriesHistory.length; i++) {
            var g = game.seriesHistory[i];
            h += '<div style="border:1px solid var(--border-color);border-radius:8px;padding:12px;"><h4 style="margin-bottom:8px;">Игра ' + g.gameNumber + '</h4><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;"><div><strong style="color:var(--radiant-color);">🏛️ Radiant</strong><div style="font-size:0.7rem;margin-top:4px;"><span class="phase-tag ban">БАН</span> ' + (g.bans&&g.bans.radiant?g.bans.radiant.join(", "):"—") + '</div><div style="font-size:0.75rem;margin-top:2px;"><span class="phase-tag pick">ПИК</span> ' + (g.picks&&g.picks.radiant?g.picks.radiant.join(", "):"—") + '</div></div><div><strong style="color:var(--dire-color);">💀 Dire</strong><div style="font-size:0.7rem;margin-top:4px;"><span class="phase-tag ban">БАН</span> ' + (g.bans&&g.bans.dire?g.bans.dire.join(", "):"—") + '</div><div style="font-size:0.75rem;margin-top:2px;"><span class="phase-tag pick">ПИК</span> ' + (g.picks&&g.picks.dire?g.picks.dire.join(", "):"—") + '</div></div></div></div>';
        }
        c.innerHTML = h;
    }
    document.getElementById("historyModal").classList.remove("hidden");
}
function hideHistory() { document.getElementById("historyModal").classList.add("hidden"); }

function showSeriesBanned() {
    var c = document.getElementById("seriesBannedContent"); if (!c) return;
    if (game.seriesBannedHeroes.length === 0) { c.innerHTML = '<p class="text-muted">Пока нет заблокированных героев.</p>'; }
    else {
        var h = '<div class="series-banned-grid">';
        var sorted = game.seriesBannedHeroes.slice().sort();
        for (var i = 0; i < sorted.length; i++) {
            var hero = sorted[i];
            var img = getHeroImageUrl(hero);
            var found = null;
            for (var j = 0; j < game.seriesHistory.length; j++) { if ((game.seriesHistory[j].picks&&game.seriesHistory[j].picks.radiant&&game.seriesHistory[j].picks.radiant.indexOf(hero)!==-1)||(game.seriesHistory[j].picks&&game.seriesHistory[j].picks.dire&&game.seriesHistory[j].picks.dire.indexOf(hero)!==-1)) { found = game.seriesHistory[j]; break; } }
            var gn = found ? found.gameNumber : "?";
            h += '<div class="series-banned-hero"><div class="sb-avatar" style="background-image:url(' + img + ')"></div><div class="sb-info"><span class="sb-name">' + hero + '</span><span class="sb-game">Игра ' + gn + '</span></div></div>';
        }
        h += '</div>';
        c.innerHTML = h;
    }
    document.getElementById("seriesBannedModal").classList.remove("hidden");
}
function hideSeriesBanned() { document.getElementById("seriesBannedModal").classList.add("hidden"); }

function toast(msg, type) {
    type = type || "info";
    var c = document.getElementById("toastContainer"); if (!c) return;
    var t = document.createElement("div"); t.className = "toast " + type; t.textContent = msg;
    c.appendChild(t); setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 2500);
}

function createParticles() {
    var c = document.getElementById("bgParticles"); if (!c) return;
    for (var i = 0; i < 20; i++) {
        var p = document.createElement("div"); p.className =
