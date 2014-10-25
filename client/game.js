var game = {
    objects: [],
    players: {},
    player_id: null,
    player_name: window.localStorage.getItem('rfk-name')
};

// Load non-kitten objects
var non_kittens = [];
$.get('non-kittens', function(txt) {
    non_kittens = txt.split("\n");
    non_kittens.pop();
}, 'text');

// Connection
window.WebSocket = window.WebSocket || window.MozWebSocket;

server = {
    host: 'localhost',
    port: '1337'
};

var websocket = new window.WebSocket("ws://" + server.host + ":" + server.port);

websocket.onopen = function() {
    if(window.localStorage.getItem('rfk-name')) {
        websocket.send('n' + window.localStorage.getItem('rfk-name').slice(0, 45));
    }
}

websocket.onerror = function() {
    $('#message').html('The robotsfindkitten <abbr title="' + "ws://" + server.host + ":" + server.port + '">server</abbr> is not accessible :( <a href="#!" onclick="window.location.reload()">Refresh ?</a>');
}

websocket.onmessage = function (message) {

    params = JSON.parse(message.data);

    // Actions received via websocket
    var actions = {
        move: function(infos) {
            game.players[infos.player.id].x = infos.player.x;
            game.players[infos.player.id].y = infos.player.y;
        },
        reset: function(infos) {
            game.objects = [];
            infos.objects.forEach(function(object) {
                game.objects.push({
                    x: object[0],
                    y: object[1],
                    symbol: String.fromCharCode(random_int(33, 126)),
                    color: '#' + [6, 7 ,8, 9, 'A', 'B', 'C', 'D'].choose() + [6, 7 ,8, 9, 'A', 'B', 'C', 'D'].choose() + [6, 7 ,8, 9, 'A', 'B', 'C', 'D'].choose()
                });
            });

            if('players' in infos) {
                infos.players.forEach(function(player) {
                    game.players[player.id] = {x: player.x, y: player.y};
                });
            }

            if('name' in infos) {
                game.player_name = game.player_name || infos.name;
                $('.name').text(game.player_name + ' ');
            }
        },
        exit: function(infos) {
            game.players[infos.id] = null;
        },
        join: function(infos) {
            game.players[infos.id] = {x: 0, y: 0};
        },
        quote: function(infos) {
            $('#message').text(non_kittens[infos.q]);
        },
        won: function(infos) {
            $('#message').html("<strong><u>" + infos.winrar + '</u> found kitten ! <span style="color: red">&lt;3</span>');
        }
    }

    if('action' in params && params.action in actions) {
        actions[params.action](params);
        refresh();
    }
};

// Movements
$(window).keydown(function(evt) {
    var keys = {
        40: 'd',
        39: 'r',
        38: 'u',
        37: 'l'
    };
    if(evt.keyCode in keys) {
        websocket.send(keys[evt.keyCode]);
    }
}).on('touchstart', function(evt) {
    if(evt.originalEvent.touches[0].clientX > 2/3 * $('body').width())
        websocket.send('r');
    else if(evt.originalEvent.touches[0].clientX < 1/3 * $('body').width())
        websocket.send('l');

    if(evt.originalEvent.touches[0].clientY > 2/3 * $('body').height())
        websocket.send('d');
    else if(evt.originalEvent.touches[0].clientY < 1/3 * $('body').height())
        websocket.send('u');

});

$('.rename').click(function() {
    var name = prompt("What's your name ?").slice(0, 45) || game.player_name;
    game.player_name = name;
    $('.name').text(name + ' ');
    window.localStorage.setItem('rfk-name', name);
    websocket.send('n' + name);
});

// Helper functions
function refresh() {
    var lines = [];
    for(var i = 0; i<21; i++) {
        var line = "";
        for(var j = 0; j<80; j++) {
            char = player_at({x: j, y: i}) || object_at({x: j, y: i}) || " ";
            line += char;
        }
        lines.push(line);
    }
    $('#game').html(lines.join('\n'));
}

function player_at(position) {
    var char = "";

    for(var i in game.players) {
        var player = game.players[i];
        if(player && player.x == position.x && player.y == position.y) {
            char = '<u>#</u>';
        }
    }

    return char;
}

function object_at(position) {
    var char = "";

    game.objects.forEach(function(object) {
        if(object.x == position.x && object.y == position.y) {
            char = '<span style="color: ' + object.color + '">' + object.symbol + '</span>';
        }
    });

    return char;
}

