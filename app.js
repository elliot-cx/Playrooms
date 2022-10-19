const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path');

const lobby = require('./management/lobby');
const game = require('./management/game')(io);
const analytics = require('./management/analytics');

app.use('/animejs', express.static(path.join(__dirname, 'node_modules/animejs/lib')));
// howler.js
app.use(express.static('public'));
app.use(express.json());

app.set('view engine', 'ejs');

// Routing

app.get('/', (_, res) => {
    res.render('index');
});

app.get('/[a-zA-Z]{4}', (_, res) => {
    res.render('game');
});

// api pour la création et l'accès aux rooms

app.post('/api/:action(start|join)', (req, res) => {
    if (req.params.action == 'start') {
        let room = lobby.create(req.body.creatorToken, req.body.room_name);
        res.json({ "partyCode": room.id });
    } else {
        // Pour l'instant, ce end-point n'est pas utilisé
        let rooms = lobby.get_rooms();
        if (rooms.find(r => r.id == req.body.id)) {
            res.json({ "errorCode": null });
        } else {
            res.json({ "errorCode": "noSuchRoom" });
        }
    }
});

// api pour la gestion via panel de controle

app.get('/api/cpanel', (req, res) => {
    res.render('cpanel');
});

//redirection en cas de page random

app.get('*', (req, res) => {
    res.redirect("/");
});

//lancer le serveur

server.listen(port, () => {
    console.log('Server is now running...');
    // setInterval(() => {
    //     console.clear();
    //     const used = process.memoryUsage().heapUsed / 1024 / 1024;
    //     console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
    //     console.log(`ram free : ${os.freemem() /1024 /1024} MB`);
    // }, 10000);
});

//sockets events

