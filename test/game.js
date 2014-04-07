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

                // Prefer forward movement most of the time
                var playTurnOne = function(action, game) {
                    if (action.player.peice.position > 10) {
                        moveBackwards(action) || moveForward(action);
                    } else {
                        moveForward(action) || moveBackward(action);
                    }
                };

                // Prefer backward movement always
                var playTurnTwo = function(action, game) {
                    moveBackwards(action) || moveForward(action);
                };


                var countWin = function() {
                    wins++;
                };

                var countLose = function() {
                    loses++;
                };

                game.players[0].on('turn', playTurnOne);
                game.players[1].on('turn', playTurnTwo);

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

                // Prefer forward movement most of the time
                var playTurnUp = function(action, game) {
                    if (action.player.peice.position > 10) {
                        moveBackwards(action) || moveForward(action);
                    } else {
                        moveForward(action) || moveBackwards(action);
                    }
                };

                // Prefer backward movement always
                var playTurnDown = function(action, game) {
                    moveBackwards(action) || moveForward(action);
                };

                var countWin = function() {
                    wins++;
                };

                var countLose = function() {
                    loses++;
                };

                game.players[0].on('turn', playTurnUp);
                game.players[1].on('turn', playTurnUp);
                game.players[2].on('turn', playTurnDown);
                game.players[3].on('turn', playTurnDown);

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

        it('should be able to attack and defend', function(done) {
            var game = new Game('1v1');

            game.on('init', function(err) {

                var attackOne = function(action, game) {
                    var two = action.getPlayer('two')
                    action.attack(0, two);    // Attack with first card
                };

                var defendTwo = function(defend, game) {
                    defend.attackCards.should.have.property('length').and.equal(1);
                    defend.attackCards[0].should.equal(1);

                    defend.block(0);    // Block with first card
                    game.end();
                };

                var verifyTwo = function(action, game) {
                    action.player.hand.cards.length.should.equal(1);
                    action.player.hand.cards[0].should.equal(2);
                    done();
                };

                game.players[0].on('turn', attackOne);
                game.players[1].on('defend', defendTwo);
                game.players[1].on('turn', verifyTwo);

                // Rig the game for the test
                game.players[0].peice.position = 6;
                game.players[1].peice.position = 7;

                game.players[0].hand.cards = [1];    // To attack
                game.players[1].hand.cards = [1, 2];    // To block

                game.start();
            });
        });

        it('should be able to dashing strike and retreat', function(done) {
            var game = new Game('1v1');

            game.on('init', function(err) {

                var dashingStrikeOne = function(action, game) {
                    var two = action.getPlayer('two');

                    action.dashingStrike(0, [1], two).should.equal(true);    // Dashing Strike!
                };

                var retreatTwo = function(defend, game) {
                    defend.block(0).should.equal(false);    // Should not be able to block

                    defend.retreat(0);
                    defend.player.state.should.equal(Player.states.RECOVERING);
                };

                var recoverTwo = function(player, game) {
                    player.state.should.equal(Player.states.RECOVERING);
                    game.end();
                    done();
                };

                game.players[0].on('turn', dashingStrikeOne);
                game.players[1].on('defend', retreatTwo);
                game.players[1].on('recover', recoverTwo);

                // Rig the game for the test
                game.players[0].peice.position = 6;
                game.players[1].peice.position = 10;

                game.players[0].hand.cards = [1, 3];    // To attack
                game.players[1].hand.cards = [5];    // To retreat

                game.start();
            });
        });

    });

    it('should be able to play a full game', function(done) {
        var game = new Game('1v1');

        game.on('init', function(err) {
            var playTurn = function(action, game) {
                var opponent = action.player.name === 'one' ? action.getPlayer('two') : action.getPlayer('one'),
                    distance = Math.abs(opponent.peice.position - action.player.peice.position);
                    attack = action.player.hand.cards.indexOf(distance);

                for (var moveIndex = 0; moveIndex < 5; moveIndex++) {
                    for (var attackIndex = moveIndex; attackIndex < 5; attackIndex++) {
                        if (moveIndex !== attackIndex && action.player.hand.peekAt(moveIndex)[0] + action.player.hand.peekAt(attackIndex)[0] === distance) {
                            return action.dashingStrike(moveIndex, attackIndex, opponent);    // Dashing strike if possible
                        }
                    }
                }

                if (~attack) {
                    return action.attack(attack, opponent);
                }

                moveForward(action) || moveBackwards(action); // Forward!
            };

            var defend = function(defend, game) {
                // Check if can block
                var defense = defend.player.hand.cards.indexOf(defend.attackCards[0]);

                if (~defense) {
                    defend.block(defense);

                } else {
                    // Check if can retreat
                    defend.retreat(0)
                    || defend.retreat(1)
                    || defend.retreat(2)
                    || defend.retreat(3)
                    || defend.retreat(4)
                    || defend.die();
                }
            };

            var endGame = function() {
                done();
            };

            game.players[0].on('turn', playTurn);
            game.players[1].on('turn', playTurn);

            game.players[0].on('defend', defend);
            game.players[1].on('defend', defend);

            game.on('end', endGame);


            game.start();
        });

    });


    it('should serialize state');
    it('should deserialize state');
});
