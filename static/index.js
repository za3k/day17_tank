"use strict";

function randInt(low, high) {
    const d = high - low;
    return low + Math.floor(Math.random() * (d+1));
}
function randFloat(low, high) {
    return randInt(Math.floor(low*1000), Math.floor(high*1000)) / 1000.0
}
function range(low, high) {
    let r=[];
    for (let i=low; i<high; i++) r.push(i);
    return r;
}
function clamp(low, high, val) {
    if (val < low) val = low;
    if (val > high) val = high;
    return val;
}

class GameObject {
    render() {
        return this.e
            .css("left", `${this.left + g.r.left}px`)
            .css("top", `${this.top + g.r.top}px`);
    }
    tick(interval) {
    }
}

class MousePos extends GameObject {
    constructor(p) {
        super();
        $(document).on("mousemove", (ev) => {
            g.r = $(".tank")[0].getBoundingClientRect();
            this.x = ev.clientX - g.r.left;
            this.y = ev.clientY - g.r.top;
        });
        this.render();
        this.x = g.r.left + g.r.width / 2.0;
        this.y = g.r.top + g.r.height / 2.0;
    }
    render() {
        g.r = $(".tank")[0].getBoundingClientRect();
    }
}

class Bubble extends GameObject {
    elapsed = 0
    constructor(p) {
        super();
        this.size = randInt(10, 50);
        this.baseLeft = randFloat(0, g.r.width);
        this.top = randFloat(0, g.r.height);
        this.hwobble = randFloat(0.01, 0.10)*g.r.width;
        this.period = randInt(1, 10);
        this.offset = randInt(1, 6000);
        this.vspeed = randFloat(0.01, 0.15)*g.r.height;

        this.e = $('<div class="bubble"></div>');
        this.render()
            .css("width", `${this.size}px`)
            .css("height", `${this.size}px`);
    }
    tick(interval) {
        this.top -= interval * this.vspeed;
        if (this.top < 0) {
            this.top += g.r.height;
            this.baseLeft = randFloat(0, g.r.width);
        }
        this.elapsed += interval;
        this.left = this.baseLeft + Math.sin(this.elapsed / this.period + this.offset) * this.hwobble;
    }
}
class Fish extends GameObject {
    damping = 0.5
    constructor(p) {
        super();
        this.size = p;
        this.left = randFloat(0, g.r.width);
        this.top = randFloat(0, g.r.height);
        this.desiredXOffset = randFloat(0, g.r.width/10)
        this.desiredYOffset = randFloat(0, g.r.height/10)
        this.topSpeed = randFloat(50, 200);
        this.xSpeed = randFloat(1, 10);
        this.ySpeed = randFloat(0.1, 2);
        this.xVel = 0;
        this.yVel = 0;
        this.rotation = 0;
        this.flip = false;

        this.e = $('<img class="fish" src="static/image/fish1.png"></img>')
        this.render()
            .css("width", `${this.size}px`)
            //.css("z-index", 100-this.size)
            .css("z-index", randInt(0, 100))
            .css("height", `${this.size}px`);
    }
    tick(interval) {
        // Accelerate toward the mouse
        const targetX = g.mousePos.x + this.desiredXOffset;
        const targetY = g.mousePos.y + this.desiredYOffset;
        this.xVel += (this.xSpeed * (targetX - this.left) - this.damping * this.xVel) * interval;
        this.yVel += (this.ySpeed * (targetY - this.top)  - this.damping * this.yVel) * interval;
        this.xVel = clamp(-this.topSpeed, this.topSpeed, this.xVel)
        this.yVel = clamp(-this.topSpeed, this.topSpeed, this.yVel)
        this.left += this.xVel * interval;
        this.top += this.yVel * interval;

        // Visually flip left and right to show movement
        this.flip = this.xVel < 0;

        // Tilt up and down to show movement
        if (this.flip) this.angle = Math.atan((targetY - this.top) / Math.abs(this.left - targetX))
        else this.angle = Math.atan((targetY - this.top) / Math.abs(this.left - targetX))

        // Wiggle around a little instead of clustering on the mouse
        this.maxYOffset = g.r.height/10;
        this.maxXOffset = g.r.width/10;
        this.desiredXOffset += randFloat((this.desiredXOffset < -this.maxXOffset ? 0:-10), (this.desiredXOffset > this.maxXOffset ? 0:10));
        this.desiredYOffset += randFloat((this.desiredYOffset < -this.maxYOffset ? 0:-10), (this.desiredYOffset > this.maxYOffset ? 0:10));

        // Bounce of the edges
        if (this.top < 0) this.yVel = Math.abs(this.yVel);
        if (this.top > g.r.height) this.yVel = -Math.abs(this.yVel);
        this.top = clamp(0, g.r.height, this.top);
        if (this.left < 0) this.xVel = Math.abs(this.xVel);
        if (this.left > g.r.width) this.xVel = -Math.abs(this.xVel);
        this.left = clamp(0, g.r.width, this.left);
    }
    render() {
        return this.e
            .css("left", `${this.left - this.e[0].width/2.0}px`)
            .css("top", `${this.top - this.e[0].height/2.0 + 50}px`)
            .css("transform", `scalex(${1-this.flip*2}) rotate(${this.angle}rad)`)
        ;
    }
}

let g = {};
$(document).ready(() => {
    let objects = [];
    const tank = $(".tank");

    function addObject(init, cls) {
        const object = new cls(init);
        objects.push(object);
        tank.append(object.e);
        return object;
    }
    function addObjects(inits, cls) {
        return inits.map(x => { return addObject(x, cls); });
    }
    function rel(x, y) {
        return 
    }

    g.mousePos = addObject(null, MousePos);
    // Add some bubbles
    const bubbles = addObjects(range(0, 50), Bubble);
    // Add some fish
    g.fishes = addObjects([10, 20, 20, 30, 50, 50, 100], Fish);

    const interval = 10;
    function tick() {
        // Find mouse position}
        objects.forEach(o => {
            o.tick(interval / 1000.0); 
            o.render(); 
        })
    }
    setInterval(tick, interval);
});
