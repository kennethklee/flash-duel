flash-duel
==========

Flash Duel board game

usage
-----

```
var Game = require('flash-duel').Game;

var game = new Game('1v1', function(err, game) {
	// game initialized
});

// or
game.on('init', function(err, game) {
	// game initialized
});
```

Entities
--------

* Game
* Board
* Deck
* Player
* Game Mode
