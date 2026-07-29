/* Dota 2 Fearless Draft - Game Logic (v15) */
var ALL_HEROES = {
    strength: ["Abaddon","Alchemist","Axe","Bristleback","Centaur Warrunner","Chaos Knight","Dawnbreaker","Doom","Dragon Knight","Earth Spirit","Earthshaker","Elder Titan","Huskar","Kunkka","Legion Commander","Lifestealer","Mars","Night Stalker","Ogre Magi","Omniknight","Primal Beast","Pudge","Sand King","Slardar","Sven","Tidehunter","Timbersaw","Tiny","Treant Protector","Tusk","Underlord","Undying","Wraith King"],
    agility: ["Anti-Mage","Arc Warden","Bloodseeker","Bounty Hunter","Clinkz","Drow Ranger","Ember Spirit","Faceless Void","Gyrocopter","Hoodwink","Juggernaut","Kez","Luna","Medusa","Meepo","Monkey King","Morphling","Muerta","Naga Siren","Nyx Assassin","Phantom Assassin","Phantom Lancer","Razor","Riki","Shadow Fiend","Slark","Sniper","Spectre","Templar Assassin","Terrorblade","Troll Warlord","Ursa","Viper","Weaver"],
    intelligence: ["Ancient Apparition","Crystal Maiden","Death Prophet","Disruptor","Enchantress","Grimstroke","Invoker","Jakiro","Keeper of the Light","Leshrac","Lich","Lina","Lion","Nature's Prophet","Necrophos","Oracle","Outworld Destroyer","Puck","Pugna","Queen of Pain","Ringmaster","Rubick","Shadow Demon","Shadow Shaman","Silencer","Skywrath Mage","Storm Spirit","Tinker","Warlock","Witch Doctor","Zeus"],
    universal: ["Bane","Batrider","Beastmaster","Brewmaster","Broodmother","Chen","Clockwerk","Dark Seer","Dark Willow","Dazzle","Enigma","Io","Lone Druid","Lycan","Magnus","Marci","Mirana","Pangolier","Phoenix","Snapfire","Spirit Breaker","Techies","Vengeful Spirit","Venomancer","Void Spirit","Windranger","Winter Wyvern"]
};
var HERO_KEYS = {"Abaddon":"abaddon","Alchemist":"alchemist","Ancient Apparition":"ancient_apparition","Anti-Mage":"antimage","Arc Warden":"arc_warden","Axe":"axe","Bane":"bane","Batrider":"batrider","Beastmaster":"beastmaster","Bloodseeker":"bloodseeker","Bounty Hunter":"bounty_hunter","Brewmaster":"brewmaster","Bristleback":"bristleback","Broodmother":"broodmother","Centaur Warrunner":"centaur","Chaos Knight":"chaos_knight","Chen":"chen","Clinkz":"clinkz","Clockwerk":"rattletrap","Crystal Maiden":"crystal_maiden","Dark Seer":"dark_seer","Dark Willow":"dark_willow","Dawnbreaker":"dawnbreaker","Dazzle":"dazzle","Death Prophet":"death_prophet","Disruptor":"disruptor","Doom":"doom_bringer","Dragon Knight":"dragon_knight","Drow Ranger":"drow_ranger","Earth Spirit":"earth_spirit","Earthshaker":"earthshaker","Elder Titan":"elder_titan","Ember Spirit":"ember_spirit","Enchantress":"enchantress","Enigma":"enigma","Faceless Void":"faceless_void","Grimstroke":"grimstroke","Gyrocopter":"gyrocopter","Hoodwink":"hoodwink","Huskar":"huskar","Invoker":"invoker","Io":"wisp","Jakiro":"jakiro","Juggernaut":"juggernaut","Keeper of the Light":"keeper_of_the_light","Kez":"kez","Kunkka":"kunkka","Legion Commander":"legion_commander","Leshrac":"leshrac","Lich":"lich","Lifestealer":"life_stealer","Lina":"lina","Lion":"lion","Lone Druid":"lone_druid","Luna":"luna","Lycan":"lycan","Magnus":"magnataur","Marci":"marci","Mars":"mars","Medusa":"medusa","Meepo":"meepo","Mirana":"mirana","Monkey King":"monkey_king","Morphling":"morphling","Muerta":"muerta","Naga Siren":"naga_siren","Nature's Prophet":"furion","Necrophos":"necrolyte","Night Stalker":"night_stalker","Nyx Assassin":"nyx_assassin","Ogre Magi":"ogre_magi","Omniknight":"omniknight","Oracle":"oracle","Outworld Destroyer":"obsidian_destroyer","Pangolier":"pangolier","Phantom Assassin":"phantom_assassin","Phantom Lancer":"phantom_lancer","Phoenix":"phoenix","Primal Beast":"primal_beast","Puck":"puck","Pudge":"pudge","Pugna":"pugna","Queen of Pain":"queenofpain","Razor":"razor","Riki":"riki","Ringmaster":"ringmaster","Rubick":"rubick","Sand King":"sand_king","Shadow Demon":"shadow_demon","Shadow Fiend":"nevermore","Shadow Shaman":"shadow_shaman","Silencer":"silencer","Skywrath Mage":"skywrath_mage","Slardar":"slardar","Slark":"slark","Snapfire":"snapfire","Sniper":"sniper","Spectre":"spectre","Spirit Breaker":"spirit_breaker","Storm Spirit":"storm_spirit","Sven":"sven","Techies":"techies","Templar Assassin":"templar_assassin","Terrorblade":"terrorblade","Tidehunter":"tidehunter","Timbersaw":"shredder","Tinker":"tinker","Tiny":"tiny","Treant Protector":"treant","Troll Warlord":"troll_warlord","Tusk":"tusk","Underlord":"abyssal_underlord","Undying":"undying","Ursa":"ursa","Vengeful Spirit":"vengeful_spirit","Venomancer":"venomancer","Viper":"viper","Void Spirit":"void_spirit","Warlock":"warlock","Weaver":"weaver","Windranger":"windrunner","Winter Wyvern":"winter_wyvern","Witch Doctor":"witch_doctor","Wraith King":"skeleton_king","Zeus":"zuus"};

