function Player(name, peice) {
    if (!(this instanceof Player)) return new Player();

    this.name = name;
    this.peice = peice;
};
module.exports = Player;
