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

        it('should win', function(done) {
            var game = new Game('1v1');

            game.on('init', function(err) {

                var playTurn = function(action, game) {
                    action.moveBackwards(0) || action.move(0);
                };

                var verify = function() {
                    done();
                };

                game.players[0].on('turn', playTurn);
                game.players[1].on('turn', playTurn);

                // Only one should be triggered
                game.players[0].on('win', verify);
                game.players[1].on('win', verify);

                game.start();
            });
        });

        it('should lose', function(done) {
            var game = new Game('1v1');

            game.on('init', function(err) {

                var playTurn = function(action, game) {
                    action.moveBackwards(0) || action.move(0);
                };

                var verify = function() {
                    done();
                };

                game.players[0].on('turn', playTurn);
                game.players[1].on('turn', playTurn);

                // Only one should be triggered
                game.players[0].on('lose', verify);
                game.players[1].on('lose', verify);

                game.start();
            });
        });

        it('should be able to attack and defend or die', function(done) {
            var game = new Game('1v1');

            game.on('init', function(err) {

                var playTurnOne = function(action, game) {
                    var two = action.getPlayer('two'),
                        distance = two.peice.position - action.player.peice.position,
                        attack = action.player.hand.cards.indexOf(distance);

                    if (~attack) {
                        action.attack([attack], two);    // Attack if possible
                    } else {
                        // Forward
                        action.move(0) || action.moveBackwards(0)
                        || action.move(1) || action.moveBackwards(1);
                    }
                };

                var playTurnTwo = function(action, game) {
                    // Forward! copy pasta should really use for loop or something
                    var result = action.move(0) || action.moveBackwards(0)
                                || action.move(1) || action.moveBackwards(1)
                                || action.move(2) || action.moveBackwards(2)
                                || action.move(3) || action.moveBackwards(3)
                                || action.move(4) || action.moveBackwards(4);

                    if (!result) {
                        console.log(action.player.hand);
                    }
                };

                var defendTwo = function(defend, game) {
                    var defense = defend.player.hand.cards.indexOf(defend.attackCards[0]);

                    if (~defense) {
                        defend.block(defense);

                    } else {
                        defend.die();
                    }
                };

                var verify = function() {
                    done();
                };

                game.players[0].on('turn', playTurnOne);
                game.players[1].on('turn', playTurnTwo);
                game.players[1].on('defend', defendTwo);

                // Only one should be triggered
                game.players[0].on('win', verify);

                game.start();
            });
        });

    });




    it('should serialize state');
    it('should deserialize state');
});
