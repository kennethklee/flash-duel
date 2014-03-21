var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    modes = require('./modes');

module.exports = Game;

function Game(mode, callback) {
    if (!(this instanceof Game)) return new Game(mode, callback);

    EventEmitter.call(this);

    this.setup(mode, callback);
};
util.inherits(Game, EventEmitter);

// arguments = self, event, args..., callback
var callbackAndEmit = function() {
    var args = Array.prototype.slice.call(arguments, 0),
        self = args.shift(),
        event = args.shift(),
        callback = args.pop();

    process.nextTick(function() {
        if (callback) callback.apply(self, args);
        args.unshift(event);
        self.emit.apply(self, args);
    });
};

Game.prototype.setup = function(mode, callback) {
    var self = this;
    if (modes[mode]) {
        modes[mode].call(this, function(err) {
            callbackAndEmit(self, 'init', err, self, callback);
        });
    } else {
        var err = new Error('Game mode does not exist.');
        callbackAndEmit(self, 'init', err, self);
    }
};