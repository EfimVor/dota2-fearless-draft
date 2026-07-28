/**
 * Dota 2 — Fearless Draft Client (v10 — исправлен синтаксис)
 * Мультиплеер через WebSocket. Таймеры 30с + 2:10 резерв.
 */

// ==================== HERO DATABASE ====================
const ALL_HEROES = {
    strength: ['Abaddon','Alchemist','Axe','Bristleback','Centaur Warrunner','Chaos Knight','Dawnbreaker','Doom','Dragon Knight','Earth Spirit','Earthshaker','Elder Titan','Huskar','Kunkka','Legion Commander','Lifestealer','Mars','Night Stalker','Ogre Magi','Omniknight','Primal Beast','Pudge','Sand King','Slardar','Sven','Tidehunter','Timbersaw','Tiny','Treant Protector','Tusk','Underlord','Undying','Wraith King'],
    agility: ['Anti-Mage','Arc Warden','Bloodseeker','Bounty Hunter','Clinkz','Drow Ranger','Ember Spirit','Faceless Void','Gyrocopter','Hoodwink','Juggernaut','Kez','Luna','Medusa','Meepo','Monkey King','Morphling','Muerta','Naga Siren','Nyx Assassin','Phantom Assassin','Phantom Lancer','Razor','Riki','Shadow Fiend','Slark','Sniper','Spectre','Templar Assassin','Terrorblade','Troll Warlord','Ursa','Viper','Weaver'],
    intelligence: ['Ancient Apparition','Crystal Maiden','Death Prophet','Disruptor','Enchantress','Grimstroke','Invoker','Jakiro','Keeper of the Light','Leshrac','Lich','Lina','Lion',"Nature's Prophet",'Necrophos','Oracle','Outworld Destroyer','Puck','Pugna','Queen of Pain','Ringmaster','Rubick','Shadow Demon','Shadow Shaman','Silencer','Skywrath Mage','Storm Spirit','Tinker','Warlock','Witch Doctor','Zeus'],
    universal: ['Bane','Batrider','Beastmaster','Brewmaster','Broodmother','Chen','Clockwerk','Dark Seer','Dark Willow','Dazzle','Enigma','Io','Lone Druid','Lycan','Magnus','Marci','Mirana','Pangolier','Phoenix','Snapfire','Spirit Breaker','Techies','Vengeful Spirit','Venomancer','Void Spirit','Windranger','Winter Wyvern']
};

const HERO_IMAGE_KEYS = {
    'Abaddon':'abaddon','Alchemist':'alchemist','Ancient Apparition':'ancient_apparition','Anti-Mage':'antimage','Arc Warden':'arc_warden','Axe':'axe','Bane':'bane','Batrider':'batrider','Beastmaster':'beastmaster','Bloodseeker':'bloodseeker','Bounty Hunter':'bounty_hunter','Brewmaster':'brewmaster','Bristleback':'bristleback','Broodmother':'broodmother','Centaur Warrunner':'centaur','Chaos Knight':'chaos_knight','Chen':'chen','Clinkz':'clinkz','Clockwerk':'rattletrap','Crystal Maiden':'crystal_maiden','Dark Seer':'dark_seer','Dark Willow':'dark_willow','Dawnbreaker':'dawnbreaker','Dazzle':'dazzle','Death Prophet':'death_prophet','Disruptor':'disruptor','Doom':'doom_bringer','Dragon Knight':'dragon_knight','Drow Ranger':'drow_ranger','Earth Spirit':'earth_spirit','Earthshaker':'earthshaker','Elder Titan':'elder_titan','Ember Spirit':'ember_spirit','Enchantress':'enchantress','Enigma':'enigma','Faceless Void':'faceless_void','Grimstroke':'grimstroke','Gyrocopter':'gyrocopter','Hoodwink':'hoodwink','Huskar':'huskar','Invoker':'invoker','Io':'wisp','Jakiro':'jakiro','Juggernaut':'juggernaut','Keeper of the Light':'keeper_of_the_light','Kez':'kez','Kunkka':'kunkka','Legion Commander':'legion_commander','Leshrac':'leshrac','Lich':'lich','Lifestealer':'life_stealer','Lina':'lina','Lion':'lion','Lone Druid':'lone_druid','Luna':'luna','Lycan':'lycan','Magnus':'magnataur','Marci':'marci','Mars':'mars','Medusa':'medusa','Meepo':'meepo','Mirana':'mirana','Monkey King':'monkey_king','Morphling':'morphling','Muerta':'muerta','Naga Siren':'naga_siren',"Nature's Prophet":'furion','Necrophos':'necrolyte','Night Stalker':'night_stalker','Nyx Assassin':'nyx_assassin','Ogre Magi':'ogre_magi','Omniknight':'omniknight','Oracle':'oracle','Outworld Destroyer':'obsidian_destroyer','Pangolier':'pangolier','Phantom Assassin':'phantom_assassin','Phantom Lancer':'phantom_lancer','Phoenix':'phoenix','Primal Beast':'primal_beast','Puck':'puck','Pudge':'pudge','Pugna':'pugna','Queen of Pain':'queenofpain','Razor':'razor','Riki':'riki','Ringmaster':'ringmaster','Rubick':'rubick','Sand King':'sand_king','Shadow Demon':'shadow_demon','Shadow Fiend':'nevermore','Shadow Shaman':'shadow_shaman','Silencer':'silencer','Skywrath Mage':'skywrath_mage','Slardar':'slardar','Slark':'slark','Snapfire':'snapfire','Sniper':'sniper','Spectre':'spectre','Spirit Breaker':'spirit_breaker','Storm Spirit':'storm_spirit','Sven':'sven','Techies':'techies','Templar Assassin':'templar_assassin','Terrorblade':'terrorblade','Tidehunter':'tidehunter','Timbersaw':'shredder','Tinker':'tinker','Tiny':'tiny','Treant Protector':'treant','Troll Warlord':'troll_warlord','Tusk':'tusk','Underlord':'abyssal_underlord','Undying':'undying','Ursa':'ursa','Vengeful Spirit':'vengeful_spirit','Venomancer':'venomancer','Viper':'viper','Void Spirit':'void_spirit','Warlock':'warlock','Weaver':'weaver','Windranger':'windrunner','Winter Wyvern':'winter_wyvern','Witch Doctor':'witch_doctor','Wraith King':'skeleton_king','Zeus':'zeus'
};

