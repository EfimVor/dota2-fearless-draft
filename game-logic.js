/* Dota 2 Fearless Draft - Game Logic (v31 - score + sounds + chat + auto-pick animation) */
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
var myTeam=null;
var pendingNextGame=false;

/* ==================== SOUNDS (Web Audio API) ==================== */
var audioCtx=null;
function initAudio(){
    if(audioCtx)return;
    try{audioCtx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){audioCtx=null;}
}
function playTone(freq,duration,type,volume){
    if(!audioCtx)return;
    try{
        var osc=audioCtx.createOscillator();
        var gain=audioCtx.createGain();
        osc.type=type||"sine";
        osc.frequency.value=freq;
        gain.gain.value=volume||0.08;
        gain.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+duration);
        osc.connect(gain);gain.connect(audioCtx.destination);
        osc.start();osc.stop(audioCtx.currentTime+duration);
    }catch(e){}
}
function playClick(){initAudio();playTone(900,0.06,"square",0.06);}
function playBan(){initAudio();playTone(180,0.18,"sawtooth",0.09);}
function playPick(){initAudio();playTone(520,0.12,"sine",0.08);setTimeout(function(){playTone(760,0.12,"sine",0.08);},100);}
function playTick(){initAudio();playTone(1300,0.05,"square",0.05);}
function playMyTurn(){initAudio();playTone(440,0.18,"triangle",0.1);setTimeout(function(){playTone(660,0.22,"triangle",0.1);},190);}
function playVictory(){initAudio();playTone(660,0.15,"sine",0.1);setTimeout(function(){playTone(880,0.15,"sine",0.1);},150);setTimeout(function(){playTone(1320,0.35,"sine",0.1);},300);}

/* ==================== NETWORKING ==================== */
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
        case"ROOM_CREATED":case"ROOM_JOINED":roomCode=m.roomCode;svCaptains=m.captains||{radiant:null,dire:null};el("roomCodeDisplay").textContent=roomCode;el("connInfo").style.display="flex";el("btnLeaveRoom").style.display="";syncCaps();if(m.state){isRemote=true;loadState(m.state);isRemote=false;refresh();}setConStatus("connected","Комната "+roomCode);toast(m.type==="ROOM_CREATED"?"Комната создана!":"Подключились!","success");break;
        case"ROOM_LEFT":resetRoomUI();toast("Вы вышли из комнаты","info");break;
        case"CAPTAIN_CLAIMED":svCaptains[m.team]=m.name;syncCaps();refresh();break;
        case"CAPTAIN_LEFT":svCaptains[m.team]=null;syncCaps();refresh();break;
        case"STATE_SYNC":svCaptains=m.captains||svCaptains;if(m.state){isRemote=true;loadState(m.state);isRemote=false;refresh();}break;
        case"GAME_ACTION":isRemote=true;remoteAction(m.action);isRemote=false;refresh();break;
        case"CHAT_MESSAGE":receiveChatMessage(m);break;
        case"TIMER_TICK":if(m.timerData){game.mainTimer=m.timerData.mainTimer;if(m.timerData.reserveTimers)game.reserveTimers=m.timerData.reserveTimers;updateTimerDisplay();}break;
        case"PLAYER_JOINED":toast("Игрок подключился","info");break;
        case"PLAYER_LEFT":toast("Игрок отключился","info");break;
        case"ERROR":toast(m.message,"error");break;
    }
}
function send(m){if(ws&&ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify(m));}
function syncState(){if(roomCode)send({type:"SYNC_STATE",state:saveState()});}
function broadcast(a){if(roomCode&&!isRemote){send({type:"GAME_ACTION",action:a});syncState();}}
function remoteAction(a){
    switch(a.type){
        case"ban":applyBanLocally(a.hero,a.attribute,a.team);break;
        case"pick":applyPickLocally(a.hero,a.attribute,a.team);break;
        case"undo":undoLocal();break;
        case"new_series":applyNewSeriesLocally(a.serializedState);break;
        case"next_game":startNextGameRemote(a.startingTeam);break;
        case"winner":applyWinnerLocally(a.team);break;
        case"coin_flip_start":
            game.coinFlipPhase="flipping";game.coinFlipWinner=null;game.coinFlipChosenSide=null;game.coinFlipChosenSideBy=null;game.coinFlipChosenPick=null;game.coinFlipChosenPickBy=null;
            el("coinFlipModal").classList.remove("hidden");
            renderCoinFlipModal();
            break;
        case"coin_flip_result":
            game.coinFlipWinner=a.winner;game.coinFlipPhase="winner_choosing";
            renderCoinFlipModal();
            break;
        case"coin_flip_choice":
            if(a.category==="side"){game.coinFlipChosenSide=a.value;game.coinFlipChosenSideBy=a.by;}
            else{game.coinFlipChosenPick=a.value;game.coinFlipChosenPickBy=a.by;}
            if(game.coinFlipPhase==="winner_choosing"){game.coinFlipPhase="loser_choosing";renderCoinFlipModal();}
            else{game.coinFlipPhase="done";finishCoinFlip();}
            break;
    }
}

