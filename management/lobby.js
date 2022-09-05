function randomString(len, charSet) {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}

var rooms = [];
const players_timeouts = {};

module.exports = {
    create : (host,name) => {
        let id = randomString(4,"AZERTYUIOPQSDFGHJKLMWXCVBN");
        while (rooms.find(r => r.id == id)) {
            id = randomString(4,"AZERTYUIOPQSDFGHJKLMWXCVBN");
        }
        const room = {
            id : id,
            game_id : 'QPJ',
            game_data : {},
            name : name,
            state : 'lobby',
            players : {},
            players_auth : {}
        }; 
        rooms.push(room);
        return room;
    },
    delete : (room)=>{
        if(room){
            rooms = rooms.filter(r => r.id != room.id);
            delete room;
            return true;
        }
        return false;
    },
    get_rooms : () =>{
        return rooms;
    },
    get_room : (id) => {
        return rooms.find(r => r.id == id);
    },
    add_player : (room,player,user_token,socket_id,player_role=null) =>{
        if (room){
            if(Object.keys(room.players).length < 10){
                room.players[player.id] = player;
                room.players_auth[user_token] = {id:player.id,socket_id:socket_id,role:player_role};
                // console.log(room.players_auth);
                return true;
            }
        }
        return false;
    },
    remove_player : (room,player_id)=>{
        if (room){
            const player = room.players[player_id];
            if (player) {
                delete room.players[player_id];
                return true;
            }
            return false;
        }
        return false;
    },
    get_player_token : (room,player_id)=>{
        if (room) {
            for(const [player_token, data] of Object.entries(room.players_auth)){
                if (data.id == player_id) {
                    return player_token;
                }
            }
        }
        return;
    },
    get_player_socket : (room,player_id)=>{
        if(room){
            let token = module.exports.get_player_token(room,player_id);
            if(token){
                return room.players_auth[token].socket_id;
            }
        }
        return;
    },
    ban_player : (room,player_id)=>{
        let player_token = module.exports.get_player_token(room,player_id);

        if (player_token){
            room.players_auth[player_token].role = 'banned';
        }
    },
    set_timeout : (room,player_id,callback)=>{
        let player_token = module.exports.get_player_token(room,player_id);
        if (player_token) {
            players_timeouts[player_token] = setTimeout(()=>{
                clearTimeout(players_timeouts[player_token]);
                delete players_timeouts[player_token];
                callback();
            },30000);
            return;
        }
        return;
    },
    check_timeout : (room,player_id)=>{
        let player_token = module.exports.get_player_token(room,player_id);

        if(player_token){
            let timeout = players_timeouts[player_token];
            if (timeout) {
                clearTimeout(timeout);
                delete players_timeouts[player_token];
            }
        }
        return;
    }
} 