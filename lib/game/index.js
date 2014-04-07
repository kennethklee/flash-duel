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
Game.Defend = require('./defend'),

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

// Emit to players who wins and who loses
var emitWinLose = function(game, direction) {
    game.winner = direction;

    game.players.forEach(function(player) {
        if (player.peice.direction === direction) {
            debug('Player ' + player.name + ' has won!');
            process.nextTick(function() {
                player.emit('win', game);
            });
        } else {
            debug('Player ' + player.name + ' has lost!');
            process.nextTick(function() {
                player.emit('lose', game);
            });
        }
    });
};

var isValidGame = function(game) {
    debug('-------------------------');
    debug('Game Check');
    debug('Players is array    ' + Array.isArray(game.players));
    debug('Enough players      ' + (game.players.length > 1));
    debug('Board exists        ' + (game.board instanceof Board));
    debug('Deck exists         ' + (game.deck instanceof Deck));
    debug('Discard deck exists ' + (game.discardDeck instanceof Deck));
    debug('-------------------------');

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

            self.state = Game.states.STARTABLE;
            self.deck.deal(5, self.players.map(function(player) {return player.hand}));

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
    this.nextPlayer = null;

    debug('Game has started.');
    this.state = Game.states.STARTED;

    var next = function(action) {
        if (self.state !== Game.states.STARTED) return;

        // Last player should have 5 cards
        if (self.nextPlayer) {
            var drawCardCount = 5 - self.nextPlayer.hand.cards.length;
            if (drawCardCount > 0) {
                drawCardCount = Math.min(drawCardCount, self.deck.cards.length);
                debug('Dealing ' + drawCardCount + ' card(s) to ' + self.nextPlayer.name);
                self.deck.deal(drawCardCount, [self.nextPlayer.hand]);
            }
        }

        debug('Deck size is ' + self.deck.cards.length);

        if (self.checkTieBreaker()) {
            process.nextTick(function() {
                self.end();
            });
            return;
        }

        // Proceed with next player
        index = (index + 1) % self.players.length;

        self.nextPlayer = self.players[index];

        if (!self.nextPlayer.playing) {
            process.nextTick(function() {
                debug('Player ' + self.nextPlayer.name + ' is dead, skip.');

                next();
            });
            return;
        }

        self.turnCount += 1;

        if (self.nextPlayer.state === Player.states.RECOVERING) {
            process.nextTick(function() {
                debug('Turn ' + self.turnCount + ' - Player ' + self.nextPlayer.name + ' is recovering.');
                self.nextPlayer.emit('recover', self.nextPlayer, self);
                self.nextPlayer.state = Player.states.NORMAL;
                next();
            });
        } else {
            var action = new Game.Action(self, self.nextPlayer, next);
            process.nextTick(function() {
                debug('Turn ' + self.turnCount + ' - Player ' + self.nextPlayer.name + ' is next.');
                self.nextPlayer.emit('turn', action, self);
            });
        }
    };

    callbackAndEmit(self, 'start', null, self, callback);
    process.nextTick(function() {
        next();
    });
};

// TODO Make into non-exposed function (Use with .bind(game))
Game.prototype.end = function(callback) {
    if (this.state !== Game.states.STARTED) return;

    debug('Game has ended.');
    this.state = Game.states.NOTSTARTABLE;

    callbackAndEmit(this, 'end', null, this, callback);
};

// Gets all living players moving in a direction
// direction = Board direction
Game.prototype.getPlayersMoving = function(direction) {
    return this.players.filter(function(player) {
        return player.peice.direction === direction && player.playing;
    });
};

// if someone has won, emits to all, emit end game and return true
Game.prototype.verifyWin = function(callback) {
    if (this.state !== Game.states.STARTED) return;

    var upPlayers = this.getPlayersMoving(Board.directions.UP),
        downPlayers = this.getPlayersMoving(Board.directions.DOWN);

    if (!upPlayers.length) {
        emitWinLose(this, Board.directions.DOWN);
        callbackAndEmit(this, 'end', null, this, callback);

        return true;
    } else if (!downPlayers.length) {
        emitWinLose(this, Board.directions.UP);
        callbackAndEmit(this, 'end', null, this, callback);

        return true;
    }

    return false;
};


// get closest opposing players
// get distance
// get number of most attackable cards of that distance
// check for cards of that distance
// whoever has the most wins
// otherwise, compare position
Game.prototype.checkTieBreaker = function(callback) {
    if (this.state !== Game.states.STARTED) return false;
    if (this.deck.cards.length) return false;    // skip when there's still cards

    debug('Tie Breaker!');

    var closestUpPos = this.board.getFurthestPosition(Board.directions.UP),
        closestUpPlayers = this.players.filter(function(player) {return player.peice.position === closestUpPos && player.playing}),
        closestDownPos = this.board.getFurthestPosition(Board.directions.DOWN),
        closestDownPlayers = this.players.filter(function(player) {return player.peice.position === closestDownPos && player.playing});

    if (!closestDownPlayers.length || !closestUpPlayers.length) {
        console.log(closestUpPlayers);
        console.log(closestDownPlayers);
        console.log('something wrong has happened.. no players left on a side!');
        return this.verifyWin();
    }

    var distance = closestDownPlayers[0].peice.position - closestUpPlayers[0].peice.position,
        upAttackCardCounts = closestUpPlayers.map(function(player) {return player.hand.countCard(distance)}),
        downAttackCardCounts = closestDownPlayers.map(function(player) {return player.hand.countCard(distance)}),
        upAttackScore = Math.max.apply(null, upAttackCardCounts),
        downAttackScore = Math.max.apply(null, downAttackCardCounts),
        upScore = closestUpPos,
        downScore = closestDownPos - this.board.length + 1;

    if (upAttackScore > downAttackScore) {
        // Up wins
        debug('Team UP can attack with ' + upAttackScore + ' ' + distance + '\'s');
        emitWinLose(this, Board.directions.UP);

    } else if (upAttackScore < downAttackScore) {
        // Down wins
        debug('Team DOWN can attack with ' + downAttackScore + ' ' + distance + '\'s');
        emitWinLose(this, Board.directions.DOWN);

    } else if (upScore > downScore) {
        // Up wins
        debug('Team UP is further up the board');
        emitWinLose(this, Board.directions.UP);

    } else if (upScore < downScore) {
        // Down wins
        debug('Team DOWN is further down the board');
        emitWinLose(this, Board.directions.DOWN);

    } else {
        // Uhhhh game rules don't specify what happens here....
        debug('Uhh what now?');
    }

    return true;
}