function el(id){return document.getElementById(id);}
function setConStatus(s,t){var d=document.querySelector(".conn-dot");var e=el("connText");if(d)d.className="conn-dot "+s;if(e)e.textContent=t;}
function createRoom(){send({type:"CREATE_ROOM"});}
function joinRoom(code){if(!code)code=el("joinRoomInput").value.trim();if(!code||code.length!==6){toast("Введите 6-значный код","error");return;}send({type:"JOIN_ROOM",roomCode:code});var u=new URL(location);u.searchParams.set("room",code);history.replaceState({},"",u);}
function copyLink(){if(!roomCode)return;var link=location.origin+location.pathname+"?room="+roomCode;navigator.clipboard.writeText(link).then(function(){toast("Ссылка скопирована!","success");}).catch(function(){var h=el("copyHelper");h.value=link;h.select();document.execCommand("copy");toast("Ссылка скопирована!","success");});}
function leaveRoom(){if(!roomCode){return;}if(!confirm("Выйти из комнаты?"))return;send({type:"LEAVE_ROOM"});resetRoomUI();toast("Вы вышли из комнаты","info");}
function resetRoomUI(){
    roomCode=null;svCaptains={radiant:null,dire:null};myTeam=null;pendingNextGame=false;
    game=freshState();
    el("connInfo").style.display="none";
    el("roomCodeDisplay").textContent="—";
    el("btnLeaveRoom").style.display="none";
    el("coinFlipModal").classList.add("hidden");
    el("chatMessages").innerHTML="";
    var u=new URL(location);u.searchParams.delete("room");history.replaceState({},"",u);
    refresh();
}

/* ==================== CHAT ==================== */
function sendChatMessage(){
    var input=el("chatInput");
    if(!input)return;
    var text=input.value.trim();
    if(!text)return;
    if(!roomCode){toast("Вы не в комнате","error");return;}
    send({type:"CHAT_MESSAGE",text:text});
    input.value="";
}
function receiveChatMessage(m){
    if(!game.chatMessages)game.chatMessages=[];
    game.chatMessages.push({text:m.text,from:m.from,team:m.team,ts:m.ts});
    if(game.chatMessages.length>80)game.chatMessages.shift();
    renderChat();
    if(!el("chatPanel").classList.contains("collapsed")){
        var box=el("chatMessages");
        if(box)box.scrollTop=box.scrollHeight;
    } else {
        el("chatPanel").classList.add("has-new");
    }
}
function toggleChat(){
    var p=el("chatPanel");
    if(p.classList.contains("collapsed")){p.classList.remove("collapsed");p.classList.remove("has-new");var box=el("chatMessages");if(box)box.scrollTop=box.scrollHeight;}
    else{p.classList.add("collapsed");}
}

