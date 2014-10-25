require("./lib/helpers.js");

var sys = require("sys"),
    Game = require("./lib/game.js").Game,
    WebSocketServer = require('ws').Server;

var wss = new WebSocketServer({port: 1337});
game = new Game();

wss.on('connection', function(client) {
    client.robot = {
        x: 0,
        y: 0,
        id: Game.last_client_id,
        name: 'Robot #' + Game.last_client_id
    };
    Game.last_client_id++;

    wss.broadcast({action: 'reset', objects: game.state(), players: robots(), id: client.robot.id, name: client.robot.name}, client);
    wss.broadcast({id: client.robot.id, action: 'join'});

    client.on('message', function(message) {
        var action = message[0];

        var actions = {
            'u': function() {
                client.robot.y--;
                client.robot.y = Math.max(client.robot.y, 0);
            },
            'd': function() {
                client.robot.y++;
                client.robot.y = Math.min(client.robot.y, 20);
            },
            'l': function() {
                client.robot.x--;
                client.robot.x = Math.max(client.robot.x, 0);
            },
            'r': function() {
                client.robot.x++;
                client.robot.x = Math.min(client.robot.x, 79);
            },
            // Name
            'n': function() {
                client.robot.name = message.slice(1, 46);
                console.log(client.robot.name);
            }
        };

        if(action in actions) {
            actions[action]();
            wss.broadcast({action: 'move', player: client.robot});

            var quote = null;
            if(game.is_kitten({x: client.robot.x, y: client.robot.y})) {
                wss.broadcast({action: 'won', winrar: client.robot.name});
                game.reset();
                wss.broadcast({action: 'reset', objects: game.state()});
            } else if(quote = game.quote({x: client.robot.x, y: client.robot.y})) {
                wss.broadcast({action: 'quote', q: quote}, client);
            }
        }
    });

    client.on('close', function() {
        wss.broadcast({id: client.robot.id, action: 'exit'});
    });
});

wss.broadcast = function(data, client) {
    data = data.toString();
    if(client !== undefined) {
        client.send(data);
    } else {
        this.clients.forEach(function(client, index) {
            client.send(data);
        });
    }
};

function robots() {
    var robots = [];
    wss.clients.forEach(function(client) {
        robots.push(client.robot);
    });
    return robots;
}
