//initialization


//DOM Elements

const playForm = document.querySelector('.room-form form');
const playButton = document.getElementById('play');
const profilePictureInput = document.getElementById('picture-upload');
const profilePicture = document.querySelector('.upload');
const nicknameInput = document.getElementById('nickname');


//Events

playButton.addEventListener('click', startGame);
profilePictureInput.addEventListener('change',setupUserProfilePicture);
profilePicture.addEventListener('click', () => {
    profilePictureInput.click();
});

//Play form event

function startGame(event){
    if (playForm.checkValidity()){
        event.preventDefault();
        let nick = nicknameInput.value;
        postJson('/api/start',{creatorToken : userToken,room_name:`Partie de ${nick}`},(res)=>{
            if (res.errorCode) return;
            playerProfile.nickname = nick;
            savePlayerProfile();
            window.location.replace(`/${res.partyCode}`);
        });
    }
}

//Set Profile Image

function setupUserProfilePicture() {
    if (this.files.length != 0){
        const imageUrl = URL.createObjectURL(this.files[0]);
        compress_image(imageUrl,(picture)=>{
            playerProfile.picture = picture;
            savePlayerProfile();
            profilePicture.style.backgroundImage = `url(data:image/jpeg;base64,${picture})`;
        });
    }
}

//Load profile picture if existing

if (playerProfile.picture != null) {
    // profilePicture.style.backgroundImage = `url(data:image/jpeg;base64,${settings.picture})`;
    profilePicture.style.backgroundImage = `url(data:image/jpeg;base64,${playerProfile.picture})`;
}
nicknameInput.value = playerProfile.nickname;
 
