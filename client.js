/**
 * Dota 2 — Fearless Draft Client (v4 — капитаны не сбрасываются)
 * Мультиплеер через WebSocket. Таймеры 30с + 2:10 резерв.
 */

// ==================== HERO DATABASE ====================
const ALL_HEROES = {
    strength: ['Abaddon','Alchemist','Axe','Bristleback','Centaur Warrunner','Chaos Knight','Dawnbreaker','Doom','Dragon Knight','Earth Spirit','Earthshaker','Elder Titan','Huskar','Kunkka','Legion Commander','Lifestealer','Mars','Night Stalker','Ogre Magi','Omniknight','Primal Beast','Pudge','Sand King','Slardar','Sven','Tidehunter','Timbersaw','Tiny','Treant Protector','Tusk','Underlord','Undying','Wraith King'],
    agility: ['Anti-Mage','Arc Warden','Bloodseeker','Bounty Hunter','Clinkz','Drow Ranger','Ember Spirit','Faceless Void','Gyrocopter','Hoodwink','Juggernaut','Kez','Luna','Medusa','Meepo','Monkey King','Morphling','Muerta','Naga Siren','Nyx Assassin','Phantom Assassin','Phantom Lancer','Razor','Riki','Shadow Fiend','Slark','Sniper','Spectre','Templar Assassin','Terrorblade','Troll Warlord','Ursa','Viper','Weaver'],
    intelligence: ['Ancient Apparition','Crystal Maiden','Death Prophet','Disruptor','Enchantress','Grimstroke','Invoker','Jakiro','Keeper of the Light','Leshrac','Lich','Lina','Lion',"Nature's Prophet",'Necrophos','Oracle','Outworld Destroyer','Puck','Pugna','Queen of Pain','Ringmaster','Rubick','Shadow Demon','Shadow Shaman','Silencer','Skywrath Mage','Storm Spirit','Tinker','Warlock','Witch Doctor','Zeus'],
    universal: ['Bane','Batrider','Beastmaster','Brewmaster','Broodmother','Chen','Clockwerk','Dark Seer','Dark Willow','Dazzle','Enigma','Io','Lone Druid','Lycan','Magnus','Marci','Mirana','Pangolier','Phoenix','Snapfire','Spirit Breaker','Techies','Vengeful Spirit','Venomancer','Void Spirit','Windranger','Winter Wyvern']
};

const HERO_IMAGE_KEYS = {'Abaddon':'abaddon','Alchemist':'alchemist','Ancient Apparition':'ancient_apparition','Anti-Mage':'antimage','Arc Warden':'arc_warden','Axe':'axe','Bane':'bane','Batrider':'batrider','Beastmaster':'beastmaster','Bloodseeker':'bloodseeker','Bounty Hunter':'bounty_hunter','Brewmaster':'brewmaster','Bristleback':'bristleback','Broodmother':'broodmother','Centaur Warrunner':'centaur','Chaos Knight':'chaos_knight','Chen':'chen','Clinkz':'clinkz','Clockwerk':'rattletrap','Crystal Maiden':'crystal_maiden','Dark Seer':'dark_seer','Dark Willow':'dark_willow','Dawnbreaker':'dawnbreaker','Dazzle':'dazzle','Death Prophet':'death_prophet','Disruptor':'disruptor','Doom':'doom_bringer','Dragon Knight':'dragon_knight','Drow Ranger':'drow_ranger','Earth Spirit':'earth_spirit','Earthshaker':'earthshaker','Elder Titan':'elder_titan','Ember Spirit':'ember_spirit','Enchantress':'enchantress','Enigma':'enigma','Faceless Void':'faceless_void','Grimstroke':'grimstroke','Gyrocopter':'gyrocopter','Hoodwink':'hoodwink','Huskar':'huskar','Invoker':'invoker','Io':'wisp','Jakiro':'jakiro','Juggernaut':'juggernaut','Keeper of the Light':'keeper_of_the_light','Kez':'kez','Kunkka':'kunkka','Legion Commander':'legion_commander','Leshrac':'leshrac','Lich':'lich','Lifestealer':'life_stealer','Lina':'lina','Lion':'lion','Lone Druid':'lone_druid','Luna':'luna','Lycan':'lycan','Magnus':'magnataur','Marci':'marci','Mars':'mars','Medusa':'medusa','Meepo':'meepo','Mirana':'mirana','Monkey King':'monkey_king','Morphling':'morphling','Muerta':'muerta','Naga Siren':'naga_siren',"Nature's Prophet":'furion','Necrophos':'necrolyte','Night Stalker':'night_stalker','Nyx Assassin':'nyx_assassin','Ogre Magi':'ogre_magi','Omniknight':'omniknight','Oracle':'oracle','Outworld Destroyer':'obsidian_destroyer','Pangolier':'pangolier','Phantom Assassin':'phantom_assassin','Phantom Lancer':'phantom_lancer','Phoenix':'phoenix','Primal Beast':'primal_beast','Puck':'puck','Pudge':'pudge','Pugna':'pugna','Queen of Pain':'queenofpain','Razor':'razor','Riki':'riki','Ringmaster':'ringmaster','Rubick':'rubick','Sand King':'sand_king','Shadow Demon':'shadow_demon','Shadow Fiend':'nevermore','Shadow Shaman':'shadow_shaman','Silencer':'silencer','Skywrath Mage':'skywrath_mage','Slardar':'slardar','Slark':'slark','Snapfire':'snapfire','Sniper':'sniper','Spectre':'spectre','Spirit Breaker':'spirit_breaker','Storm Spirit':'storm_spirit','Sven':'sven','Techies':'techies','Templar Assassin':'templar_assassin','Terrorblade':'terrorblade','Tidehunter':'tidehunter','Timbersaw':'shredder','Tinker':'tinker','Tiny':'tiny','Treant Protector':'treant','Troll Warlord':'troll_warlord','Tusk':'tusk','Underlord':'abyssal_underlord','Undying':'undying','Ursa':'ursa','Vengeful Spirit':'vengeful_spirit','Venomancer':'venomancer','Viper':'viper','Void Spirit':'void_spirit','Warlock':'warlock','Weaver':'weaver','Windranger':'windrunner','Winter Wyvern':'winter_wyvern','Witch Doctor':'witch_doctor','Wraith King':'skeleton_king','Zeus':'zeus'};

