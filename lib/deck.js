function Deck(cards, random) {
    if (!(this instanceof Deck)) return new Deck(cards, random);

    this.random = random || Math.random;
    this.reset(cards);
}
module.exports = Deck;

// Reset cards
Deck.prototype.reset = function(cards) {
    cards = cards || [];

    this.cards = cards.slice(); // clone
};


// Shuffle deck
//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
Deck.prototype.shuffle = function() {
    for(var j, x, i = this.cards.length; i; j = parseInt(this.random() * i), x = this.cards[--i], this.cards[i] = this.cards[j], this.cards[j] = x);
}


// Deal to deck(s)
Deck.prototype.deal = function(numberOfCards, decks) {
    var self = this;

    if (!Array.isArray(decks)) {
        decks = [decks];
    }

    if (numberOfCards * decks.length > this.cards.length) {
        return new Error('Not enough cards in deck.');
    }

    decks.forEach(function(deck) {
        var cards = self.draw(numberOfCards);
        deck.hit(cards);
    });
};


// Draw number of cards from the top of the deck
Deck.prototype.draw = Deck.prototype.drawFromTop = function(num) {
    return this.cards.splice(0, num || 1);
};


// Draw from the bottom of the deck
Deck.prototype.drawFromBottom = function(num) {
    num = num || 1;
    return this.cards.splice(this.cards.length - num, num);
};


// Draw a card from anywhere in the deck
// parameters are the index of each card
Deck.prototype.drawAt = function(indices) {
    var positions = Array.isArray(indices)
                    ? indices    // use array if possible
                    : Array.prototype.slice.call(arguments); // fall back to arguments

    // Get cards
    var result = this.cards.filter(function(card, index) {
        return ~positions.indexOf(index);
    });

    // Remove cards
    this.cards = this.cards.filter(function(card, index) {
        return !~positions.indexOf(index);
    });

    return result;
};

Deck.prototype.peekAt = function(indices) {
    var positions = Array.isArray(indices)
                    ? indices    // use array if possible
                    : Array.prototype.slice.call(arguments); // fall back to arguments

    return this.cards.filter(function(card, index) {
        return ~positions.indexOf(index);
    });
}

// Add cards to the top of the deck
Deck.prototype.hit = Deck.prototype.hitOnTop = function(cards) {
    if (!Array.isArray(cards)) {
        cards = [cards];
    }

    var args = cards;
    args.unshift(0);
    args.unshift(0);

    this.cards.splice.apply(this.cards, args);
};


// Add cards to the bottom of the deck
Deck.prototype.hitOnBottom = function(cards) {
    if (!Array.isArray(cards)) {
        cards = [cards];
    }

    var args = cards;
    args.unshift(0);
    args.unshift(this.cards.length);

    this.cards.splice.apply(this.cards, args);
};

// Count cards that have the specified number
Deck.prototype.countCard = function(number) {
    return this.cards.reduce(function(count, card) {return count += card === number}, 0);
};
