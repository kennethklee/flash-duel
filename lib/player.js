var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    Deck = require('./deck');

module.exports = Player;

// Events: turn, recover, defend, win, lose
function Player(game, name, peice) {
    if (!(this instanceof Player)) return new Player(game, name, peice);

    this.game = game;
    this.name = name;
    this.playing = true;    // Dead or alive?
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