function getHeroImageUrl(n){const k=HERO_IMAGE_KEYS[n];return k?`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${k}.png`:'';}
function getAttrBg(a){return{strength:'#1a100e',agility:'#0e1a12',intelligence:'#0e141a',universal:'#160e1a'}[a]||'#111';}
function getAttrLabel(a){return{strength:'Сила',agility:'Ловкость',intelligence:'Интеллект',universal:'Универсал'}[a]||a;}

// ==================== CONFIG ====================
const DEFAULT_CONFIG = {heroesPerAttribute:10,bansPerTeam:3,picksPerTeam:5,banOrder:['radiant','dire','radiant','dire','radiant','dire'],pickOrder:['radiant','dire','dire','radiant','radiant','dire','dire','radiant','radiant','dire']};
let config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

// ==================== WEBSOCKET ====================
let ws = null;
let roomCode = null;
let serverCaptains = {radiant:null,dire:null};
let isRemoteAction = false;

function getServerUrl() {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${location.host}`;
}

function connectWebSocket() {
    if (ws && ws.readyState === WebSocket.OPEN) return;
    const url = getServerUrl();
    updateConnectionStatus('connecting','Подключение...');
    try {
        ws = new WebSocket(url);
        ws.onopen = () => {
            updateConnectionStatus('connected','Подключен к серверу');
            const urlParams = new URLSearchParams(location.search);
            const roomFromUrl = urlParams.get('room');
            if (roomFromUrl && !roomCode) joinRoom(roomFromUrl);
        };
        ws.onmessage = (e) => handleServerMessage(JSON.parse(e.data));
        ws.onclose = () => { updateConnectionStatus('disconnected','Соединение потеряно'); ws=null; setTimeout(connectWebSocket,3000); };
        ws.onerror = () => updateConnectionStatus('disconnected','Ошибка соединения');
    } catch(e) { updateConnectionStatus('disconnected','Сервер недоступен'); setTimeout(connectWebSocket,5000); }
}

function handleServerMessage(msg) {
    switch(msg.type) {
        case 'ROOM_CREATED': case 'ROOM_JOINED':
            roomCode=msg.roomCode; serverCaptains=msg.captains||{radiant:null,dire:null};
            document.getElementById('roomCodeDisplay').textContent=roomCode;
            document.getElementById('connInfo').style.display='flex';
            // При первом входе синхронизируем капитанов (но не перезаписываем локальных)
            syncCaptainsFromServer();
            if(msg.state){isRemoteAction=true;deserializeState(msg.state);isRemoteAction=false;renderAll();updateUI();}
            updateConnectionStatus('connected',`Комната ${roomCode}`);
            showToast(msg.type==='ROOM_CREATED'?'Комната создана! Отправьте код сопернику.':'Подключились к комнате!','success');
            break;
        case 'CAPTAIN_CLAIMED':
            serverCaptains[msg.team]=msg.name; syncCaptainsFromServer(); renderCaptainBar();
            showToast(`${msg.name} стал капитаном ${msg.team==='radiant'?'Radiant':'Dire'}!`,'info');
            break;
        case 'CAPTAIN_LEFT': serverCaptains[msg.team]=null; syncCaptainsFromServer(); renderCaptainBar(); break;
        case 'STATE_SYNC':
            serverCaptains=msg.captains||serverCaptains;
            // Не перезаписываем локальных капитанов
            if(msg.state){isRemoteAction=true;deserializeState(msg.state);isRemoteAction=false;renderAll();updateUI();}
            break;
        case 'GAME_ACTION':
            isRemoteAction=true; handleRemoteAction(msg.action); isRemoteAction=false;
            if(msg.captains){serverCaptains=msg.captains;}
            renderAll(); updateUI();
            break;
        case 'PLAYER_JOINED': showToast('Игрок подключился к комнате','info'); break;
        case 'PLAYER_LEFT': showToast('Игрок отключился','info'); break;
        case 'ERROR': showToast(msg.message,'error'); break;
    }
}

function sendMessage(msg){if(ws&&ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify(msg));}
function syncGameState(){if(!roomCode)return;sendMessage({type:'SYNC_STATE',state:serializeState()});}
function broadcastAction(action){if(!roomCode||isRemoteAction)return;sendMessage({type:'GAME_ACTION',action});syncGameState();}
function handleRemoteAction(action){switch(action.type){case'ban':applyBanLocally(action.hero,action.attribute,action.team);break;case'pick':applyPickLocally(action.hero,action.attribute,action.team);break;case'undo':applyUndoLocally();break;case'new_series':applyNewSeriesLocally(action.serializedState);break;case'next_game':applyNextGameLocally();break;case'set_winner':applyWinnerLocally(action.winner);break;}}

// ==================== CONNECTION UI ====================
function updateConnectionStatus(status,text){const dot=document.querySelector('.conn-dot');const textEl=document.getElementById('connText');if(dot){dot.className='conn-dot';dot.classList.add(status);}if(textEl)textEl.textContent=text;}
function createRoom(){sendMessage({type:'CREATE_ROOM'});}
function joinRoom(code){if(!code){code=document.getElementById('joinRoomInput').value.trim();}if(!code||code.length!==6){showToast('Введите 6-значный код комнаты','error');return;}sendMessage({type:'JOIN_ROOM',roomCode:code});const newUrl=new URL(location);newUrl.searchParams.set('room',code);history.replaceState({},'',newUrl);}
function copyInviteLink(){if(!roomCode)return;const link=`${location.origin}${location.pathname}?room=${roomCode}`;navigator.clipboard.writeText(link).then(()=>{showToast('Ссылка скопирована! Отправьте её сопернику.','success');}).catch(()=>{const helper=document.getElementById('copyHelper');helper.value=link;helper.select();document.execCommand('copy');showToast('Ссылка скопирована!','success');});}

// ==================== CAPTAINS (отдельно от игрового состояния) ====================
let captains = {radiant:null,dire:null}; // {name, id} или null

function syncCaptainsFromServer() {
    // Не трогаем локальных капитанов, только обновляем информацию с сервера
    if (serverCaptains.radiant && (!captains.radiant || captains.radiant.id !== 'local')) {
        captains.radiant = {name: serverCaptains.radiant, id: 'remote'};
    } else if (!serverCaptains.radiant && captains.radiant && captains.radiant.id !== 'local') {
        captains.radiant = null;
    }
    if (serverCaptains.dire && (!captains.dire || captains.dire.id !== 'local')) {
        captains.dire = {name: serverCaptains.dire, id: 'remote'};
    } else if (!serverCaptains.dire && captains.dire && captains.dire.id !== 'local') {
        captains.dire = null;
    }
}

function isMyCaptain(team) {
    if (!captains[team]) return true; // нет капитана — свободный доступ
    return captains[team].id !== 'remote';
}

// ==================== GAME STATE (без captains) ====================
function createInitialState(){
    return {
        seriesStarted:false, currentGame:1,
        availableHeroes:{strength:[],agility:[],intelligence:[],universal:[]},
        phase:'ban', step:0, currentTurn:'radiant',
        bans:{radiant:[],dire:[]}, picks:{radiant:[],dire:[]},
        currentGameBans:[], currentGamePicks:[],
        seriesBannedHeroes:[],
        seriesHistory:[],
        radiantScore:0, direScore:0,
        waitingForWinner:false,
        mainTimer:30,
        reserveTimers:{radiant:130,dire:130}
    };
}
let state = createInitialState();

function serializeState(){
    return {
        seriesStarted:state.seriesStarted, currentGame:state.currentGame,
        availableHeroes:JSON.parse(JSON.stringify(state.availableHeroes)),
        phase:state.phase, step:state.step, currentTurn:state.currentTurn,
        bans:JSON.parse(JSON.stringify(state.bans)), picks:JSON.parse(JSON.stringify(state.picks)),
        currentGameBans:[...state.currentGameBans], currentGamePicks:[...state.currentGamePicks],
        seriesBannedHeroes:[...state.seriesBannedHeroes],
        seriesHistory:JSON.parse(JSON.stringify(state.seriesHistory)),
        radiantScore:state.radiantScore, direScore:state.direScore,
        waitingForWinner:state.waitingForWinner,
        mainTimer:state.mainTimer,
        reserveTimers:{radiant:state.reserveTimers.radiant,dire:state.reserveTimers.dire}
    };
}

function deserializeState(s){
    if(!s)return;
    state.seriesStarted=s.seriesStarted; state.currentGame=s.currentGame;
    state.availableHeroes=s.availableHeroes; state.phase=s.phase;
    state.step=s.step; state.currentTurn=s.currentTurn;
    state.bans=s.bans; state.picks=s.picks;
    state.currentGameBans=s.currentGameBans; state.currentGamePicks=s.currentGamePicks;
    state.seriesBannedHeroes=[...(s.seriesBannedHeroes||[])];
    state.seriesHistory=s.seriesHistory; state.radiantScore=s.radiantScore;
    state.direScore=s.direScore; state.waitingForWinner=s.waitingForWinner;
    state.mainTimer=s.mainTimer!==undefined?s.mainTimer:30;
    state.reserveTimers=s.reserveTimers||{radiant:130,dire:130};
}

// ==================== TIMER ====================
let turnTimerInterval = null;

function startTurnTimer(team) {
    stopTurnTimer();
    updateTimerDisplay();
    if (!state.seriesStarted || state.phase === 'complete' || state.waitingForWinner) return;
    const isOurTurn = state.currentTurn === team;
    const isLocalCaptain = !captains[team] || captains[team].id === 'local';
    if (!isOurTurn || !isLocalCaptain) return;
    turnTimerInterval = setInterval(() => {
        if (state.phase === 'complete' || state.waitingForWinner) { stopTurnTimer(); return; }
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
        if (roomCode && state.mainTimer % 5 === 0) syncGameState();
    }, 1000);
}

function stopTurnTimer() { if (turnTimerInterval) { clearInterval(turnTimerInterval); turnTimerInterval = null; } }

function forceRandomAction(team) {
    const availableHeroes = [];
    for (const attr of ['strength','agility','intelligence','universal']) {
        (state.availableHeroes[attr]||[]).forEach(hero => availableHeroes.push({hero,attribute:attr}));
    }
    if (availableHeroes.length === 0) return;
    const randomPick = availableHeroes[Math.floor(Math.random() * availableHeroes.length)];
    if (state.phase === 'ban') {
        applyBanLocally(randomPick.hero, randomPick.attribute, team);
        broadcastAction({ type:'ban', hero: randomPick.hero, attribute: randomPick.attribute, team });
        syncGameState();
        showToast(`Авто-бан: ${randomPick.hero}`, 'info');
    } else {
        applyPickLocally(randomPick.hero, randomPick.attribute, team);
        broadcastAction({ type:'pick', hero: randomPick.hero, attribute: randomPick.attribute, team });
        syncGameState();
        showToast(`Авто-пик: ${randomPick.hero}`, 'info');
    }
}

function updateTimerDisplay() {
    const timerMain = document.getElementById('timerMain');
    const timerReserve = document.getElementById('timerReserve');
    const timerContainer = document.getElementById('timerContainer');
    const turnInfo = document.getElementById('turnInfo');
    if (!state.seriesStarted || state.phase === 'complete' || state.waitingForWinner) {
        if(timerContainer) timerContainer.style.display = 'none';
        if(turnInfo) turnInfo.style.display = 'block';
        return;
    }
    if(timerContainer) timerContainer.style.display = 'flex';
    if(turnInfo) turnInfo.style.display = 'none';
    const team = state.currentTurn;
    const reserve = state.reserveTimers[team] || 0;
    const mainMin = Math.floor(Math.max(0, state.mainTimer) / 60);
    const mainSec = Math.max(0, state.mainTimer) % 60;
    if(timerMain) timerMain.textContent = `${String(mainMin).padStart(2,'0')}:${String(mainSec).padStart(2,'0')}`;
    const resMin = Math.floor(reserve / 60);
    const resSec = reserve % 60;
    if(timerReserve) timerReserve.textContent = `+${resMin}:${String(resSec).padStart(2,'0')}`;
    if(timerContainer) {
        timerContainer.classList.remove('warning','danger');
        if (state.mainTimer <= 10 && state.mainTimer > 0) timerContainer.classList.add('warning');
        else if (state.mainTimer === 0) timerContainer.classList.add('danger');
    }
}

// ==================== HELPERS ====================
function shuffleArray(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function getAvailablePool(attr){return(ALL_HEROES[attr]||[]).filter(h=>!state.seriesBannedHeroes.includes(h));}
function generateHeroPool(){const pool={strength:[],agility:[],intelligence:[],universal:[]};for(const attr of['strength','agility','intelligence','universal']){pool[attr]=shuffleArray(getAvailablePool(attr)).slice(0,config.heroesPerAttribute);}return pool;}
function getBanStepTeam(s){return config.banOrder[s]||(s%2===0?'radiant':'dire');}
function getPickStepTeam(s){return config.pickOrder[s]||(s%2===0?'radiant':'dire');}
function totalBans(){return config.bansPerTeam*2;}
function totalPicks(){return config.picksPerTeam*2;}

// ==================== GAME ACTIONS ====================
function claimCaptain(team){if(!roomCode){showToast('Сначала подключитесь к комнате!','error');return;}if(serverCaptains[team]){showToast(`Капитан ${team==='radiant'?'Radiant':'Dire'} уже выбран!`,'error');return;}pendingCaptainTeam=team;document.getElementById('captainNameModal').classList.remove('hidden');document.getElementById('captainNameInput').value='';document.getElementById('captainNameInput').focus();}
let pendingCaptainTeam=null;

function confirmCaptainName(){const input=document.getElementById('captainNameInput');const name=input.value.trim()||`Капитан ${pendingCaptainTeam==='radiant'?'Radiant':'Dire'}`;const team=pendingCaptainTeam;document.getElementById('captainNameModal').classList.add('hidden');pendingCaptainTeam=null;captains[team]={name,id:'local'};sendMessage({type:'CLAIM_CAPTAIN',team,name});serverCaptains[team]=name;renderCaptainBar();updateUI();showToast(`Вы стали капитаном ${team==='radiant'?'Radiant':'Dire'}!`,'success');}
function leaveCaptain(team){if(captains[team]&&captains[team].id==='remote')return;captains[team]=null;sendMessage({type:'LEAVE_CAPTAIN',team});serverCaptains[team]=null;renderCaptainBar();updateUI();}

function startNewSeries(){
    const savedCaptains = captains; // сохраняем текущих капитанов
    state = createInitialState();
    state.seriesStarted = true;
    state.availableHeroes = generateHeroPool();
    state.phase = 'ban'; state.step = 0; state.currentTurn = config.banOrder[0];
    // captains не трогаем — они остаются глобальными
    renderAll(); updateUI();
    broadcastAction({type:'new_series', serializedState: serializeState()});
    syncGameState();
    showToast('Новая серия началась! ⚔️ Фаза банов','success');
}

function applyNewSeriesLocally(ss){
    if(ss){deserializeState(ss);}
    else{
        state = createInitialState();
        state.seriesStarted = true;
        state.availableHeroes = generateHeroPool();
        state.phase = 'ban'; state.step = 0; state.currentTurn = config.banOrder[0];
    }
    renderAll(); updateUI();
}

function banHero(hero,attribute){
    if(state.phase!=='ban'){showToast('Сейчас фаза пиков!','error');return;}
    if(!state.seriesStarted){showToast('Начните новую серию!','error');return;}
    if(state.waitingForWinner)return;
    const pool=state.availableHeroes[attribute];
    if(!pool||!pool.includes(hero)){showToast('Герой недоступен!','error');return;}
    const team=getBanStepTeam(state.step);
    if(state.bans[team].length>=config.bansPerTeam){showToast('Команда сделала все баны!','error');return;}
    if(!isMyCaptain(team)){showToast('Это не ваш бан!','error');return;}
    applyBanLocally(hero,attribute,team);
    broadcastAction({type:'ban',hero,attribute,team});
    syncGameState();
}

function applyBanLocally(hero,attribute,team){
    state.currentGameBans.push({hero,attribute,team});
    state.bans[team].push(hero);
    state.availableHeroes[attribute]=state.availableHeroes[attribute].filter(h=>h!==hero);
    state.step++;
    if(state.step>=totalBans()){
        state.phase='pick'; state.step=0; state.currentTurn=config.pickOrder[0];
    }else{
        state.currentTurn=getBanStepTeam(state.step);
    }
    state.mainTimer=30;
    renderAll(); updateUI();
    startTurnTimer(state.currentTurn);
}

function pickHero(hero,attribute){
    if(state.phase!=='pick'){showToast('Сейчас фаза банов!','error');return;}
    if(!state.seriesStarted){showToast('Начните новую серию!','error');return;}
    if(state.waitingForWinner)return;
    const pool=state.availableHeroes[attribute];
    if(!pool||!pool.includes(hero)){showToast('Герой недоступен!','error');return;}
    const team=getPickStepTeam(state.step);
    if(state.picks[team].length>=config.picksPerTeam){showToast('Команда набрала всех героев!','error');return;}
    if(!isMyCaptain(team)){showToast('Это не ваш пик!','error');return;}
    applyPickLocally(hero,attribute,team);
    broadcastAction({type:'pick',hero,attribute,team});
    syncGameState();
}

function applyPickLocally(hero,attribute,team){
    state.currentGamePicks.push({hero,attribute,team});
    state.picks[team].push(hero);
    state.availableHeroes[attribute]=state.availableHeroes[attribute].filter(h=>h!==hero);
    state.step++;
    if(state.step>=totalPicks()){
        state.phase='complete'; state.waitingForWinner=true;
        stopTurnTimer();
    }else{
        state.currentTurn=getPickStepTeam(state.step);
        state.mainTimer=30;
    }
    renderAll(); updateUI();
    if(!state.waitingForWinner) startTurnTimer(state.currentTurn);
    checkSkipFullTeam();
}

function checkSkipFullTeam(){
    const team=state.currentTurn;
    if(state.picks[team].length>=config.picksPerTeam){
        state.step++;
        if(state.step>=totalPicks()){
            state.phase='complete'; state.waitingForWinner=true;
            stopTurnTimer();
        }else{
            state.currentTurn=getPickStepTeam(state.step);
            state.mainTimer=30;
        }
        renderAll(); updateUI();
        if(!state.waitingForWinner) startTurnTimer(state.currentTurn);
        checkSkipFullTeam();
    }
}

function undoLastAction(){
    if(!state.seriesStarted)return;
    if(state.waitingForWinner){showToast('Игра завершена, отмена невозможна.','error');return;}
    const hasBans=state.currentGameBans.length>0;
    const hasPicks=state.currentGamePicks.length>0;
    if(!hasBans&&!hasPicks){showToast('Нечего отменять!','error');return;}
    applyUndoLocally();
    broadcastAction({type:'undo'});
    syncGameState();
}

function applyUndoLocally(){
    if(state.phase==='pick'&&state.currentGamePicks.length>0){
        const last=state.currentGamePicks.pop();
        state.picks[last.team].pop();
        if(!state.availableHeroes[last.attribute])state.availableHeroes[last.attribute]=[];
        state.availableHeroes[last.attribute].push(last.hero);
        state.step--;
        state.currentTurn=getPickStepTeam(state.step);
    }else if(state.phase==='ban'&&state.currentGameBans.length>0){
        const last=state.currentGameBans.pop();
        state.bans[last.team].pop();
        if(!state.availableHeroes[last.attribute])state.availableHeroes[last.attribute]=[];
        state.availableHeroes[last.attribute].push(last.hero);
        state.step--;
        state.currentTurn=getBanStepTeam(state.step);
    }else if(state.phase==='pick'&&state.currentGamePicks.length===0&&state.currentGameBans.length>0){
        const last=state.currentGameBans.pop();
        state.bans[last.team].pop();
        if(!state.availableHeroes[last.attribute])state.availableHeroes[last.attribute]=[];
        state.availableHeroes[last.attribute].push(last.hero);
        state.phase='ban'; state.step=totalBans()-1; state.currentTurn=getBanStepTeam(state.step);
    }
    state.waitingForWinner=false; hideWinnerModal();
    state.mainTimer=30;
    renderAll(); updateUI();
    startTurnTimer(state.currentTurn);
    showToast('Действие отменено ↩','info');
}

function nextGame(){
    if(state.waitingForWinner){showToast('Сначала укажите победителя!','error');return;}
    applyNextGameLocally();
    broadcastAction({type:'next_game'});
    syncGameState();
}

function applyNextGameLocally(){
    const gr={gameNumber:state.currentGame,bans:JSON.parse(JSON.stringify(state.bans)),picks:JSON.parse(JSON.stringify(state.picks)),winner:null};
    state.currentGamePicks.forEach(p=>{if(!state.seriesBannedHeroes.includes(p.hero))state.seriesBannedHeroes.push(p.hero);});
    state.seriesHistory.push(gr);
    state = createInitialState();
    state.currentGame = gr.gameNumber + 1;
    state.bans={radiant:[],dire:[]}; state.picks={radiant:[],dire:[]};
    state.currentGameBans=[]; state.currentGamePicks=[];
    state.phase='ban'; state.step=0; state.currentTurn=config.banOrder[0];
    state.waitingForWinner=false; state.mainTimer=30;
    state.reserveTimers={radiant:130,dire:130};
    state.seriesBannedHeroes = [...state.seriesBannedHeroes]; // сохраняем
    state.availableHeroes=generateHeroPool();
    renderAll(); updateUI();
    showToast(`Игра ${state.currentGame} началась! Фаза банов`,'info');
}

function setGameWinner(winner){
    if(!state.waitingForWinner)return;
    applyWinnerLocally(winner);
    broadcastAction({type:'set_winner',winner});
    syncGameState();
}

function applyWinnerLocally(winner){
    if(state.seriesHistory.length>0){
        const last=state.seriesHistory[state.seriesHistory.length-1];
        if(!last.winner&&last.gameNumber===state.currentGame-1){last.winner=winner;}
        else{addGameRecord(winner);}
    }else{addGameRecord(winner);}
    if(winner==='radiant')state.radiantScore++;else if(winner==='dire')state.direScore++;
    state.waitingForWinner=false; hideWinnerModal();
    renderAll(); updateUI();
    showToast(`${winner==='radiant'?'Radiant':'Dire'} победили! 🏆`,'success');
}

function addGameRecord(winner){
    state.seriesHistory.push({gameNumber:state.currentGame,bans:JSON.parse(JSON.stringify(state.bans)),picks:JSON.parse(JSON.stringify(state.picks)),winner});
}

function skipWinner(){
    if(!state.waitingForWinner)return;
    state.waitingForWinner=false; hideWinnerModal(); updateUI();
    showToast('Победитель не указан.','info');
}

// ==================== RENDER ====================
function renderAll(){
    renderHeroPool();
    renderTeamBans('radiant'); renderTeamBans('dire');
    renderTeamPicks('radiant'); renderTeamPicks('dire');
    updateAttrCounts(); updateGameBadge(); updatePhaseBadge();
    updateScoreDisplay(); renderCaptainBar(); updateButtons(); updateTimerDisplay();
}

function renderHeroPool(){
    const grids={strength:'strengthGrid',agility:'agilityGrid',intelligence:'intelligenceGrid',universal:'universalGrid'};
    for(const[attr,gridId]of Object.entries(grids)){
        const grid=document.getElementById(gridId); if(!grid)continue;
        const heroes=state.availableHeroes[attr]||[]; grid.innerHTML='';
        if(!state.seriesStarted){grid.innerHTML='<div class="text-muted" style="grid-column:1/-1;padding:16px;font-size:0.7rem;">Начните серию</div>';continue;}
        if(heroes.length===0){grid.innerHTML='<div class="text-muted" style="grid-column:1/-1;padding:16px;font-size:0.7rem;">Нет героев</div>';continue;}
        heroes.forEach(hero=>{
            const card=document.createElement('div');
            const isBanned=state.currentGameBans.some(b=>b.hero===hero);
            const isPicked=state.currentGamePicks.some(p=>p.hero===hero);
            const isSeriesBanned=state.seriesBannedHeroes.includes(hero);
            let cls=`hero-card ${attr}`;
            if(isSeriesBanned)cls+=' series-banned';
            else if(isPicked)cls+=' picked';
            else if(isBanned)cls+=' banned';
            card.className=cls;
            const imgUrl=getHeroImageUrl(hero);
            if(imgUrl)card.style.backgroundImage=`url(${imgUrl})`;
            else card.style.backgroundColor=getAttrBg(attr);
            let inner=`<div class="hero-info"><span class="hero-name">${hero}</span><span class="hero-attr-badge">${getAttrLabel(attr)}</span></div>`;
            if(isBanned&&!isSeriesBanned&&!isPicked)inner+='<span class="banned-overlay">🚫</span>';
            card.innerHTML=inner;
            if(!isSeriesBanned&&!isPicked){
                if(state.phase==='ban'&&!isBanned)card.onclick=()=>banHero(hero,attr);
                else if(state.phase==='pick'&&!isBanned)card.onclick=()=>pickHero(hero,attr);
            }
            grid.appendChild(card);
        });
        const needed=config.heroesPerAttribute-heroes.length;
        for(let i=0;i<needed;i++){
            const e=document.createElement('div'); e.className='hero-card series-banned';
            e.innerHTML='<div class="hero-info"><span class="hero-name" style="color:#333;">Заблокирован</span></div>';
            grid.appendChild(e);
        }
    }
}

function renderTeamBans(team){
    const c=document.getElementById(`${team}BanSlots`); if(!c)return;
    const bans=state.bans[team]||[]; c.innerHTML='';
    for(let i=0;i<config.bansPerTeam;i++){
        const s=document.createElement('div'); s.className='ban-slot'+(i<bans.length?' filled':' empty');
        s.textContent=i<bans.length?bans[i]:'—'; if(i<bans.length)s.title=bans[i];
        c.appendChild(s);
    }
}

function renderTeamPicks(team){
    const c=document.getElementById(`${team}Picks`); if(!c)return;
    const picks=state.picks[team]||[]; c.innerHTML='';
    for(let i=0;i<config.picksPerTeam;i++){
        const s=document.createElement('div'); s.className='pick-slot';
        if(i<picks.length){
            s.className+=` filled ${team}-pick`;
            const u=getHeroImageUrl(picks[i]);
            if(u)s.style.backgroundImage=`url(${u})`;
            s.innerHTML=`<span>${picks[i]}</span>`; s.title=picks[i];
        }else{
            s.className+=' empty'; s.textContent='ПУСТО';
        }
        s.dataset.slot=`${team}-${i}`; c.appendChild(s);
    }
}

function renderCaptainBar(){
    const rE=document.getElementById('radiantCaptainEmpty'),rF=document.getElementById('radiantCaptainFilled'),rN=document.getElementById('radiantCaptainName');
    const dE=document.getElementById('direCaptainEmpty'),dF=document.getElementById('direCaptainFilled'),dN=document.getElementById('direCaptainName');
    if(captains.radiant){rE.classList.add('hidden');rF.classList.remove('hidden');rN.textContent=captains.radiant.name;}
    else{rE.classList.remove('hidden');rF.classList.add('hidden');}
    if(captains.dire){dE.classList.add('hidden');dF.classList.remove('hidden');dN.textContent=captains.dire.name;}
    else{dE.classList.remove('hidden');dF.classList.add('hidden');}
}

function updateAttrCounts(){
    const m={strCount:'strength',agiCount:'agility',intCount:'intelligence',uniCount:'universal'};
    for(const[id,attr]of Object.entries(m)){
        const e=document.getElementById(id); if(e)e.textContent=`${(state.availableHeroes[attr]||[]).length}/${config.heroesPerAttribute}`;
    }
}

function updateGameBadge(){document.getElementById('gameBadge').textContent=`Игра ${state.currentGame}`;}
function updatePhaseBadge(){
    const b=document.getElementById('phaseBadge');
    if(!state.seriesStarted){b.textContent='Ожидание';b.className='phase-badge waiting';return;}
    if(state.phase==='ban'){b.textContent='Фаза банов';b.className='phase-badge ban-phase';}
    else if(state.phase==='pick'){b.textContent='Фаза пиков';b.className='phase-badge pick-phase';}
    else{b.textContent='Завершено';b.className='phase-badge complete';}
}

function updateScoreDisplay(){
    document.getElementById('radiantScore').textContent=state.radiantScore;
    document.getElementById('direScore').textContent=state.direScore;
}

function updateUI(){
    updateTurnDisplay(); updateButtons();
    updateGameBadge(); updatePhaseBadge(); updateScoreDisplay(); updateTimerDisplay();
}

function updateTurnDisplay(){
    const rT=document.getElementById('radiantTurn'),dT=document.getElementById('direTurn'),tI=document.getElementById('turnInfo');
    if(!state.seriesStarted){
        rT?.classList.add('hidden'); dT?.classList.add('hidden');
        if(tI){tI.textContent='Подключитесь к комнате для начала';tI.className='turn-info';}
        resetPanelGlows(); return;
    }
    if(state.phase==='complete'||state.waitingForWinner){
        rT?.classList.add('hidden'); dT?.classList.add('hidden');
        if(tI){tI.textContent='Все пики сделаны — выберите победителя';tI.className='turn-info';}
        resetPanelGlows(); return;
    }
    const isR=state.currentTurn==='radiant';
    rT?.classList.toggle('hidden',!isR); dT?.classList.toggle('hidden',isR);
    const rP=document.getElementById('radiantPanel'),dP=document.getElementById('direPanel');
    if(rP&&dP){
        rP.style.boxShadow=isR?'0 0 30px var(--radiant-glow)':'none';
        dP.style.boxShadow=!isR?'0 0 30px var(--dire-glow)':'none';
    }
    startTurnTimer(state.currentTurn);
}

function resetPanelGlows(){
    const r=document.getElementById('radiantPanel'),d=document.getElementById('direPanel');
    if(r)r.style.boxShadow='none'; if(d)d.style.boxShadow='none';
}

function updateButtons(){
    const u=document.getElementById('btnUndo'),n=document.getElementById('btnNextGame');
    const hasA=(state.phase==='ban'&&state.currentGameBans.length>0)||(state.phase==='pick'&&(state.currentGamePicks.length>0||state.currentGameBans.length>0));
    if(u)u.disabled=!state.seriesStarted||!hasA||state.waitingForWinner;
    if(n)n.disabled=!state.seriesStarted||state.phase!=='complete'||state.waitingForWinner;
}

// ==================== MODALS ====================
function showWinnerModal(){document.getElementById('winnerModal')?.classList.remove('hidden');document.getElementById('winnerGameNum').textContent=state.currentGame;}
function hideWinnerModal(){document.getElementById('winnerModal')?.classList.add('hidden');}
function showSettingsModal(){
    document.getElementById('settingHeroesPerAttr').value=config.heroesPerAttribute;
    document.getElementById('settingBansPerTeam').value=config.bansPerTeam;
    document.getElementById('settingPicksPerTeam').value=config.picksPerTeam;
    document.getElementById('settingBanOrder').value=config.banOrder.join(',');
    document.getElementById('settingPickOrder').value=config.pickOrder.join(',');
    document.getElementById('settingsModal').classList.remove('hidden');
}
function hideSettingsModal(){document.getElementById('settingsModal')?.classList.add('hidden');}
function applySettings(){
    const hpa=Math.max(5,Math.min(15,parseInt(document.getElementById('settingHeroesPerAttr').value)||10));
    const bpt=Math.max(1,Math.min(5,parseInt(document.getElementById('settingBansPerTeam').value)||3));
    const ppt=Math.max(3,Math.min(5,parseInt(document.getElementById('settingPicksPerTeam').value)||5));
    const bo=(document.getElementById('settingBanOrder').value||'R,D,R,D,R,D').split(',').map(s=>s.trim().toLowerCase());
    const po=(document.getElementById('settingPickOrder').value||'R,D,D,R,R,D,D,R,R,D').split(',').map(s=>s.trim().toLowerCase());
    const pt=s=>s==='r'||s==='radiant'?'radiant':s==='d'||s==='dire'?'dire':null;
    const bo2=bo.map(pt).filter(Boolean),po2=po.map(pt).filter(Boolean);
    if(bo2.length!==bpt*2){showToast(`Порядок банов: ровно ${bpt*2} элементов!`,'error');return;}
    if(po2.length!==ppt*2){showToast(`Порядок пиков: ровно ${ppt*2} элементов!`,'error');return;}
    config.heroesPerAttribute=hpa;config.bansPerTeam=bpt;config.picksPerTeam=ppt;
    config.banOrder=bo2;config.pickOrder=po2;
    hideSettingsModal();
    if(state.seriesStarted)startNewSeries();
    showToast('Настройки применены!','success');
}

function showHistoryModal(){
    const c=document.getElementById('historyContent');if(!c)return;
    if(state.seriesHistory.length===0&&state.currentGameBans.length===0&&state.currentGamePicks.length===0){
        c.innerHTML='<p class="text-muted">Серия ещё не начата.</p>';
    }else{
        let h='<div style="display:flex;flex-direction:column;gap:14px;">';
        state.seriesHistory.forEach(g=>{
            h+=`<div style="border:1px solid var(--border-color);border-radius:8px;padding:12px;">
                <h4 style="margin-bottom:8px;">Игра ${g.gameNumber} ${g.winner==='radiant'?'🏛️ Radiant':g.winner==='dire'?'💀 Dire':''}</h4>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div><strong style="color:var(--radiant-color);">🏛️ Radiant</strong>
                        <div style="font-size:0.7rem;margin-top:4px;"><span class="phase-tag ban">БАН</span> ${g.bans?.radiant?.join(', ')||'—'}</div>
                        <div style="font-size:0.75rem;margin-top:2px;"><span class="phase-tag pick">ПИК</span> ${g.picks?.radiant?.join(', ')||'—'}</div>
                    </div>
                    <div><strong style="color:var(--dire-color);">💀 Dire</strong>
                        <div style="font-size:0.7rem;margin-top:4px;"><span class="phase-tag ban">БАН</span> ${g.bans?.dire?.join(', ')||'—'}</div>
                        <div style="font-size:0.75rem;margin-top:2px;"><span class="phase-tag pick">ПИК</span> ${g.picks?.dire?.join(', ')||'—'}</div>
                    </div>
                </div>
            </div>`;
        });
        if((state.currentGameBans.length>0||state.currentGamePicks.length>0)&&
           !state.seriesHistory.some(g=>g.gameNumber===state.currentGame)){
            h+=`<div style="border:1px solid var(--accent-blue);border-radius:8px;padding:12px;opacity:0.8;">
                <h4 style="margin-bottom:8px;">Игра ${state.currentGame} (текущая)</h4>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div><strong style="color:var(--radiant-color);">🏛️ Radiant</strong>
                        <div style="font-size:0.7rem;margin-top:4px;"><span class="phase-tag ban">БАН</span> ${state.bans.radiant.join(', ')||'—'}</div>
                        <div style="font-size:0.75rem;margin-top:2px;"><span class="phase-tag pick">ПИК</span> ${state.picks.radiant.join(', ')||'—'}</div>
                    </div>
                    <div><strong style="color:var(--dire-color);">💀 Dire</strong>
                        <div style="font-size:0.7rem;margin-top:4px;"><span class="phase-tag ban">БАН</span> ${state.bans.dire.join(', ')||'—'}</div>
                        <div style="font-size:0.75rem;margin-top:2px;"><span class="phase-tag pick">ПИК</span> ${state.picks.dire.join(', ')||'—'}</div>
                    </div>
                </div>
            </div>`;
        }
        h+='</div>';c.innerHTML=h;
    }
    document.getElementById('historyModal').classList.remove('hidden');
}

function hideHistoryModal(){document.getElementById('historyModal')?.classList.add('hidden');}

function showSeriesBannedModal(){
    const c=document.getElementById('seriesBannedContent');if(!c)return;
    if(state.seriesBannedHeroes.length===0){c.innerHTML='<p class="text-muted">Пока нет заблокированных героев.</p>';}
    else{
        let h='<div class="series-banned-grid">';
        [...state.seriesBannedHeroes].sort().forEach(hero=>{
            const u=getHeroImageUrl(hero);
            const gf=state.seriesHistory.find(g=>g.picks?.radiant?.includes(hero)||g.picks?.dire?.includes(hero));
            const gn=gf?gf.gameNumber:'?';
            h+=`<div class="series-banned-hero">
                <div class="sb-avatar" style="background-image:url(${u})"></div>
                <div class="sb-info"><span class="sb-name">${hero}</span><span class="sb-game">Игра ${gn}</span></div>
            </div>`;
        });
        h+='</div>';c.innerHTML=h;
    }
    document.getElementById('seriesBannedModal').classList.remove('hidden');
}

function hideSeriesBannedModal(){document.getElementById('seriesBannedModal')?.classList.add('hidden');}

function showToast(msg,type='info'){
    const c=document.getElementById('toastContainer');if(!c)return;
    const t=document.createElement('div');t.className=`toast ${type}`;t.textContent=msg;
    c.appendChild(t);setTimeout(()=>t.remove(),2500);
}

function createParticles(){
    const c=document.getElementById('bgParticles');if(!c)return;
    for(let i=0;i<20;i++){
        const p=document.createElement('div');p.className='particle';
        p.style.left=Math.random()*100+'%';
        p.style.animationDelay=Math.random()*6+'s';
        p.style.animationDuration=(5+Math.random()*8)+'s';
        p.style.width=p.style.height=(1+Math.random()*2)+'px';
        c.appendChild(p);
    }
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded',()=>{
    createParticles();
    connectWebSocket();

    document.getElementById('btnCreateRoom').addEventListener('click',createRoom);
    document.getElementById('btnJoinRoom').addEventListener('click',()=>joinRoom());
    document.getElementById('btnCopyLink').addEventListener('click',copyInviteLink);
    document.getElementById('joinRoomInput').addEventListener('keydown',(e)=>{if(e.key==='Enter')joinRoom();});

    document.getElementById('btnClaimRadiant').addEventListener('click',()=>claimCaptain('radiant'));
    document.getElementById('btnClaimDire').addEventListener('click',()=>claimCaptain('dire'));
    document.getElementById('btnLeaveRadiant').addEventListener('click',()=>leaveCaptain('radiant'));
    document.getElementById('btnLeaveDire').addEventListener('click',()=>leaveCaptain('dire'));
    document.getElementById('btnCaptainNameConfirm').addEventListener('click',confirmCaptainName);
    document.getElementById('btnCaptainNameCancel').addEventListener('click',()=>{document.getElementById('captainNameModal').classList.add('hidden');pendingCaptainTeam=null;});
    document.getElementById('captainNameInput').addEventListener('keydown',(e)=>{if(e.key==='Enter')confirmCaptainName();});

    document.getElementById('btnNewSeries').addEventListener('click',startNewSeries);
    document.getElementById('btnNextGame').addEventListener('click',nextGame);
    document.getElementById('btnUndo').addEventListener('click',undoLastAction);

    document.getElementById('btnSettings').addEventListener('click',showSettingsModal);
    document.getElementById('btnSettingsClose').addEventListener('click',hideSettingsModal);
    document.getElementById('btnSettingsApply').addEventListener('click',applySettings);

    document.getElementById('btnHistory').addEventListener('click',showHistoryModal);
    document.getElementById('btnHistoryClose').addEventListener('click',hideHistoryModal);

    document.getElementById('btnSeriesBanned').addEventListener('click',showSeriesBannedModal);
    document.getElementById('btnSeriesBannedClose').addEventListener('click',hideSeriesBannedModal);

    document.getElementById('btnRadiantWin').addEventListener('click',()=>setGameWinner('radiant'));
    document.getElementById('btnDireWin').addEventListener('click',()=>setGameWinner('dire'));
    document.getElementById('btnSkipWinner').addEventListener('click',skipWinner);

    document.querySelectorAll('.modal-overlay').forEach(ov=>{
        ov.addEventListener('click',(e)=>{
            if(e.target===ov){
                ov.classList.add('hidden');
                if(ov.id==='winnerModal'&&state.waitingForWinner)skipWinner();
            }
        });
    });

    document.addEventListener('keydown',(e)=>{
        if(e.ctrlKey&&e.key==='z'){e.preventDefault();undoLastAction();}
        if(e.ctrlKey&&e.key==='n'){e.preventDefault();if(!document.getElementById('btnNextGame').disabled)nextGame();}
        if(e.key==='Escape'){hideSettingsModal();hideHistoryModal();hideSeriesBannedModal();}
    });

    renderAll();updateUI();
    document.getElementById('connInfo').style.display='none';
});
