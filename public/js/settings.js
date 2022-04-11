//user settings

const userToken = initToken();

function initToken() {
    let token = localStorage.getItem('userToken');
    if ( token == null || token.length != 20 ) {
        token = randomString(20);
        localStorage.setItem('userToken',token);
    }
    return token;
}

// Load player profile
const playerProfile = getPlayerProfile();

function getPlayerProfile() {
    console.log('Loading player profile... ⌛');
    profile = JSON.parse(localStorage.getItem('playerProfile'));
    if(profile == undefined){
        profile = {
            nickname : null,
            picture : null
        }
        console.log('Player profile created sucessfuly ! ✅');
    }else{
        console.log('Player profile loaded sucessfuly ! ✅');
    }
    return profile;
}

function savePlayerProfile(nickname,picture) {
    localStorage.setItem('playerProfile',JSON.stringify(playerProfile));
    console.log('Player profile saved sucessfuly ! ✅');
}