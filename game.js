/* Dota 2 Fearless Draft - Game Logic (v4) */
var ALL_HEROES = {
    strength: ["Abaddon","Alchemist","Axe","Bristleback","Centaur Warrunner","Chaos Knight","Dawnbreaker","Doom","Dragon Knight","Earth Spirit","Earthshaker","Elder Titan","Huskar","Kunkka","Legion Commander","Lifestealer","Mars","Night Stalker","Ogre Magi","Omniknight","Primal Beast","Pudge","Sand King","Slardar","Sven","Tidehunter","Timbersaw","Tiny","Treant Protector","Tusk","Underlord","Undying","Wraith King"],
    agility: ["Anti-Mage","Arc Warden","Bloodseeker","Bounty Hunter","Clinkz","Drow Ranger","Ember Spirit","Faceless Void","Gyrocopter","Hoodwink","Juggernaut","Kez","Luna","Medusa","Meepo","Monkey King","Morphling","Muerta","Naga Siren","Nyx Assassin","Phantom Assassin","Phantom Lancer","Razor","Riki","Shadow Fiend","Slark","Sniper","Spectre","Templar Assassin","Terrorblade","Troll Warlord","Ursa","Viper","Weaver"],
    intelligence: ["Ancient Apparition","Crystal Maiden","Death Prophet","Disruptor","Enchantress","Grimstroke","Invoker","Jakiro","Keeper of the Light","Leshrac","Lich","Lina","Lion","Nature's Prophet","Necrophos","Oracle","Outworld Destroyer","Puck","Pugna","Queen of Pain","Ringmaster","Rubick","Shadow Demon","Shadow Shaman","Silencer","Skywrath Mage","Storm Spirit","Tinker","Warlock","Witch Doctor","Zeus"],
    universal: ["Bane","Batrider","Beastmaster","Brewmaster","Broodmother","Chen","Clockwerk","Dark Seer","Dark Willow","Dazzle","Enigma","Io","Lone Druid","Lycan","Magnus","Marci","Mirana","Pangolier","Phoenix","Snapfire","Spirit Breaker","Techies","Vengeful Spirit","Venomancer","Void Spirit","Windranger","Winter Wyvern"]
};

var HERO_KEYS = {"Abaddon":"abaddon","Alchemist":"alchemist","Ancient Apparition":"ancient_apparition","Anti-Mage":"antimage","Arc Warden":"arc_warden","Axe":"axe","Bane":"bane","Batrider":"batrider","Beastmaster":"beastmaster","Bloodseeker":"bloodseeker","Bounty Hunter":"bounty_hunter","Brewmaster":"brewmaster","Bristleback":"bristleback","Broodmother":"broodmother","Centaur Warrunner":"centaur","Chaos Knight":"chaos_knight","Chen":"chen","Clinkz":"clinkz","Clockwerk":"rattletrap","Crystal Maiden":"crystal_maiden","Dark Seer":"dark_seer","Dark Willow":"dark_willow","Dawnbreaker":"dawnbreaker","Dazzle":"dazzle","Death Prophet":"death_prophet","Disruptor":"disruptor","Doom":"doom_bringer","Dragon Knight":"dragon_knight","Drow Ranger":"drow_ranger","Earth Spirit":"earth_spirit","Earthshaker":"earthshaker","Elder Titan":"elder_titan","Ember Spirit":"ember_spirit","Enchantress":"enchantress","Enigma":"enigma","Faceless Void":"faceless_void","Grimstroke":"grimstroke","Gyrocopter":"gyrocopter","Hoodwink":"hoodwink","Huskar":"huskar","Invoker":"invoker","Io":"wisp","Jakiro":"jakiro","Juggernaut":"juggernaut","Keeper of the Light":"keeper_of_the_light","Kez":"kez","Kunkka":"kunkka","Legion Commander":"legion_commander","Leshrac":"leshrac","Lich":"lich","Lifestealer":"life_stealer","Lina":"lina","Lion":"lion","Lone Druid":"lone_druid","Luna":"luna","Lycan":"lycan","Magnus":"magnataur","Marci":"marci","Mars":"mars","Medusa":"medusa","Meepo":"meepo","Mirana":"mirana","Monkey King":"monkey_king","Morphling":"morphling","Muerta":"muerta","Naga Siren":"naga_siren","Nature's Prophet":"furion","Necrophos":"necrolyte","Night Stalker":"night_stalker","Nyx Assassin":"nyx_assassin","Ogre Magi":"ogre_magi","Omniknight":"omniknight","Oracle":"oracle","Outworld Destroyer":"obsidian_destroyer","Pangolier":"pangolier","Phantom Assassin":"phantom_assassin","Phantom Lancer":"phantom_lancer","Phoenix":"phoenix","Primal Beast":"primal_beast","Puck":"puck","Pudge":"pudge","Pugna":"pugna","Queen of Pain":"queenofpain","Razor":"razor","Riki":"riki","Ringmaster":"ringmaster","Rubick":"rubick","Sand King":"sand_king","Shadow Demon":"shadow_demon","Shadow Fiend":"nevermore","Shadow Shaman":"shadow_shaman","Silencer":"silencer","Skywrath Mage":"skywrath_mage","Slardar":"slardar","Slark":"slark","Snapfire":"snapfire","Sniper":"sniper","Spectre":"spectre","Spirit Breaker":"spirit_breaker","Storm Spirit":"storm_spirit","Sven":"sven","Techies":"techies","Templar Assassin":"templar_assassin","Terrorblade":"terrorblade","Tidehunter":"tidehunter","Timbersaw":"shredder","Tinker":"tinker","Tiny":"tiny","Treant Protector":"treant","Troll Warlord":"troll_warlord","Tusk":"tusk","Underlord":"abyssal_underlord","Undying":"undying","Ursa":"ursa","Vengeful Spirit":"vengeful_spirit","Venomancer":"venomancer","Viper":"viper","Void Spirit":"void_spirit","Warlock":"warlock","Weaver":"weaver","Windranger":"windrunner","Winter Wyvern":"winter_wyvern","Witch Doctor":"witch_doctor","Wraith King":"skeleton_king","Zeus":"zuus"};

