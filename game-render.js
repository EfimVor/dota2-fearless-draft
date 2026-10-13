/* Dota 2 Fearless Draft - Game Render (v31) */
function refresh(){renderHeroPool();renderTeamBans("radiant");renderTeamBans("dire");renderTeamPicks("radiant");renderTeamPicks("dire");renderHistoryPanel();updateAttrCounts();updateGameBadge();updatePhaseBadge();syncCaps();updateButtons();updateTimerDisplay();updateTurnDisplay();updateSpecUI();highlightNextSlot();updateScoreDisplay();updateWinnerPanel();renderChat();}
function highlightNextSlot(){var a=document.querySelectorAll(".pick-slot");for(var i=0;i<a.length;i++)a[i].classList.remove("next-slot");if(!game.seriesStarted||game.phase!=="pick"||game.phase==="complete")return;var t=game.currentTurn;var p=game.picks[t]||[];if(p.length>=CFG.picksPerTeam)return;var n=p.length;var s=document.querySelector('[data-slot="'+t+'-'+n+'"]');if(s&&s.classList.contains("empty"))s.classList.add("next-slot");}
function renderHeroPool(){var g={strength:"strengthGrid",agility:"agilityGrid",intelligence:"intelligenceGrid",universal:"universalGrid"};for(var a in g){if(!g.hasOwnProperty(a))continue;var d=el(g[a]);if(!d)continue;var h=game.availableHeroes[a]||[];d.innerHTML="";if(!game.seriesStarted){d.innerHTML='<div class="text-muted" style="grid-column:1/-1;padding:12px;font-size:0.65rem;">Начните серию</div>';continue;}if(h.length===0){d.innerHTML='<div class="text-muted" style="grid-column:1/-1;padding:12px;font-size:0.65rem;">Нет героев</div>';continue;}for(var i=0;i<h.length;i++){(function(hh,aa){var c=document.createElement("div");var bn=game.currentGameBans.some(function(b){return b.hero===hh;});var pk=game.currentGamePicks.some(function(p){return p.hero===hh;});var sb=game.seriesBannedHeroes.indexOf(hh)!==-1;var cl="hero-card "+aa;if(sb)cl+=" series-banned";else if(pk)cl+=" picked";else if(bn)cl+=" banned";c.className=cl;var im=heroImg(hh);if(im)c.style.backgroundImage="url("+im+")";else c.style.backgroundColor=attrBg(aa);var inr='<div class="hero-info"><span class="hero-name">'+hh+'</span><span class="hero-attr-badge">'+attrLabel(aa)+'</span></div>';if(bn&&!sb&&!pk)inr+='<span class="banned-overlay">🚫</span>';c.innerHTML=inr;if(!sb&&!pk&&!bn){if(game.phase==="ban")c.onclick=function(){banHero(hh,aa);};else if(game.phase==="pick")c.onclick=function(){pickHero(hh,aa);};}d.appendChild(c);})(h[i],a);}var nd=CFG.heroesPerAttribute-h.length;for(var j=0;j<nd;j++){var e=document.createElement("div");e.className="hero-card series-banned";e.innerHTML='<div class="hero-info"><span class="hero-name" style="color:#333;">Заблокирован</span></div>';d.appendChild(e);}}}
function renderTeamBans(team){var c=el(team+"BanSlots");if(!c)return;var bans=game.bans[team]||[];c.innerHTML="";for(var i=0;i<CFG.bansPerTeam;i++){var s=document.createElement("div");s.className="ban-slot";if(i<bans.length){s.className+=" filled";var img=heroImg(bans[i]);if(img){s.style.backgroundImage="url("+img+")";s.style.backgroundSize="cover";s.style.backgroundPosition="center 20%";}else s.style.background=attrBg("strength");s.title=bans[i];}else s.className+=" empty";c.appendChild(s);}}
function renderTeamPicks(team){var c=el(team+"Picks");if(!c)return;var picks=game.picks[team]||[];c.innerHTML="";for(var i=0;i<CFG.picksPerTeam;i++){var s=document.createElement("div");s.className="pick-slot";if(i<picks.length){s.className+=" filled "+team+"-pick";var img=heroImg(picks[i]);if(img)s.style.backgroundImage="url("+img+")";s.innerHTML="<span>"+picks[i]+"</span>";s.title=picks[i];}else{s.className+=" empty";s.textContent="ПУСТО";}s.dataset.slot=team+"-"+i;c.appendChild(s);}}
function renderHistoryPanel(){var list=el("historyScroll");if(!list)return;if(game.seriesHistory.length===0){list.innerHTML='<p class="text-muted">Нет завершённых игр</p>';return;}var html="";var rev=game.seriesHistory.slice().reverse();for(var i=0;i<rev.length;i++){var g=rev[i];html+='<div class="history-game-card"><div class="history-game-num">Игра '+g.gameNumber+'</div>';if(g.picks&&g.picks.radiant&&g.picks.radiant.length>0){html+='<div class="history-team-row"><span class="history-team-label radiant">R</span>';for(var j=0;j<g.picks.radiant.length;j++){var img=heroImg(g.picks.radiant[j]);html+='<div class="history-hero-icon" style="background-image:url('+img+')" title="'+g.picks.radiant[j]+'"></div>';}html+='</div>';}if(g.picks&&g.picks.dire&&g.picks.dire.length>0){html+='<div class="history-team-row"><span class="history-team-label dire">D</span>';for(var k=0;k<g.picks.dire.length;k++){var img=heroImg(g.picks.dire[k]);html+='<div class="history-hero-icon" style="background-image:url('+img+')" title="'+g.picks.dire[k]+'"></div>';}html+='</div>';}html+='</div>';}list.innerHTML=html;}
function updateAttrCounts(){var map={strCount:"strength",agiCount:"agility",intCount:"intelligence",uniCount:"universal"};for(var id in map){if(!map.hasOwnProperty(id))continue;var attr=map[id];var heroes=game.availableHeroes[attr]||[];var sel=heroes.filter(function(h){return!game.currentGameBans.some(function(b){return b.hero===h;})&&!game.currentGamePicks.some(function(p){return p.hero===h;});}).length;var e=el(id);if(e)e.textContent=sel+"/"+CFG.heroesPerAttribute;}}
function updateGameBadge(){el("gameBadge").textContent="Игра "+game.currentGame;}
function updatePhaseBadge(){var b=el("phaseBadge");if(!game.seriesStarted){b.textContent="Ожидание";b.className="phase-badge waiting";return;}if(game.phase==="ban"){b.textContent="Фаза банов";b.className="phase-badge ban-phase";}else if(game.phase==="pick"){b.textContent="Фаза пиков";b.className="phase-badge pick-phase";}else{b.textContent="Завершено";b.className="phase-badge complete";}}