io.on('connection', (socket) => {

    // console.log(io.engine.clientsCount);

    // lors de la tentative de connexion à une room
    socket.on('joinRoom', (joinData, callback) => {

        // Récupération de la salle actuellle
        const room = lobby.get_room(joinData.room_code);

        // Vérification de la salle
        if (room) {

            // récupération du token
            let player_token = joinData.user_token;

            // analytics.track('room joined',player_token);

            // detecter si le joueur est déjà venu dans la partie
            let player_auth = room.players_auth[player_token];

            if (player_auth) {
                // on récupère l'id du joueur
                let player_id = player_auth.id;

                // detecter si le joueur a été banni de la salle
                if (player_auth.role == 'banned') {

                    // fermeture du client
                    socket.emit('close', 'banned');

                } else {

                    // détecter si le joueur est déjà connecté
                    let player = room.players[player_id];

                    if (player) {
                        if (player.online) {
                            // on ferme le client
                            socket.emit('close', 'alreadyConnected');
                        } else {

                            // TODO #2 : Vérification de si le joueur a été expulsé pour inactivité de +30s
                            lobby.check_timeout(room, player_id);

                            player.online = true;
                            player_auth.socket_id = socket.id;
                            player.nickname = joinData.player_settings.nickname;
                            player.picture = joinData.player_settings.picture;
                            io.to(room.id).emit('update_player', player);

                            // rejoindre la room

                            socket.join(room.id);

                            // renvoi des données de la salle

                            callback({
                                id: room.id,
                                game_id: room.game_id,
                                name: room.name,
                                state: room.state,
                                players: room.players
                            }, player_id);
                        }
                    } else {
                        let player = {
                            id: player_id,
                            online: true,
                            nickname: joinData.player_settings.nickname.substring(0,16),
                            picture: joinData.player_settings.picture,
                            role: null
                        }

                        // ajout du joueur dans la salle
                        if (lobby.add_player(room, player, player_token, socket.id, null)) {

                            socket.join(room.id);

                            callback({
                                id: room.id,
                                game_id: room.game_id,
                                name: room.name,
                                state: room.state,
                                players: room.players
                            }, player_id);

                            // On notifie les autres clients
                            socket.to(room.id).emit('add_player', player);
                        } else {
                            socket.emit('close', 'tooManyPlayers');
                        }
                    }
                }
            } else {
                // on créer un nouveau joueur

                //génèration de l'identifiant du joueur
                player_id = Object.keys(room.players_auth).length;

                // detecter si le joueur a un role spécial

                //TODO #3 : Vérification host
                if (room.players[player_id]) {

                }

                let role = (player_id == 0) ? 'host' : null;

                // création du joueur
                let player = {
                    id: player_id,
                    online: true,
                    nickname: joinData.player_settings.nickname.substring(0,16),
                    picture: joinData.player_settings.picture,
                    role: role
                }

                // ajout du joueur dans la salle
                if (lobby.add_player(room, player, player_token, socket.id, role)) {

                    socket.join(room.id);

                    callback({
                        id: room.id,
                        game_id: room.game_id,
                        name: room.name,
                        state: room.state,
                        players: room.players
                    }, player_id);

                    // On notifie les autres clients
                    socket.to(room.id).emit('add_player', player);
                } else {
                    socket.emit('close', 'tooManyPlayers');
                }
            }
        } else {
            // si la room n'existe pas, fermeture du client
            socket.emit('close', 'noSuchRoom');
        }
    });

    socket.on('start', (user_token, room_id) => {
        //start a game
        let room = lobby.get_room(room_id);

        if (room && room.players_auth[user_token]) {
            if (room.players_auth[user_token].role == 'host') {
                if (room.state == 'lobby') {
                    if (Object.keys(room.players).length > 3) {
                        room.state = 'playing';
                        game.start(room);
                    }
                    return;
                }

            } else {
                socket.emit('close', 'authError');
            }
        } else {
            socket.emit('close', 'noSuchRoom');
        }

    });

    socket.on('game_data', (player_token, room_id, data, callback) => {
        const room = lobby.get_room(room_id);
        if (room) {
            game.update_player(player_token, room, data, callback);
        } else {
            socket.emit('close', 'noSuchRoom');
        }
    });

    socket.on('message', (player_token, room_id, message, callback) => {
        const room = lobby.get_room(room_id);
        if (room) {
            const player_auth = room.players_auth[player_token];
            if (player_auth) {
                io.to(room_id).emit('message_received', { 'player_id': player_auth.id, 'message': message.substring(0, 140) });
                if (callback) { callback(); }
            } else {
                socket.emit('close', 'authError');
            }
        } else {
            socket.emit('close', 'noSuchRoom');
        }
    });

    socket.on('ban', (data) => {
        const room = lobby.get_room(data.room_id);
        if (room) {
            if (room.players_auth[data.user_token].role == 'host') {
                lobby.ban_player(room, data.player_id);
                banned_player_socket = lobby.get_player_socket(data.player_id);
                if (banned_player_socket) {
                    io.to(banned_player).emit('close', 'banned');
                    io.to(room.id).except(banned_player).emit('ban_player', data.player_id);
                }
            } else {
                socket.emit('close', 'authError');
            }
        } else {
            // ne devrait pas arriver
            socket.emit('close', 'noSuchRoom');
        }
    });

    socket.on('disconnect', () => {
        const rooms = lobby.get_rooms();
        // à améliorer pour la rapidité 

        rooms.forEach(room => {
            // key = user token , data = player id, socket id, role...
            for (const [key, data] of Object.entries(room.players_auth)) {

                // TODO : vérifier si la déconnexion n'est pas intentionnelle

                if (data.socket_id == socket.id) {
                    let player = room.players[data.id];
                    player.online = false;
                    io.to(room.id).emit('update_player', player);

                    //Gérer le kickout

                    //TODO #4 : vérifier la déconnexion de l'hote

                    lobby.set_timeout(room, player.id, () => {
                        lobby.remove_player(room, player.id);
                        io.to(room.id).emit('remove_player', player.id);
                        if (Object.keys(room.players).length == 0) {
                            clearTimeout(room.game_data.next_step_timeout);
                            lobby.delete(room);
                        }
                    });
                    break;
                }
            }
        });
    });
});