function heroImg(n){var k=HERO_KEYS[n];return k?"https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/"+k+".png":"";}
function attrBg(a){var c={strength:"#1a100e",agility:"#0e1a12",intelligence:"#0e141a",universal:"#160e1a"};return c[a]||"#111";}
function attrLabel(a){var l={strength:"Сила",agility:"Ловкость",intelligence:"Интеллект",universal:"Универсал"};return l[a]||a;}

var CFG={heroesPerAttribute:9,bansPerTeam:3,picksPerTeam:5,banOrder:["radiant","dire","radiant","dire","radiant","dire"],pickOrder:["radiant","dire","dire","radiant","radiant","dire","dire","radiant","radiant","dire"]};

var ws=null,roomCode=null,svCaptains={radiant:null,dire:null},isRemote=false;
function connect(){
    if(ws&&ws.readyState===WebSocket.OPEN)return;
    var url=(location.protocol==="https:"?"wss:":"ws:")+"//"+location.host;
    setConStatus("connecting","Подключение...");
    try{ws=new WebSocket(url);ws.onopen=onOpen;ws.onmessage=onMsg;ws.onclose=onClose;ws.onerror=onErr;}
    catch(e){setConStatus("disconnected","Сервер недоступен");setTimeout(connect,5000);}
}
function onOpen(){setConStatus("connected","Подключен");var p=new URLSearchParams(location.search);var r=p.get("room");if(r&&!roomCode)joinRoom(r);}
function onClose(){setConStatus("disconnected","Соединение потеряно");ws=null;setTimeout(connect,3000);}
function onErr(){setConStatus("disconnected","Ошибка");}
function onMsg(e){
    var m=JSON.parse(e.data);
    switch(m.type){
        case"ROOM_CREATED":case"ROOM_JOINED":roomCode=m.roomCode;svCaptains=m.captains||{radiant:null,dire:null};el("roomCodeDisplay").textContent=roomCode;el("connInfo").style.display="flex";syncCaps();if(m.state){isRemote=true;loadState(m.state);isRemote=false;refresh();}setConStatus("connected","Комната "+roomCode);toast(m.type==="ROOM_CREATED"?"Комната создана!":"Подключились!","success");break;
        case"CAPTAIN_CLAIMED":svCaptains[m.team]=m.name;syncCaps();refresh();toast(m.name+" — капитан "+(m.team==="radiant"?"Radiant":"Dire")+"!","info");break;
        case"CAPTAIN_LEFT":svCaptains[m.team]=null;syncCaps();refresh();break;
        case"STATE_SYNC":svCaptains=m.captains||svCaptains;if(m.state){isRemote=true;loadState(m.state);isRemote=false;refresh();}break;
        case"GAME_ACTION":isRemote=true;remoteAction(m.action);isRemote=false;if(m.captains)svCaptains=m.captains;refresh();break;
        case"TIMER_TICK":if(m.timerData){game.mainTimer=m.timerData.mainTimer;if(m.timerData.reserveTimers)game.reserveTimers=m.timerData.reserveTimers;updateTimerDisplay();}break;
        case"PLAYER_JOINED":toast("Игрок подключился","info");break;
        case"PLAYER_LEFT":toast("Игрок отключился","info");break;
        case"ERROR":toast(m.message,"error");break;
    }
}
function send(m){if(ws&&ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify(m));}
function syncState(){if(roomCode)send({type:"SYNC_STATE",state:saveState()});}
function broadcast(a){if(roomCode&&!isRemote){send({type:"GAME_ACTION",action:a});syncState();}}
function remoteAction(a){switch(a.type){case"ban":applyBanLocally(a.hero,a.attribute,a.team);break;case"pick":applyPickLocally(a.hero,a.attribute,a.team);break;case"undo":undoLocal();break;case"new_series":applyNewSeriesLocally(a.serializedState);break;case"next_game":startNextGameRemote(a.startingTeam);break;}}

function el(id){return document.getElementById(id);}
function setConStatus(s,t){var d=document.querySelector(".conn-dot");var e=el("connText");if(d)d.className="conn-dot "+s;if(e)e.textContent=t;}
function createRoom(){send({type:"CREATE_ROOM"});}
function joinRoom(code){if(!code)code=el("joinRoomInput").value.trim();if(!code||code.length!==6){toast("Введите 6-значный код","error");return;}send({type:"JOIN_ROOM",roomCode:code});var u=new URL(location);u.searchParams.set("room",code);history.replaceState({},"",u);}
function copyLink(){if(!roomCode)return;var link=location.origin+location.pathname+"?room="+roomCode;navigator.clipboard.writeText(link).then(function(){toast("Ссылка скопирована!","success");}).catch(function(){var h=el("copyHelper");h.value=link;h.select();document.execCommand("copy");toast("Ссылка скопирована!","success");});}