// ... остальные функции до remoteAction ...
function remoteAction(a){
    switch(a.type){
        case"ban":applyBanLocally(a.hero,a.attribute,a.team);break;
        case"pick":applyPickLocally(a.hero,a.attribute,a.team);break;
        case"undo":undoLocal();break;
        case"new_series":applyNewSeriesLocally(a.serializedState);break;
        case"next_game":startNextGameRemote(a.startingTeam);break; // changed
    }
}

// ... потом функции nextGame, nextGameLocal, startNextGame ...

function nextGame(){
    if(!isLocal()){toast("Только капитаны могут перейти дальше","error");return;}
    if(game.phase!=="complete"){toast("Сначала завершите драфт!","error");return;}
    // Показываем модальное окно выбора стороны
    el("startSideModal").classList.remove("hidden");
    // Обработчики кнопок вызова startNextGame уже привязаны, но они вызывают doStart.
    // Нужно временно переопределить обработчики или передать флаг, что это следующая игра.
    // Проще: добавим новую переменную-флаг pendingNextGame = true, и в обработчиках проверять.
    pendingNextGame = true;
}
var pendingNextGame = false;

function startNextGame(side){
    // Устанавливаем порядки в зависимости от выбранной стороны
    if(side==="dire"){
        CFG.banOrder=["dire","radiant","dire","radiant","dire","radiant"];
        CFG.pickOrder=["dire","radiant","radiant","dire","dire","radiant","radiant","dire","dire","radiant"];
    } else {
        CFG.banOrder=["radiant","dire","radiant","dire","radiant","dire"];
        CFG.pickOrder=["radiant","dire","dire","radiant","radiant","dire","dire","radiant","radiant","dire"];
    }
    // Логика nextGameLocal, но с новыми порядками
    var hist = game.seriesHistory.slice();
    if (!hist.some(function(g){return g.gameNumber===game.currentGame;})) {
        hist.push({gameNumber:game.currentGame, bans:JSON.parse(JSON.stringify(game.bans)), picks:JSON.parse(JSON.stringify(game.picks))});
    }
    var banned=game.seriesBannedHeroes.slice();
    game.currentGamePicks.forEach(function(p){if(banned.indexOf(p.hero)===-1)banned.push(p.hero);});
    var nextNum=game.currentGame+1;
    game=freshState();
    game.seriesHistory = hist;
    game.currentGame=nextNum;
    game.seriesBannedHeroes=banned;
    game.availableHeroes=genPool();
    game.phase="ban";game.step=0;game.currentTurn=CFG.banOrder[0];
    game.seriesStarted=true;
    refresh();
    broadcast({type:"next_game", startingTeam:side});
    syncState();
    toast("Игра "+game.currentGame+" началась! "+(side==="radiant"?"Radiant":"Dire")+" начинает ⚔️","info");
}
function startNextGameRemote(side){
    // Вызывается при получении next_game от другого игрока
    startNextGame(side);
}

// обработчики кнопок в DOMContentLoaded:
el("btnStartRadiant").addEventListener("click",function(){
    el("startSideModal").classList.add("hidden");
    if(pendingNextGame){
        pendingNextGame = false;
        startNextGame("radiant");
    } else {
        doStart("radiant");
    }
});
el("btnStartDire").addEventListener("click",function(){
    el("startSideModal").classList.add("hidden");
    if(pendingNextGame){
        pendingNextGame = false;
        startNextGame("dire");
    } else {
        doStart("dire");
    }
});
// ... остальные обработчики
