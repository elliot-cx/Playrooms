//user settings

const userToken = getUserToken();

function getUserToken() {
    let token = localStorage.getItem('userToken');
    if ( token == null ) {
        token = randomString(20);
        localStorage.setItem('userToken',token);
    }
    return token;
}

const playerProfile = getPlayerProfile();

function getPlayerProfile() {
    profile = JSON.parse(localStorage.getItem('playerProfile'));
    if(profile == undefined){
        profile = {
            nickname : null,
            picture : null
        }
    }
    return profile;
}

function savePlayerProfile(nickname,picture) {
    localStorage.setItem('playerProfile',JSON.stringify(playerProfile));
}