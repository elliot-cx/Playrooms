var rooms = [];

module.exports = {
    create : (id) => {
        const room = {
            id : id,
            players : []
        }; 
        rooms.push(room);
        return room;
    }
} 