/* ==================== CAPTAINS ==================== */
function syncCaps(){
    var rE=el("radiantCaptainEmpty"),rF=el("radiantCaptainFilled"),rN=el("radiantCaptainName");
    var dE=el("direCaptainEmpty"),dF=el("direCaptainFilled"),dN=el("direCaptainName");
    var rCap=svCaptains[game.sideAssignment.radiant];
    var dCap=svCaptains[game.sideAssignment.dire];
    if(rCap){rE.classList.add("hidden");rF.classList.remove("hidden");rN.textContent=rCap;}
    else{rE.classList.remove("hidden");rF.classList.add("hidden");}
    if(dCap){dE.classList.add("hidden");dF.classList.remove("hidden");dN.textContent=dCap;}
    else{dE.classList.remove("hidden");dF.classList.add("hidden");}
    updateSpecUI();
}
function getMySide(){
    if(!myTeam)return null;
    if(game.sideAssignment.radiant===myTeam)return "radiant";
    if(game.sideAssignment.dire===myTeam)return "dire";
    return null;
}
function isMyTurn(){var s=getMySide();return s!==null&&game.seriesStarted&&game.currentTurn===s&&game.phase!=="complete";}
function updateSpecUI(){
    var cr=el("btnClaimRadiant"),cd=el("btnClaimDire");
    if(!myTeam&&roomCode){
        if(svCaptains.radiant&&svCaptains.dire){if(cr)cr.style.display="none";if(cd)cd.style.display="none";}
    } else {if(cr)cr.style.display="";if(cd)cd.style.display="";}
}

function setOrderByStartingTeam(startingTeam){
    if(startingTeam==="dire"){
        CFG.banOrder=["dire","radiant","dire","radiant","dire","radiant"];
        CFG.pickOrder=["dire","radiant","radiant","dire","dire","radiant","radiant","dire","dire","radiant"];
    } else {
        CFG.banOrder=["radiant","dire","radiant","dire","radiant","dire"];
        CFG.pickOrder=["radiant","dire","dire","radiant","radiant","dire","dire","radiant","radiant","dire"];
    }
}

function freshState(){return{seriesStarted:false,currentGame:1,availableHeroes:{strength:[],agility:[],intelligence:[],universal:[]},phase:"ban",step:0,currentTurn:"radiant",bans:{radiant:[],dire:[]},picks:{radiant:[],dire:[]},currentGameBans:[],currentGamePicks:[],seriesBannedHeroes:[],seriesHistory:[],radiantScore:0,direScore:0,mainTimer:30,reserveTimers:{radiant:130,dire:130},startingTeam:"radiant",coinFlipPhase:null,coinFlipWinner:null,coinFlipChosenSide:null,coinFlipChosenSideBy:null,coinFlipChosenPick:null,coinFlipChosenPickBy:null,sideAssignment:{radiant:"radiant",dire:"dire"},chatMessages:[],winner:null};}
var game=freshState();
function saveState(){return{seriesStarted:game.seriesStarted,currentGame:game.currentGame,availableHeroes:JSON.parse(JSON.stringify(game.availableHeroes)),phase:game.phase,step:game.step,currentTurn:game.currentTurn,bans:JSON.parse(JSON.stringify(game.bans)),picks:JSON.parse(JSON.stringify(game.picks)),currentGameBans:game.currentGameBans.slice(),currentGamePicks:game.currentGamePicks.slice(),seriesBannedHeroes:game.seriesBannedHeroes.slice(),seriesHistory:JSON.parse(JSON.stringify(game.seriesHistory)),radiantScore:game.radiantScore,direScore:game.direScore,mainTimer:game.mainTimer,reserveTimers:{radiant:game.reserveTimers.radiant,dire:game.reserveTimers.dire},startingTeam:game.startingTeam,coinFlipPhase:game.coinFlipPhase,coinFlipWinner:game.coinFlipWinner,coinFlipChosenSide:game.coinFlipChosenSide,coinFlipChosenSideBy:game.coinFlipChosenSideBy,coinFlipChosenPick:game.coinFlipChosenPick,coinFlipChosenPickBy:game.coinFlipChosenPickBy,sideAssignment:{radiant:game.sideAssignment.radiant,dire:game.sideAssignment.dire},winner:game.winner};}
function loadState(s){if(!s)return;game.seriesStarted=s.seriesStarted;game.currentGame=s.currentGame;game.availableHeroes=s.availableHeroes;game.phase=s.phase;game.step=s.step;game.currentTurn=s.currentTurn;game.bans=s.bans;game.picks=s.picks;game.currentGameBans=s.currentGameBans||[];game.currentGamePicks=s.currentGamePicks||[];game.seriesBannedHeroes=s.seriesBannedHeroes||[];game.seriesHistory=s.seriesHistory||[];game.radiantScore=s.radiantScore||0;game.direScore=s.direScore||0;game.mainTimer=s.mainTimer!==undefined?s.mainTimer:30;game.reserveTimers=s.reserveTimers||{radiant:130,dire:130};game.startingTeam=s.startingTeam||"radiant";game.coinFlipPhase=s.coinFlipPhase||null;game.coinFlipWinner=s.coinFlipWinner||null;game.coinFlipChosenSide=s.coinFlipChosenSide||null;game.coinFlipChosenSideBy=s.coinFlipChosenSideBy||null;game.coinFlipChosenPick=s.coinFlipChosenPick||null;game.coinFlipChosenPickBy=s.coinFlipChosenPickBy||null;game.sideAssignment=s.sideAssignment||{radiant:"radiant",dire:"dire"};game.winner=s.winner||null;setOrderByStartingTeam(game.startingTeam);}

