const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path');

app.use('/animejs', express.static(path.join(__dirname, 'node_modules/animejs/lib')));
app.use(express.static('public'));

app.set('view engine','ejs');

app.get('/',(req,res) => {
    res.render('index');
});

//,'25.46.22.91'
server.listen(3000,()=>{ 
    console.log('Server is listening...')
});

io.on('connection',(socket) => {
    console.log("New User Connected");
    socket.on('join',(data)=>{
        socket.join(data);
    });
});