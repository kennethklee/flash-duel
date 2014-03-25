var Peice = require('./peice');

module.exports = Board;

function Board(size) {
    if (!(this instanceof Board)) return new Board(mode, callback);

    this.length = size;
    this.peices = [];
};

// Directions
Board.directions = {
    UP: 1,
    DOWN: -1
};

// Add a "physical" peice on the board
Board.prototype.add = function(position, direction) {
    var peice = new Peice(this, position, direction);

    if (this.isPeiceValid(peice)) {
        this.peices.push(peice);
        return peice;
    }
};

Board.prototype.getPeicesMoving = function(direction) {
    return this.peices.filter(function(peice) {
        return peice.direction === direction;
    });
};

Board.prototype.getFurthestPosition = function(direction) {
    var position = function(peice) {
        return peice.position;
    };
    var pos = this.getPeicesMoving(direction).map(position);

    if (direction === Board.UP) {
        pos.push(1);    // In case there are no peices
        return Math.max.apply(null, pos);
    } else {
        pos.push(this.length);    // In case there are no peices
        return Math.min.apply(null, pos);
    }
};

// Validate position of the peice
Board.prototype.isPeiceValid = function(peice) {
    // Out of bounds check
    if (peice.position < 1 || peice.position > this.length) {
        return false;
    }

    // Check if passed opposing peices
    if (peice.direction === Board.directions.UP) {
        var opposingPosition = this.getFurthestPosition(Board.directions.DOWN);

        if (peice.position >= opposingPosition) {
            return false;
        }

    } else if (peice.direction === Board.directions.DOWN) {
        var opposingPosition = this.getFurthestPosition(Board.directions.UP);

        if (peice.position <= opposingPosition) {
            return false;
        }
    }

    return true;
};