/* ==================== TIMER ==================== */
var timerInt=null;
var lastTickSec=-1;
function startTimer(){
    stopTimer();
    if(!game.seriesStarted||game.phase==="complete")return;
    if(!isMyTurn())return;
    var team=game.currentTurn;
    timerInt=setInterval(function(){
        if(game.phase==="complete"||!isMyTurn()){stopTimer();return;}
        var prev=game.mainTimer;
        if(game.mainTimer>0)game.mainTimer--;
        else if(game.reserveTimers[team]>0)game.reserveTimers[team]--;
        else{stopTimer();forceRandom(team);return;}
        // tick sound при <=10 сек
        if(game.mainTimer<=10&&game.mainTimer>0&&game.mainTimer!==lastTickSec){playTick();lastTickSec=game.mainTimer;}
        if(game.mainTimer===0)lastTickSec=-1;
        updateTimerDisplay();
        if(roomCode&&!isRemote)send({type:"TIMER_SYNC",timerData:{mainTimer:game.mainTimer,reserveTimers:game.reserveTimers}});
    },1000);
}
function stopTimer(){if(timerInt){clearInterval(timerInt);timerInt=null;}lastTickSec=-1;}
function forceRandom(team){
    var pool=[];var attrs=["strength","agility","intelligence","universal"];
    for(var i=0;i<attrs.length;i++){var heroes=game.availableHeroes[attrs[i]]||[];for(var j=0;j<heroes.length;j++){var h=heroes[j];if(!game.currentGameBans.some(function(b){return b.hero===h;})&&!game.currentGamePicks.some(function(p){return p.hero===h;}))pool.push({hero:h,attribute:attrs[i]});}}
    if(pool.length===0)return;
    var pick=pool[Math.floor(Math.random()*pool.length)];
    var isBan=game.phase==="ban";
    if(isBan){applyBanLocally(pick.hero,pick.attribute,team);broadcast({type:"ban",hero:pick.hero,attribute:pick.attribute,team:team});}
    else{applyPickLocally(pick.hero,pick.attribute,team);broadcast({type:"pick",hero:pick.hero,attribute:pick.attribute,team:team});}
    syncState();
    showTimeoutOverlay(pick.hero,isBan?pick.attribute:pick.attribute,isBan);
}
function showTimeoutOverlay(hero,attr,isBan){
    var ov=el("timeoutOverlay");
    if(!ov)return;
    el("timeoutHero").textContent=hero;
    el("timeoutAction").textContent=isBan?"🚫 Авто-бан":"✅ Авто-пик";
    el("timeoutAvatar").style.backgroundImage="url("+heroImg(hero)+")";
    ov.classList.remove("hidden");
    playTone(isBan?200:600,0.3,"sawtooth",0.1);
    setTimeout(function(){ov.classList.add("hidden");},2200);
}
function updateTimerDisplay(){
    var mainEl=el("timerMain"),resEl=el("timerReserve"),cont=el("timerContainer");
    if(!game.seriesStarted||game.phase==="complete"){if(cont)cont.style.display="none";return;}
    if(cont)cont.style.display="flex";
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

/* ==================== CAPTAIN / SERIES ==================== */
var pendingCap=null;
function claimCaptain(team){if(!roomCode){toast("Сначала подключитесь!","error");return;}if(svCaptains[team]){toast("Капитан уже выбран","error");return;}pendingCap=team;el("captainNameModal").classList.remove("hidden");el("captainNameInput").value="";el("captainNameInput").focus();}
function confirmCapName(){var input=el("captainNameInput");var name=input.value.trim()||("Капитан "+(pendingCap==="radiant"?"Radiant":"Dire"));var team=pendingCap;el("captainNameModal").classList.add("hidden");pendingCap=null;myTeam=team;send({type:"CLAIM_CAPTAIN",team:team,name:name});svCaptains[team]=name;syncCaps();refresh();toast("Вы стали капитаном!","success");}
function leaveCaptain(team){if(myTeam!==team)return;myTeam=null;send({type:"LEAVE_CAPTAIN",team:team});svCaptains[team]=null;syncCaps();refresh();}

function startNewSeries(){if(!myTeam&&game.seriesStarted){toast("Только капитан может начать","error");return;}if(!svCaptains.radiant||!svCaptains.dire){toast("Нужны оба капитана!","error");return;}startCoinFlip();}

function startCoinFlip(){
    game.coinFlipPhase="flipping";game.coinFlipWinner=null;game.coinFlipChosenSide=null;game.coinFlipChosenSideBy=null;game.coinFlipChosenPick=null;game.coinFlipChosenPickBy=null;
    el("coinFlipModal").classList.remove("hidden");
    renderCoinFlipModal();
    broadcast({type:"coin_flip_start"});
    setTimeout(function(){
        if(game.coinFlipPhase!=="flipping")return;
        game.coinFlipWinner=Math.random()<0.5?"radiant":"dire";
        game.coinFlipPhase="winner_choosing";
        broadcast({type:"coin_flip_result",winner:game.coinFlipWinner});
        syncState();
        renderCoinFlipModal();
    },2500);
}

function chooseCoinFlipOption(category,value){
    if(game.coinFlipPhase!=="winner_choosing"&&game.coinFlipPhase!=="loser_choosing")return;
    var chooser;
    if(game.coinFlipPhase==="winner_choosing"){chooser=game.coinFlipWinner;}
    else{chooser=game.coinFlipWinner==="radiant"?"dire":"radiant";}
    if(myTeam!==chooser){toast("Сейчас не ваш выбор","error");return;}
    if(game.coinFlipPhase==="winner_choosing"){
        if(category==="side"){game.coinFlipChosenSide=value;game.coinFlipChosenSideBy=chooser;}
        else{game.coinFlipChosenPick=value;game.coinFlipChosenPickBy=chooser;}
        game.coinFlipPhase="loser_choosing";
        renderCoinFlipModal();
    } else {
        if(category==="side"){game.coinFlipChosenSide=value;game.coinFlipChosenSideBy=chooser;}
        else{game.coinFlipChosenPick=value;game.coinFlipChosenPickBy=chooser;}
        game.coinFlipPhase="done";
    }
    broadcast({type:"coin_flip_choice",category:category,value:value,by:chooser});
    if(game.coinFlipPhase==="done"){finishCoinFlip();}
    syncState();
}

function finishCoinFlip(){
    el("coinFlipModal").classList.add("hidden");
    var winner=game.coinFlipWinner;
    var loser=winner==="radiant"?"dire":"radiant";
    var winnerSide,loserSide;
    if(game.coinFlipChosenSideBy===winner){winnerSide=game.coinFlipChosenSide;loserSide=winnerSide==="radiant"?"dire":"radiant";}
    else{loserSide=game.coinFlipChosenSide;winnerSide=loserSide==="radiant"?"dire":"radiant";}
    var winnerFirst;
    if(game.coinFlipChosenPickBy===winner){winnerFirst=game.coinFlipChosenPick==="first";}
    else{winnerFirst=game.coinFlipChosenPick==="second";}
    var startingSide=winnerFirst?winnerSide:loserSide;
    var newAssign={};
    newAssign[winnerSide]=winner;
    newAssign[loserSide]=loser;
    var isNext=pendingNextGame;
    pendingNextGame=false;
    game.coinFlipPhase=null;game.coinFlipWinner=null;game.coinFlipChosenSide=null;game.coinFlipChosenSideBy=null;game.coinFlipChosenPick=null;game.coinFlipChosenPickBy=null;
    if(isNext){startNextGameWithAssignment(startingSide,newAssign);}
    else{doStartWithAssignment(startingSide,newAssign);}
    syncState();
}

function doStartWithAssignment(side,assignment){
    setOrderByStartingTeam(side);
    game=freshState();
    game.sideAssignment=assignment;game.seriesStarted=true;game.startingTeam=side;game.availableHeroes=genPool();
    game.phase="ban";game.step=0;game.currentTurn=CFG.banOrder[0];
    game.chatMessages=game.chatMessages||[];
    refresh();broadcast({type:"new_series",startingTeam:side,serializedState:saveState()});syncState();startTimer();
    toast("Новая серия!","success");
}

function startNextGameWithAssignment(side,assignment){
    setOrderByStartingTeam(side);
    var hist=game.seriesHistory.slice();
    if(!hist.some(function(g){return g.gameNumber===game.currentGame;})){hist.push({gameNumber:game.currentGame,bans:JSON.parse(JSON.stringify(game.bans)),picks:JSON.parse(JSON.stringify(game.picks))});}
    var banned=game.seriesBannedHeroes.slice();
    game.currentGamePicks.forEach(function(p){if(banned.indexOf(p.hero)===-1)banned.push(p.hero);});
    var nextNum=game.currentGame+1;
    var prevScoreR=game.radiantScore,prevScoreD=game.direScore;
    var prevChat=game.chatMessages?game.chatMessages.slice():[];
    game=freshState();
    game.sideAssignment=assignment;game.seriesHistory=hist;game.currentGame=nextNum;game.seriesBannedHeroes=banned;game.startingTeam=side;
    game.availableHeroes=genPool();game.phase="ban";game.step=0;game.currentTurn=CFG.banOrder[0];game.seriesStarted=true;
    game.radiantScore=prevScoreR;game.direScore=prevScoreD;game.chatMessages=prevChat;
    refresh();broadcast({type:"next_game",startingTeam:side});syncState();startTimer();
    toast("Игра "+game.currentGame+" началась!","info");
}

function applyNewSeriesLocally(s){if(s)loadState(s);refresh();}
function startNextGameRemote(side){startNextGameWithAssignment(side,game.sideAssignment);}

/* ==================== WINNER ==================== */
function recordWinner(team){
    var mySide=getMySide();
    if(!mySide){toast("Только капитаны могут отметить победителя","error");return;}
    if(game.phase!=="complete"){toast("Сначала завершите драфт","error");return;}
    if(game.winner){toast("Победитель уже отмечен","error");return;}
    applyWinnerLocally(team);
    broadcast({type:"winner",team:team});
    syncState();
}
function applyWinnerLocally(team){
    if(game.winner)return;
    game.winner=team;
    if(team==="radiant")game.radiantScore++;else game.direScore++;
    playVictory();
    refresh();
    toast((team==="radiant"?"🏛️ Radiant":"💀 Dire")+" победил!","success");
}

/* ==================== GAME ACTIONS ==================== */
function banHero(hero,attr){
    var mySide=getMySide();
    if(!mySide){toast("Вы не капитан","error");return;}
    if(game.phase!=="ban"){toast("Сейчас фаза пиков!","error");return;}
    var team=banStepTeam(game.step);
    if(mySide!==team){toast("Не ваш бан","error");return;}
    if(game.bans[team].length>=CFG.bansPerTeam){toast("Все баны сделаны","error");return;}
    if(game.currentGameBans.some(function(b){return b.hero===hero;})||game.currentGamePicks.some(function(p){return p.hero===hero;})){toast("Герой уже выбран","error");return;}
    playBan();
    applyBanLocally(hero,attr,team);broadcast({type:"ban",hero:hero,attribute:attr,team:team});syncState();
}
function applyBanLocally(hero,attr,team){game.currentGameBans.push({hero:hero,attribute:attr,team:team});game.bans[team].push(hero);game.step++;if(game.step>=totalBans()){game.phase="pick";game.step=0;game.currentTurn=CFG.pickOrder[0];}else{game.currentTurn=banStepTeam(game.step);}game.mainTimer=30;refresh();startTimer();}
function pickHero(hero,attr){
    var mySide=getMySide();
    if(!mySide){toast("Вы не капитан","error");return;}
    if(game.phase!=="pick"){toast("Сейчас фаза банов!","error");return;}
    var team=pickStepTeam(game.step);
    if(mySide!==team){toast("Не ваш пик","error");return;}
    if(game.picks[team].length>=CFG.picksPerTeam){toast("Все пики сделаны","error");return;}
    if(game.currentGameBans.some(function(b){return b.hero===hero;})||game.currentGamePicks.some(function(p){return p.hero===hero;})){toast("Герой уже выбран","error");return;}
    playPick();
    applyPickLocally(hero,attr,team);broadcast({type:"pick",hero:hero,attribute:attr,team:team});syncState();
}
function applyPickLocally(hero,attr,team){game.currentGamePicks.push({hero:hero,attribute:attr,team:team});game.picks[team].push(hero);game.step++;if(game.step>=totalPicks()){game.phase="complete";stopTimer();addGameToHistory();syncState();}else{game.currentTurn=pickStepTeam(game.step);game.mainTimer=30;}refresh();if(game.phase!=="complete"){startTimer();skipIfFull();}}
function skipIfFull(){if(game.picks[game.currentTurn].length>=CFG.picksPerTeam){game.step++;if(game.step>=totalPicks()){game.phase="complete";stopTimer();addGameToHistory();syncState();}else{game.currentTurn=pickStepTeam(game.step);game.mainTimer=30;}refresh();if(game.phase!=="complete"){startTimer();skipIfFull();}}}
function addGameToHistory(){if(game.seriesHistory.some(function(g){return g.gameNumber===game.currentGame;}))return;game.seriesHistory.push({gameNumber:game.currentGame,bans:JSON.parse(JSON.stringify(game.bans)),picks:JSON.parse(JSON.stringify(game.picks))});}

function undoLastAction(){var mySide=getMySide();if(!mySide){toast("Только капитаны могут отменять","error");return;}if(!game.seriesStarted)return;if(game.phase==="complete"){toast("Игра завершена","error");return;}if(game.currentGameBans.length===0&&game.currentGamePicks.length===0){toast("Нечего отменять","error");return;}undoLocal();broadcast({type:"undo"});syncState();}
function undoLocal(){if(game.phase==="pick"&&game.currentGamePicks.length>0){var last=game.currentGamePicks.pop();game.picks[last.team].pop();game.step--;game.currentTurn=pickStepTeam(game.step);}else if(game.phase==="ban"&&game.currentGameBans.length>0){var last=game.currentGameBans.pop();game.bans[last.team].pop();game.step--;game.currentTurn=banStepTeam(game.step);}else if(game.phase==="pick"&&game.currentGamePicks.length===0&&game.currentGameBans.length>0){var last=game.currentGameBans.pop();game.bans[last.team].pop();game.phase="ban";game.step=totalBans()-1;game.currentTurn=banStepTeam(game.step);}game.mainTimer=30;refresh();startTimer();toast("Отменено","info");}

function nextGame(){
    var mySide=getMySide();
    if(!mySide){toast("Только капитаны могут перейти дальше","error");return;}
    if(game.phase!=="complete"){toast("Сначала завершите драфт!","error");return;}
    if(!game.winner){toast("Сначала отметьте победителя","error");return;}
    pendingNextGame=true;
    startCoinFlip();
}

/* ==================== SETTINGS / HISTORY ==================== */
function showSettings(){el("settingHeroesPerAttr").value=CFG.heroesPerAttribute;el("settingBansPerTeam").value=CFG.bansPerTeam;el("settingPicksPerTeam").value=CFG.picksPerTeam;el("settingBanOrder").value=CFG.banOrder.join(",");el("settingPickOrder").value=CFG.pickOrder.join(",");el("settingsModal").classList.remove("hidden");}
function hideSettings(){el("settingsModal").classList.add("hidden");}
function applySettings(){var hpa=Math.max(5,Math.min(15,parseInt(el("settingHeroesPerAttr").value)||10));var bpt=Math.max(1,Math.min(5,parseInt(el("settingBansPerTeam").value)||3));var ppt=Math.max(3,Math.min(5,parseInt(el("settingPicksPerTeam").value)||5));var br=(el("settingBanOrder").value||"R,D,R,D,R,D").split(",").map(function(s){var t=s.trim().toLowerCase();if(t==="r"||t==="radiant")return"radiant";if(t==="d"||t==="dire")return"dire";return null;}).filter(Boolean);var pr=(el("settingPickOrder").value||"R,D,D,R,R,D,D,R,R,D").split(",").map(function(s){var t=s.trim().toLowerCase();if(t==="r"||t==="radiant")return"radiant";if(t==="d"||t==="dire")return"dire";return null;}).filter(Boolean);if(br.length!==bpt*2){toast("Баны: ровно "+(bpt*2)+" элементов!","error");return;}if(pr.length!==ppt*2){toast("Пики: ровно "+(ppt*2)+" элементов!","error");return;}CFG.heroesPerAttribute=hpa;CFG.bansPerTeam=bpt;CFG.picksPerTeam=ppt;CFG.banOrder=br;CFG.pickOrder=pr;hideSettings();if(game.seriesStarted)startNewSeries();toast("Настройки применены!","success");}
function showHistory(){var c=el("historyContent");if(!c)return;if(game.seriesHistory.length===0&&game.currentGameBans.length===0&&game.currentGamePicks.length===0){c.innerHTML='<p class="text-muted">Серия ещё не начата.</p>';}else{var h='<div style="display:flex;flex-direction:column;gap:14px;">';for(var i=0;i<game.seriesHistory.length;i++){var g=game.seriesHistory[i];h+='<div style="border:1px solid var(--border-color);border-radius:8px;padding:12px;"><h4 style="margin-bottom:8px;">Игра '+g.gameNumber+'</h4><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;"><div><strong style="color:var(--radiant-color);">🏛️ Radiant</strong><div style="font-size:0.7rem;margin-top:4px;"><span class="phase-tag ban">БАН</span> '+(g.bans&&g.bans.radiant?g.bans.radiant.join(", "):"—")+'</div><div style="font-size:0.75rem;margin-top:2px;"><span class="phase-tag pick">ПИК</span> '+(g.picks&&g.picks.radiant?g.picks.radiant.join(", "):"—")+'</div></div><div><strong style="color:var(--dire-color);">💀 Dire</strong><div style="font-size:0.7rem;margin-top:4px;"><span class="phase-tag ban">БАН</span> '+(g.bans&&g.bans.dire?g.bans.dire.join(", "):"—")+'</div><div style="font-size:0.75rem;margin-top:2px;"><span class="phase-tag pick">ПИК</span> '+(g.picks&&g.picks.dire?g.picks.dire.join(", "):"—")+'</div></div></div></div>';}c.innerHTML=h;}el("historyModal").classList.remove("hidden");}
function hideHistory(){el("historyModal").classList.add("hidden");}
function showSeriesBanned(){var c=el("seriesBannedContent");if(!c)return;if(game.seriesBannedHeroes.length===0){c.innerHTML='<p class="text-muted">Пока нет заблокированных героев.</p>';}else{var h='<div class="series-banned-grid">';var sorted=game.seriesBannedHeroes.slice().sort();for(var i=0;i<sorted.length;i++){var hero=sorted[i];var img=heroImg(hero);var found=null;for(var j=0;j<game.seriesHistory.length;j++){if((game.seriesHistory[j].picks&&game.seriesHistory[j].picks.radiant&&game.seriesHistory[j].picks.radiant.indexOf(hero)!==-1)||(game.seriesHistory[j].picks&&game.seriesHistory[j].picks.dire&&game.seriesHistory[j].picks.dire.indexOf(hero)!==-1)){found=game.seriesHistory[j];break;}}var gn=found?found.gameNumber:"?";h+='<div class="series-banned-hero"><div class="sb-avatar" style="background-image:url('+img+')"></div><div class="sb-info"><span class="sb-name">'+hero+'</span><span class="sb-game">Игра '+gn+'</span></div></div>';}h+='</div>';c.innerHTML=h;}el("seriesBannedModal").classList.remove("hidden");}
function hideSeriesBanned(){el("seriesBannedModal").classList.add("hidden");}
function toast(msg,type){type=type||"info";var c=el("toastContainer");if(!c)return;var t=document.createElement("div");t.className="toast "+type;t.textContent=msg;c.appendChild(t);setTimeout(function(){if(t.parentNode)t.parentNode.removeChild(t);},2500);}
function createParticles(){var c=el("bgParticles");if(!c)return;for(var i=0;i<20;i++){var p=document.createElement("div");p.className="particle";p.style.left=Math.random()*100+"%";p.style.animationDelay=Math.random()*6+"s";p.style.animationDuration=(5+Math.random()*8)+"s";p.style.width=(1+Math.random()*2)+"px";p.style.height=p.style.width;c.appendChild(p);}}
