/* Dota 2 Fearless Draft - Game Render (v26 - визуализация порядка пиков) */
function refresh(){renderHeroPool();renderTeamBans("radiant");renderTeamBans("dire");renderTeamPicks("radiant");renderTeamPicks("dire");renderHistoryPanel();updateAttrCounts();updateGameBadge();updatePhaseBadge();updateScoreDisplay();syncCaps();updateButtons();updateTimerDisplay();updateTurnDisplay();updateSpecUI();renderPickOrder();highlightNextSlot();}

// Визуализация порядка пиков
function renderPickOrder(){
    var container = el("pickOrderContainer");
    if(!container) return;
    if(!game.seriesStarted || game.phase !== "pick"){
        container.style.display = "none";
        return;
    }
    container.style.display = "flex";
    var html = "";
    var order = CFG.pickOrder;
    var steps = [];
    // Группируем последовательные ходы одной команды
    var i = 0;
    while(i < order.length){
        var team = order[i];
        var count = 1;
        while(i + count < order.length && order[i + count] === team) count++;
        steps.push({team: team, count: count});
        i += count;
    }
    for(var s = 0; s < steps.length; s++){
        var step = steps[s];
        var icon = step.team === "radiant" ? "🏛️" : "💀";
        var color = step.team === "radiant" ? "var(--radiant-color)" : "var(--dire-color)";
        html += '<span style="color:' + color + ';font-weight:700;margin:0 4px;">' + icon + ' ' + step.count + '</span>';
        if(s < steps.length - 1) html += '<span style="color:var(--text-muted);">→</span>';
    }
    container.innerHTML = '<span style="color:var(--text-secondary);margin-right:8px;">📋 Пики:</span>' + html;
}

// Подсветка следующего пустого слота
function highlightNextSlot(){
    // Убираем подсветку со всех слотов
    var allSlots = document.querySelectorAll(".pick-slot");
    for(var i = 0; i < allSlots.length; i++){
        allSlots[i].classList.remove("next-slot");
    }
    if(!game.seriesStarted || game.phase !== "pick" || game.phase === "complete") return;
    var team = game.currentTurn;
    var picks = game.picks[team] || [];
    var max = CFG.picksPerTeam;
    if(picks.length >= max) return;
    var nextIndex = picks.length;
    var slot = document.querySelector('[data-slot="' + team + '-' + nextIndex + '"]');
    if(slot && slot.classList.contains("empty")){
        slot.classList.add("next-slot");
    }
}

// Остальные функции рендера без изменений (те же, что в v25 final)
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
function updateAttrCounts(){var map={strCount:"strength",agiCount:"agility",intCount:"intelligence",uniCount:"universal"};for(var id in map){if(!map.hasOwnProperty(id))continue;var attr=map[id];var heroes=game.availableHeroes[attr]||[];var sel=heroes.filter(function(h){return!game.currentGameBans.some(function(b){return b.hero===h;})&&!game.currentGamePicks.some(function(p){return p.hero===h;});}).length;var e=el(id);if(e)e.textContent=sel+"/"+CFG.heroesPerAttribute;}}
function updateGameBadge(){el("gameBadge").textContent="Игра "+game.currentGame;}
function updatePhaseBadge(){var b=el("phaseBadge");if(!game.seriesStarted){b.textContent="Ожидание";b.className="phase-badge waiting";return;}if(game.phase==="ban"){b.textContent="Фаза банов";b.className="phase-badge ban-phase";}else if(game.phase==="pick"){b.textContent="Фаза пиков";b.className="phase-badge pick-phase";}else{b.textContent="Завершено";b.className="phase-badge complete";}}
function updateScoreDisplay(){el("radiantScore").textContent=game.radiantScore;el("direScore").textContent=game.direScore;}
function updateUI(){updateTurnDisplay();updateButtons();updateGameBadge();updatePhaseBadge();updateScoreDisplay();updateTimerDisplay();}
function updateTurnDisplay(){
    var rN=el("radiantNotice"),dN=el("direNotice"),tI=el("turnInfo");
    if(!game.seriesStarted||game.phase==="complete"){
        if(rN)rN.classList.add("hidden");if(dN)dN.classList.add("hidden");
        if(tI){tI.textContent="Подключитесь к комнате для начала";tI.className="turn-info";}
        resetGlows();return;
    }
    var isR=game.currentTurn==="radiant";
    if(rN)rN.classList.toggle("hidden",!isR);
    if(dN)dN.classList.toggle("hidden",isR);
    if(tI){tI.textContent=isR?"⚔️ Ход Radiant":"⚔️ Ход Dire";tI.className="turn-info "+(isR?"radiant-turn-text":"dire-turn-text");}
    var rP=el("radiantPanel"),dP=el("direPanel");
    if(rP&&dP){rP.style.boxShadow=isR?"0 0 25px var(--radiant-glow)":"none";dP.style.boxShadow=!isR?"0 0 25px var(--dire-glow)":"none";}
    startTimer();
}
function resetGlows(){var r=el("radiantPanel"),d=el("direPanel");if(r)r.style.boxShadow="none";if(d)d.style.boxShadow="none";}
function updateButtons(){var u=el("btnUndo"),n=el("btnNextGame");var has=(game.phase==="ban"&&game.currentGameBans.length>0)||(game.phase==="pick"&&(game.currentGamePicks.length>0||game.currentGameBans.length>0));if(u)u.disabled=!game.seriesStarted||!has||game.phase==="complete"||!myTeam;if(n)n.disabled=!game.seriesStarted||game.phase!=="complete"||!myTeam;}

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
