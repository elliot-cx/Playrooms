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
    create : (host) => {
        let id = randomString(4,"AZERTYUIOPQSDFGHJKLMWXCVBN");
        while (rooms.find(r => r.id == id)) {
            id = randomString(4,"AZERTYUIOPQSDFGHJKLMWXCVBN");
        }
        const room = {
            id : id,
            host : host,
            players : []
        }; 
        rooms.push(room);
        return room;
    },
    get_rooms : () =>{
        return rooms;
    }
} 