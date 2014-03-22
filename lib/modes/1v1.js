var Board = require('../board'),
    Deck = require('../deck'),
	Player = require('../player');

var cards = [
    1, 1, 1, 1, 1,
    2, 2, 2, 2, 2,
    3, 3, 3, 3, 3,
    4, 4, 4, 4, 4,
    5, 5, 5, 5, 5
];

module.exports = function(callback) {
    this.board = new Board();
    this.moveDeck = new Deck(cards);
    this.discardDeck = new Deck();
    this.teams = [];

    if (callback) return callback.call(this);
};