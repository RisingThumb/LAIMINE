const readline = require('readline')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


const mineflayer = require('mineflayer');
const navigatePlugin = require('mineflayer-navigate')(mineflayer);
var blockFinderPlugin = require('mineflayer-blockfinder')(mineflayer);
const bot = mineflayer.createBot({host: "us.shotbow.net",
  port: 25565, 
  username: 'wdas',
  password: 'wdas',
  verbose: true,
  version: 1.12, });
// install the plugin
navigatePlugin(bot);
bot.loadPlugin(blockFinderPlugin);
const vec3 = require('vec3')
var status = "init"
var savedBlock
// optional configuration
bot.navigate.blocksToAvoid[132] = true; // avoid tripwire
bot.navigate.blocksToAvoid[9] = true; // avoid still water
bot.navigate.blocksToAvoid[8] = true; //avoid flowing water
bot.navigate.blocksToAvoid[59] = false; // ok to trample crops
bot.navigate.on('pathFound', function (path) {
  console.log("found path. I can get there in " + path.length + " moves.");
});
bot.navigate.on('cannotFind', function (closestPath) {
  console.log("unable to find path. getting as close as possible");
  bot.navigate.walk(closestPath);
});
bot.navigate.on('arrived', function () {
  console.log("I have arrived");
  if (status === "refill"){
    bot.lookAt(savedBlock)
    var glassbottle = getBottleB()
    bot.equip(glassbottle,'hand')
    setTimeout(bot.activateItem, 500)
    status="idle"
  }
});
bot.navigate.on('interrupted', function() {
  console.log("stopping");
});



rl.on('line', (input) => {
  // navigate to whoever talks
  if (input === 'spawn') {
    bot.navigate.to(vec3({x:0, y:64, z:0}));
  } else if (input === 'stop') {
    bot.navigate.stop();
  }
  else if (input === 'init') {
    init()
  }
  else if (input === 'fight') {
    rofl=setInterval(showZeds,200)
  }else if (input === 'forth') {
    bot.navigate.to(vec3({x:3655, y:64, z:-1205}));
  }
  else if (input === 'items') {
    sayItems()
  }
  else if (input === 'hello') {
    console.log("Hello world, I am a bot designed to do cool things!")
  }
});

bot.on('spawn', function(username, message) {
  console.log(bot.entity.position)
});

bot.on('message', (message) => {
  console.log(message.toAnsi())
})


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
      console.log("Found a water source at "+blocks[0].position)
      bot.navigate.to(blocks[0].position)
      savedBlock=blocks[0].position
      status="refill"
    }
    else{
    }



  }


  )}

})

function showZeds () {
  try{
  const zeds = Object.keys(bot.entities).map(id => bot.entities[id]).filter(e => e.entityType === 54)
  const closeZedsId = zeds.filter(e => bot.entity.position.distanceTo(e.position) < 3).map(e => e)
  var i=0
  var len=closeZedsId.length
  if (len>0){
    bot.equip(bot.inventory.findInventoryItem(268),'hand')
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

function init(){
  bot.activateItem()
  setTimeout(function (){
  const window=bot.currentWindow || bot.inventory
  console.log("Passed first")
  bot.clickWindow(2,0,0)
  setTimeout(function (){
    const window=bot.currentWindow || bot.inventory
    console.log("Passed second")
    bot.clickWindow(1,0,0)
    setTimeout(function (){
      const window=bot.currentWindow || bot.inventory
      console.log("Passed third")
      bot.clickWindow(0,0,0)
      setTimeout(function (){
        console.log(bot.physics)
        console.log(bot.entity.position)

      },1000)


    },1000)


  },1000)

},1000)


}