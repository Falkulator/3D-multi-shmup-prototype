
var Player = function(user, x, y){
	this.x = x;
	this.y = y;
	this.user = user;
	this.id;
	this.type;
	this.rot;
	this.dx;
	this.dy;
	this.remove = false;
 	this.fire = fire;

}
	Player.prototype.getX = function() {
		return this.x;
	};
	Player.prototype.getY = function() {
		return this.y;
	};
	Player.prototype.getRot = function() {
		return this.rot;
	};
	Player.prototype.updateEnt = function() {

	};


function fire(x,y,ax,ay){
  var bullet = new Bullet(x,y,ax,ay);
  return bullet;	
}
//unique id generator for the ents
(function () {
    var uid = 0;

    function generateId() { return uid++; };

    Player.prototype.uid = function() {
        var newId = generateId();

        this.uid = function() { return newId; };

        return newId;
    };
})();

Bullet.prototype = new Player();
Bullet.prototype.constructor = Bullet;
function Bullet(x,y,dx,dy){
	this.x	= x;
	this.y = y;
	this.startx = x;
	this.starty = y;
	var vlength = veclength(dx,dy);
	this.ax = dx/vlength;
	this.ay = dy/vlength;
	this.updateEnt = updateBullet;
};
function updateBullet(){
	this.x += this.ax;
	this.y += this.ay;
	if(veclength(this.x-this.startx, this.y-this.starty)>100){
        this.remove = true;
	}
	
}

function veclength(x,y){
	return Math.sqrt(x*x+y*y);
}


	module.exports = Player;
