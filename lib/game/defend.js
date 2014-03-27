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
        allMatch = cards.reduce(function(result, card) {result = result && card === cards[0]}, true);

    if (allMatch && this.attackCards.length === cards.length && cards[0] === this.attackCards[0]) {
        this.originalAction.next();
        return true;
    }

    this.player.hand.hit(cards);    // Put it back
    return false;
};

Defend.prototype.retreat = function(cardIndex) {
    if (this.attackType === Action.attackTypes.NONRETREATABLE) return false;

    var card = this.player.hand.drawAt(cardIndex)[0];

    if (this.player.peice.moveBackwards(card)) {
        this.originalAction.next();
        this.player.state = Player.states.RETREATING;
        return true;
    }

    this.player.hand.hit([card]);    // Put it back
    return false;
};

Defend.prototype.die = function() {
    // Kill!
    this.originalAction.game.board.remove(this.player.peice);
    this.player.playing = false;

    process.nextTick(function() {
        if (!this.originalAction.game.verifyWin()) {
            this.originalAction.next();
        }
    });

    return true;
};
