const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path');

const lobby = require('./management/lobby');

app.use('/animejs', express.static(path.join(__dirname, 'node_modules/animejs/lib')));
app.use(express.static('public'));
app.use(express.json());

app.set('view engine','ejs');

// Routing

app.get('/',(req,res) => {
    res.render('index');
});

app.get('/[a-zA-Z]{4}',(req,res)=>{
    res.render('game');
});

app.post('/api/:action(start|join)',(req,res)=>{
    if (req.params.action == 'start') {
        let room = lobby.create(req.body.creatorToken);
        res.json({"partyCode": room.id});
    } else {
        let rooms = lobby.get_rooms();
        if (rooms.find(r => r.id == req.body.id)) {
            res.json({"errorCode":null});
        } else {
            res.json({"errorCode":"noSuchRoom"});
        }
        //faire le ban
    }
});


//redirection en cas de page random
app.get('*',(req,res)=>{
    res.redirect("/");
});

server.listen(port,()=>{ 
    console.log('Server is now running...')
});

//sockets events

io.on('connection',(socket) => {
    console.log("New User Connected");

    socket.on('join',(data)=>{
        socket.join(data);
    });
});