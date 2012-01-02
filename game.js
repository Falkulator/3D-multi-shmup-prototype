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
   socket.on('disconnect', onDisconnect);
   socket.on('onNewPlayer', onNewPlayer);
});
};

  
  function onNewPlayer(data){
  	console.log(data.player.user + " Has Entered");
  	var newplayer = new Player(data.player.user, 0, 0);
  	newplayer.id = this.id;
	newplayer.x = 1;
	newplayer.y = 2;
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




function onDisconnect(){
	console.log(this.user + " has left");
	var removePlayer = playerById(this.id);
	// Player not found
	if (!removePlayer) {
		console.log("Player not found: " + this.id);
		return;
	};
	// Remove player from players array
	players.splice(players.indexOf(removePlayer), 1);
	// Remove Player entity
	entities.splice(players.indexOf(removePlayer), 1);
	// Broadcast removed player to connected socket clients
	this.broadcast.emit("removeplayer", {id: this.id});

};

function movePlayer(d){
  var player = entityById(d.uid);
  player.x += d.dx;
  player.y += d.dy;


};


function initEntities() {

};

// Broadcast entity information to clients, uid = unique ent id, id = socket id
function updatePlayers(io) {
var i, entity;
	for (i = 0; i < entities.length; i++) {
		entity = entities[i];
		io.sockets.emit("entityUpdate", {id: entity.id, user: entity.user, x: entity.getX(), y: entity.getY(), uid: entity.uid(), type: entity.type });
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



