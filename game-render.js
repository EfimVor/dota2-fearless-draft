/* Dota 2 Fearless Draft - Game Render (v27 final) */
function refresh(){renderHeroPool();renderTeamBans("radiant");renderTeamBans("dire");renderTeamPicks("radiant");renderTeamPicks("dire");renderHistoryPanel();updateAttrCounts();updateGameBadge();updatePhaseBadge();syncCaps();updateButtons();updateTimerDisplay();updateTurnDisplay();updateSpecUI();renderPickOrder();highlightNextSlot();}

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

function highlightNextSlot(){
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

function renderHeroPool(){var grids={strength:"strengthGrid",agility:"agilityGrid",intelligence:"intelligenceGrid",universal:"universalGrid"};for(var attr in grids){if(!grids.hasOwnProperty(attr))continue;var grid=el(grids[attr]);if(!grid)continue;var heroes=game.availableHeroes[attr]||[];grid.innerHTML="";if(!game.seriesStarted){grid.innerHTML='<div class="text-muted" style="grid-column:1/-1;padding:12px;font-size:0.65rem;">Начните серию</div>';continue;}if(heroes.length===0){grid.innerHTML='<div class="text-muted" style="grid-column:1/-1;padding:12px;font-size:0.65rem;">Нет героев</div>';continue;}for(var i=0;i<heroes.length;i++){(function(hero,attr){var card=document.createElement("div");var banned=game.currentGameBans.some(function(b){return b.hero===hero;});var picked=game.currentGamePicks.some(function(p){return p.hero===hero;});var seriesBanned=game.seriesBannedHeroes.indexOf(hero)!==-1;var cls="hero-card "+attr;if(seriesBanned)cls+=" series-banned";else if(picked)cls+=" picked";else if(banned)cls+=" banned";card.className=cls;var img=heroImg(hero);if(img)card.style.backgroundImage="url("+img+")";else card.style.backgroundColor=attrBg(attr);var inner='<div class="hero-info"><span class="hero-name">'+hero+'</span><span class="hero-attr-badge">'+attrLabel(attr)+'</span></div>';if(banned&&!seriesBanned&&!picked)inner+='<span class="banned-overlay">🚫</span>';card.innerHTML=inner;if(!seriesBanned&&!picked&&!banned){if(game.phase==="ban")card.onclick=function(){banHero(hero,attr);};else if(game.phase==="pick")card.onclick=function(){pickHero(hero,attr);};}grid.appendChild(card);})(heroes[i],attr);}var needed=CFG.heroesPerAttribute-heroes.length;for(var j=0;j<needed;j++){var e=document.createElement("div");e.className="hero-card series-banned";e.innerHTML='<div class="hero-info"><span class="hero-name" style="color:#333;">Заблокирован</span></div>';grid.appendChild(e);}}}
function renderTeamBans(team){var c=el(team+"BanSlots");if(!c)return;var bans=
