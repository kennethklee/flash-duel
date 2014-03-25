var Player = require('../player');
module.exports = Action;

function Action(game, player, next) {
    if (!(this instanceof Action)) return new Action(game, player, next);

    this.game = game;
    this.player = player;
    this.next = next;
};

Action.attackTypes = {
    NORMAL: 'normal',
    NONRETREATABLE: 'non-retreatable',
    UNBLOCKABLE: 'unblockable'
};


Action.prototype.getPlayer = function(name) {
    return this.game.players.filter(function(player) {return player.name === name})[0];
};

Action.prototype.moveForward = Action.prototype.move = function(cardIndex) {
    var card = this.player.hand.drawAt(cardIndex)[0];

    if (this.player.peice.moveForward(card)) {
        this.next();
        return true;
    }

    this.player.hand.hit([card]);    // Put it back
    return false;
};

Action.prototype.moveBackwards = function(cardIndex) {
    var card = this.player.hand.drawAt(cardIndex)[0];

    if (this.player.peice.moveBackwards(card)) {
        this.next();
        return true;
    }

    this.player.hand.hit([card]);    // Put it back
    return false;
};

Action.prototype.push = function(cardIndex, player) {
    var card = this.player.hand.drawAt(cardIndex)[0],
        pushPosition = this.player.peice.position + this.player.peice.direction;

    if (player.peice.position === pushPosition && player.peice.moveBackwards(card)) {
        this.next();
        return true;
    }

};

Action.prototype.attack = function(cardIndices, player) {
    var self = this,
        cards = this.player.hand.drawAt(cardIndices),
        allMatch = cards.reduce(function(result, card) {result = result && card === cards[0]}, true),
        attackPosition = this.player.peice.position + (cards[0] * this.player.peice.direction);

    if (allMatch && player.peice.position === attackPosition) {
        var defend = new Action.Defend(this, player, Action.attackTypes.NORMAL, cards);

        process.nextTick(function() {
            player.emit('defend', defend, self.game);
        });

        return true;
    }

    this.player.hand.hit(cards);    // Put it back
    return false;
};

Action.prototype.dashingStrike = function(moveCardIndex, attackCardIndices, peice) {

};



Action.Defend = function(originalAction, player, attackType, attackCards) {
    if (!(this instanceof Action.Defend)) return new Action.Defend(originalAction, player, attackType, attackCards);

    this.originalAction = originalAction;
    this.player = player;
    this.attackType = attackType;
    this.attackCards = attackCards.slice();
};

Action.Defend.prototype.block = function(cardIndices) {
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

Action.Defend.prototype.retreat = function(cardIndex) {
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

Action.Defend.prototype.die = function() {
    // TODO end game!
};
