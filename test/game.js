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

                game.players.length.should.equal(2);

                done();
            });
        });

        it('should always have 5 cards in hand when only moving', function(done) {
            var game = new Game('1v1');

            game.on('init', function(err) {

                var playTurn = function(action, game) {
                    action.player.hand.cards.length.should.equal(5);

                    action.moveBackwards(0) || action.move(0);
                };

                game.players[0].on('turn', playTurn);
                game.players[1].on('turn', playTurn);

                game.on('end', function(err) {
                    assert.ifError(err);

                    game.turnCount.should.equal(15);

                    done();
                });

                game.start();
            });
        });

        it.skip('should allow one team to win', function(done) {
            var game = new Game('1v1');

            game.on('init', function(err) {

                var playTurn = function(action, game) {
                    action.moveBackwards(0) || action.move(0);
                };

                game.players[0].on('turn', playTurn);
                game.players[1].on('turn', playTurn);

                // Only one should be triggered
                game.players[0].on('win', done);
                game.players[1].on('win', done);

                game.start();
            });
        });

        it.skip('should allow one team to lose', function(done) {
            var game = new Game('1v1');

            game.on('init', function(err) {

                var playTurn = function(action, game) {
                    action.moveBackwards(0) || action.move(0);
                };

                game.players[0].on('turn', playTurn);
                game.players[1].on('turn', playTurn);

                // Only one should be triggered
                game.players[0].on('lose', done);
                game.players[1].on('lose', done);

                game.start();
            });
        });
    });

    describe('2v2', function() {
        it('should create a new game', function(done) {
            var game = new Game('2v2');

            game.on('init', function(err) {
                assert.ifError(err);

                game.players.length.should.equal(4);
                game.players.forEach(function(player) {
                    player.hand.cards.length.should.equal(5);
                });

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

                    game.players.forEach(function(player) {
                        player.hand.cards.length.should.equal(5);
                    });

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
