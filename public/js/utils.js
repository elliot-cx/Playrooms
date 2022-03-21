//JSON Post and Get

const headers = { "Content-Type": "application/json" };

function postJson(url, body, callback) {
  fetch(url, { method: "POST", headers, body: JSON.stringify(body) })
    .then((res) => {
      if (!res.ok) throw new Error(`httpStatusCode:${res.status}`);
      res.json().then((json) => callback(json));
    })
    .catch((error) => { callback({ errorCode: error.message }); });
}

function getJson(url, callback) {
  fetch(url, { method: "GET", headers })
    .then((res) => {
      if (!res.ok) throw new Error(`httpStatusCode:${res.status}`);
      if (res.status === 204) return callback(null);
      res.json().then((json) => callback(json));
    })
    .catch((error) => { callback({ errorCode: error.message }); });
}

//Random functions

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function randomString(len, charSet) {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}