const mineflayer = require('mineflayer');
const navigatePlugin = require('mineflayer-navigate')(mineflayer);
var blockFinderPlugin = require('mineflayer-blockfinder')(mineflayer);
const bot = mineflayer.createBot({host: "localhost",
  port: 60814, 
  username: 'LAI' });
// install the plugin
navigatePlugin(bot);
bot.loadPlugin(blockFinderPlugin);
const vec3 = require('vec3')
var status = "init"
var savedBlock
// optional configuration
bot.navigate.blocksToAvoid[132] = true; // avoid tripwire
bot.navigate.blocksToAvoid[59] = false; // ok to trample crops
bot.navigate.on('pathFound', function (path) {
  bot.chat("found path. I can get there in " + path.length + " moves.");
});
bot.navigate.on('cannotFind', function (closestPath) {
  bot.chat("unable to find path. getting as close as possible");
  bot.navigate.walk(closestPath);
});
bot.navigate.on('arrived', function () {
  bot.chat("I have arrived");
  if (status === "refill"){
    bot.lookAt(savedBlock)
    var glassbottle = getBottleB()
    bot.equip(glassbottle,'hand')
    setTimeout(bot.activateItem, 500)
    status="idle"
  }
});
bot.navigate.on('interrupted', function() {
  bot.chat("stopping");
});
bot.on('chat', function(username, message) {
  // navigate to whoever talks
  if (username === bot.username) return;
  const target = bot.players[username].entity;
  if (message === 'come') {
    bot.navigate.to(target.position);
  } else if (message === 'stop') {
    bot.navigate.stop();
  }
  else if (message === 'fight') {
    rofl=setInterval(showZeds,200)
  }
  else if (message === 'items') {
    sayItems()
  }
  else if (message === 'hello') {
    bot.chat("Hello world, I am a bot designed to do cool things!")
  }
});

function showZeds () {
  try{
  const zeds = Object.keys(bot.entities).map(id => bot.entities[id]).filter(e => e.entityType === 54)
  const closeZedsId = zeds.filter(e => bot.entity.position.distanceTo(e.position) < 3).map(e => e)
  var i=0
  var len=closeZedsId.length
  if (len>0){
    bot.equip(bot.inventory.findInventoryItem(276),'hand')
  }
  for(;i<len;i++){
  console.log(closeZedsId[i].position)
  bot.lookAt(closeZedsId[i].position)
  bot.attack(closeZedsId[i])
  }}
  catch(err){}
}

function sayItems (items = bot.inventory.items()) {
  const output = items.map(itemToString).join(', ')
  if (output) {
    console.log(output)
  } else {
    console.log('empty')
  }
}

function itemToString (item) {
  if (item) {
    return `${item.name} x ${item.count}`
  } else {
    return '(nothing)'
  }
}

function getFood(){
  try{return bot.inventory.findInventoryItem(260)}
  catch(err){
    try{return bot.inventory.findInventoryItem(391)}
    catch(err){
      try{return bot.inventory.findInventoryItem(360)}
      catch(err){return 0}
  }
}
}

function getBottle(){
  try{return bot.inventory.findInventoryItem(373)}
  catch(err){return 0
  }
}

function getBottleB(){
  try{return bot.inventory.findInventoryItem(374)}
  catch(err){return 0}
}


bot.on('health',function(){
  console.log("Food:"+bot.food+" Saturation:"+bot.foodSaturation+" Health:"+bot.health)
  if (bot.food<16){
    var food = getFood()
    console.log(food)
    try{
      bot.equip(food,'hand')
      bot.activateItem()
    }
    catch(err){
      console.log("I have no food!")
    }
  }
  sayItems()

});

bot.on('experience',function(){
  if (bot.experience.level<5){
    var waterbottle = getBottle()
    try{
    bot.equip(waterbottle,'hand')
    bot.activateItem()
    console.log("RefilledWater")
  }
    catch(err){console.log("No waterbottle")}
  }

  var glass = getBottleB()

  if (glass){
  bot.findBlock({
    point: bot.entity.position,
    matching: 9,
    maxdistance: 16,
    count: 1,
  }, function(err, blocks){
    if (err){
      console.log("Error occured "+err)
    }
    if (blocks.length) {
      bot.chat("Found a water source at "+blocks[0].position)
      bot.navigate.to(blocks[0].position)
      savedBlock=blocks[0].position
      status="refill"
    }
    else{
      bot.chat("No water source")
    }



  }


  )}

})