function getHeroImageUrl(n){const k=HERO_IMAGE_KEYS[n];return k?`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${k}.png`:'';}
function getAttrBg(a){return{strength:'#1a100e',agility:'#0e1a12',intelligence:'#0e141a',universal:'#160e1a'}[a]||'#111';}
function getAttrLabel(a){return{strength:'Сила',agility:'Ловкость',intelligence:'Интеллект',universal:'Универсал'}[a]||a;}

// ==================== CONFIG ====================
const DEFAULT_CONFIG = {heroesPerAttribute:10,bansPerTeam:3,picksPerTeam:5,banOrder:[],pickOrder:[]};
let config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

function setOrderByStartingTeam(startingTeam) {
    if (startingTeam === 'radiant') {
        config.banOrder = ['radiant','dire','radiant','dire','radiant','dire'];
        config.pickOrder = ['radiant','dire','dire','radiant','radiant','dire','dire','radiant','radiant','dire'];
    } else {
        config.banOrder = ['dire','radiant','dire','radiant','dire','radiant'];
        config.pickOrder = ['dire','radiant','radiant','dire','dire','radiant','radiant','dire','dire','radiant'];
    }
}
setOrderByStartingTeam('radiant');

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
            syncCaptainsFromServer();
            if(msg.state){isRemoteAction=true;deserializeState(msg.state);isRemoteAction=false;renderAll();updateUI();}
            updateConnectionStatus('connected',`Комната ${roomCode}`);
            showToast(msg.type==='ROOM_CREATED'?'Комната создана! Отправьте код сопернику.':'Подключились к комнате!','success');
            break;
        case 'CAPTAIN_CLAIMED':
            serverCaptains[msg.team]=msg.name; syncCaptainsFromServer(); renderAll();
            showToast(`${msg.name} стал капитаном ${msg.team==='radiant'?'Radiant':'Dire'}!`,'info');
            break;
        case 'CAPTAIN_LEFT': serverCaptains[msg.team]=null; syncCaptainsFromServer(); renderAll(); break;
        case 'STATE_SYNC':
            serverCaptains=msg.captains||serverCaptains;
            if(msg.state){isRemoteAction=true;deserializeState(msg.state);isRemoteAction=false;renderAll();updateUI();}
            break;
        case 'GAME_ACTION':
            isRemoteAction=true; handleRemoteAction(msg.action); isRemoteAction=false;
            if(msg.captains){serverCaptains=msg.captains;}
            renderAll(); updateUI();
            break;
        case 'TIMER_TICK':
            if(msg.timerData) {
                state.mainTimer = msg.timerData.mainTimer;
                if(msg.timerData.reserveTimers) state.reserveTimers = msg.timerData.reserveTimers;
                updateTimerDisplay();
            }
            break;
        case 'PLAYER_JOINED': showToast('Игрок подключился к комнате','info'); break;
        case 'PLAYER_LEFT': showToast('Игрок отключился','info'); break;
        case 'ERROR': showToast(msg.message,'error'); break;
    }
}