var captains={radiant:null,dire:null};
function syncCaps(){
    if(svCaptains.radiant&&(!captains.radiant||captains.radiant.id!=="local"))captains.radiant={name:svCaptains.radiant,id:"remote"};
    else if(!svCaptains.radiant&&captains.radiant&&captains.radiant.id!=="local")captains.radiant=null;
    if(svCaptains.dire&&(!captains.dire||captains.dire.id!=="local"))captains.dire={name:svCaptains.dire,id:"remote"};
    else if(!svCaptains.dire&&captains.dire&&captains.dire.id!=="local")captains.dire=null;
    updateSpecUI();
}
function isMyCaptain(team){return!captains[team]||captains[team].id!=="remote";}
function isLocal(){return(captains.radiant&&captains.radiant.id==="local")||(captains.dire&&captains.dire.id==="local");}
function updateSpecUI(){
    var cr=el("btnClaimRadiant"),cd=el("btnClaimDire");
    if(!isLocal()&&roomCode){
        if(captains.radiant&&captains.dire){
            if(cr)cr.style.display="none";
            if(cd)cd.style.display="none";
            toast("Вы зритель","info");
        }
    } else {
        if(cr)cr.style.display="";
        if(cd)cd.style.display="";
    }
}

function freshState(){return{seriesStarted:false,currentGame:1,availableHeroes:{strength:[],agility:[],intelligence:[],universal:[]},phase:"ban",step:0,currentTurn:"radiant",bans:{radiant:[],dire:[]},picks:{radiant:[],dire:[]},currentGameBans:[],currentGamePicks:[],seriesBannedHeroes:[],seriesHistory:[],radiantScore:0,direScore:0,mainTimer:30,reserveTimers:{radiant:130,dire:130}};}
var game=freshState();
function saveState(){return{seriesStarted:game.seriesStarted,currentGame:game.currentGame,availableHeroes:JSON.parse(JSON.stringify(game.availableHeroes)),phase:game.phase,step:game.step,currentTurn:game.currentTurn,bans:JSON.parse(JSON.stringify(game.bans)),picks:JSON.parse(JSON.stringify(game.picks)),currentGameBans:game.currentGameBans.slice(),currentGamePicks:game.currentGamePicks.slice(),seriesBannedHeroes:game.seriesBannedHeroes.slice(),seriesHistory:JSON.parse(JSON.stringify(game.seriesHistory)),radiantScore:game.radiantScore,direScore:game.direScore,mainTimer:game.mainTimer,reserveTimers:{radiant:game.reserveTimers.radiant,dire:game.reserveTimers.dire}};}
function loadState(s){if(!s)return;game.seriesStarted=s.seriesStarted;game.currentGame=s.currentGame;game.availableHeroes=s.availableHeroes;game.phase=s.phase;game.step=s.step;game.currentTurn=s.currentTurn;game.bans=s.bans;game.picks=s.picks;game.currentGameBans=s.currentGameBans||[];game.currentGamePicks=s.currentGamePicks||[];game.seriesBannedHeroes=s.seriesBannedHeroes||[];game.seriesHistory=s.seriesHistory||[];game.radiantScore=s.radiantScore||0;game.direScore=s.direScore||0;game.mainTimer=s.mainTimer!==undefined?s.mainTimer:30;game.reserveTimers=s.reserveTimers||{radiant:130,dire:130};}

var timerInt=null;
function startTimer(team){
    stopTimer();updateTimerDisplay();
    if(!game.seriesStarted||game.phase==="complete")return;
    if(!team)return;
    if(game.currentTurn!==team||(captains[team]&&captains[team].id!=="local"))return;
    timerInt=setInterval(function(){
        if(game.phase==="complete"){stopTimer();return;}
        if(game.mainTimer>0)game.mainTimer--;
        else if(game.reserveTimers[team]>0)game.reserveTimers[team]--;
        else{stopTimer();forceRandom(team);return;}
        updateTimerDisplay();
        if(roomCode&&!isRemote)send({type:"TIMER_SYNC",timerData:{mainTimer:game.mainTimer,reserveTimers:game.reserveTimers}});
    },1000);
}
function stopTimer(){if(timerInt){clearInterval(timerInt);timerInt=null;}}
function forceRandom(team){
    var pool=[];
    var attrs=["strength","agility","intelligence","universal"];
    for(var i=0;i<attrs.length;i++){var heroes=game.availableHeroes[attrs[i]]||[];for(var j=0;j<heroes.length;j++){var h=heroes[j];if(!game.currentGameBans.some(function(b){return b.hero===h;})&&!game.currentGamePicks.some(function(p){return p.hero===h;}))pool.push({hero:h,attribute:attrs[i]});}}
    if(pool.length===0)return;
    var pick=pool[Math.floor(Math.random()*pool.length)];
    if(game.phase==="ban"){applyBanLocally(pick.hero,pick.attribute,team);broadcast({type:"ban",hero:pick.hero,attribute:pick.attribute,team:team});}
    else{applyPickLocally(pick.hero,pick.attribute,team);broadcast({type:"pick",hero:pick.hero,attribute:pick.attribute,team:team});}
    syncState();toast("Авто-"+(game.phase==="ban"?"бан: ":"пик: ")+pick.hero,"info");
}
function updateTimerDisplay(){
    var mainEl=el("timerMain"),resEl=el("timerReserve"),cont=el("timerContainer"),info=el("turnInfo");
    if(!game.seriesStarted||game.phase==="complete"){if(cont)cont.style.display="none";if(info)info.style.display="block";return;}
    if(cont)cont.style.display="flex";if(info)info.style.display="none";
    var team=game.currentTurn,reserve=game.reserveTimers[team]||0;
    var mm=Math.floor(Math.max(0,game.mainTimer)/60),ms=Math.max(0,game.mainTimer)%60;
    if(mainEl)mainEl.textContent=(mm<10?"0":"")+mm+":"+(ms<10?"0":"")+ms;
    var rm=Math.floor(reserve/60),rs=reserve%60;
    if(resEl)resEl.textContent="+"+rm+":"+(rs<10?"0":"")+rs;
    if(cont){cont.classList.remove("warning","danger");if(game.mainTimer<=10&&game.mainTimer>0)cont.classList.add("warning");else if(game.mainTimer===0)cont.classList.add("danger");}
}

