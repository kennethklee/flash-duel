var debug = require('debug')('flash-duel:game:action'),
    Game = require('./index'),
    Player = require('../player');

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
        debug('Player ' + this.player.name + ' moves forward by ' + card + ' to ' + this.player.peice.position);
        this.game.discardDeck.hit(card);
        this.next();
        return true;
    }

    this.player.hand.hit([card]);    // Put it back
    return false;
};

Action.prototype.moveBackwards = function(cardIndex) {
    var card = this.player.hand.drawAt(cardIndex)[0];

    if (this.player.peice.moveBackwards(card)) {
        debug('Player ' + this.player.name + ' moves backwards by ' + card + ' to ' + this.player.peice.position);
        this.game.discardDeck.hit(card);
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
        debug('Player ' + this.player.name + ' pushes ' + player.name + ' by ' + card);
        this.game.discardDeck.hit(card);
        this.next();
        return true;
    }

    this.player.hand.hit([card]);    // Put it back
    return false;
};

Action.prototype.attack = function(cardIndices, opponent) {
    var self = this,
        cards = this.player.hand.drawAt(cardIndices),
        allMatch = cards.reduce(function(result, card) {return result = result && card === cards[0]}, true),
        attackPosition = this.player.peice.position + (cards[0] * this.player.peice.direction);

    if (allMatch && opponent.peice.position === attackPosition) {
        var defend = new Game.Defend(this, opponent, Action.attackTypes.NONRETREATABLE, cards);

        debug('Player ' + this.player.name + ' attacks ' + opponent.name + ' with ' + cards[0]);
        this.game.discardDeck.hit(cards);

        process.nextTick(function() {
            opponent.emit('defend', defend, self.game);
        });

        return true;
    }

    this.player.hand.hit(cards);    // Put them back
    return false;
};

Action.prototype.dashingStrike = function(moveCardIndex, attackCardIndices, opponent) {
    var self = this,
        moveCard = this.player.hand.drawAt(moveCardIndex)[0];
        attackCards = this.player.hand.drawAt(attackCardIndices),
        allMatch = attackCards.reduce(function(result, card) {return result = result && card === attackCards[0]}, true),
        attackPosition = this.player.peice.position + ((card + cards[0]) * this.player.peice.direction);

    if (allMatch && opponent.peice.position === attackPosition) {
        var defend = new Game.Defend(this, opponent, Action.attackTypes.NORMAL, cards);

        this.player.peice.moveForward(moveCard);

        debug('Player ' + this.player.name + ' dashes ' + moveCard + ' and attacks ' + player.name + ' with ' + attackCards[0]);
        this.game.discardDeck.hit(moveCard);
        this.game.discardDeck.hit(attackCards);

        process.nextTick(function() {
            opponent.emit('defend', defend, self.game);
        });

        return true;
    }

    this.player.hand.hit(moveCard);    // Put it back
    this.player.hand.hit(attackCards);    // Put them back
    return false;
};
