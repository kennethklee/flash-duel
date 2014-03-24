var Deck = require('./deck');

function Player(name, peice) {
    if (!(this instanceof Player)) return new Player(name, peice);

    this.name = name;
    this.hand = new Deck();
    this.peice = peice;
};
module.exports = Player;

function Action(cards, player) {
    if (!(this instanceof Action)) return new Action(cards, player);

    this.cards = cards;
    this.player = player;
}

Player.prototype.selectCards = function() {
    var cardIndices = Array.prototype.slice(0);
    return new Action(this.hand.drawAt(cardIndices), this);
}

Action.prototype.moveForward = function() {
    return this.peice.moveForward(this.card);
};

Action.prototype.moveBackwards = function() {
    return this.peice.moveBackwards(this.card);
};

Action.prototype.push = function() {

};

Action.prototype.attack = function() {

};

Action.prototype.attack = function() {

};