function shuffle(a){var r=a.slice();for(var i=r.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=r[i];r[i]=r[j];r[j]=t;}return r;}
function availPool(attr){return(ALL_HEROES[attr]||[]).filter(function(h){return game.seriesBannedHeroes.indexOf(h)===-1;});}
function genPool(){var p={strength:[],agility:[],intelligence:[],universal:[]};var attrs=["strength","agility","intelligence","universal"];for(var i=0;i<attrs.length;i++){p[attrs[i]]=shuffle(availPool(attrs[i])).slice(0,CFG.heroesPerAttribute);}return p;}
function banStepTeam(s){return CFG.banOrder[s]||(s%2===0?"radiant":"dire");}
function pickStepTeam(s){return CFG.pickOrder[s]||(s%2===0?"radiant":"dire");}
function totalBans(){return CFG.bansPerTeam*2;}
function totalPicks(){return CFG.picksPerTeam*2;}

var pendingCap=null;
var pendingNextGame=false;
function claimCaptain(team){if(!roomCode){toast("Сначала подключитесь!","error");return;}if(svCaptains[team]){toast("Капитан уже выбран","error");return;}pendingCap=team;el("captainNameModal").classList.remove("hidden");el("captainNameInput").value="";el("captainNameInput").focus();}
function confirmCapName(){var input=el("captainNameInput");var name=input.value.trim()||("Капитан "+(pendingCap==="radiant"?"Radiant":"Dire"));var team=pendingCap;el("captainNameModal").classList.add("hidden");pendingCap=null;captains[team]={name:name,id:"local"};send({type:"CLAIM_CAPTAIN",team:team,name:name});svCaptains[team]=name;refresh();toast("Вы стали капитаном "+(team==="radiant"?"Radiant":"Dire")+"!","success");}
function leaveCaptain(team){if(captains[team]&&captains[team].id==="remote")return;captains[team]=null;send({type:"LEAVE_CAPTAIN",team:team});svCaptains[team]=null;refresh();}
function startNewSeries(){if(!isLocal()&&game.seriesStarted){toast("Только капитан может начать","error");return;}if(!game.seriesStarted||game.phase==="complete"){el("startSideModal").classList.remove("hidden");}else{doStart(CFG.banOrder[0]);}}
function doStart(side){
    if(side==="dire"){CFG.banOrder=["dire","radiant","dire","radiant","dire","radiant"];CFG.pickOrder=["dire","radiant","radiant","dire","dire","radiant","radiant","dire","dire","radiant"];}
    else{CFG.banOrder=["radiant","dire","radiant","dire","radiant","dire"];CFG.pickOrder=["radiant","dire","dire","radiant","radiant","dire","dire","radiant","radiant","dire"];}
    game=freshState();game.seriesStarted=true;game.availableHeroes=genPool();game.phase="ban";game.step=0;game.currentTurn=CFG.banOrder[0];
    refresh();broadcast({type:"new_series",startingTeam:side,serializedState:saveState()});syncState();
    startTimer(game.currentTurn);
    toast("Новая серия! "+(side==="radiant"?"Radiant":"Dire")+" начинает ⚔️","success");
}
function applyNewSeriesLocally(s){if(s)loadState(s);else{game=freshState();game.seriesStarted=true;game.availableHeroes=genPool();game.currentTurn=CFG.banOrder[0];}refresh();}
function banHero(hero,attr){
    if(!isLocal()){toast("Только капитаны могут банить","error");return;}
    if(game.phase!=="ban"){toast("Сейчас фаза пиков!","error");return;}
    if(!game.seriesStarted){toast("Начните новую серию!","error");return;}
    var team=banStepTeam(game.step);
    if(game.bans[team].length>=CFG.bansPerTeam){toast("Все баны сделаны","error");return;}
    if(!isMyCaptain(team)){toast("Не ваш бан","error");return;}
    if(game.currentGameBans.some(function(b){return b.hero===hero;})||game.currentGamePicks.some(function(p){return p.hero===hero;})){toast("Герой уже выбран","error");return;}
    applyBanLocally(hero,attr,team);broadcast({type:"ban",hero:hero,attribute:attr,team:team});syncState();
}
function applyBanLocally(hero,attr,team){game.currentGameBans.push({hero:hero,attribute:attr,team:team});game.bans[team].push(hero);game.step++;if(game.step>=totalBans()){game.phase="pick";game.step=0;game.currentTurn=CFG.pickOrder[0];}else{game.currentTurn=banStepTeam(game.step);}game.mainTimer=30;refresh();startTimer(game.currentTurn);}
function pickHero(hero,attr){
    if(!isLocal()){toast("Только капитаны могут пикать","error");return;}
    if(game.phase!=="pick"){toast("Сейчас фаза банов!","error");return;}
    if(!game.seriesStarted){toast("Начните новую серию!","error");return;}
    var team=pickStepTeam(game.step);
    if(game.picks[team].length>=CFG.picksPerTeam){toast("Все пики сделаны","error");return;}
    if(!isMyCaptain(team)){toast("Не ваш пик","error");return;}
    if(game.currentGameBans.some(function(b){return b.hero===hero;})||game.currentGamePicks.some(function(p){return p.hero===hero;})){toast("Герой уже выбран","error");return;}
    applyPickLocally(hero,attr,team);broadcast({type:"pick",hero:hero,attribute:attr,team:team});syncState();
}
function applyPickLocally(hero,attr,team){game.currentGamePicks.push({hero:hero,attribute:attr,team:team});game.picks[team].push(hero);game.step++;if(game.step>=totalPicks()){game.phase="complete";stopTimer();addGameToHistory();syncState();}else{game.currentTurn=pickStepTeam(game.step);game.mainTimer=30;}refresh();if(game.phase!=="complete"){startTimer(game.currentTurn);skipIfFull();}}
function skipIfFull(){if(game.picks[game.currentTurn].length>=CFG.picksPerTeam){game.step++;if(game.step>=totalPicks()){game.phase="complete";stopTimer();addGameToHistory();syncState();}else{game.currentTurn=pickStepTeam(game.step);game.mainTimer=30;}refresh();if(game.phase!=="complete"){startTimer(game.currentTurn);skipIfFull();}}}
function addGameToHistory(){if(game.seriesHistory.some(function(g){return g.gameNumber===game.currentGame;}))return;game.seriesHistory.push({gameNumber:game.currentGame,bans:JSON.parse(JSON.stringify(game.bans)),picks:JSON.parse(JSON.stringify(game.picks))});}
function undoLastAction(){if(!isLocal()){toast("Только капитаны могут отменять","error");return;}if(!game.seriesStarted)return;if(game.phase==="complete"){toast("Игра завершена","error");return;}if(game.currentGameBans.length===0&&game.currentGamePicks.length===0){toast("Нечего отменять","error");return;}undoLocal();broadcast({type:"undo"});syncState();}
function undoLocal(){if(game.phase==="pick"&&game.currentGamePicks.length>0){var last=game.currentGamePicks.pop();game.picks[last.team].pop();game.step--;game.currentTurn=pickStepTeam(game.step);}else if(game.phase==="ban"&&game.currentGameBans.length>0){var last=game.currentGameBans.pop();game.bans[last.team].pop();game.step--;game.currentTurn=banStepTeam(game.step);}else if(game.phase==="pick"&&game.currentGamePicks.length===0&&game.currentGameBans.length>0){var last=game.currentGameBans.pop();game.bans[last.team].pop();game.phase="ban";game.step=totalBans()-1;game.currentTurn=banStepTeam(game.step);}game.mainTimer=30;refresh();startTimer(game.currentTurn);toast("Отменено","info");}
function nextGame(){
    if(!isLocal()){toast("Только капитаны могут перейти дальше","error");return;}
    if(game.phase!=="complete"){toast("Сначала завершите драфт!","error");return;}
    pendingNextGame=true;
    el("startSideModal").classList.remove("hidden");
}
function startNextGame(side){
    if(side==="dire"){CFG.banOrder=["dire","radiant","dire","radiant","dire","radiant"];CFG.pickOrder=["dire","radiant","radiant","dire","dire","radiant","radiant","dire","dire","radiant"];}
    else{CFG.banOrder=["radiant","dire","radiant","dire","radiant","dire"];CFG.pickOrder=["radiant","dire","dire","radiant","radiant","dire","dire","radiant","radiant","dire"];}
    var hist=game.seriesHistory.slice();
    if(!hist.some(function(g){return g.gameNumber===game.currentGame;})){hist.push({gameNumber:game.currentGame,bans:JSON.parse(JSON.stringify(game.bans)),picks:JSON.parse(JSON.stringify(game.picks))});}
    var banned=game.seriesBannedHeroes.slice();
    game.currentGamePicks.forEach(function(p){if(banned.indexOf(p.hero)===-1)banned.push(p.hero);});
    var nextNum=game.currentGame+1;
    game=freshState();
    game.seriesHistory=hist;
    game.currentGame=nextNum;
    game.seriesBannedHeroes=banned;
    game.availableHeroes=genPool();
    game.phase="ban";game.step=0;game.currentTurn=CFG.banOrder[0];
    game.seriesStarted=true;
    refresh();
    broadcast({type:"next_game",startingTeam:side});
    syncState();
    startTimer(game.currentTurn);
    toast("Игра "+game.currentGame+" началась! "+(side==="radiant"?"Radiant":"Dire")+" начинает ⚔️","info");
}
function startNextGameRemote(side){startNextGame(side);}

