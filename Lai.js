const readline = require('readline')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


const mineflayer = require('mineflayer');
const navigatePlugin = require('mineflayer-navigate')(mineflayer);
var blockFinderPlugin = require('mineflayer-blockfinder')(mineflayer);
const bot = mineflayer.createBot({host: "localhost",
  port: 62950,
  username: '@@@',
  password: '@@@',
  verbose: true,
  version: "1.12.2", });
// install the plugin
navigatePlugin(bot);
bot.loadPlugin(blockFinderPlugin);
const vec3 = require('vec3')
var status = "init"
var savedBlock
var follow = false;
// optional configuration
bot.navigate.blocksToAvoid[132] = true; // avoid tripwire
bot.navigate.blocksToAvoid[9] = true; // avoid still water
bot.navigate.blocksToAvoid[8] = true; //avoid flowing water
bot.navigate.blocksToAvoid[59] = false; // ok to trample crops
bot.navigate.blocksToAvoid[44] = true; //avoid slabs
bot.navigate.blocksToAvoid[126] = true; //avoid newer slabs

bot.navigate.on('pathFound', function (path) {
  //console.log("found path. I can get there in " + path.length + " moves.");
});
bot.navigate.on('cannotFind', function (closestPath) {
  //console.log("unable to find path. getting as close as possible");
  if (follow===false){
  bot.navigate.walk(closestPath);
}
});
bot.navigate.on('arrived', function () {
  console.log("I have arrived");
});
bot.navigate.on('interrupted', function() {
  console.log("stopping");
});


//Basic input/output for commandline
rl.on('line', (input) => {
  // navigate to whoever talks
  if (input === 'spawn') {
    bot.navigate.to(vec3({x:0, y:64, z:0}));//useless
  } else if (input === 'stop') {
    bot.navigate.stop();
  }
  else if (input === 'init') {
    init()
  }
  else if (input === 'fight') {
    rofl=setInterval(showZeds,200)//Every 200ms checks for zombies and attacko
  }else if (input === 'forth') {//This can definitely be streamlined with a switch-case statement for multiple locations
    bot.navigate.to(vec3({x:3655, y:64, z:-1205}));
  }
  else if (input === 'items') {
    sayItems()
  }
  else if (input === 'follow'){
    follow = true
    followMe()
  }
  else if (input == 'followStop'){
    follow = false
  }
});

//I... forgot what this does...
bot.on('spawn', function(username, message) {
});

//Puts messages from chat into commandline
bot.on('message', (message) => {
  console.log(message.toAnsi())
})

//Handling food on food change
bot.on('health',function(){
  console.log("Food:"+bot.food+" Saturation:"+bot.foodSaturation+" Health:"+bot.health)
  if (bot.food<16){
    try{
      swapper(391)
      setTimeout(function(){bot.activateItem()},600)
      //getFood()
    }
    catch(err){
      console.log("I have no food!")
    }
  }
  //sayItems()
});

//Handling water on experience change.
bot.on('experience',function(){
  if (bot.experience.level<5){
  try{
    swapper(373)
    setTimeout(function(){bot.activateItem()},600)
    console.log("RefilledWater")
  }
    catch(err){console.log("No waterbottle")}
  }
  if(bot.inventory.findInventoryItem(374) !== null){
    glass=true}
  else{
    glass=false
  }

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
      setTimeout(function(){
        bot.navigate.stop()
        setTimeout(function(){
          swapper(374)
          bot.lookAt(savedBlock.plus(vec3(0.2, 0.7, 0.2)))
          setTimeout(function(){bot.activateItem()},600)
        }, 300)
      },10000)//longass delay to travel to waterblock then run code inside it
    }
  }
  )}
})

//Detects all nearby zombies(distance=3m, might need change to 4m), then loops through and looks at/attacks nearby zombies.
function showZeds () {
  try{
  const zeds = Object.keys(bot.entities).map(id => bot.entities[id]).filter(e => e.entityType === 54)
  const closeZedsId = zeds.filter(e => bot.entity.position.distanceTo(e.position) < 3).map(e => e)
  var i=0
  var len=closeZedsId.length
  if (len>0){
    //swapper(276)
  }
  for(;i<len;i++){
  //console.log(closeZedsId[i].position)
  swapper(276)
  bot.navigate.stop()
  bot.lookAt(closeZedsId[i].position.plus(vec3(0, 0.7, 0)))
  bot.attack(closeZedsId[i])
  }}
  catch(err){console.log(err)}
}

//Returns all items in inventory as a string
function sayItems (items = bot.inventory.items()) {
  const output = items.map(itemToString).join(', ')
  if (output) {
    console.log(output)
  } else {
    console.log('empty')
  }
}

//Returns all items in inventory as a string
function itemToString (item) {
  if (item) {
    return `${item.name} x ${item.count}`
  } else {
    return '(nothing)'
  }
}

/*function getFood(){
  try{swapper(260)}
  catch(err){
    try{swapper(391)}
    catch(err){
      try{swapper(360)}
      catch(err){return 0}
  }
}
}*/

//Swaps first slot with wanted item
function swapper(itemID){
      setTimeout(function (){
        const window=bot.currentWindow || bot.inventory
        try{
        if(bot.inventory.findInventoryItem(itemID).slot!==36){
        bot.putAway(36,function(err){})
        setTimeout(function (){
          try{bot.moveSlotItem(bot.inventory.findInventoryItem(itemID).slot,36,function(err){})}
          catch(err){}
      },200)}}
      catch(err){console.log("Error occured, probably no item of that type")}
      },200)}

//Initial function to join first MineZ server
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
      swapper(391)
    },1000)
  },1000)
},1000)
}

//Recursive function for following with pathfinding on a delay of 1sec
function followMe () {
   setTimeout(function () {
      const player = bot.players['Mr_3141592653589'].entity;
      var path = bot.navigate.findPathSync(player.position, {
            timeout: 1 * 1000,
            endRadius: 4,
          });
      bot.navigate.walk(path.path,function(){
        if (player != null) {
                bot.lookAt(player.position.plus(vec3(0, 1.62, 0)));
              }

      })          // 
      if (follow) {            
         followMe();             
      }                        
   }, 1000)
}