function sendMessage(msg){if(ws&&ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify(msg));}
function syncGameState(){if(!roomCode)return;sendMessage({type:'SYNC_STATE',state:serializeState()});}
function broadcastAction(action){if(!roomCode||isRemoteAction)return;sendMessage({type:'GAME_ACTION',action});syncGameState();}
function handleRemoteAction(action){switch(action.type){case'ban':applyBanLocally(action.hero,action.attribute,action.team);break;case'pick':applyPickLocally(action.hero,action.attribute,action.team);break;case'undo':applyUndoLocally();break;case'new_series':setOrderByStartingTeam(action.startingTeam);applyNewSeriesLocally(action.serializedState);break;case'next_game':applyNextGameLocally();break;case'set_winner':break;}}

// ==================== CONNECTION UI ====================
function updateConnectionStatus(status,text){const dot=document.querySelector('.conn-dot');const textEl=document.getElementById('connText');if(dot){dot.className='conn-dot';dot.classList.add(status);}if(textEl)textEl.textContent=text;}
function createRoom(){sendMessage({type:'CREATE_ROOM'});}
function joinRoom(code){if(!code){code=document.getElementById('joinRoomInput').value.trim();}if(!code||code.length!==6){showToast('Введите 6-значный код комнаты','error');return;}sendMessage({type:'JOIN_ROOM',roomCode:code});const newUrl=new URL(location);newUrl.searchParams.set('room',code);history.replaceState({},'',newUrl);}
function copyInviteLink(){if(!roomCode)return;const link=`${location.origin}${location.pathname}?room=${roomCode}`;navigator.clipboard.writeText(link).then(()=>{showToast('Ссылка скопирована! Отправьте её сопернику.','success');}).catch(()=>{const helper=document.getElementById('copyHelper');helper.value=link;helper.select();document.execCommand('copy');showToast('Ссылка скопирована!','success');});}

// ==================== CAPTAINS & SPECTATOR ====================
let captains = {radiant:null,dire:null};

function syncCaptainsFromServer() {
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
    if (!captains[team]) return true;
    return captains[team].id !== 'remote';
}

function isLocalCaptain() {
    return (captains.radiant && captains.radiant.id === 'local') || (captains.dire && captains.dire.id === 'local');
}

function isSpectator() {
    return !isLocalCaptain();
}

function updateSpectatorUI() {
    const claimRadiant = document.getElementById('btnClaimRadiant');
    const claimDire = document.getElementById('btnClaimDire');
    if (isSpectator() && roomCode) {
        if (captains.radiant && captains.dire) {
            if (claimRadiant) claimRadiant.style.display = 'none';
            if (claimDire) claimDire.style.display = 'none';
            showToast('Вы зритель 👁️', 'info');
        }
    } else {
        if (claimRadiant) claimRadiant.style.display = '';
        if (claimDire) claimDire.style.display = '';
    }
}

// ==================== GAME STATE ====================
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
    state.direScore=s.direScore;
    state.mainTimer=s.mainTimer!==undefined?s.mainTimer:30;
    state.reserveTimers=s.reserveTimers||{radiant:130,dire:130};
}

// ==================== TIMER ====================
let turnTimerInterval = null;

function startTurnTimer(team) {
    stopTurnTimer();
    updateTimerDisplay();
    if (!state.seriesStarted || state.phase === 'complete') return;
    const isOurTurn = state.currentTurn === team;
    const isLocalCaptain = !captains[team] || captains[team].id === 'local';
    if (!isOurTurn || !isLocalCaptain) return;

    turnTimerInterval = setInterval(() => {
        if (state.phase === 'complete') { stopTurnTimer(); return; }
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
                type: 'TIMER_SYNC',
                timerData: {
                    mainTimer: state.mainTimer,
                    reserveTimers: state.reserveTimers
                }
            });
        }
    }, 1000);
}

