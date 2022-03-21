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

function savePlayerProfile() {
    //
}