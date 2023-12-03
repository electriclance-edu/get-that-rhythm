var FRAME = 0;
const inputPersistence = 5; // How many frames an input is considered as recent.
var inputTocks = {
    1:null,
    2:null,
    3:null,
    4:null
}
var lastPressedFrame = {
    1:0,
    2:0,
    3:0,
    4:0
}

setInterval(()=>{
    FRAME++;
},16)

function onload() {
    for (var i = 1; i <= 4; i++) {
        inputTocks[i] = new Audio();
        var src = document.createElement("source");
        src.type = "audio/mpeg";
        src.src  = "tock.mp3";
        inputTocks[i].appendChild(src);
    }
}

function recentUnlikePress() {
    let recents = [];
    
    Object.entries(lastPressedFrame).forEach(([input,inputFrame])=>{
        if (FRAME - inputFrame < inputPersistence) recents.push(input);
    });

    return recents;
}

document.addEventListener("keydown",(e)=>{
    input = null;
    if (e.code == "KeyA" || e.code == "ArrowLeft") input = 1;
    if (e.code == "KeyS" || e.code == "ArrowDown") input = 2;
    if (e.code == "Period" || e.code == "KeyW" || e.code == "ArrowUp") input = 3;
    if (e.code == "Slash" || e.code == "KeyD" || e.code == "ArrowRight") input = 4;

    if (input) {
        let elem = document.getElementById("rhythm" + input);
        elem.classList.remove("state-hover");
        elem.classList.remove("state-clicked");

        elem.classList.add("state-hover");
        setTimeout(()=>{
            elem.classList.add("state-clicked");
            setTimeout(()=>{
                elem.classList.remove("state-hover");
                elem.classList.remove("state-clicked");
            },200)
        },16)

        inputTocks[input].pause();
        inputTocks[input].currentTime = 0
        inputTocks[input].play();
    }
});