var Board = require('../board'),
	Player = require('../player');


module.exports = function(callback) {
    this.board = new Board();
    this.teams = [];

    if (callback) return callback.call(this);
};