/* ==================== SCORE ==================== */
function updateScoreDisplay(){
    var rs=el("radiantScore"),ds=el("direScore"),sc=el("seriesScore");
    if(rs)rs.textContent=game.radiantScore||0;
    if(ds)ds.textContent=game.direScore||0;
    if(sc){sc.style.display=(game.seriesStarted||game.radiantScore>0||game.direScore>0)?"flex":"none";}
}
function updateWinnerPanel(){
    var wp=el("winnerPanel");
    if(!wp)return;
    if(game.phase!=="complete"||!game.seriesStarted){wp.classList.add("hidden");return;}
    if(game.winner){
        wp.classList.remove("hidden");
        el("winnerPanelInfo").textContent=(game.winner==="radiant"?"🏛️ Radiant":"💀 Dire")+" уже победил";
        el("btnWinRadiant").style.display="none";
        el("btnWinDire").style.display="none";
    } else {
        wp.classList.remove("hidden");
        el("winnerPanelInfo").textContent="Кто победил в этой игре?";
        el("btnWinRadiant").style.display="";
        el("btnWinDire").style.display="";
    }
}

/* ==================== CHAT ==================== */
function renderChat(){
    var box=el("chatMessages");
    if(!box)return;
    var msgs=game.chatMessages||[];
    box.innerHTML="";
    if(msgs.length===0){box.innerHTML='<div class="chat-empty">Напишите сообщение...</div>';return;}
    for(var i=0;i<msgs.length;i++){
        var m=msgs[i];
        var d=document.createElement("div");
        d.className="chat-msg";
        var teamClass=m.team==="radiant"?"radiant":(m.team==="dire"?"dire":"neutral");
        d.classList.add(teamClass);
        d.innerHTML='<span class="chat-from">'+escapeHtml(m.from)+'</span><span class="chat-text">'+escapeHtml(m.text)+'</span>';
        box.appendChild(d);
    }
}
function escapeHtml(s){if(!s)return"";return String(s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}

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
    // звук "твой ход" при смене хода
    var mySide=getMySide();
    if(mySide&&mySide===game.currentTurn&&game.phase!=="complete"){
        if(window._lastTurn!==game.currentTurn){playMyTurn();window._lastTurn=game.currentTurn;}
    } else {window._lastTurn=game.currentTurn;}
    startTimer();
}
function resetGlows(){var r=el("radiantPanel"),d=el("direPanel");if(r)r.style.boxShadow="none";if(d)d.style.boxShadow="none";}
function updateButtons(){var u=el("btnUndo"),n=el("btnNextGame");var mySide=getMySide();var has=(game.phase==="ban"&&game.currentGameBans.length>0)||(game.phase==="pick"&&(game.currentGamePicks.length>0||game.currentGameBans.length>0));if(u)u.disabled=!game.seriesStarted||!has||game.phase==="complete"||!mySide;if(n)n.disabled=!game.seriesStarted||game.phase!=="complete"||!mySide||!game.winner;}

