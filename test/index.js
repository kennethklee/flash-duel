var should = require('should'),
    flashDuel = require('..'),
    Game = flashDuel.Game;

describe('Game', function() {

    describe('1v1', function() {
        it('should create a new game', function(done) {
            var game = new Game('1v1');

            game.on('init', done);
        });
        it('should allow one team to win');
    });

    describe('2v2', function() {
        it('should create a new game');
        it('should allow one team to win');
    });

    it('should list players in teams');
    it('should return a board');
    it('should return the game deck');
    it('should return the discard pile');

    it('should serialize state');
    it('should deserialize state');

});

describe('Board', function() {

    it('should move a player');
    it('should fail to move a player outside the board');
    it('should fail to move a player past the other team');
    it('should list player positions');

});

describe('Deck', function() {

    it('should create with 25 cards in 1v1 mode');
    it('should create with 50 cards in 2v2 mode');
    it('should create empty');

    it('should shuffle');
    it('should sort');

    it('should draw one card at index');
    it('should draw x cards from index');

});