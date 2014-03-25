var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    Deck = require('./deck');

module.exports = Player;

// Events: turn, recover, defend
function Player(game, name, peice) {
    if (!(this instanceof Player)) return new Player(game, name, peice);

    this.game = game;
    this.name = name;
    this.playing = true;
    this.state = Player.states.NORMAL;
    this.hand = new Deck();
    this.peice = peice;

    EventEmitter.call(this);
};
util.inherits(Player, EventEmitter);

Player.states = {
    NORMAL: 'normal',
    RETREATING: 'retreating'
};
