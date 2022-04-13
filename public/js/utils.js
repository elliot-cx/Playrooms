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
    randomString += charSet.substring(randomPoz, randomPoz + 1);
  }
  return randomString;
}

//image compress

function compress_image(url, callback) {
  console.log('Compressing Image... ⌛');
  const image = new Image();
  image.src = url;
  image.crossOrigin = "anonymous";
  image.onload = () => {
    const maxSize = 128;

    const canvas = document.createElement("canvas");
    canvas.width = maxSize;
    canvas.height = maxSize;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let width = maxSize;
    let height = maxSize;

    if (image.width > image.height) width = Math.round(maxSize * image.width / image.height);
    else if (image.height > image.width) height = Math.round(maxSize * image.height / image.width);

    ctx.drawImage(image, 0, 0, image.width, image.height, (maxSize - width) / 2, (maxSize - height) / 2, width, height);

    let picture;

    for (let i = 0; i < 5; i++) {
      const quality = 1 - i / 10;
      picture = canvas.toDataURL("image/jpeg", quality).substring("data:image/jpeg;base64,".length);
      if (picture.length <= 10000) {
        // console.log(`Picture was compressed at quality level ${quality}.`);
        break;
      }
    }

    // callback(`Picture is too big even after maximum compression: ${picture.length} bytes.`);
    canvas.remove();
    URL.revokeObjectURL(url);
    if (picture.length < 10000) {
      console.log('Image Compressed Successfuly ! ✅');
      callback(picture);
    }
    return;
  }

  image.onerror = () => {
    console.log("Image Compression Failed ! ❌");
    URL.revokeObjectURL(url);
    return;
  }
}

// detect user change tab