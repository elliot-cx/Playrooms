const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path');
const lobby = require('./management/lobby');

app.use('/animejs', express.static(path.join(__dirname, 'node_modules/animejs/lib')));
app.use(express.static('public'));

app.set('view engine','ejs');

app.get('/',(req,res) => {
    res.render('index');
});

app.get('/[a-zA-Z]{4}',(req,res)=>{
    //
});

app.post('/api',(req,res)=>{
    // lobby.create()
    res.json({"code":"ok"});
});

app.get('*',(req,res)=>{
    res.redirect("/");
});

server.listen(port,()=>{ 
    console.log('Server is now running...')
});

io.on('connection',(socket) => {
    console.log("New User Connected");

    socket.on('join',(data)=>{
        socket.join(data);
    });

});