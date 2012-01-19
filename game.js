Player = require('./public/javascripts/player.js')

var players = [];
var entities = [];
module.exports.gamestart = function(io) {
	initSockets(io);
	initEntities();
	start(io);


	};


	
// Game Loop

function update(io){
	updateEntities(io);


};
	
function start(io){
	try{
		setTimeout( function(){
		start(io);
		update(io);
		}, 5);
	}
	catch(err){
	}
};
	
//Socket Handlers
	
function initSockets(io){	

io.sockets.on('connection', function (socket) {
   socket.on('movePlayer', movePlayer);
   socket.on('rotPlayer', rotPlayer);
   socket.on('fire', trytofire);
   socket.on('disconnect', onDisconnect);
   socket.on('onNewPlayer', onNewPlayer);
   socket.on('respawn', respawn);

});
};

  
  function onNewPlayer(data){
  	console.log(data.player.user + " Has Entered");
  	var newplayer = new Player(data.player.user, 0, 0);
  	newplayer.id = this.id;
	newplayer.type = 'player';
  	this.broadcast.emit('newplayer', {id: newplayer.id, user: newplayer.user});
  	var i, existingPlayer;
	
	for (i = 0; i < players.length; i++) {
		existingPlayer = players[i];
		this.emit("newplayer", {id: existingPlayer.id, user: existingPlayer.user});
	};
	this.emit('selfid', { uid: newplayer.uid() });
 	players.push(newplayer);
 	entities.push(newplayer);
  };

  function respawn(data){
	var newplayer = new Player(data.user, 0, 0);
  	newplayer.id = this.id;
	newplayer.type = 'player';
	this.emit('selfid', { uid: newplayer.uid() });
	entities.push(newplayer);
  };


function onDisconnect(){

	var removePlayer = playerById(this.id);
	var removeEnt = entityById(removePlayer.uid());
	console.log(removePlayer.user + " has left");
	// Player not found
	if (!removePlayer) {
		console.log("Player not found: " + this.id);
		return;
	};
	// Remove from players array
	players.splice(players.indexOf(removePlayer), 1);
	// Remove Player entity
	removeEnt.remove = true;
	// Broadcast removed player to connected socket clients
	this.broadcast.emit("removeplayer", {id: this.id});

};
function removeEntity(i){
  entities.splice(i, 1);
};
function movePlayer(d){
  var player = entityById(d.uid);
  player.x += d.dx;
  player.y += d.dy;


};
function rotPlayer(d){
  var player = entityById(d.uid);
  player.rot = d.rot;
};
function trytofire(d){
  var player = entityById(d.uid);
  if (!player){return};
  
  var bullet = player.fire(player.x,player.y,d.aim[0],d.aim[1]);
  entities.push(bullet);
  
  
};


function initEntities() {

};
//collision detection
function intersectRect(A, B){
  var xOverlap = valueInRange(A.x, B.x, B.x + B.rad) ||
  valueInRange(B.x, A.x, A.x + A.rad) ||
  valueInRange(A.x, B.x - B.rad, B.x) ||
  valueInRange(B.x, A.x - A.rad, A.x);

  var yOverlap = valueInRange(A.y, B.y, B.y + B.rad) ||
  valueInRange(B.y, A.y, A.y + A.rad) ||
  valueInRange(A.y, B.y - B.rad, B.y) ||
  valueInRange(B.y, A.y - A.rad, A.y);

  return xOverlap && yOverlap;
};
function valueInRange(value, min, max){

  return (value <= max) && (value >= min);

};


//executes updateEnt on each entity
function updateEntities(io){
var i;
var jents = [];
	for (i = 0; i < entities.length; i++) {
		
		entities[i].updateEnt();

		if(entities[i].isdead){
		  
		};


		for(j=i+1; j< entities.length; j++){
		  if (intersectRect(entities[i],entities[j]) && entities[i].id!==entities[j].id && entities[i].type!==entities[j].type){
			entities[i].ishit = true;
			entities[j].ishit = true;

		  };

		};
		if(!entities[i].remove){
		jents[i] = {};
		jents[i].x = entities[i].getX();
		jents[i].y = entities[i].getY();
		jents[i].uid = entities[i].uid();
		jents[i].rot = entities[i].getRot();
		jents[i].hp = entities[i].hp;
		jents[i].type = entities[i].type;
		jents[i].id = entities[i].id;
		};
		if(entities[i].remove){
		  io.sockets.emit("removeEnt", {uid: entities[i].uid()});
		  removeEntity(i);
		};	
	};
// Broadcast entity information to clients, uid = unique ent id, id = socket id
	var jstring = JSON.stringify(jents);
	var jparse = JSON.parse(jstring);
	io.sockets.emit("entityUpdate", {"entarr": jparse});

};




function entityById(uid) {
	var i;
	for (i = 0; i < entities.length; i++) {
		if (entities[i].uid() == uid)
			return entities[i];
	};
	
	return false;
};
// Find player by ID
function playerById(id) {
	var i;
	for (i = 0; i < players.length; i++) {
		if (players[i].id == id)
			return players[i];
	};
	
	return false;
};



