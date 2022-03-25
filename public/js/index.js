//initialization


//DOM Elements

const playForm = document.querySelector('.room-form form');
const playButton = document.getElementById('play');
const profilePictureInput = document.getElementById('picture-upload');
const profilePicture = document.querySelector('.upload');
const nicknameInput = document.getElementById('nickname');


//Events

playButton.addEventListener('click', startGame);
profilePictureInput.addEventListener('change',upload);
profilePicture.addEventListener('click', () => {
    profilePictureInput.click();
});

//Play form event

function startGame(){
    if (playForm.checkValidity()){
        postJson('/api/start',{creatorToken : userToken},(res)=>{
            if (res.errorCode) return;
            playerProfile.nickname = nicknameInput.value;
            savePlayerProfile();
            location.href = `/${res.partyCode}`;
        });
    }
}

function upload(){
    if (this.files.length != 0){
        const imageUrl = URL.createObjectURL(this.files[0]);
        setupUserPictureFromUrl(imageUrl);
    }
}

//Set Profile Image

function setupUserPictureFromUrl(url) {
    compress_image(url,(picture)=>{
      playerProfile.picture = picture;
      savePlayerProfile();
      profilePicture.style.backgroundImage = `url(data:image/jpeg;base64,${picture})`;
    })
}

//Load profile picture if existing

if (playerProfile.picture != null) {
    // profilePicture.style.backgroundImage = `url(data:image/jpeg;base64,${settings.picture})`;
    profilePicture.style.backgroundImage = `url(data:image/jpeg;base64,${playerProfile.picture})`;
}
nicknameInput.value = playerProfile.nickname;
 
