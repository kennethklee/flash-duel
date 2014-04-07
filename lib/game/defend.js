var debug = require('debug')('flash-duel:game:defend'),
    Action = require('./action'),
    Player = require('../player');

module.exports = Defend;

function Defend(originalAction, player, attackType, attackCards) {
    if (!(this instanceof Defend)) return new Defend(originalAction, player, attackType, attackCards);

    this.originalAction = originalAction;
    this.player = player;
    this.attackType = attackType;
    this.attackCards = attackCards.slice();
};

Defend.prototype.block = function(cardIndices) {
    if (this.attackType === Action.attackTypes.UNBLOCKABLE) return false;

    var cards = this.player.hand.drawAt(cardIndices),
        allMatch = cards.reduce(function(result, card) {return result = result && card === cards[0]}, true);

    if (allMatch && this.attackCards.length === cards.length && cards[0] === this.attackCards[0]) {
        debug('Player ' + this.player.name + ' blocks.');
        this.originalAction.next();
        return true;
    }

    this.player.hand.hit(cards);    // Put it back
    return false;
};

Defend.prototype.retreat = function(cardIndex) {
    if (this.attackType === Action.attackTypes.NONRETREATABLE) return false;

    var card = this.player.hand.drawAt(cardIndex)[0];

    // TODO retreat to start position past.
    if (this.player.peice.moveBackwards(card)) {
        debug('Player ' + this.player.name + ' retreats back by ' + card + ' to ' + this.player.peice.position);
        this.player.state = Player.states.RECOVERING;
        this.originalAction.next();
        return true;
    }

    this.player.hand.hit([card]);    // Put it back
    return false;
};

Defend.prototype.die = function() {
    var self = this;
    // Kill!
    debug('Player ' + this.player.name + ' cannot defend.');
    this.originalAction.game.board.remove(this.player.peice);
    this.player.playing = false;

    process.nextTick(function() {
        if (!self.originalAction.game.verifyWin()) {
            // One down, but not out yet!
            self.originalAction.next();
        }
    });

    return true;
};
