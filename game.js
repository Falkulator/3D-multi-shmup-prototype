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
	updatePlayers(io);

};
	
function start(io){
	try{
		setTimeout( function(){
		start(io);
		update(io);
		}, 25);
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
	console.log(this.user + " has left");
	var removePlayer = playerById(this.id);
	// Player not found
	if (!removePlayer) {
		console.log("Player not found: " + this.id);
		return;
	};
	// Remove from players array
	players.splice(players.indexOf(removePlayer), 1);
	// Remove Player entity
    entities.splice(entities.indexOf(removePlayer), 1);

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
var i, entity;

	for (i = 0; i < entities.length; i++) {
		
		entities[i].updateEnt();

		if(entities[i].isdead){
		  
		};
		if(entities[i].remove){
		  io.sockets.emit("removeEnt", {uid: entities[i].uid()});
		  removeEntity(i);
		};	

		for(j=i+1; j< entities.length; j++){
		  if (intersectRect(entities[i],entities[j]) && entities[i].id!==entities[j].id && entities[i].type!==entities[j].type){
			entities[i].ishit = true;
			entities[j].ishit = true;

		  };

		};

	
	};
};
// Broadcast entity information to clients, uid = unique ent id, id = socket id
function updatePlayers(io) {
var i, entity;
	for (i = 0; i < entities.length; i++) {
		entity = entities[i];
		io.sockets.emit("entityUpdate", {id: entity.id, user: entity.user, x: entity.getX(), y: entity.getY(), uid: entity.uid(), type: entity.type, rot: entity.getRot(), hp: entity.hp});
	};
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