function renderCoinFlipModal(){
    var modal=el("coinFlipModal");
    if(!modal)return;
    if(!game.coinFlipPhase){modal.classList.add("hidden");return;}
    modal.classList.remove("hidden");
    var title=el("coinFlipTitle"),body=el("coinFlipBody");
    if(!title||!body)return;
    if(game.coinFlipPhase==="flipping"){
        title.textContent="🪙 Бросаем монетку...";
        body.innerHTML='<div class="coin-flip-container"><div class="coin-flip-teams"><div class="coin-flip-team"><div class="coin-flip-icon">🏛️</div><div class="coin-flip-name">'+(svCaptains.radiant||"Капитан 1")+'</div></div><div class="coin-vs">VS</div><div class="coin-flip-team"><div class="coin-flip-icon">💀</div><div class="coin-flip-name">'+(svCaptains.dire||"Капитан 2")+'</div></div></div><div class="coin">🪙</div></div>';
        return;
    }
    if(game.coinFlipPhase==="winner_choosing"){
        var wName=svCaptains[game.coinFlipWinner]||"Капитан";
        title.textContent="🪙 Монетка пала на "+wName+"!";
        var isMy=(myTeam===game.coinFlipWinner);
        var dis=isMy?"":"disabled";
        body.innerHTML='<div class="coin-flip-result"><p class="coin-flip-info">'+(isMy?"Ваш выбор:":"Ждём выбора "+wName+"...")+'</p><div class="coin-choice-group"><div class="coin-choice-label">Сторона</div><div class="coin-choice-buttons"><button class="coin-choice-btn radiant" '+dis+' onclick="chooseCoinFlipOption(\'side\',\'radiant\')">🏛️ Radiant</button><button class="coin-choice-btn dire" '+dis+' onclick="chooseCoinFlipOption(\'side\',\'dire\')">💀 Dire</button></div></div><div class="coin-choice-group"><div class="coin-choice-label">Порядок пиков</div><div class="coin-choice-buttons"><button class="coin-choice-btn first" '+dis+' onclick="chooseCoinFlipOption(\'pick\',\'first\')">Первый пик</button><button class="coin-choice-btn second" '+dis+' onclick="chooseCoinFlipOption(\'pick\',\'second\')">Второй пик</button></div></div></div>';
        return;
    }
    if(game.coinFlipPhase==="loser_choosing"){
        var loser=game.coinFlipWinner==="radiant"?"dire":"radiant";
        var lName=svCaptains[loser]||"Капитан";
        var wName2=svCaptains[game.coinFlipWinner]||"Капитан";
        var wChose=game.coinFlipChosenSideBy===game.coinFlipWinner?"side":"pick";
        var wVal=wChose==="side"?game.coinFlipChosenSide:game.coinFlipChosenPick;
        var wLabel=wChose==="side"?(wVal==="radiant"?"🏛️ Radiant":"💀 Dire"):(wVal==="first"?"Первый пик":"Второй пик");
        title.textContent="🪙 "+wName2+" выбрал: "+wLabel;
        var isMy2=(myTeam===loser);
        var dis2=isMy2?"":"disabled";
        var html='<div class="coin-flip-result"><p class="coin-flip-info">'+(isMy2?"Ваш выбор:":"Ждём выбора "+lName+"...")+'</p>';
        if(wChose==="side"){
            html+='<div class="coin-choice-group"><div class="coin-choice-label">Порядок пиков</div><div class="coin-choice-buttons"><button class="coin-choice-btn first" '+dis2+' onclick="chooseCoinFlipOption(\'pick\',\'first\')">Первый пик</button><button class="coin-choice-btn second" '+dis2+' onclick="chooseCoinFlipOption(\'pick\',\'second\')">Второй пик</button></div></div>';
        } else {
            html+='<div class="coin-choice-group"><div class="coin-choice-label">Сторона</div><div class="coin-choice-buttons"><button class="coin-choice-btn radiant" '+dis2+' onclick="chooseCoinFlipOption(\'side\',\'radiant\')">🏛️ Radiant</button><button class="coin-choice-btn dire" '+dis2+' onclick="chooseCoinFlipOption(\'side\',\'dire\')">💀 Dire</button></div></div>';
        }
        html+='</div>';
        body.innerHTML=html;
        return;
    }
}

