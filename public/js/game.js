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
const lobby_players_counter = lobby_page.querySelector('p.players-counter');
const lobby_title = lobby_players_container.querySelector('h2');
const lobby_players_wrapper = lobby_players_container.querySelector('div');
const lobby_waiting_host_label = lobby_players_container.querySelector('p.game-status');
const lobby_start_button = document.getElementById('start');

lobby_start_button.addEventListener('click',()=>{
    socket.emit('start',userToken,room_code);
    lobby_start_button.setAttribute('disabled',true);
});

// Game Dom

const game_page_countdown = document.getElementById('countdown');
const game_page_countdown_number = game_page_countdown.querySelector('div');
const game_page_countdown_svg = game_page_countdown.querySelector('svg');
const game_page_countdown_svg_circle = game_page_countdown_svg.querySelector('circle');

const game_wait_view = game_page.querySelector(".wait-view");
const game_teams_view = game_page.querySelector(".teams-view");
const game_questions_view = game_page.querySelector(".questions-view");
const game_vote_view = game_page.querySelector(".vote-view");
const game_challenges_view = game_page.querySelector(".challenges-view");
const game_end_view = game_page.querySelector(".end-view");

const game_team_containers = game_teams_view.getElementsByClassName("team-container");

const game_questions_challenge_card = game_questions_view.querySelector('div.challenge-card');
const game_questions_challenge_card_question = game_questions_challenge_card.querySelector(".card-question");
const game_questions_challenge_card_answer = game_questions_challenge_card.querySelector(".card-answer");
const game_questions_challenge_answer_input = document.getElementById('challenge-answer');
const game_questions_challenge_valid_btn = document.getElementById('btn-valid-challenge');

game_questions_challenge_card.onclick = () => {game_questions_challenge_card.classList.toggle("flipped")};
game_questions_challenge_valid_btn.onclick = () => {
    if (game_questions_challenge_answer_input.value.length > 2) {
        socket.emit('game_data',userToken,room_code,game_questions_challenge_answer_input.value,() =>{
            game_questions_challenge_valid_btn.setAttribute('disabled',true);
            game_questions_challenge_answer_input.setAttribute('disabled',true);
        });
    }
}
game_questions_challenge_answer_input.onkeyup = (e) =>{
    e.preventDefault();
    if (e.keyCode === 13) {
        game_questions_challenge_valid_btn.click();
    }
}

const game_vote_challenge_card = game_vote_view.querySelector('div.challenge-card');
const game_vote_challenge_card_question = game_vote_challenge_card.querySelector(".card-question");
const game_vote_challenge_card_answer = game_vote_challenge_card.querySelector(".card-answer");
const game_vote_challenge_answers_container = game_vote_view.querySelector('div.challenges-container');

//global variables

// const game_url = location.href;
var room_code = location.href.split("/")[3].toUpperCase();
var socket = null;
var my_player_id;
var players;
var current_game_view;

//Global Functions

function show_page(page,back=true) {
    lobby_page.setAttribute('hidden',null);
    loading_page.setAttribute('hidden',null);
    profile_page.setAttribute('hidden',null);
    if (!back){background_page.setAttribute('hidden',null);}
    page.removeAttribute('hidden');
}

function display_error(message){
    loading_page.setAttribute('hidden',null);
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

    //client event

    socket.on('disconnect',disconnect);
    socket.on('connect_error',(error) => { disconnect(`Tu as été déconnecté, code erreur : ${error.message}`);});
    socket.on('close',disconnect);

    //players events

    socket.on('update_player',update_player);
    socket.on('add_player',add_player);
    socket.on('remove_player',remove_player);
    socket.on('ban_player',ban_player);

    //game events
    socket.on('game_update',game_update);
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

// TODO : notification des joueurs + support in game

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
            message = "Vous n'avez pas les permissions requises !";
            break;
        case 'tooManyPlayers':
            message = "Il y a trop de joueurs dans ce salon !";
            break;
    }
    display_error(message);
}

// Profile Page Functions

//TODO : Add possibility to modify player name and profile picture

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

    lobby_players_counter.innerText = `${nb_players}/10 joueurs dans le lobby`;

    if (players[my_player_id].role == 'host') {
        lobby_start_button.removeAttribute('hidden');
        lobby_waiting_host_label.setAttribute('hidden','true');
    }

    if (nb_players > 1) {
        lobby_start_button.removeAttribute('disabled');
        lobby_start_button.innerText = "Démarrer la partie";
        lobby_waiting_host_label.innerText = "En attente de l'hôte...";
    }else{
        lobby_start_button.setAttribute('disabled','true');
        lobby_start_button.innerText = `${4 - nb_players} joueur(s) manquant(s)`;
        lobby_waiting_host_label.innerText = `${4 - nb_players} joueur(s) manquant(s)`;
    }
    
    
}


