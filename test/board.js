var should = require('should'),
    Board = require('../lib/board'),
    Peice = require('../lib/board/peice');

describe('Board', function() {

    it('should create a board', function(done) {
        var board = new Board(4);

        board.should.have.property('length').and.equal(4);
        board.should.have.property('peices');

        done();
    });

    it('should add a player', function(done) {
        var board = new Board(4);

        var peice = board.add(1, Board.UP);

        peice.should.not.be.empty;
        peice.should.be.an.instanceOf(Peice);
        peice.should.have.property('board').and.equal(board);
        peice.should.have.property('position').and.equal(1);
        peice.should.have.property('direction').and.equal(Board.UP);

        done();
    });

    it('should fail to add players outside the board', function(done) {
        var board = new Board(4);

        var belowPeice = board.add(0, Board.UP),
            abovePeice = board.add(5, Board.DOWN);

        should.not.exist(belowPeice);
        should.not.exist(abovePeice);

        done();
    });

    it('should fail to add opposing players on wrong side', function(done) {
        var board = new Board(4),
            upPeice = board.add(2, Board.UP),
            downPeice = board.add(3, Board.DOWN);

        var wrongUpPeice = board.add(3, Board.UP),
            wrongDownPeice = board.add(1, Board.DOWN);

        upPeice.should.not.be.empty;
        downPeice.should.not.be.empty;

        should.exist(upPeice);
        should.exist(downPeice);

        should.not.exist(wrongUpPeice);
        should.not.exist(wrongDownPeice);

        done();
    });

    it('should get the peicing moving a direction', function(done) {
        var board = new Board(4),
            one = board.add(1, Board.UP),
            two = board.add(2, Board.UP),
            three = board.add(4, Board.DOWN);

        var peices = board.getPeicesMoving(Board.UP);

        peices.should.be.an.instanceOf(Array);
        peices.should.have.property('length').and.equal(2);

        peices.should.not.containEql(three);

        done();

    });

    it('should get furthest position of a direction', function(done) {
        var board = new Board(4),
            upPeice = board.add(2, Board.UP),
            downPeice = board.add(3, Board.DOWN);

        var upFurthest = board.getFurthestPosition(Board.UP),
            downFurthest = board.getFurthestPosition(Board.DOWN);

        upFurthest.should.equal(2);
        downFurthest.should.equal(3);

        done()
    });

    it('should move players forwards and backwards', function(done) {
        var board = new Board(10),
            upPeice1 = board.add(1, Board.UP),
            upPeice2 = board.add(3, Board.UP),
            downPeice1 = board.add(10, Board.DOWN),
            downPeice2 = board.add(8, Board.DOWN);

        var upMove1 = upPeice1.moveForward(4),
            upMove2 = upPeice2.moveBackwards(2),
            downMove1 = downPeice1.moveForward(4);
            downMove2 = downPeice2.moveBackwards(2);

        upMove1.should.equal(true);
        upMove2.should.equal(true);
        downMove1.should.equal(true);
        downMove2.should.equal(true);

        upPeice1.position.should.equal(5);
        upPeice2.position.should.equal(1);
        downPeice1.position.should.equal(6);
        downPeice2.position.should.equal(10);

        done();
    });

    it('should fail to move a player outside the board', function(done) {
        var board = new Board(10),
            upPeice = board.add(1, Board.UP),
            downPeice = board.add(10, Board.DOWN);

        var upMove = upPeice.moveBackwards(4),
            downMove = downPeice.moveBackwards(4);

        upMove.should.equal(false);
        downMove.should.equal(false);

        // No change
        upPeice.position.should.equal(1);
        downPeice.position.should.equal(10);

        done();
    });

    it('should fail to move a player past the other team', function(done) {
        var board = new Board(10),
            upPeice = board.add(1, Board.UP),
            downPeice = board.add(10, Board.DOWN);

        var upMove = upPeice.moveForward(9),
            downMove = downPeice.moveForward(9);

        upMove.should.equal(false);
        downMove.should.equal(false);

        // No change
        upPeice.position.should.equal(1);
        downPeice.position.should.equal(10);

        done();
    });
});
