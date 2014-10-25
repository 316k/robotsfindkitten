function random_int(min, max, exclude) {
    exclude = exclude || [];
    while(exclude.contains(number = Math.round(Math.random() * (max - min)) + min));
    return number;
}

function Game() {
    this.reset();
};

// Returns the state of the game, aka an array containing the objects' positions
Game.prototype.state = function() {
    var response = [];
    this.objects.forEach(function(value) {
        response.push([value.x, value.y]);
    });
    return response;
};

// Returns the quote number at `position` or null if no quote is found
Game.prototype.quote = function(position) {
    var response = null;
    this.objects.forEach(function(object, index) {
        if(response === null && object.x == position.x && object.y == position.y) {
            response = object.q;
        }
    });
    return response;
};

// Tells if there is a kitten at `position`
Game.prototype.is_kitten = function(position) {
    var response = false;
    var game = this;
    this.objects.forEach(function(object, index) {
        response = response || (object.x == position.x && object.y == position.y && index == game.kitten);
    });
    return response;
};

Game.prototype.reset = function() {
    this.objects = [];
    quotes = [];
    x = [];
    y = [];

    for(i=0; i<Game.non_kittens; i++) {
        this.objects[i] = {
            q: random_int(0, Game.nbr_quotes - 1, quotes),
            x: random_int(0, 79, x),
            y: random_int(0, 20, y)
        };

        quotes.push(this.objects[i].q);
        x.push(this.objects[i].x);
        y.push(this.objects[i].y);
    }

    this.kitten = random_int(0, Game.non_kittens - 1);
};

Game.non_kittens = 21;

// Number of non kittens available
Game.nbr_quotes = 701;

// Client IDs
Game.last_client_id = 0;

exports.Game = Game;
