// Background animation

const background_page = document.querySelector('.base > .background');

var background_animations = [];

for (let index = 0; index < 20; index++) {
    let div = document.createElement('div');
    div.style.left = randomIntFromInterval(10,90) + '%';
    let hw = randomIntFromInterval(40,70);
    div.style.height = hw + "px";
    div.style.width = hw + "px";
    div.style.top = "110%";
    background_page.appendChild(div);
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