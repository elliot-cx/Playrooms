// Background animation

let background_bubbles = document.querySelector('.base > .background')

var background_animations = [];

for (let index = 0; index < 20; index++) {
    let div = document.createElement('div');
    div.style.left = randomIntFromInterval(10,90) + '%';
    let hw = randomIntFromInterval(40,70);
    div.style.height = hw + "px";
    div.style.width = hw + "px";
    div.style.top = "110%";
    background_bubbles.appendChild(div);
    let animation = anime({
        targets:div,
        easing:'easeInQuad',
        top: '0%',
        opacity: 0,
        loop:true,
        delay:randomIntFromInterval(0,5000),
        autoplay:true,
        duration:randomIntFromInterval(10000,20000),
    })
    background_animations.push(animation);
}

//initialization


//DOM Elements

const playButton = document.getElementById('play');
const profilePictureInput = document.getElementById('picture-upload');
const profilePicture = document.querySelector('.upload');
const nicknameInput = document.getElementById('nickname');


//Events

playButton.addEventListener('click',play);
profilePictureInput.addEventListener('change',upload);
profilePicture.addEventListener('click', () => {
    profilePictureInput.click();
});

//Play form event

function play(){
    preventDefault();
    postJson('/api/',)
}

function upload(){
    if (this.files.length != 0){
        const imageUrl = URL.createObjectURL(this.files[0]);
        setupUserPictureFromUrl(imageUrl,() => URL.revokeObjectURL(imageUrl));
    }
}

//Set Profile Image

function setupUserPictureFromUrl(url, callback) {
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
          console.log(`Picture was compressed at quality level ${quality}.`);
          break;
        }
      }
  
      if (picture.length > 10000) return callback(`Picture is too big even after maximum compression: ${picture.length} bytes.`);
  
    //   settings.picture = picture;
    //   saveSettings();
  
      profilePicture.style.backgroundImage = `url(data:image/jpeg;base64,${picture})`;
      callback(null);
    }
  
    image.onerror = () => {
      console.log("Could not load image.");
      callback();
      return;
    };
  }

// if (settings.picture != null) {
//     setupPictureButton.style.backgroundImage = `url(data:image/jpeg;base64,${settings.picture})`;
// }