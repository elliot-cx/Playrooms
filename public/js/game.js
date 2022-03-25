// Global Dom

const error_page = document.querySelector('.error.page');
const lobby_page = document.querySelector('.lobby.page');
const loading_page = document.querySelector('.loading.page');
const profile_page = document.querySelector('.profile.page');

//Profile Page 

var socket = null;

function show_page(page,back=true) {
    error_page.setAttribute('hidden',null);
    lobby_page.setAttribute('hidden',null);
    loading_page.setAttribute('hidden',null);
    profile_page.setAttribute('hidden',null);
    if (back == false){background_page.setAttribute('hidden',null);}
    page.removeAttribute('hidden');
}

if (playerProfile.nickname != null) {
    show_page(lobby_page);
    // error_page.removeAttribute('hidden');

}

function disconnect(reason) {
    if (socket != null) {
        socket.off('disconnect');
        socket.close();
    }
    switch (reason) {
        case value:
            
            break;
    
        default:
            break;
    }

}