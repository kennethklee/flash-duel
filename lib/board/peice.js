module.exports = Peice;

function Peice(board, position, direction) {
    if (!(this instanceof Peice)) return new Peice(board, position, direction);

    this.board = board;
    this.position = position;
    this.direction = direction;
};

Peice.prototype.moveForward = function(units) {
    var oldPosition = this.position,
        result = false;

    this.position += (units * this.direction);

    if (result = !this.board.isPeiceValid(this)) {
        this.position = oldPosition;
    }

    return !result;
};

Peice.prototype.moveBackwards = function(units) {
    return this.moveForward(-units);
};