//Game page

var countdownInterval = null;

function show_countdown(start,end,callback) {
    if(countdownInterval){clearInterval(countdownInterval);}
    const total_time = (end - start) / 1000;
    let pourcentage = 100
    let countdown = total_time;

    game_page_countdown_number.innerText = countdown;
    pourcentage = Math.floor((countdown/total_time)*100);  
    game_page_countdown_svg_circle.style.strokeDashoffset = `${113-Math.floor((pourcentage/100)*113)}px`;

    game_page_countdown.removeAttribute('hidden');
    countdownInterval = setInterval(() => {
        if (countdown == 0) {
            clearInterval(countdownInterval);
            countdownInterval = null
            game_page_countdown.setAttribute('hidden',null);
            if(callback){callback();}
            return;
        }
        game_page_countdown_number.innerText = countdown;
        pourcentage = Math.floor((countdown/total_time)*100);  
        game_page_countdown_svg_circle.style.strokeDashoffset = `${113-Math.floor((pourcentage/100)*113)}px`;
        countdown--;
    }, 1000);
}

function switch_game_view(game_view) {
    if (current_game_view == null || current_game_view != game_view) {
        current_game_view = game_view;
        game_wait_view.setAttribute('hidden',null);
        game_teams_view.setAttribute('hidden',null);
        game_questions_view.setAttribute('hidden',null);
        game_vote_view.setAttribute('hidden',null);
        game_challenges_view.setAttribute('hidden',null);
        game_end_view.setAttribute('hidden',null);
        game_view.removeAttribute('hidden');
    }
}

