Player = require('./player.js')

var Bullet = function(x,y,dx,dy){

	this.x	= x;
	this.y = y;
	
	var vlength = veclength(dx,dy);
	this.ax = dx/vlength;
	this.ay = dy/vlength;
	this.updateEnt = updateBullet;
	
}
function updateBullet(){
	this.x += this.ax;
	this.y += this.ay;
	console.log(this.uid()+' ' +this.y);
	
}

function veclength(x,y){
	return Math.sqrt(x*x+y*y);
}

	module.exports = Bullet;
