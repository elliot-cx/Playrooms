// Background animation

const background_page = document.querySelector('.base > .background');

// var background_animations = [];

if (window.innerWidth >= 1000) {
    for (let index = 0; index < 10; index++) {
        let div = document.createElement('div');
        div.style.left = randomIntFromInterval(0,95) + '%';
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
            delay:anime.random(0,5000),
            autoplay:true,
            duration:anime.random(10000,20000),
        })
        // background_animations.push(animation);
    }
}

// window.onresize = () =>{}
window.addEventListener('orientationchange',(event)=>{
    // alert(event.target.screen.orientation.angle);
})