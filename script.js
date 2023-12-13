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
    "red":"rgba(255, 44, 108,0.5)",
    "blue":"rgba(44, 171, 255,0.5)",
    "ora":"rgba(255, 241, 44,0.5)",
    "gre":"rgba(44, 255, 114,0.5)",
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
        let added = new Point(
            v1_planar.x + v2_planar.x,
            v1_planar.y + v2_planar.y
        );
        return added.toVector();
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
            ((radToDeg(Math.atan2(this.y, this.x)))).toFixed(4) * 1.00
        );
    }
    angleTowards(target) {
        let rad = Math.atan2(target.x - this.x,-(target.y - this.y));
        let deg = radToDeg(rad);
        deg -= 90;
        if (deg < 0) deg = 360 + deg;
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
        this.innateNumber = randInt(1000);
    }
    applyForce(vec) {
        this.vel = Vector.add(this.vel,vec);
    }
}
class PhysicsBodyManager {
    static globalMomentumPercentageLoss = 0.94;
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
            body.pos.x += body.vel.toPoint().x * timeFactor;
            body.pos.y += body.vel.toPoint().y * timeFactor;
            // --------- update vel
            // mousedown (magnitude, direction)
            if (true) {
                // body.vel = new Vector(20,body.pos.angleTowards(new Point(mousePos.x,mousePos.y)));
                let angle = body.pos.angleTowards(new Point(mousePos.x,mousePos.y));
                let force = new Vector(10 + randInt(body.innateNumber % 90),angle + (randInt(50) * (body.innateNumber % 2 ? -1 : 1)));
                body.applyForce(force);

                
                // DRAW TOWARDS CURSOR VECTOR
                // PhysicsBodyManager.canvas.ctx.beginPath();
                // PhysicsBodyManager.canvas.ctx.lineWidth = 5;
                // PhysicsBodyManager.canvas.ctx.strokeStyle = "rgb(255,150,150)";
                // PhysicsBodyManager.canvas.ctx.moveTo(body.pos.x,body.pos.y);
                // let forcePoint = force.toPoint();
                // PhysicsBodyManager.canvas.ctx.lineTo(body.pos.x + forcePoint.x*50,body.pos.y + forcePoint.y*50);
                // PhysicsBodyManager.canvas.ctx.stroke();
            }
            // friction (magnitude)
            // body.vel.mag = Math.max(0,body.vel.mag - this.globalMomentumAbsoluteLoss);
            body.vel.mag *= this.globalMomentumPercentageLoss + (body.rad / 1000);

            
            // screen edge (magnitude, direction)
            // collisions

            // DRAW OBJECT
            // PhysicsBodyManager.canvas.ctx.shadowBlur = 100;
            // PhysicsBodyManager.canvas.ctx.shadowColor = colors[body.type];
            PhysicsBodyManager.canvas.ctx.beginPath();
            PhysicsBodyManager.canvas.ctx.arc(body.pos.x, body.pos.y, body.rad * (cycleNumber(FRAME,60)/120 + 0.5), 0, 2 * Math.PI);
            PhysicsBodyManager.canvas.ctx.fillStyle = colors[body.type];
            PhysicsBodyManager.canvas.ctx.fill();

            // DRAW INNATE MOVEMENT VECTOR
            // PhysicsBodyManager.canvas.ctx.beginPath();
            // PhysicsBodyManager.canvas.ctx.lineWidth = 5;
            // PhysicsBodyManager.canvas.ctx.strokeStyle = "black";
            // PhysicsBodyManager.canvas.ctx.moveTo(body.pos.x,body.pos.y);
            // let vPoint = body.vel.toPoint();
            // PhysicsBodyManager.canvas.ctx.lineTo(body.pos.x + vPoint.x,body.pos.y + vPoint.y);
            // PhysicsBodyManager.canvas.ctx.stroke();
        });  
    }
}

document.addEventListener("mousemove",(e)=>{
    mousePos = new Point(e.clientX,e.clientY);
})

function onload() {
    FRAME_TIME = Date.now();
    mousePos = new Point(window.innerWidth / 2,window.innerHeight / 2);

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

    PhysicsBodyManager.addPhysicsBody(new PhysicsBody({
        pos:new Point(window.innerWidth/2 + (window.innerWidth/100 * ((input - 2)*12)),window.innerHeight/2),
        vel:new Vector(randInt(3000) + 2000,randInt(360)),
        type:["red","blue","ora","gre"][input - 1],
        rad:15 + randInt(30)
    }))

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

function cycleNumber(index, cycleSize = 8) {
    index += 8;
    let raw = (index % (cycleSize*2)) - cycleSize;
    raw = raw < 0 ? raw : raw + 1;
    raw = Math.abs(raw);
    return raw;
}