function refresh(){renderHeroPool();renderTeamBans("radiant");renderTeamBans("dire");renderTeamPicks("radiant");renderTeamPicks("dire");renderHistoryPanel();updateAttrCounts();updateGameBadge();updatePhaseBadge();updateScoreDisplay();renderCaptainBar();updateButtons();updateTimerDisplay();updateSpecUI();}
function renderHeroPool(){var grids={strength:"strengthGrid",agility:"agilityGrid",intelligence:"intelligenceGrid",universal:"universalGrid"};for(var attr in grids){if(!grids.hasOwnProperty(attr))continue;var grid=el(grids[attr]);if(!grid)continue;var heroes=game.availableHeroes[attr]||[];grid.innerHTML="";if(!game.seriesStarted){grid.innerHTML='<div class="text-muted" style="grid-column:1/-1;padding:12px;font-size:0.65rem;">Начните серию</div>';continue;}if(heroes.length===0){grid.innerHTML='<div class="text-muted" style="grid-column:1/-1;padding:12px;font-size:0.65rem;">Нет героев</div>';continue;}for(var i=0;i<heroes.length;i++){(function(hero,attr){var card=document.createElement("div");var banned=game.currentGameBans.some(function(b){return b.hero===hero;});var picked=game.currentGamePicks.some(function(p){return p.hero===hero;});var seriesBanned=game.seriesBannedHeroes.indexOf(hero)!==-1;var cls="hero-card "+attr;if(seriesBanned)cls+=" series-banned";else if(picked)cls+=" picked";else if(banned)cls+=" banned";card.className=cls;var img=heroImg(hero);if(img)card.style.backgroundImage="url("+img+")";else card.style.backgroundColor=attrBg(attr);var inner='<div class="hero-info"><span class="hero-name">'+hero+'</span><span class="hero-attr-badge">'+attrLabel(attr)+'</span></div>';if(banned&&!seriesBanned&&!picked)inner+='<span class="banned-overlay">🚫</span>';card.innerHTML=inner;if(!seriesBanned&&!picked&&!banned){if(game.phase==="ban")card.onclick=function(){banHero(hero,attr);};else if(game.phase==="pick")card.onclick=function(){pickHero(hero,attr);};}grid.appendChild(card);})(heroes[i],attr);}var needed=CFG.heroesPerAttribute-heroes.length;for(var j=0;j<needed;j++){var e=document.createElement("div");e.className="hero-card series-banned";e.innerHTML='<div class="hero-info"><span class="hero-name" style="color:#333;">Заблокирован</span></div>';grid.appendChild(e);}}}
function renderTeamBans(team){var c=el(team+"BanSlots");if(!c)return;var bans=game.bans[team]||[];c.innerHTML="";for(var i=0;i<CFG.bansPerTeam;i++){var s=document.createElement("div");s.className="ban-slot";if(i<bans.length){s.className+=" filled";var img=heroImg(bans[i]);if(img){s.style.backgroundImage="url("+img+")";s.style.backgroundSize="cover";s.style.backgroundPosition="center 20%";}else s.style.background=attrBg("strength");s.title=bans[i];}else s.className+=" empty";c.appendChild(s);}}
function renderTeamPicks(team){var c=el(team+"Picks");if(!c)return;var picks=game.picks[team]||[];c.innerHTML="";for(var i=0;i<CFG.picksPerTeam;i++){var s=document.createElement("div");s.className="pick-slot";if(i<picks.length){s.className+=" filled "+team+"-pick";var img=heroImg(picks[i]);if(img)s.style.backgroundImage="url("+img+")";s.innerHTML="<span>"+picks[i]+"</span>";s.title=picks[i];}else{s.className+=" empty";s.textContent="ПУСТО";}s.dataset.slot=team+"-"+i;c.appendChild(s);}}
function renderHistoryPanel(){
    var list=el("historyScroll");if(!list)return;
    if(game.seriesHistory.length===0){list.innerHTML='<p class="text-muted">Нет завершённых игр</p>';return;}
    var html="";
    var reversed=game.seriesHistory.slice().reverse();
    for(var i=0;i<reversed.length;i++){
        var g=reversed[i];
        html+='<div class="history-game-card"><div class="history-game-num">Игра '+g.gameNumber+'</div>';
        if(g.picks&&g.picks.radiant&&g.picks.radiant.length>0){
            html+='<div class="history-team-row"><span class="history-team-label radiant">R</span>';
            for(var j=0;j<g.picks.radiant.length;j++){var img=heroImg(g.picks.radiant[j]);html+='<div class="history-hero-icon" style="background-image:url('+img+')" title="'+g.picks.radiant[j]+'"></div>';}
            html+='</div>';
        }
        if(g.picks&&g.picks.dire&&g.picks.dire.length>0){
            html+='<div class="history-team-row"><span class="history-team-label dire">D</span>';
            for(var k=0;k<g.picks.dire.length;k++){var img=heroImg(g.picks.dire[k]);html+='<div class="history-hero-icon" style="background-image:url('+img+')" title="'+g.picks.dire[k]+'"></div>';}
            html+='</div>';
        }
        html+='</div>';
    }
    list.innerHTML=html;
}
function renderCaptainBar(){
    var rE=el("radiantCaptainEmpty"),rF=el("radiantCaptainFilled"),rN=el("radiantCaptainName");
    var dE=el("direCaptainEmpty"),dF=el("direCaptainFilled"),dN=el("direCaptainName");
    if(captains.radiant){rE.classList.add("hidden");rF.classList.remove("hidden");rN.textContent=captains.radiant.name;}
    else{rE.classList.remove("hidden");rF.classList.add("hidden");}
    if(captains.dire){dE.classList.add("hidden");dF.classList.remove("hidden");dN.textContent=captains.dire.name;}
    else{dE.classList.remove("hidden");dF.classList.add("hidden");}
}
function updateAttrCounts(){var map={strCount:"strength",agiCount:"agility",intCount:"intelligence",uniCount:"universal"};for(var id in map){if(!map.hasOwnProperty(id))continue;var attr=map[id];var heroes=game.availableHeroes[attr]||[];var sel=heroes.filter(function(h){return!game.currentGameBans.some(function(b){return b.hero===h;})&&!game.currentGamePicks.some(function(p){return p.hero===h;});}).length;var e=el(id);if(e)e.textContent=sel+"/"+CFG.heroesPerAttribute;}}
function updateGameBadge(){el("gameBadge").textContent="Игра "+game.currentGame;}
function updatePhaseBadge(){var b=el("phaseBadge");if(!game.seriesStarted){b.textContent="Ожидание";b.className="phase-badge waiting";return;}if(game.phase==="ban"){b.textContent="Фаза банов";b.className="phase-badge ban-phase";}else if(game.phase==="pick"){b.textContent="Фаза пиков";b.className="phase-badge pick-phase";}else{b.textContent="Завершено";b.className="phase-badge complete";}}
function updateScoreDisplay(){el("radiantScore").textContent=game.radiantScore;el("direScore").textContent=game.direScore;}
function updateUI(){updateTurnDisplay();updateButtons();updateGameBadge();updatePhaseBadge();updateScoreDisplay();updateTimerDisplay();}
function updateTurnDisplay(){
    var rT=el("radiantTurn"),dT=el("direTurn"),tI=el("turnInfo");
    if(!game.seriesStarted){if(rT)rT.classList.add("hidden");if(dT)dT.classList.add("hidden");if(tI){tI.textContent="Подключитесь к комнате для начала";tI.className="turn-info";}resetGlows();return;}
    if(game.phase==="complete"){if(rT)rT.classList.add("hidden");if(dT)dT.classList.add("hidden");if(tI){tI.textContent="Драфт завершён";tI.className="turn-info";}resetGlows();return;}
    var isR=game.currentTurn==="radiant";
    if(rT)rT.classList.toggle("hidden",!isR);
    if(dT)dT.classList.toggle("hidden",isR);
    if(tI){tI.textContent=isR?"⚔️ Ход Radiant":"⚔️ Ход Dire";tI.className="turn-info "+(isR?"radiant-turn-text":"dire-turn-text");}
    var rP=el("radiantPanel"),dP=el("direPanel");
    if(rP&&dP){rP.style.boxShadow=isR?"0 0 25px var(--radiant-glow)":"none";dP.style.boxShadow=!isR?"0 0 25px var(--dire-glow)":"none";}
    startTimer(game.currentTurn);
}
function resetGlows(){var r=el("radiantPanel"),d=el("direPanel");if(r)r.style.boxShadow="none";if(d)d.style.boxShadow="none";}
function updateButtons(){var u=el("btnUndo"),n=el("btnNextGame");var has=(game.phase==="ban"&&game.currentGameBans.length>0)||(game.phase==="pick"&&(game.currentGamePicks.length>0||game.currentGameBans.length>0));if(u)u.disabled=!game.seriesStarted||!has||game.phase==="complete"||!isLocal();if(n)n.disabled=!game.seriesStarted||game.phase!=="complete"||!isLocal();}

