var should = require('should'),
    Deck = require('../lib/deck');

describe('Deck', function() {
    it('should create a deck', function(done) {
        var defaultDeck = new Deck();

        defaultDeck.should.have.property('cards');
        defaultDeck.cards.should.have.property('length').and.equal(0);
        defaultDeck.should.have.property('random').and.equal(Math.random);

        var random = function() {};
        var randomDeck = new Deck(null, random);

        randomDeck.should.have.property('random').and.equal(random);

        done();
    });

    it('should clone the cards', function(done) {
        var cards = [1, 2, 3, 4, 5],
            deck = new Deck(cards);

        // modify the cards
        cards.pop();

        // ensure deck hasn't changed
        deck.should.have.property('cards');
        deck.cards.should.have.property('length').and.equal(5);

        done();
    });

    it('should deal cards from the deck', function(done) {
        var deck = new Deck([1, 2, 3, 4, 5]),
            targetDeck1 = new Deck(),
            targetDeck2 = new Deck();

        // deal out 4 of the 5 cards
        deck.deal(2, [targetDeck1, targetDeck2]);

        deck.cards.length.should.equal(1); // check remaining

        // ensure cards are dealt out equally
        targetDeck1.cards.length.should.equal(2);
        targetDeck2.cards.length.should.equal(2);

        done();
    });

    it('should fail to deal cards when not enough cards', function(done) {
        var deck = new Deck([1, 2, 3, 4, 5]),
            targetDeck1 = new Deck(),
            targetDeck2 = new Deck();

        // try to deal out 6 cards, when it only has 5
        var err = deck.deal(3, [targetDeck1, targetDeck2]);

        err.should.be.instanceOf(Error);
        err.message.should.equal('Not enough cards in deck.');

        deck.cards.length.should.equal(5); // no change

        // ensure cards are not dealt
        targetDeck1.cards.length.should.equal(0);
        targetDeck2.cards.length.should.equal(0);

        done();
    });

    it('should draw cards from the top', function(done) {
        var deck = new Deck([1, 2, 3, 4, 5]);

        var cards = deck.draw(2);

        deck.cards.length.should.equal(3);
        deck.cards[0].should.equal(3);    // first
        deck.cards[2].should.equal(5);    // last

        cards.should.have.property('length').and.equal(2);
        cards[0].should.equal(1);
        cards[1].should.equal(2);

        done();
    });

    it('should draw cards from the bottom', function(done) {
        var deck = new Deck([1, 2, 3, 4, 5]);

        var cards = deck.drawFromBottom(2);

        deck.cards.length.should.equal(3);
        deck.cards[0].should.equal(1);    // first
        deck.cards[2].should.equal(3);    // last

        cards.should.have.property('length').and.equal(2);
        cards[0].should.equal(4);
        cards[1].should.equal(5);

        done();
    });

    it('should draw cards from anywhere in deck', function(done) {
        var deck = new Deck([1, 2, 3, 4, 5]);

        var cards = deck.drawAt(0, 4, 2);

        deck.cards.length.should.equal(2);
        deck.cards[0].should.equal(2);
        deck.cards[1].should.equal(4);

        cards.length.should.equal(3);
        cards[0].should.equal(1);
        cards[1].should.equal(5);
        cards[2].should.equal(3);

        done();
    });

    it('should "hit" cards on top', function(done) {
        var deck = new Deck([3, 4]);

        deck.hit([1, 2]);

        deck.cards.length.should.equal(4);
        deck.cards[0].should.equal(1);
        deck.cards[1].should.equal(2);

        done();
    });

    it('should "hit" cards on bottom', function(done) {
        var deck = new Deck([3, 4]);

        deck.hitOnBottom([5, 6]);

        deck.cards.length.should.equal(4);
        deck.cards[2].should.equal(5);
        deck.cards[3].should.equal(6);

        done();
    });
});
