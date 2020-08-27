window.addEventListener("resize", resize);
var gui;
function Params(){
  this.maxSpeed = 1.5;
  this.maxAttaches = 5;
  this.attachRadius = 74;
  this.numParticles = 300;
  this.pointRadius = 0;
  this.hueBase = 200;
  this.hueVariance = 60;
  this.lineFade = .5;
  this.backgroundFade = .7;
  this.lineWidth = 1;
  this.useMouse = false;
  this.mouseRadius = 200;
  this.mouseSpeedModifier = 4;
}
var attachParticleRatio = (50)/500;
var lastParticleAmount = 500;

var paramSet = new Params();
var particles = [];
var maxParticles = 1000;
var width = 0;
var height = 0;
function Particle(x, y, xSpeed, ySpeed){
  this.x = x;
  this.y = y;
  this.xSpeed = xSpeed;
  this.ySpeed = ySpeed;
  this.mouseModX = 0;
  this.mouseModY = 0;
  this.step = function(){
    this.mouseModX = 0;
    this.mouseModY = 0;
    if (mouseIsPressed && paramSet.useMouse){
      var xDiff = this.x - mouseX;
      var yDiff = this.y - mouseY;
      var distance = Math.sqrt(xDiff*xDiff + yDiff*yDiff);
      if (distance < paramSet.mouseRadius){
        this.mouseModX = (xDiff/distance)*paramSet.mouseSpeedModifier;
        this.mouseModY = (yDiff/distance)*paramSet.mouseSpeedModifier;
      }
    }
    
    this.x += this.xSpeed*paramSet.maxSpeed + this.mouseModX;
    this.y += this.ySpeed*paramSet.maxSpeed + this.mouseModY;
    if (this.x < 0) this.x = 0;
    if (this.x > width) this.x = width;
    if (this.y < 0) this.y = 0;
    if (this.y > height) this.y = height;
    if (this.x <= 0 && this.xSpeed < 0) this.xSpeed *= -1;
    if (this.x >= width && this.xSpeed > 0) this.xSpeed *= -1;
    if (this.y <= 0 && this.ySpeed < 0) this.ySpeed *= -1;
    if (this.y >= height && this.ySpeed > 0) this.ySpeed *= -1;
  }
}

function createParticle(){
  var x = Math.random()*window.innerWidth;
  var y = Math.random()*window.innerHeight;
  var xSpeed = Math.random()*2 - 1;
  var ySpeed = Math.random()*2 - 1;
  // console.log(x + ", " + y + ", " + xSpeed + ", " + ySpeed);
  return (new Particle(x, y, xSpeed, ySpeed));
}

for (var i = 0; i < maxParticles; i++){
  particles.push(createParticle());
}

function setup() 
{
  createCanvas(window.innerWidth, window.innerHeight);
  resize();
  background(0);
  colorMode(HSB, 360, 100, 100, 100);
  gui = new dat.GUI({
    height : 5 * 32 - 1
  });
  
  gui.remember(paramSet);
  
  var particles = gui.addFolder("particles");
  particles.add(paramSet, "numParticles", 0, 1000, 1);
  particles.add(paramSet, "maxSpeed", 0, 5);
  particles.add(paramSet, "pointRadius", 0, 5);
  particles.open();
  
  var connections = gui.addFolder("connecitons");
  connections.add(paramSet, "attachRadius", 0, 200, 1).listen();
  connections.add(paramSet, "maxAttaches", 1, 10, 1);
  connections.open();
  
  var visuals = gui.addFolder("visuals");
  visuals.add(paramSet, "hueBase", 0, 360);
  visuals.add(paramSet, "hueVariance", 0, 360);
  visuals.add(paramSet, "lineWidth", 1, 30);
  visuals.add(paramSet, "lineFade", 0, 1, .01);
  visuals.add(paramSet, "backgroundFade", 0, 1, .01);
  
  var mouse = gui.addFolder("mouse");
  mouse.add(paramSet, "useMouse");
  mouse.add(paramSet, "mouseRadius", 0, 500);
  mouse.add(paramSet, "mouseSpeedModifier", -10, 10);
}
     
function draw() 
{
  var bgAlpha = 1 - paramSet.backgroundFade;
  background(1, 1, 1,bgAlpha*bgAlpha*100);
  noStroke();
  for (var i = 0; i < paramSet.numParticles; i++){
    var p = particles[i];
    fill(0, 100, 100);
    ellipse(p.x, p.y, paramSet.pointRadius, paramSet.pointRadius);
    p.step();
  }
  for (var i = 0; i < paramSet.numParticles; i++){
    var p = particles[i];
    drawClosest(p);
  }
}

function drawClosest(p){
  strokeWeight(paramSet.lineWidth);
  var attaches = 0;
  var attachRadius = paramSet.attachRadius;
  for(var i = 0; i < paramSet.numParticles; i++){
    var p2 = particles[i];
    var xDiff = p2.x-p.x;
    var yDiff = p2.y-p.y;
    var distance = xDiff*xDiff+yDiff*yDiff;
    if (distance < attachRadius*attachRadius){
      setStrokeColor(distance);
      line(p.x, p.y, p2.x, p2.y);
      attaches++;
    }
    if (attaches >= paramSet.maxAttaches) i = paramSet.numParticles;
  }
}

function setStrokeColor(distance){
  var attachRadius = paramSet.attachRadius;
  var value = distance/(attachRadius*attachRadius);
  var hue = value*paramSet.hueVariance;
  hue -= paramSet.hueVariance/2;
  hue += paramSet.hueBase;
  if (hue > 360) hue -= 360;
  if (hue < 0) hue += 360;
  var alpha = 100 - value*value*(paramSet.lineFade*paramSet.lineFade)*100;
  stroke(hue, 80, 100, alpha);
}

function resize(){
  resizeCanvas(window.innerWidth, window.innerHeight);
  width = window.innerWidth;
  height = window.innerHeight;
  background(1, 1, 1, 100);
}