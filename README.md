flash-duel
==========

[Flash Duel](http://www.sirlingames.com/collections/flash-duel) board game library with basic game modes.

* 1v1
* 2v2

features
--------

* event based turns
* extendable

usage
-----

```javascript
var Game = require('flash-duel').Game;

var game = new Game('1v1', function(err, game) {
	// game initialized
});

// or
game.on('init', function(err, game) {
	// game initialized
});

// Handle start event
game.on('start', function(err, game) {

	game.players[0].on('turn', function(action, game) {
		// Player can perform an action
	});

	game.players[0].on('defend', function(defend, game) {
		// Player can defend from an attack
	});

	game.players[0].on('recover', function(player, game) {
		// Player is informed when turn is skipped and is recovering
	});

	game.players[0].on('win', function(action, game) {
		// Player has won!
	});

	game.players[0].on('lost', function(action, game) {
		// Player has lost!
	});

});

// Trigger the start of a game
game.start();

```

entities
--------

* Game
* Board
* Deck
* Player
* Game Mode
