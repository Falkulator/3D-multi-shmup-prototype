
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , Player = require('./public/javascripts/player.js')
  , game = require('./game')
var app = module.exports = express.createServer()
  , io = require('socket.io').listen(app);
// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

io.configure(function() {
		// Only use WebSockets
		io.set("transports", ["websocket"]);
		 //Restrict log output
		io.set("log level", 2);
});

// Routes
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
  });


app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

//Socket Handling and Game logic

game.gamestart(io);




