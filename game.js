Player = require('./public/javascripts/player.js')
bison = require('bison')
var players = [];
var entities = [];
module.exports.gamestart = function(io) {
	initSockets(io);
	initEntities();
	start(io);


};


	
// Game Loop

function update(io) {
	updateEntities(io);
};
	
function start(io) {
	try {
		setTimeout( function() {
		start(io);
		update(io);
		}, 30);
	}
	catch(err) {
	}
};
	
//Socket Handlers
	
function initSockets(io) {	

io.sockets.on('connection', function (socket) {
   socket.on('movePlayer', movePlayer);
   socket.on('rotPlayer', rotPlayer);
   socket.on('fire', trytofire);
   socket.on('disconnect', onDisconnect);
   socket.on('onNewPlayer', onNewPlayer);
   socket.on('respawn', respawn);
   socket.on('ping', ping);

});
};

  
  function onNewPlayer(data) {
  	console.log(data.player.user + " Has Entered");
  	var newplayer = new Player(data.player.user, 0, 0);
  	newplayer.id = this.id;
	  newplayer.type = 0;
  	this.broadcast.emit('newplayer', {id: newplayer.id, user: newplayer.user});
  	var i, existingPlayer, len = players.length;
	
	  for (i = 0; i < len; i += 1) {
		  existingPlayer = players[i];
		  this.emit("newplayer", {id: existingPlayer.id, user: existingPlayer.user});
	  };
	  this.emit('selfid', { uid: newplayer.uid() });
		this.emit('initents', initEntities());
 	  players.push(newplayer);
 	  entities.push(newplayer);
  };

  function respawn(data) {
	  var newent = new Player(data.user, 0, 0);
  	newent.id = this.id;
	  newent.type = 0;
	  var player = playerById(this.id);
	  players.splice(players.indexOf(player), 1);
	  this.emit('selfid', { uid: newent.uid() });
	  entities.push(newent);
	  players.push(newent);
  };

  function ping(d) {
	  this.emit('pong', {ping: d.ping, pong: 1});
  };

  function onDisconnect() {
	  var removePlayer = playerById(this.id);
  	console.log(removePlayer.user + " has left");
	  // Player not found
	  if (!removePlayer) {
		  console.log("Player not found: " + this.id);
	  	return;
	  };
  	var removeEnt = entityById(removePlayer.uid());
    // Remove from players array
	  players.splice(players.indexOf(removePlayer), 1);
	  // Remove Player entity
	  removeEnt.remove = true;
  	// Broadcast removed player to connected socket clients
  	this.broadcast.emit("removeplayer", {id: this.id});
  };

  function removeEntity(i) {
    entities.splice(i, 1);
  };

  function movePlayer(d) {
    var player = entityById(d.uid);
    if (d.m == 0){
	    player.y += 0.1;
 	}
 	if (d.m == 1){
		player.y += -0.1;
 	}
  	if (d.m == 2){
		player.x += -0.1;
  	}
  	if (d.m == 3){
		player.x += 0.1;
  	}
  };
  function rotPlayer(d) {
    var player = entityById(d.uid);
    player.rot = d.rot;
  };
  function trytofire(d) {
    var player = entityById(d.uid);
    if (!player){return};
	player.firenow = Date.now();
	if (player.firetime < player.firenow-player.firelast){
    	var bullet = player.fire(player.x,player.y,d.aim[0],d.aim[1]);
    	entities.push(bullet); 
		player.firelast  = Date.now();
	};
	};

function addEntity(entity) {
	var ent = {}
	ent.u = entity.uid();
	ent.x = entity.getX().toFixed(2);
	ent.y = entity.getY().toFixed(2);
	ent.r = entity.getRot().toFixed(2);
	ent.h = entity.hp;
	ent.t = entity.type;
  var bcode = bison.encode(ent);
	return bcode;
};

function initEntities() {
	var ents = [];
	var len = entities.length;
	for (i = 0; i < len; i += 1) {
		ents[i] = {};
		ents[i].u = entities[i].uid();
		ents[i].x = entities[i].getX().toFixed(2);
		ents[i].y = entities[i].getY().toFixed(2);
		ents[i].r = entities[i].getRot().toFixed(2);
		ents[i].h = entities[i].hp;
		ents[i].t = entities[i].type;

	}
  var bcode = bison.encode(ents);
	return bcode;
};
//collision detection
function intersectRect(A, B) {
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
function valueInRange(value, min, max) {

  return (value <= max) && (value >= min);

};


//executes updateEnt on each entity
function updateEntities(io) {

var i, len = entities.length;
var jents = [];
	for (i = 0; i < len; i += 1) {
		
		entities[i].updateEnt();
		if(entities[i].add){
			io.sockets.emit("2", addEntity(entities[i]));
			entities[i].add = false;
		}
		if(entities[i].isdead) {
		  
		};
		if(entities[i].remove) {
		  io.sockets.emit("removeEnt", {uid: entities[i].uid()});
		  removeEntity(i);
			return;
		};	

		for(j = i + 1; j < len; j += 1) {
		  if (intersectRect(entities[i],entities[j]) && entities[i].id!==entities[j].id && entities[i].type!==entities[j].type){
			  entities[i].ishit = true;
			  entities[j].ishit = true;

		  };

		};
		if(!entities[i].remove) {
		  jents[i] = {};
		  jents[i].u = entities[i].uid();
//Save bandwidth
			if (entities[i].getX().toFixed(2) !== entities[i].lastx){
		  	jents[i].x = entities[i].getX().toFixed(2);
				entities[i].lastx = entities[i].getX().toFixed(2); 
			}
			if (entities[i].getY().toFixed(2) !== entities[i].lasty){
	  		jents[i].y = entities[i].getY().toFixed(2);
				entities[i].lasty = entities[i].getY().toFixed(2); 
			}
			if (entities[i].getRot().toFixed(2) !== entities[i].lastrot){
		  	jents[i].r = entities[i].getRot().toFixed(2);
				entities[i].lastrot = entities[i].getRot().toFixed(2); 
			}
			if (entities[i].hp !== entities[i].lasthp){
		  	jents[i].h = entities[i].hp;
				entities[i].lasthp = entities[i].hp; 
			}
		};

	};
// Broadcast entity information to clients, uid = unique ent id, id = socket id
  var bcode = bison.encode(jents);
	io.sockets.volatile.emit("1", bcode);

};


function entityById(uid) {
	var i, len = entities.length;
	for (i = 0; i < len; i += 1) {
		if (entities[i].uid() == uid)
			return entities[i];
	};
	
	return false;
};
// Find player by ID
function playerById(id) {
	var i, len = players.length;
	for (i = 0; i < len; i += 1) {
		if (players[i].id == id)
			return players[i];
	};
	
	return false;
};


