var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    debug = require('debug')('flash-duel:game'),
    Player = require('../player'),
    Board = require('../board'),
    Deck = require('../deck'),
    modes = require('../modes');

module.exports = Game;

function Game(mode, callback) {
    if (!(this instanceof Game)) return new Game(mode, callback);

    EventEmitter.call(this);

    this.players = [];
    this.state = Game.states.NOTSTARTABLE;

    this.reset(mode, callback);
};
util.inherits(Game, EventEmitter);

Game.Action = require('./action'),

Game.states = {
    NOTSTARTABLE: 'not-startable',
    STARTABLE: 'startable',
    STARTED: 'started'
};

// Helper function
// arguments = self, event, args..., callback
var callbackAndEmit = function() {
    var args = Array.prototype.slice.call(arguments, 0),
        self = args.shift(),
        event = args.shift(),
        callback = args.pop();

    process.nextTick(function() {
        debug('Emitting ' + event);
        if (callback) callback.apply(self, args);
        args.unshift(event);
        self.emit.apply(self, args);
    });
};

var isValidGame = function(game) {
    debug('Players is array - ' + Array.isArray(game.players));
    debug('Enough players - ' + (game.players.length > 1));
    debug('Board exists - ' + (game.board instanceof Board));
    debug('Deck exists - ' + (game.deck instanceof Deck));
    debug('Discard deck exists - ' + (game.discardDeck instanceof Deck));

    return Array.isArray(game.players)
        && game.players.length > 1
        && game.board instanceof Board
        && game.deck instanceof Deck
        && game.discardDeck instanceof Deck;
}

Game.prototype.reset = function(mode, callback) {
    var self = this;
    if (modes[mode]) {
        debug('Creating ' + mode + ' game...');
        modes[mode].call(this, function(err) {
            // Ensure we have all the information we need
            if (!err && !isValidGame(self)) {
                err = new Error('Game mode insufficient to start game.');
            }

            this.state = Game.states.STARTABLE;

            debug('Game is ready to start.');
            callbackAndEmit(self, 'init', err, self, callback);
        });
    } else {
        var err = new Error('Game mode does not exist.');
        callbackAndEmit(self, 'init', err, self, callback);
    }
};

Game.prototype.start = function(callback) {
    if (this.state !== Game.states.STARTABLE) return false;

    var self = this,
        index = -1;

    this.turnCount = 0;

    var next = function(action) {
        // TODO Check if attacking

        // Proceed with next player
        index = (index + 1) % self.players.length;
        self.turnCount += 1;

        var player = self.players[index],
            drawCardCount = player.hand.cards.length - 5;

        self.deck.deal(drawCardCount, [player.hand]);

        if (!self.deck.cards.length) {
            // TODO draw!
            process.nextTick(function() {
                endGame.bind(self);
            });
        } else if (player.state === Player.states.RETREATING) {
            process.nextTick(function() {
                debug('Turn ' + self.turnCount + ' - Player ' + index + ' is recovering.');
                player.emit('recover', self);
                next();
            });
        } else {
            var action = new Game.Action(self, player, next);
            process.nextTick(function() {
                debug('Turn ' + self.turnCount + ' - Player ' + player.name + ' is next.');
                player.emit('turn', action, self);
            });
        }
    };


    debug('Game has started.');
    this.state = Game.states.STARTED;
    process.nextTick(function() {
        callbackAndEmit(self, 'start', null, self, callback);
        next();
    });
};

// TODO Make into non-exposed function (Use with .bind(game))
Game.prototype.end = function(callback) {
    if (this.state !== Game.states.STARTED) return;

    debug('Game has ended.');
    this.state = Game.states.NOTSTARTABLE;
    process.nextTick(function() {
        callbackAndEmit(self, 'end', null, self, callback);
    });
};