function showSettings(){el("settingHeroesPerAttr").value=CFG.heroesPerAttribute;el("settingBansPerTeam").value=CFG.bansPerTeam;el("settingPicksPerTeam").value=CFG.picksPerTeam;el("settingBanOrder").value=CFG.banOrder.join(",");el("settingPickOrder").value=CFG.pickOrder.join(",");el("settingsModal").classList.remove("hidden");}
function hideSettings(){el("settingsModal").classList.add("hidden");}
function applySettings(){var hpa=Math.max(5,Math.min(15,parseInt(el("settingHeroesPerAttr").value)||10));var bpt=Math.max(1,Math.min(5,parseInt(el("settingBansPerTeam").value)||3));var ppt=Math.max(3,Math.min(5,parseInt(el("settingPicksPerTeam").value)||5));var br=(el("settingBanOrder").value||"R,D,R,D,R,D").split(",").map(function(s){var t=s.trim().toLowerCase();if(t==="r"||t==="radiant")return"radiant";if(t==="d"||t==="dire")return"dire";return null;}).filter(Boolean);var pr=(el("settingPickOrder").value||"R,D,D,R,R,D,D,R,R,D").split(",").map(function(s){var t=s.trim().toLowerCase();if(t==="r"||t==="radiant")return"radiant";if(t==="d"||t==="dire")return"dire";return null;}).filter(Boolean);if(br.length!==bpt*2){toast("Баны: ровно "+(bpt*2)+" элементов!","error");return;}if(pr.length!==ppt*2){toast("Пики: ровно "+(ppt*2)+" элементов!","error");return;}CFG.heroesPerAttribute=hpa;CFG.bansPerTeam=bpt;CFG.picksPerTeam=ppt;CFG.banOrder=br;CFG.pickOrder=pr;hideSettings();if(game.seriesStarted)startNewSeries();toast("Настройки применены!","success");}
function showHistory(){var c=el("historyContent");if(!c)return;if(game.seriesHistory.length===0&&game.currentGameBans.length===0&&game.currentGamePicks.length===0){c.innerHTML='<p class="text-muted">Серия ещё не начата.</p>';}else{var h='<div style="display:flex;flex-direction:column;gap:14px;">';for(var i=0;i<game.seriesHistory.length;i++){var g=game.seriesHistory[i];h+='<div style="border:1px solid var(--border-color);border-radius:8px;padding:12px;"><h4 style="margin-bottom:8px;">Игра '+g.gameNumber+'</h4><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;"><div><strong style="color:var(--radiant-color);">🏛️ Radiant</strong><div style="font-size:0.7rem;margin-top:4px;"><span class="phase-tag ban">БАН</span> '+(g.bans&&g.bans.radiant?g.bans.radiant.join(", "):"—")+'</div><div style="font-size:0.75rem;margin-top:2px;"><span class="phase-tag pick">ПИК</span> '+(g.picks&&g.picks.radiant?g.picks.radiant.join(", "):"—")+'</div></div><div><strong style="color:var(--dire-color);">💀 Dire</strong><div style="font-size:0.7rem;margin-top:4px;"><span class="phase-tag ban">БАН</span> '+(g.bans&&g.bans.dire?g.bans.dire.join(", "):"—")+'</div><div style="font-size:0.75rem;margin-top:2px;"><span class="phase-tag pick">ПИК</span> '+(g.picks&&g.picks.dire?g.picks.dire.join(", "):"—")+'</div></div></div></div>';}c.innerHTML=h;}el("historyModal").classList.remove("hidden");}
function hideHistory(){el("historyModal").classList.add("hidden");}
function showSeriesBanned(){var c=el("seriesBannedContent");if(!c)return;if(game.seriesBannedHeroes.length===0){c.innerHTML='<p class="text-muted">Пока нет заблокированных героев.</p>';}else{var h='<div class="series-banned-grid">';var sorted=game.seriesBannedHeroes.slice().sort();for(var i=0;i<sorted.length;i++){var hero=sorted[i];var img=heroImg(hero);var found=null;for(var j=0;j<game.seriesHistory.length;j++){if((game.seriesHistory[j].picks&&game.seriesHistory[j].picks.radiant&&game.seriesHistory[j].picks.radiant.indexOf(hero)!==-1)||(game.seriesHistory[j].picks&&game.seriesHistory[j].picks.dire&&game.seriesHistory[j].picks.dire.indexOf(hero)!==-1)){found=game.seriesHistory[j];break;}}var gn=found?found.gameNumber:"?";h+='<div class="series-banned-hero"><div class="sb-avatar" style="background-image:url('+img+')"></div><div class="sb-info"><span class="sb-name">'+hero+'</span><span class="sb-game">Игра '+gn+'</span></div></div>';}h+='</div>';c.innerHTML=h;}el("seriesBannedModal").classList.remove("hidden");}
function hideSeriesBanned(){el("seriesBannedModal").classList.add("hidden");}
function toast(msg,type){type=type||"info";var c=el("toastContainer");if(!c)return;var t=document.createElement("div");t.className="toast "+type;t.textContent=msg;c.appendChild(t);setTimeout(function(){if(t.parentNode)t.parentNode.removeChild(t);},2500);}
function createParticles(){var c=el("bgParticles");if(!c)return;for(var i=0;i<20;i++){var p=document.createElement("div");p.className="particle";p.style.left=Math.random()*100+"%";p.style.animationDelay=Math.random()*6+"s";p.style.animationDuration=(5+Math.random()*8)+"s";p.style.width=(1+Math.random()*2)+"px";p.style.height=p.style.width;c.appendChild(p);}}

