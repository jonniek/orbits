const G = 6.67428e-11;
const AU = (149.6e6 * 1000)
const SCALE = 250 / AU
const timestep = 24*3600/5

var sling = null;
var rect;
class Scene {
  constructor(size = {width: 900, height: 600}, options = {zIndex: 1}) {
    this.objects = [];
    this.tickInterval = undefined;
    this.width = size.width;
    this.height = size.height;

    let canvas = document.getElementById('canvas');
    canvas.width = $(window).width() ;
    canvas.height = $(window).height();
    this.canvas = canvas;
    document.body.appendChild(canvas);
    this.context = canvas.getContext('2d');
    rect = canvas.getBoundingClientRect();
  }

  addObject(object) {
    this.objects.push(object);
  }

  removeObject(object) {
  	this.objects.forEach((o, i) => {
  		if(object==o){
  			this.object.splice(i,1);
  			return;
  		}
  	})
  }

  // returns force exerted on this body by the other body
  attraction(self, other) {
  	if (self===other) return false;

  	// compute distance between bodies
  	const sx = self.options.px;
  	const sy = self.options.py;
  	const ox = other.options.px;
  	const oy = other.options.py;
  	const dx = ox-sx;
  	const dy = oy-sy;
  	const d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

  	if (d==0) return [0, 0];

  	// compute force
  	const F = G * self.options.mass * other.options.mass / Math.pow(d, 2);

  	// compute direction
  	const o = Math.atan2(dy, dx);
  	const Fx = Math.cos(o) * F;
  	const Fy = Math.sin(o) * F;

  	//console.log(sx, sy, ox, oy, dx, dy, d, F, o, Fx, Fy);
  	return [Fx, Fy]
  }

  render() {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);

    const changes = [];
    this.objects.forEach( o => {
    	let total = [0,0];
    	this.objects.forEach(o2 =>{
    		if (o!==o2) {
	    		let tmp = this.attraction(o, o2);
	    		total[0] += tmp[0];
	    		total[1] += tmp[1];
    		}
    	});
    	changes.push(total);
    });
  	changes.forEach((change, index) => {
  		this.objects[index].updateV(change[0], change[1]);
  	});
    this.objects.forEach( o => {
      o.draw(this.context);
    });
    if(sling!=null) sling.draw(this.context);
  }

  sling(){
		window.addEventListener('mousedown', (e) => {
      sling = new Slingshot({
      	px: e.pageX - rect.left,
      	py: e.pageY - rect.top,
      });
      sling.followToMouse();
    });

		window.addEventListener('mouseup', (e) => {
			if (sling.options.px!=e.pageX-rect.left) {
      	sling.shoot();
      }
      sling.unfollow();
      sling=null
    });

		document.body.onkeyup = function(e){
	    if(e.keyCode == 32){
		  	let body = new Body({
				  name: "White hole",
				  mass: 1.989e30,
				  vx: 20000,
				  vy: 0,
				  px: 0,
				  py: -1*AU,
		  		radius: 11,
		  		linewidth: 1,
		  		strokestyle: '#fff'
				});
				scene.addObject(body);
		  	let body2 = new Body({
				  name: "White hole",
				  mass: 1.989e30,
				  vx: -20000,
				  vy: 0,
				  px: 0,
				  py: 1*AU,
		  		radius: 11,
		  		linewidth: 1,
		  		strokestyle: '#fff'
				});
				scene.addObject(body2);
	    }
	  }
  }
}

class Body {
  constructor(options) {
    this.options = options;
  }

  updateV(x, y){
  	this.options.vx += x / this.options.mass * timestep;
  	this.options.vy += y / this.options.mass * timestep;
  	this.updateP();
  }

  updateP(){
  	this.options.px += this.options.vx * timestep;
  	this.options.py += this.options.vy * timestep;
  }

  draw(context) {
    if (context == null) return false;

    context.lineWidth = this.options.linewidth;
    context.fillStyle = this.options.strokestyle;

    context.beginPath();
    context.arc(
      this.options.px*SCALE + scene.canvas.width/2,
      this.options.py*SCALE + scene.canvas.height/2,
      this.options.radius,
      0,
      2*Math.PI,
      false
    );
    context.fill();
  }
}

class Slingshot {
  constructor(options) {
    this.options = options;
  }

  unfollow(){
  	window.removeEventListener('mousemove', (e) => {
      this.options.px2 = e.pageX - rect.left;
      this.options.py2 = e.pageY - rect.top;
    });
  }

  followToMouse() {
    window.addEventListener('mousemove', (e) => {
      this.options.px2 = e.pageX - rect.left;
      this.options.py2 = e.pageY - rect.top;
    });
  }

  shoot(){
  	let size = Math.random()*6 + 1;
  	let body = new Body({
		  name: "Black hole",
		  mass: Math.pow(size,25),
		  vx: (this.options.px - this.options.px2) * 500,
		  vy: (this.options.py - this.options.py2) * 500,
		  px: (this.options.px-scene.canvas.width/2) /SCALE,
		  py: (this.options.py-scene.canvas.height/2) /SCALE,
  		radius: Math.ceil(size),
  		linewidth: 1,
  		strokestyle: '#'+(Math.floor(Math.random() * 156) + 100).toString(16)+
  			(Math.floor(Math.random() * 156) + 100).toString(16)+
  				(Math.floor(Math.random() * 156) + 100).toString(16)
		});
		scene.addObject(body);
  }

  draw(context) {
  	console.log(context);
    this.context = context;
    if (this.context == null) return false;

    this.context.beginPath();
		this.context.moveTo(this.options.px, this.options.py);
		context.lineTo(this.options.px2 , this.options.py2);
    this.context.strokeStyle = '#FF4136';
		context.stroke();
  }
}

let sun = new Body({
  name: "Sun",
  mass: 1.989e30,
  vx: 0,
  vy: 0,
  px: 0,
  py: 0,
  radius: 5,
  linewidth: 3,
  strokestyle: 'yellow'
});


let earth = new Body({
  name: "Earth",
  mass: 5.972e24,
  vx: 0,
  vy: 29783,
  px: -1*AU,
  py: 0,
  radius: 2,
  linewidth: 1,
  strokestyle: 'lightblue'
});


let mercury = new Body({
  name: "Mercury",
  mass: 0.330e24,
  vx: 47400,
  vy: 0,
  px: 0,
  py: 57.9e6*1000,
  radius: 2,
  linewidth: 1,
  strokestyle: '#956e46'
});

let venus = new Body({
  name: "Venus",
  mass: 4.87e24,
  vx: 0,
  vy: -35000,
  px: 108.2e6*1000,
  py: 0,
  radius: 2,
  linewidth: 1,
  strokestyle: '#BBBF67'
});

let scene = new Scene();
scene.addObject(sun);
scene.addObject(earth);
scene.addObject(mercury);
scene.addObject(venus);
scene.render();
scene.sling();


$(window).bind("resize", function(){
	scene.canvas.width = $(window).width();
	scene.canvas.height = $(window).height();
});


const fps = 45;
function draw() {
	setTimeout(function() {
		requestAnimationFrame(draw);

		scene.render()
	}, 1000 / fps);
}
draw();