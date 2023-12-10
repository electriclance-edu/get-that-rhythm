var FRAME = 0;
var LAST_FRAME_TIME;
var FRAME_TIME;
var mousePos;
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
var inputResources = {
    1:"red",
    2:"blue",
    3:"red",
    4:"blue"
}
var resourceCounts = {
    "red":0,
    "blue":0
}
const colors = {
    "red":"rgb(255, 44, 108)",
    "blue":"rgb(44, 171, 255)"
}

function performFrame() {
    FRAME++;
    LAST_FRAME_TIME = FRAME_TIME;
    FRAME_TIME = Date.now();
    PhysicsBodyManager.timestep();
    requestAnimationFrame(performFrame);
}

class Vector {
    mag;
    deg;

    constructor(mag = 0, deg = 0) {
        this.mag = mag;
        this.deg = deg;
    }
    get rad() {
        return degToRad(this.deg);
    }
    toPoint() {
        return new Point(
            (this.mag * Math.cos(-this.rad)).toFixed(4) * 1.00,
            -(this.mag * Math.sin(-this.rad)).toFixed(4) * 1.00
        );
    }
    static add(v1,v2) {
        let v1_planar = v1.toPoint();
        let v2_planar = v2.toPoint();

        return new Point(
            v1_planar.x + v2_planar.x,
            v1_planar.y + v2_planar.y
        ).toVector();
    }
}
class Point {
    x;
    y;
    
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    toVector() {
        return new Vector(
            (Math.sqrt(this.x * this.x + this.y * this.y)).toFixed(4) * 1.00,
            ((360 - radToDeg(Math.atan(this.y / this.x)))).toFixed(4) * 1.00
        );
    }
    angleTowards(target) {
        let rad = Math.atan2(target.x - this.x,-(target.y - this.y));
        let deg = radToDeg(rad);
        deg -= 90;
        if (deg < 0) deg = 360 + deg;
        console.log(deg);
        return deg;
    }
}
class PhysicsBody {
    pos; // Position: in pixels
    vel; // Vector: magnitude (pixels per second), direction (angle rel. +x, deg)
    rad; // Radius: in pixels
    type; // Color: "red" or "blue"

    constructor(options) {
        this.pos = options.pos || new Point(0,0);
        this.vel = options.vel || new Vector(0,0);
        this.rad = options.rad || 30; //randInt(100);
        this.type = options.type || "red";
    }
    applyForce(vec) {
        this.vel = Vector.add(this.vel,vec);
    }
}
class PhysicsBodyManager {
    static globalMomentumPercentageLoss = 0.99;
    static globalMomentumAbsoluteLoss = 3;
    static bodies = [];
    static canvas = {
        elem:undefined,
        ctx:undefined,
        center:undefined
    }

    static init() {
        PhysicsBodyManager.canvas.elem = document.getElementById("PhysicsBodyCanvas");
        PhysicsBodyManager.canvas.ctx = PhysicsBodyManager.canvas.elem.getContext("2d");
        PhysicsBodyManager.canvas.elem.width = window.innerWidth;
        PhysicsBodyManager.canvas.elem.height = window.innerHeight;
        PhysicsBodyManager.canvas.center = new Point(PhysicsBodyManager.canvas.elem.width/2,PhysicsBodyManager.canvas.elem.height/2);


        this.addPhysicsBody(new PhysicsBody({
            pos:new Point(300,300)
        }))
    }
    static addPhysicsBody(physicsBody) {
        PhysicsBodyManager.bodies.push(physicsBody);
    }
    static timestep() {
        // CLEAR CANVAS
        PhysicsBodyManager.canvas.ctx.clearRect(
            0, 0, 
            PhysicsBodyManager.canvas.elem.width, 
            PhysicsBodyManager.canvas.elem.height
        );

        let timeFactor = 1 / (1000 / getFrameLength());
        // UPDATE/RENDER OBJECTS
        PhysicsBodyManager.bodies.forEach((body)=>{
            // UPDATE DATA
            // --------- update position based on vel
            console.log(body.vel.toPoint());
            body.pos.x += body.vel.toPoint().x * timeFactor;
            body.pos.y += body.vel.toPoint().y * timeFactor;
            // --------- update vel
            // mousedown (magnitude, direction)
            if (true) {
                body.applyForce(new Vector(20,body.pos.angleTowards(new Point(mousePos.x,mousePos.y))));
                // console.log(body.vel);
            }
            // friction (magnitude)
            // body.vel.mag = Math.max(0,body.vel.mag - this.globalMomentumAbsoluteLoss);
            body.vel.mag *= this.globalMomentumPercentageLoss;

            
            // screen edge (magnitude, direction)
            // collisions

            // DRAW OBJECT
            PhysicsBodyManager.canvas.ctx.beginPath();
            PhysicsBodyManager.canvas.ctx.arc(body.pos.x, body.pos.y, body.rad, 0, 2 * Math.PI);
            PhysicsBodyManager.canvas.ctx.fillStyle = body.type;
            PhysicsBodyManager.canvas.ctx.fill();
        });  
    }
}

document.addEventListener("mousemove",(e)=>{
    mousePos = new Point(e.clientX,e.clientY);
})

function onload() {
    FRAME_TIME = Date.now();
    mousePos = new Point(0,0);

    PhysicsBodyManager.init();

    for (var i = 1; i <= 4; i++) {
        inputTocks[i] = new Audio();
        var src = document.createElement("source");
        src.type = "audio/mpeg";
        src.src  = "tock.mp3";
        inputTocks[i].appendChild(src);
    }

    Object.keys(resourceCounts).forEach((resource)=>{
       incrementResource(resource,0); 
    });


    requestAnimationFrame(performFrame);
}

function recentUnlikePress() {
    let recents = [];
    
    Object.entries(lastPressedFrame).forEach(([input,inputFrame])=>{
        if (FRAME - inputFrame < inputPersistence) recents.push(input);
    });

    return recents;
}
function doInput(input) {
    // Pop the input dot
    animateInputDot(input);

    // Play audio
    audioInputDot(input);

    // Update resource
    incrementResource(inputResources[input]);
}
function audioInputDot() {
    inputTocks[input].pause();
    inputTocks[input].currentTime = 0
    inputTocks[input].play();
}
function animateInputDot(input) {
    let elem = document.getElementById("rhythm" + input);

    elem.classList.remove("state-pre");
    elem.classList.remove("state-clicked");

    elem.classList.add("state-pre");
    setTimeout(()=>{
        elem.classList.add("state-clicked");
        setTimeout(()=>{
            elem.classList.remove("state-pre");
            elem.classList.remove("state-clicked");
        },200)
    },16)
}

function incrementResource(resource,amt = 1) {
    resourceCounts[resource] += amt;
    document.getElementById(`resourceCount-${resource}`).innerHTML = resourceCounts[resource];
}
document.addEventListener("keydown",(e)=>{
    input = null;
    if (e.code == "KeyA" || e.code == "ArrowLeft") input = 1;
    if (e.code == "KeyS" || e.code == "ArrowDown") input = 2;
    if (e.code == "Period" || e.code == "KeyW" || e.code == "ArrowUp") input = 3;
    if (e.code == "Slash" || e.code == "KeyD" || e.code == "ArrowRight") input = 4;

    if (input) {
        doInput(input);
    }
});

function randInt(max) {
    return Math.floor(Math.random() * max);
}
function radToDeg(rad) {
    return rad * 180 / 3.1415;
}
function degToRad(deg) {
    return deg * 3.1415 / 180;
}
function getFrameLength() {
    return FRAME_TIME - LAST_FRAME_TIME;
}