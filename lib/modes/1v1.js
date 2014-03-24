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
    this.discardDeck = new Deck();

    this.deck = new Deck(cards);
    this.deck.shuffle();

    this.board = new Board(18);

    var one = new Player('one', this.board.add(1, Board.UP));
    var two = new Player('two', this.board.add(18, Board.DOWN));

    if (one instanceof Error) {
        if (callback) return callback.call(this, one);
    } else if (two instanceof Error) {
        if (callback) return callback.call(this, two);
    }

    this.players = [one, two];

    if (callback) return callback.call(this);
};
