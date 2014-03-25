var assert = require('assert'),
    should = require('should'),
    flashDuel = require('..'),
    Player = flashDuel.Player,
    Game = flashDuel.Game;

describe('Game', function() {

    describe('1v1', function() {
        it('should create a new game', function(done) {
            var game = new Game('1v1');

            game.on('init', function(err) {
                assert.ifError(err);

                game.deck.cards.length.should.equal(25);
                game.players.length.should.equal(2);

                done();
            });
        });

        it('should allow one team to win');
    });

    describe('2v2', function() {
        it('should create a new game', function(done) {
            var game = new Game('2v2');

            game.on('init', function(err) {
                assert.ifError(err);

                game.deck.cards.length.should.equal(50);
                game.players.length.should.equal(4);

                done();
            });
        });
        it('should allow one team to win');
    });

    it('should start a game', function(done) {
        var game = new Game('1v1');

        game.on('init', function(err) {
            assert.ifError(err);

            game.on('start', done);

            game.start();
        });
    });

    describe('Player', function() {

        it('should emit a turn when the game starts', function(done) {
            var game = new Game('1v1');

            game.on('init', function(err) {

                game.players[0].on('turn', function(action, game) {
                    var player = action.getPlayer('one');

                    action.should.be.an.instanceOf(Game.Action);
                    game.should.be.an.instanceOf(Game);

                    done();
                });

                game.start();
            });
        });

        it('should get a player by name within a turn', function(done) {
            var game = new Game('1v1');

            game.on('init', function(err) {

                game.players[0].on('turn', function(action, game) {
                    var player = action.getPlayer('one');

                    player.should.be.instanceOf(Player);
                    player.name.should.equal('one');

                    done();
                });

                game.start();
            });
        });

        it('should properly be moving to the next player\'s turn', function(done) {
            var game = new Game('1v1');

            game.on('init', function(err) {

                game.players[0].on('turn', function(action, game) {
                    action.player.should.be.instanceOf(Player);
                    action.player.name.should.equal('one');

                    action.move(0);
                });

                game.players[1].on('turn', function(action, game) {
                    action.player.name.should.equal('two');
                    done();
                });

                game.start();
            });
        });

    });




    it('should serialize state');
    it('should deserialize state');
});
