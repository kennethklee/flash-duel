var Board = require('../board'),
	Deck = require('../deck'),
	Player = require('../player');

var cards = [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
    4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5
];

var checkForError = function(entity, callback) {
	if (entity instanceof Error) {
		if (callback) return callback.call(this, entity);
	}
}

module.exports = function(callback) {
	this.deck = new Deck(cards);
	this.deck.shuffle();

	this.discardDeck = new Deck();

	this.board = new Board(18);

	var one = new Player(this, 'one', this.board.add(1, Board.UP)),
		two = new Player(this, 'two', this.board.add(1, Board.UP)),
		three = new Player(this, 'three', this.board.add(18, Board.DOWN)),
		four = new Player(this, 'four', this.board.add(18, Board.DOWN));

	checkForError(one, callback);
	checkForError(two, callback);
	checkForError(three, callback);
	checkForError(four, callback);

	this.players = [one, two, three, four];

	if (callback) return callback.call(this);
};