function game_update(game_data) {
    switch (game_data.state) {
        case 'teams':
            console.log('Game started ! 🕹️');
            // game_teams_view.querySelector('.versus-wrapper h2').removeAttribute('hidden');
            show_page(game_page);

            for (let index = 0; index < game_data.teams.length; index++) {
                const team_players = game_data.teams[index];
                game_team_containers[index].innerHTML = "";
                for(const player_id of team_players){
                    let player = players[player_id];
                    if (player) {
                        let player_div = document.createElement('div');
                        player_div.classList.add('player-container');
                        game_team_containers[index].appendChild(player_div);
                        let player_profile_pic = document.createElement('div');
                        player_profile_pic.classList.add('profile-picture');
                        if (player.picture != null) player_profile_pic.style.backgroundImage = `url(data:image/jpeg;base64,${player.picture})`;
                        player_div.appendChild(player_profile_pic);
                        let player_nick = document.createElement('p');
                        player_nick.textContent = player.nickname;
                        player_div.appendChild(player_nick);
                    }
                }
            }
            switch_game_view(game_teams_view);
            let teams_animation = anime.timeline().add({
                targets: game_team_containers[0].getElementsByClassName('player-container'),
                scale: [14,1],
                opacity: [0,1],
                easing: "easeOutCirc",
                duration: 500,
                delay: (el, i) => 500 * i
            }).add({
                targets: '.versus-wrapper h2',
                background: 'rgba(0, 0, 0, 0)',
                scale: [14,1],
                opacity: [0,1],
                easing: "easeOutCirc",
                duration: 2000
            }).add({
                targets: game_team_containers[1].getElementsByClassName('player-container'),
                scale: [14,1],
                opacity: [0,1],
                easing: "easeOutCirc",
                zIndex:-1,
                duration: 500,
                delay: (el, i) => 500 * i
            });

            anime({
                targets: game_teams_view.querySelector(".start-wrapper h3"),
                easing: 'easeInQuint',
                duration:5000,
                opacity: [0.0,1.0]
            });

            let dots_anime = anime.timeline({loop:true}).add({
                targets: game_teams_view.querySelectorAll(".start-wrapper h3 span"),
                easing: 'easeInQuint',
                direction: 'alternate',
                translateY: [0, "-0.3em"],
                zIndex:-3,
                duration:300,
                delay: (el, i) => 100 * i,
            }).add({
                targets: game_teams_view.querySelectorAll(".start-wrapper h3 span"),
                easing: 'easeInQuad',
                direction: 'alternate',
                translateY: ["-0.3em", 0],
                zIndex:-3,
                duration:300,
                delay: (el, i) => 100 * i,
            });

            setTimeout(() => {
                dots_anime.pause();
                teams_animation.pause();
                // game_teams_view.querySelector('.versus-wrapper h2').setAttribute('hidden',null);
                anime({
                    targets: game_teams_view.querySelector(".start-wrapper h3"),
                    easing: 'easeOutCubic',
                    duration:100,
                    opacity: [1.0,0]
                });
                anime({
                    targets: '.versus-wrapper h2',
                    scale: [1,50],
                    zIndex:3,
                    background: 'linear-gradient(120deg, var(--first-color) 0%, var(--second-color) 100%)',
                    color: 'rgba(0, 0, 0, 0)',
                    borderRadius: '50%',
                    easing: "easeOutCirc",
                    duration: 2500,
                });
                // }).add({
                //     targets: '.versus-wrapper h2',
                //     opacity:[1.0,0.0],
                //     easing: "easeOutCubic",
                //     duration: 100,
                // });
            }, 15000);
            break;
        case 'questions':
            switch_game_view(game_questions_view);
            game_questions_challenge_valid_btn.removeAttribute('disabled');
            game_questions_challenge_answer_input.removeAttribute('disabled');
            anime({
                targets:game_questions_view,
                opacity: [0.0,1.0],
                easing: 'easeInQuad',
                duration:1000,
                complete: function() {
                    game_questions_challenge_card.classList.toggle('flipped');
                }
            });
            game_questions_challenge_card_question.innerText = game_data.team_data.challenge[0];
            
            // TODO : Mode de jeux avec réponse cachée
            if (game_data.team_data.challenge[1] != '') {
                game_questions_challenge_card_answer.removeAttribute('hidden');
                game_questions_challenge_card_answer.innerText = game_data.team_data.challenge[1];
            }else{
                game_questions_challenge_card_answer.setAttribute('hidden',true);
            }

            show_countdown(game_data.next_step_time_start,game_data.next_step_time,()=>{
                if (!game_questions_challenge_valid_btn.disabled) {
                    socket.emit('game_data',userToken,room_code,game_questions_challenge_answer_input.value,() =>{
                        game_questions_challenge_valid_btn.setAttribute('disabled',true);
                        game_questions_challenge_answer_input.setAttribute('disabled',true);
                    });
                }
            });
            break;
        case 'vote':
            if (game_data.team_data) {
                switch_game_view(game_vote_view);
                game_vote_challenge_card_question.innerText = game_data.team_data.challenge[0];
                game_vote_challenge_card.classList.remove('flipped');

                if (game_data.team_data.challenge[1] != '') {
                    game_vote_challenge_card_answer.removeAttribute('hidden');
                    game_vote_challenge_card_answer.innerText = game_data.team_data.challenge[1];
                }else{
                    game_vote_challenge_card_answer.setAttribute('hidden',true);
                }

                if(game_vote_challenge_answers_container.childElementCount == 0){
                    for (let index = 0; index < game_data.team_data.challenges.length; index++) {
                        let challenge_container = document.createElement('div');
                        challenge_container.className = "challenge-container"
                        // challenge_container.dataset.id = index;
                        challenge_container.innerHTML = (
                        `<div class="challenge-card flipped">
                            <div class="card-face front">
                                <h2>Questions pour des <br>pigeons</h2>
                            </div>
                            <div class="card-face back">
                                <!-- <p class="card-question"></p> -->
                                <p class="card-answer">${game_data.team_data.challenges[index]}</p>
                                <div class="players"></div>
                            </div>
                        </div>`
                        );
                        challenge_container.addEventListener('click',()=>{
                            socket.emit('game_data',userToken,room_code,index);
                        });
                        game_vote_challenge_answers_container.appendChild(challenge_container);             
                    }
                }
                
            }else{
                switch_game_view(game_wait_view);
            }
            if(!countdownInterval){
                show_countdown(game_data.next_step_time_start,game_data.next_step_time);
            }
            break;
        case 'challenge':
            game_questions_challenge_card.classList.remove("flipped");
            switch_game_view(game_challenges_view);
            show_countdown(game_data.next_step_time_start,game_data.next_step_time);
            break;
        default:
            break;
    }
    console.log(game_data);
}

// document.addEventListener("visibilitychange", (event) => {
//     if (document.visibilityState == "visible") {
//       console.log("tab is active")
//     } else {
//       console.log("tab is inactive")
//     }
//   });