document.addEventListener("DOMContentLoaded",function(){
    createParticles();connect();
    // Глобальный initAudio на первое действие
    document.addEventListener("click",initAudio,{once:true});
    document.addEventListener("keydown",initAudio,{once:true});
    el("btnCreateRoom").addEventListener("click",createRoom);
    el("btnJoinRoom").addEventListener("click",function(){joinRoom();});
    el("btnCopyLink").addEventListener("click",copyLink);
    el("btnLeaveRoom").addEventListener("click",leaveRoom);
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
    el("btnSettings").addEventListener("click",showSettings);
    el("btnSettingsClose").addEventListener("click",hideSettings);
    el("btnSettingsApply").addEventListener("click",applySettings);
    el("btnHistory").addEventListener("click",showHistory);
    el("btnHistoryClose").addEventListener("click",hideHistory);
    el("btnSeriesBanned").addEventListener("click",showSeriesBanned);
    el("btnSeriesBannedClose").addEventListener("click",hideSeriesBanned);
    el("btnWinRadiant").addEventListener("click",function(){recordWinner("radiant");});
    el("btnWinDire").addEventListener("click",function(){recordWinner("dire");});
    el("btnChatSend").addEventListener("click",sendChatMessage);
    el("chatInput").addEventListener("keydown",function(e){if(e.key==="Enter")sendChatMessage();});
    el("chatHeader").addEventListener("click",toggleChat);
    var ovs=document.querySelectorAll(".modal-overlay");for(var i=0;i<ovs.length;i++){ovs[i].addEventListener("click",function(e){if(e.target===e.currentTarget)e.currentTarget.classList.add("hidden");});}
    document.addEventListener("keydown",function(e){if(e.ctrlKey&&e.key==="z"){e.preventDefault();undoLastAction();}if(e.key==="Escape"){hideSettings();hideHistory();hideSeriesBanned();}});
    refresh();updateUI();el("connInfo").style.display="none";el("btnLeaveRoom").style.display="none";
});
