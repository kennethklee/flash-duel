module.exports = Peice;

function Peice(board, position, direction) {
    if (!(this instanceof Peice)) return new Peice(board, position, direction);

    this.board = board;
    this.position = position;
    this.direction = direction;
};

Peice.prototype.moveForward = function(units) {
    var oldPosition = this.position;

    this.position += (units * this.direction);

    if (!this.board.isPeiceValid(this)) {
        // Restore old position
        this.position = oldPosition;
        return false;
    }

    return true;
};

Peice.prototype.moveBackwards = function(units) {
    return this.moveForward(-units);
};