function stopTurnTimer() { if (turnTimerInterval) { clearInterval(turnTimerInterval); turnTimerInterval = null; } }

function forceRandomAction(team) {
    const availableHeroes = [];
    for (const attr of ['strength','agility','intelligence','universal']) {
        (state.availableHeroes[attr]||[]).forEach(hero => {
            if (!state.currentGameBans.some(b=>b.hero===hero) && !state.currentGamePicks.some(p=>p.hero===hero)) {
                availableHeroes.push({hero,attribute:attr});
            }
        });
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
    if (!state.seriesStarted || state.phase === 'complete') {
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

function confirmCaptainName(){const input=document.getElementById('captainNameInput');const name=input.value.trim()||`Капитан ${pendingCaptainTeam==='radiant'?'Radiant':'Dire'}`;const team=pendingCaptainTeam;document.getElementById('captainNameModal').classList.add('hidden');pendingCaptainTeam=null;captains[team]={name,id:'local'};sendMessage({type:'CLAIM_CAPTAIN',team,name});serverCaptains[team]=name;renderAll();updateUI();showToast(`Вы стали капитаном ${team==='radiant'?'Radiant':'Dire'}!`,'success');}
function leaveCaptain(team){if(captains[team]&&captains[team].id==='remote')return;captains[team]=null;sendMessage({type:'LEAVE_CAPTAIN',team});serverCaptains[team]=null;renderAll();updateUI();}

function startNewSeries(){
    if (!isLocalCaptain() && state.seriesStarted) {
        showToast('Только капитан может начать новую серию','error');
        return;
    }
    if (!state.seriesStarted || state.phase === 'complete') {
        document.getElementById('startSideModal').classList.remove('hidden');
    } else {
        doStartNewSeries(config.banOrder[0]);
    }
}

function doStartNewSeries(startingTeam) {
    setOrderByStartingTeam(startingTeam);
    state = createInitialState();
    state.seriesStarted = true;
    state.availableHeroes = generateHeroPool();
    state.phase = 'ban'; state.step = 0; state.currentTurn = config.banOrder[0];
    renderAll(); updateUI();
    broadcastAction({type:'new_series', startingTeam: startingTeam, serializedState: serializeState()});
    syncGameState();
    showToast(`Новая серия началась! ${startingTeam==='radiant'?'Radiant':'Dire'} начинает ⚔️`,'success');
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
    if(!isLocalCaptain()){showToast('Только капитаны могут банить','error');return;}
    if(state.phase!=='ban'){showToast('Сейчас фаза пиков!','error');return;}
    if(!state.seriesStarted){showToast('Начните новую серию!','error');return;}
    const team=getBanStepTeam(state.step);
    if(state.bans[team].length>=config.bansPerTeam){showToast('Команда сделала все баны!','error');return;}
    if(!isMyCaptain(team)){showToast('Это не ваш бан!','error');return;}
    if(state.currentGameBans.some(b=>b.hero===hero)||state.currentGamePicks.some(p=>p.hero===hero)){showToast('Герой уже выбран','error');return;}
    applyBanLocally(hero,attribute,team);
    broadcastAction({type:'ban',hero,attribute,team});
    syncGameState();
}

function applyBanLocally(hero,attribute,team){
    state.currentGameBans.push({hero,attribute,team});
    state.bans[team].push(hero);
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
    if(!isLocalCaptain()){showToast('Только капитаны могут пикать','error');return;}
    if(state.phase!=='pick'){showToast('Сейчас фаза банов!','error');return;}
    if(!state.seriesStarted){showToast('Начните новую серию!','error');return;}
    const team=getPickStepTeam(state.step);
    if(state.picks[team].length>=config.picksPerTeam){showToast('Команда набрала всех героев!','error');return;}
    if(!isMyCaptain(team)){showToast('Это не ваш пик!','error');return;}
    if(state.currentGameBans.some(b=>b.hero===hero)||state.currentGamePicks.some(p=>p.hero===hero)){showToast('Герой уже выбран','error');return;}
    applyPickLocally(hero,attribute,team);
    broadcastAction({type:'pick',hero,attribute,team});
    syncGameState();
}

function applyPickLocally(hero,attribute,team){
    state.currentGamePicks.push({hero,attribute,team});
    state.picks[team].push(hero);
    state.step++;
    if(state.step>=totalPicks()){
        state.phase='complete';
        stopTurnTimer();
        addCurrentGameToHistory();
        syncGameState();
    }else{
        state.currentTurn=getPickStepTeam(state.step);
        state.mainTimer=30;
    }
    renderAll(); updateUI();
    if(state.phase!=='complete') {
        startTurnTimer(state.currentTurn);
        checkSkipFullTeam();
    }
}

function checkSkipFullTeam(){
    const team=state.currentTurn;
    if(state.picks[team].length>=config.picksPerTeam){
        state.step++;
        if(state.step>=totalPicks()){
            state.phase='complete';
            stopTurnTimer();
            addCurrentGameToHistory();
            syncGameState();
        }else{
            state.currentTurn=getPickStepTeam(state.step);
            state.mainTimer=30;
        }
        renderAll(); updateUI();
        if(state.phase!=='complete') {
            startTurnTimer(state.currentTurn);
            checkSkipFullTeam();
        }
    }
}

function addCurrentGameToHistory(){
    if (state.seriesHistory.some(g=>g.gameNumber===state.currentGame)) return;
    state.seriesHistory.push({
        gameNumber: state.currentGame,
        bans: JSON.parse(JSON.stringify(state.bans)),
        picks: JSON.parse(JSON.stringify(state.picks))
    });
}

function undoLastAction(){
    if(!isLocalCaptain()){showToast('Только капитаны могут отменять действия','error');return;}
    if(!state.seriesStarted)return;
    if(state.phase==='complete'){showToast('Игра завершена, отмена невозможна.','error');return;}
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
        state.step--;
        state.currentTurn=getPickStepTeam(state.step);
    }else if(state.phase==='ban'&&state.currentGameBans.length>0){
        const last=state.currentGameBans.pop();
        state.bans[last.team].pop();
        state.step--;
        state.currentTurn=getBanStepTeam(state.step);
    }else if(state.phase==='pick'&&state.currentGamePicks.length===0&&state.currentGameBans.length>0){
        const last=state.currentGameBans.pop();
        state.bans[last.team].pop();
        state.phase='ban'; state.step=totalBans()-1; state.currentTurn=getBanStepTeam(state.step);
    }
    state.mainTimer=30;
    renderAll(); updateUI();
    startTurnTimer(state.currentTurn);
    showToast('Действие отменено ↩','info');
}

function nextGame(){
    if(!isLocalCaptain()){showToast('Только капитаны могут перейти к следующей игре','error');return;}
    if(state.phase!=='complete'){showToast('Сначала завершите драфт!','error');return;}
    applyNextGameLocally();
    broadcastAction({type:'next_game'});
    syncGameState();
}

function applyNextGameLocally(){
    const currentBanned = [...state.seriesBannedHeroes];
    state.currentGamePicks.forEach(p=>{if(!currentBanned.includes(p.hero))currentBanned.push(p.hero);});
    const nextGameNum = state.currentGame + 1;
    state = createInitialState();
    state.currentGame = nextGameNum;
    state.seriesBannedHeroes = currentBanned;
    state.availableHeroes = generateHeroPool();
    state.phase = 'ban'; state.step = 0; state.currentTurn = config.banOrder[0];
    state.seriesStarted = true;
    renderAll(); updateUI();
    showToast(`Игра ${state.currentGame} началась! Фаза банов`,'info');
}

// ==================== RENDER ====================
function renderAll(){
    renderHeroPool();
    renderTeamBans('radiant'); renderTeamBans('dire');
    renderTeamPicks('radiant'); renderTeamPicks('dire');
    renderHistoryPanel();
    updateAttrCounts(); updateGameBadge(); updatePhaseBadge();
    updateScoreDisplay(); renderCaptainBar(); updateButtons(); updateTimerDisplay();
    updateSpectatorUI();
}

function renderHeroPool(){
    const grids={strength:'strengthGrid',agility:'agilityGrid',intelligence:'intelligenceGrid',universal:'universalGrid'};
    for(const[attr,gridId]of Object.entries(grids)){
        const grid=document.getElementById(gridId); if(!grid)continue;
        const heroes=state.availableHeroes[attr]||[]; grid.innerHTML='';
        if(!state.seriesStarted){grid.innerHTML='<div class="text-muted" style="grid-column:1/-1;padding:12px;font-size:0.65rem;">Начните серию</div>';continue;}
        if(heroes.length===0){grid.innerHTML='<div class="text-muted" style="grid-column:1/-1;padding:12px;font-size:0.65rem;">Нет героев</div>';continue;}
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
            if(!isSeriesBanned && !isPicked && !isBanned){
                if(state.phase==='ban') card.onclick=()=>banHero(hero,attr);
                else if(state.phase==='pick') card.onclick=()=>pickHero(hero,attr);
            }
            grid.appendChild(card);
        });
        const needed=config.heroesPerAttribute - heroes.length;
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
        const s=document.createElement('div');
        s.className='ban-slot';
        if(i<bans.length){
            s.className+=' filled';
            const imgUrl=getHeroImageUrl(bans[i]);
            if(imgUrl) {
                s.style.backgroundImage = `url(${imgUrl})`;
                s.style.backgroundSize = 'cover';
                s.style.backgroundPosition = 'center 20%';
            } else {
                s.style.background = getAttrBg('strength');
            }
            s.title=bans[i];
        }else{
            s.className+=' empty';
        }
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

function renderHistoryPanel(){
    const list = document.getElementById('historyList');
    if(!list) return;
    if(state.seriesHistory.length === 0) {
        list.innerHTML = '<p class="text-muted">Нет завершённых игр</p>';
        return;
    }
    let html = '';
    const reversed = [...state.seriesHistory].reverse();
    reversed.forEach(game => {
        html += '<div class="history-game"><div class="history-game-number">Игра ' + game.gameNumber + '</div>';
        if (game.picks && game.picks.radiant && game.picks.radiant.length > 0) {
            html += '<div class="history-team-row"><span class="history-team-label radiant">R</span>';
            game.picks.radiant.forEach(hero => {
                const img = getHeroImageUrl(hero);
                html += '<div class="history-hero-icon" style="background-image:url(' + img + ')" title="' + hero + '"></div>';
            });
            html += '</div>';
        }
        if (game.picks && game.picks.dire && game.picks.dire.length > 0) {
            html += '<div class="history-team-row"><span class="history-team-label dire">D</span>';
            game.picks.dire.forEach(hero => {
                const img = getHeroImageUrl(hero);
                html += '<div class="history-hero-icon" style="background-image:url(' + img + ')" title="' + hero + '"></div>';
            });
            html += '</div>';
        }
        html += '</div>';
    });
    list.innerHTML = html;
}

function renderCaptainBar(){
    const rE=document.getElementById('radiantCaptainEmpty'),rF=document.getElementById('radiantCaptainFilled'),rN=document.getElementById('radiantCaptainName');
    const dE=document.getElementById('direCaptainEmpty'),dF=document.getElementById('direCaptainFilled'),dN=document.getElementById('direCaptainName');
    if(captains.radiant){rE.classList.add('hidden');rF.classList.remove('hidden');rN.textContent=captains.radiant.name;}
    else{rE.classList.remove('hidden');rF.classList.add('hidden');}
    if(captains.dire){dE.classList.add('hidden');dF.classList.remove('hidden');dN.textContent=captains.dire.name;}
    else{dE.classList.remove('hidden');dF.classList.add('hidden');}
    updateSpectatorUI();
}

function updateAttrCounts(){
    const m={strCount:'strength',agiCount:'agility',intCount:'intelligence',uniCount:'universal'};
    for(const[id,attr]of Object.entries(m)){
        const heroes = state.availableHeroes[attr] || [];
        const selectable = heroes.filter(h =>
            !state.currentGameBans.some(b=>b.hero===h) &&
            !state.currentGamePicks.some(p=>p.hero===h)
        ).length;
        const e=document.getElementById(id);
        if(e) e.textContent = `${selectable}/${config.heroesPerAttribute}`;
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
    if(state.phase==='complete'){
        rT?.classList.add('hidden'); dT?.classList.add('hidden');
        if(tI){tI.textContent='Драфт завершён';tI.className='turn-info';}
        resetPanelGlows(); return;
    }
    const isR=state.currentTurn==='radiant';
    rT?.classList.toggle('hidden',!isR); dT?.classList.toggle('hidden',isR);
    const rP=document.getElementById('radiantPanel'),dP=document.getElementById('direPanel');
    if(rP&&dP){
        rP.style.boxShadow=isR?'0 0 25px var(--radiant-glow)':'none';
        dP.style.boxShadow=!isR?'0 0 25px var(--dire-glow)':'none';
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
    if(u)u.disabled=!state.seriesStarted||!hasA||state.phase==='complete'||!isLocalCaptain();
    if(n)n.disabled=!state.seriesStarted||state.phase!=='complete'||!isLocalCaptain();
}

// ==================== MODALS ====================
function showSettings
