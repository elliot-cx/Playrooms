// Global Dom

const error_page = document.querySelector('.error.page');
const lobby_page = document.querySelector('.lobby.page');
const loading_page = document.querySelector('.loading.page');
const profile_page = document.querySelector('.profile.page');
const game_page = document.querySelector('.game.page');

//Error Dom

const error_page_message = error_page.querySelector('p');

// Profile Dom

const profile_play_form = profile_page.querySelector('.room-form form');
const profile_play_button = document.getElementById('play');
const profile_picture_input = document.getElementById('picture-upload');
const profile_picture = profile_page.querySelector('.profile-picture');
const nickname_input = document.getElementById('nickname');

// Lobby Dom

const lobby_players_container = lobby_page.querySelector('.players-container');
const lobby_title = lobby_players_container.querySelector('h2');
const lobby_players_wrapper = lobby_players_container.querySelector('div');
const lobby_waiting_host_label = lobby_players_container.querySelector('p');
const lobby_start_button = document.getElementById('start');

//global variables

// const game_url = location.href;
var room_code = location.href.split("/")[3];
var socket = null;
var my_player_id;
var players;

//Global Functions

function show_page(page,back=true) {
    lobby_page.setAttribute('hidden',null);
    loading_page.setAttribute('hidden',null);
    profile_page.setAttribute('hidden',null);
    if (!back){background_page.setAttribute('hidden',null);}
    page.removeAttribute('hidden');
}

function display_error(message){
    error_page_message.innerText = message;
    error_page.removeAttribute('hidden');
}


function JoinRoom() {
    console.log('Conneting to Playrooms servers... 🔌');
    show_page(loading_page);
    socket = io({ reconnection: false}); //, transports: ["websocket"] 

    let joinData = {
        room_code: room_code,
        user_token: userToken,
        socket_id: socket.id,
        player_settings: playerProfile
    }

    socket.emit('joinRoom',joinData,onJoinSuccess);

    socket.on('disconnect',disconnect);
    socket.on('connect_error',(error) => { disconnect(`Tu as été déconnecté, code erreur : ${error.message}`)});
    socket.on('close',disconnect);

    socket.on('update_player',update_player);
    socket.on('add_player',add_player);
    socket.on('remove_player',remove_player);
    socket.on('ban_player',ban_player);
}

function onJoinSuccess(room_data,player_id){
    console.log('Connected successfuly ! ✅');

    my_player_id = player_id;

    // traitement des données de la salle

    room_code = room_data.id;

    //récupère la liste des joueurs
    players = room_data.players;

    // console.log(room_data);

    lobby_players_container.querySelector('h2').innerText = room_data.name;
    //on regarde le status de la partie 
    switch (room_data.state) {
        case 'lobby':
            show_page(lobby_page);
            render_lobby();
            break;
        case 'playing':
            show_page(game_page);
            break;
        default:
            break;
    }
}

// TODO : notification des joueurs

function update_player(player) {
    players[player.id] = player;
    render_lobby();
}

function add_player(player) {
    players[player.id] = player;
    render_lobby();
}

function remove_player(player_id) {
    delete players[player_id];
    render_lobby();
}

function ban_player(player_id) {
    delete players[player_id];
    render_lobby();
}

function disconnect(reason) {
    console.log('You have been disconnected ! ⚠️');
    if (socket != null) {
        socket.off('disconnect');
        socket.close();
    }
    let message = "Tu as été déconnecté !";
    switch (reason) {
        case 'noSuchRoom':
            message = "Cette salle n'existe plus !";
            break;
        case 'alreadyConnected':
            message = "Tu es déjà connecté à cette partie !";
            break;
        case 'alreadyStarted':
            message = "La partie a déjà commencé !";
            break;
        case 'banned':
            message = "Tu as été banni de cette salle !";
            break;
        case 'authError':
            message = "Vous n'avez pas les permissions requises !"
            break;
    }
    display_error(message);
}

// Profile Page Functions

if (playerProfile.nickname != null) {
    JoinRoom();
}else{
    show_page(profile_page);
}

//Profile picture upload event

profile_play_button.addEventListener('click', confirm_profile);
profile_picture_input.addEventListener('change',setUserProfilePicture);
profile_picture.addEventListener('click', () => {
    profile_picture_input.click();
});

//Set Profile Image

function setUserProfilePicture() {
    if (this.files.length != 0){
        const imageUrl = URL.createObjectURL(this.files[0]);
        compress_image(imageUrl,(picture)=>{
            playerProfile.picture = picture;
            profile_picture.style.backgroundImage = `url(data:image/jpeg;base64,${picture})`;
        })
    }
}

//Profile Page Confirm Profile

function confirm_profile(event){
    if (profile_play_form.checkValidity()){
        event.preventDefault();
        playerProfile.nickname = nickname_input.value;
        savePlayerProfile();
        JoinRoom();
    }
}

// Lobby Page

function render_lobby() {

    // Code HTML du player container

    // <div class="player-container">
    //     <div class="profile-picture"></div>
    //     <p>Benslimoune</p>
    // </div>

    lobby_players_wrapper.innerHTML = "";
    for(const [id, player] of Object.entries(players)){
        let player_div = document.createElement('div');
        player_div.classList.add('player-container');
        lobby_players_wrapper.appendChild(player_div);
        let player_profile_pic = document.createElement('div');
        player_profile_pic.classList.add('profile-picture');
        if (player.picture != null) player_profile_pic.style.backgroundImage = `url(data:image/jpeg;base64,${player.picture})`;
        player_div.appendChild(player_profile_pic);
        let player_nick = document.createElement('p');
        if (player.online == false) {
            player_nick.classList.add('offline');
        }
        player_nick.textContent = player.nickname;
        player_div.appendChild(player_nick);
    }

    let nb_players = Object.keys(players).length;

    if (players[my_player_id].role == 'host') {
        lobby_start_button.removeAttribute('hidden');
        lobby_waiting_host_label.setAttribute('hidden','true');
    }

    if (nb_players > 3) {
        lobby_start_button.removeAttribute('disabled');
        lobby_start_button.innerText = "Démarrer la partie";
        lobby_waiting_host_label.innerText = "En attente de l'hôte...";
    }else{
        lobby_start_button.setAttribute('disabled','true');
        lobby_start_button.innerText = `${4- nb_players} joueurs manquant(s)`;
        lobby_waiting_host_label.innerText = `${4- nb_players} joueurs manquant(s)`;
    }     
}
