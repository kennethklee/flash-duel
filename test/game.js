var assert = require('assert'),
    should = require('should'),
    flashDuel = require('..'),
    Player = flashDuel.Player,
    Game = flashDuel.Game;

// Some helper functions
var moveForward = function(action) {
    return action.move(0)
        || action.move(1)
        || action.move(2)
        || action.move(3)
        || action.move(4);
};

var moveBackwards = function(action) {
    return action.moveBackwards(0)
        || action.moveBackwards(1)
        || action.moveBackwards(2)
        || action.moveBackwards(3)
        || action.moveBackwards(4);
};

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

                    moveBackwards(action) || moveForward(action);
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

        it('should win and lose', function(done) {
            var game = new Game('1v1');

            game.on('init', function(err) {
                var wins = 0,
                    loses = 0;

                var playTurn = function(action, game) {
                    moveBackwards(action) || moveForward(action);
                };

                var countWin = function() {
                    wins++;
                };

                var countLose = function() {
                    loses++;
                };

                game.players[0].on('turn', playTurn);
                game.players[1].on('turn', playTurn);

                for (var i = 0; i < 2; i++) {
                    game.players[i].on('win', countWin);
                    game.players[i].on('lose', countLose);
                }

                game.on('end', function() {
                    wins.should.equal(1);
                    loses.should.equal(1);
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

        it('should win and lose', function(done) {
            var game = new Game('2v2');

            game.on('init', function(err) {
                var wins = 0,
                    loses = 0;

                var playTurn = function(action, game) {
                    moveBackwards(action) || moveForward(action);
                };

                var countWin = function() {
                    wins++;
                };

                var countLose = function() {
                    loses++;
                };

                game.players[0].on('turn', playTurn);
                game.players[1].on('turn', playTurn);
                game.players[2].on('turn', playTurn);
                game.players[3].on('turn', playTurn);

                for (var i = 0; i < 4; i++) {
                    game.players[i].on('win', countWin);
                    game.players[i].on('lose', countLose);
                }

                game.on('end', function() {
                    wins.should.equal(2);
                    loses.should.equal(2);
                    done();
                });

                game.start();
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

        it('should be able to attack and defend or die', function(done) {
            var game = new Game('1v1');

            game.on('init', function(err) {

                var playTurnOne = function(action, game) {
                    var two = action.getPlayer('two'),
                        distance = two.peice.position - action.player.peice.position,
                        attack = action.player.hand.cards.indexOf(distance);

                    if (~attack) {
                        action.attack(attack, two);    // Attack if possible
                    } else {
                        moveForward(action) || moveBackwards(action); // Forward!
                    }
                };

                var playTurnTwo = function(action, game) {
                    console.log(action.player.peice);
                    console.log(action.player.hand);
                    // Too close to other side
                    if (action.player.peice.position <= 10) {
                        return moveBackwards(action);
                    }

                    moveForward(action) || moveBackwards(action); // Forward!
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

        it('should be able to dashing strike and retreat/die', function(done) {
            var game = new Game('1v1');

            game.on('init', function(err) {

                var playTurnOne = function(action, game) {
                    var two = action.getPlayer('two'),
                        distance = two.peice.position - action.player.peice.position;

                    for (var moveIndex = 0; moveIndex < 5; moveIndex++) {
                        for (var attackIndex = moveIndex; attackIndex < 5; attackIndex++) {
                            if (moveIndex !== attackIndex && action.player.hand.peekAt(moveIndex)[0] + action.player.hand.peekAt(attackIndex)[0] === distance) {
                                return action.dashingStrike(moveIndex, attackIndex, two);    // Attack if possible
                            }
                        }
                    }

                    if (distance <= 10) {
                        return moveBackwards(action);
                    }

                    moveForward(action) || moveBackwards(action); // Forward!
                };

                var playTurnTwo = function(action, game) {
                    var one = action.getPlayer('one'),
                        distance = action.player.peice.position - one.peice.position;

                    //console.log(action.player.peice);
                    //console.log(action.player.hand);

                    if (distance <= 5 || action.player.peice.position <= 11) {
                        return moveBackwards(action);
                    }

                    moveForward(action) || moveBackwards(action); // Forward!
                };

                var defendTwo = function(defend, game) {
                    defend.retreat(0)
                    || defend.retreat(1)
                    || defend.retreat(2)
                    || defend.retreat(3)
                    || defend.retreat(4);
                };

                var verify = function(player, game) {
                    game.end(); // Force game end to stop the game
                    done();
                };

                game.players[0].on('turn', playTurnOne);
                game.players[1].on('turn', playTurnTwo);
                game.players[1].on('defend', defendTwo);
                game.players[1].on('recover', verify);

                game.start();
            });
        });

    });




    it('should serialize state');
    it('should deserialize state');
});
