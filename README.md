flash-duel
==========

Flash Duel board game

usage
-----

```
var Game = require('flash-duel').Game;

var mode = '1v1';
var game = new Game(mode, function(err, game) {
	// game initialized
});

// or
game.on('init', function(err, game) {
	// game initialized
});
```