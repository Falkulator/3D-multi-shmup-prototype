var Player = function(user, x, y){
	this.x = x;
	this.y = y;
	this.user = user;
	this.id;
	this.type;



}
	Player.prototype.getX = function() {
		return this.x;
	};
	Player.prototype.getY = function() {
		return this.y;
	};

(function() {
    var uid = 0;

    function generateId() { return uid++; };

    Player.prototype.uid = function() {
        var newId = generateId();

        this.uid = function() { return newId; };

        return newId;
    };
})();


	module.exports = Player;
