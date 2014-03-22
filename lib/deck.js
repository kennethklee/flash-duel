var shuffle = require('shuffle');

module.exports = function(cards) {
    cards = cards || [];
    
    this.cards = Array.prototype.slice.call(cards);
};