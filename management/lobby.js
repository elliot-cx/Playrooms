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

module.exports = {
    create : (host,name) => {
        let id = randomString(4,"AZERTYUIOPQSDFGHJKLMWXCVBN");
        while (rooms.find(r => r.id == id)) {
            id = randomString(4,"AZERTYUIOPQSDFGHJKLMWXCVBN");
        }
        const room = {
            id : id,
            game_id : 'QPJ',
            name : name,
            state : 'lobby',
            players : {},
            players_auth : {}
        }; 
        rooms.push(room);
        return room;
    },
    get_rooms : () =>{
        return rooms;
    },
    get_room : (id) => {
        return rooms.find(r => r.id == id);
    },
    add_player : (room,player,user_token,socket_id,player_role=null) =>{
        if (room){
            room.players[player.id] = player;
            room.players_auth[user_token] = {id:player.id,socket_id:socket_id,role:player_role};
            // console.log(room.players_auth);
            return true;
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
    ban_player : (room,player_id)=>{
        if (room){
            // TODO : Check if player exist
            for(const [player_token, data] of Object.entries(room.players_auth)){
                if (data.id == player_id) {
                    room.players_auth[player_token].role = 'banned';
                    break;
                }
            }
            return true
        }
        return false
    }
} 