document.addEventListener("DOMContentLoaded",function(){
    createParticles();connect();
    el("btnCreateRoom").addEventListener("click",createRoom);
    el("btnJoinRoom").addEventListener("click",function(){joinRoom();});
    el("btnCopyLink").addEventListener("click",copyLink);
    el("joinRoomInput").addEventListener("keydown",function(e){if(e.key==="Enter")joinRoom();});
    el("btnClaimRadiant").addEventListener("click",function(){claimCaptain("radiant");});
    el("btnClaimDire").addEventListener("click",function(){claimCaptain("dire");});
    el("btnLeaveRadiant").addEventListener("click",function(){leaveCaptain("radiant");});
    el("btnLeaveDire").addEventListener("click",function(){leaveCaptain("dire");});
    el("btnCaptainNameConfirm").addEventListener("click",confirmCapName);
    el("btnCaptainNameCancel").addEventListener("click",function(){el("captainNameModal").classList.add("hidden");pendingCap=null;});
    el("captainNameInput").addEventListener("keydown",function(e){if(e.key==="Enter")confirmCapName();});
    el("btnNewSeries").addEventListener("click",startNewSeries);
    el("btnNextGame").addEventListener("click",nextGame);
    el("btnUndo").addEventListener("click",undoLastAction);
    el("btnStartRadiant").addEventListener("click",function(){
        el("startSideModal").classList.add("hidden");
        if(pendingNextGame){pendingNextGame=false;startNextGame("radiant");}
        else{doStart("radiant");}
    });
    el("btnStartDire").addEventListener("click",function(){
        el("startSideModal").classList.add("hidden");
        if(pendingNextGame){pendingNextGame=false;startNextGame("dire");}
        else{doStart("dire");}
    });
    el("btnStartSideCancel").addEventListener("click",function(){el("startSideModal").classList.add("hidden");pendingNextGame=false;});
    el("btnSettings").addEventListener("click",showSettings);
    el("btnSettingsClose").addEventListener("click",hideSettings);
    el("btnSettingsApply").addEventListener("click",applySettings);
    el("btnHistory").addEventListener("click",showHistory);
    el("btnHistoryClose").addEventListener("click",hideHistory);
    el("btnSeriesBanned").addEventListener("click",showSeriesBanned);
    el("btnSeriesBannedClose").addEventListener("click",hideSeriesBanned);
    var ovs=document.querySelectorAll(".modal-overlay");for(var i=0;i<ovs.length;i++){ovs[i].addEventListener("click",function(e){if(e.target===e.currentTarget)e.currentTarget.classList.add("hidden");});}
    document.addEventListener("keydown",function(e){if(e.ctrlKey&&e.key==="z"){e.preventDefault();undoLastAction();}if(e.ctrlKey&&e.key==="n"){e.preventDefault();var btn=el("btnNextGame");if(btn&&!btn.disabled)nextGame();}if(e.key==="Escape"){hideSettings();hideHistory();hideSeriesBanned();}});
    refresh();updateUI();el("connInfo").style.display="none";
});
