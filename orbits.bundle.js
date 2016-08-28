'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var G = 6.67428e-11;
var AU = 149.6e6 * 1000;
var SCALE = 250 / AU;
var timestep = 24 * 3600 / 2;

var _sling = null;
var rect;

var Scene = function () {
  function Scene() {
    var size = arguments.length <= 0 || arguments[0] === undefined ? { width: 900, height: 600 } : arguments[0];
    var options = arguments.length <= 1 || arguments[1] === undefined ? { zIndex: 1 } : arguments[1];

    _classCallCheck(this, Scene);

    this.objects = [];
    this.tickInterval = undefined;
    this.width = size.width;
    this.height = size.height;

    var canvas = document.getElementById('canvas');
    canvas.width = $(window).width();
    canvas.height = $(window).height();
    this.canvas = canvas;
    document.body.appendChild(canvas);
    this.context = canvas.getContext('2d');
    rect = canvas.getBoundingClientRect();
  }

  _createClass(Scene, [{
    key: 'addObject',
    value: function addObject(object) {
      this.objects.push(object);
    }
  }, {
    key: 'removeObject',
    value: function removeObject(object) {
      var _this = this;

      this.objects.forEach(function (o, i) {
        if (object == o) {
          _this.object.splice(i, 1);
          return;
        }
      });
    }

    // returns force exerted on this body by the other body

  }, {
    key: 'attraction',
    value: function attraction(self, other) {
      if (self === other) return false;

      // compute distance between bodies
      var sx = self.options.px;
      var sy = self.options.py;
      var ox = other.options.px;
      var oy = other.options.py;
      var dx = ox - sx;
      var dy = oy - sy;
      var d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

      if (d == 0) return [0, 0];

      // compute force
      var F = G * self.options.mass * other.options.mass / Math.pow(d, 2);

      // compute direction
      var o = Math.atan2(dy, dx);
      var Fx = Math.cos(o) * F;
      var Fy = Math.sin(o) * F;

      //console.log(sx, sy, ox, oy, dx, dy, d, F, o, Fx, Fy);
      return [Fx, Fy];
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);

      this.context.font = '15pt sans';
      this.context.fillStyle = 'white';
      this.context.textAlign = 'center';
      this.context.fillText('Click and hold to shoot planetary bodies into orbit!', this.canvas.width / 2, this.canvas.height - 100);
      this.context.fillText('Press space to create two tiny blackholes!', this.canvas.width / 2, this.canvas.height - 50);

      var changes = [];
      this.objects.forEach(function (o) {
        var total = [0, 0];
        _this2.objects.forEach(function (o2) {
          if (o !== o2) {
            var tmp = _this2.attraction(o, o2);
            total[0] += tmp[0];
            total[1] += tmp[1];
          }
        });
        changes.push(total);
      });
      changes.forEach(function (change, index) {
        _this2.objects[index].updateV(change[0], change[1]);
      });
      this.objects.forEach(function (o) {
        o.draw(_this2.context);
      });
      if (_sling != null) _sling.draw(this.context);
    }
  }, {
    key: 'sling',
    value: function sling() {
      window.addEventListener('mousedown', function (e) {
        _sling = new Slingshot({
          px: e.pageX - rect.left,
          py: e.pageY - rect.top
        });
        _sling.followToMouse();
      });

      window.addEventListener('mouseup', function (e) {
        if (_sling.options.px != e.pageX - rect.left) {
          _sling.shoot();
        }
        _sling.unfollow();
        _sling = null;
      });

      document.body.onkeyup = function (e) {
        if (e.keyCode == 32) {
          var body = new Body({
            name: "White hole",
            mass: 1.989e30,
            vx: 20000,
            vy: 0,
            px: 0,
            py: -1 * AU,
            radius: 11,
            linewidth: 1,
            strokestyle: '#fff'
          });
          scene.addObject(body);
          var body2 = new Body({
            name: "White hole",
            mass: 1.989e30,
            vx: -20000,
            vy: 0,
            px: 0,
            py: 1 * AU,
            radius: 11,
            linewidth: 1,
            strokestyle: '#fff'
          });
          scene.addObject(body2);
        }
      };
    }
  }]);

  return Scene;
}();

var Body = function () {
  function Body(options) {
    _classCallCheck(this, Body);

    this.options = options;
  }

  _createClass(Body, [{
    key: 'updateV',
    value: function updateV(x, y) {
      this.options.vx += x / this.options.mass * timestep;
      this.options.vy += y / this.options.mass * timestep;
      this.updateP();
    }
  }, {
    key: 'updateP',
    value: function updateP() {
      this.options.px += this.options.vx * timestep;
      this.options.py += this.options.vy * timestep;
    }
  }, {
    key: 'draw',
    value: function draw(context) {
      if (context == null) return false;

      context.lineWidth = this.options.linewidth;
      context.fillStyle = this.options.strokestyle;

      context.beginPath();
      context.arc(this.options.px * SCALE + scene.canvas.width / 2, this.options.py * SCALE + scene.canvas.height / 2, this.options.radius, 0, 2 * Math.PI, false);
      context.fill();
    }
  }]);

  return Body;
}();

var Slingshot = function () {
  function Slingshot(options) {
    _classCallCheck(this, Slingshot);

    this.options = options;
  }

  _createClass(Slingshot, [{
    key: 'unfollow',
    value: function unfollow() {
      var _this3 = this;

      window.removeEventListener('mousemove', function (e) {
        _this3.options.px2 = e.pageX - rect.left;
        _this3.options.py2 = e.pageY - rect.top;
      });
    }
  }, {
    key: 'followToMouse',
    value: function followToMouse() {
      var _this4 = this;

      window.addEventListener('mousemove', function (e) {
        _this4.options.px2 = e.pageX - rect.left;
        _this4.options.py2 = e.pageY - rect.top;
      });
    }
  }, {
    key: 'shoot',
    value: function shoot() {
      var size = Math.random() * 6 + 1;
      var body = new Body({
        name: "Black hole",
        mass: Math.pow(size, 25),
        vx: (this.options.px - this.options.px2) * 500,
        vy: (this.options.py - this.options.py2) * 500,
        px: (this.options.px - scene.canvas.width / 2) / SCALE,
        py: (this.options.py - scene.canvas.height / 2) / SCALE,
        radius: Math.ceil(size),
        linewidth: 1,
        strokestyle: '#' + (Math.floor(Math.random() * 156) + 100).toString(16) + (Math.floor(Math.random() * 156) + 100).toString(16) + (Math.floor(Math.random() * 156) + 100).toString(16)
      });
      scene.addObject(body);
    }
  }, {
    key: 'draw',
    value: function draw(context) {
      console.log(context);
      this.context = context;
      if (this.context == null) return false;

      this.context.beginPath();
      this.context.moveTo(this.options.px, this.options.py);
      context.lineTo(this.options.px2, this.options.py2);
      this.context.strokeStyle = '#FF4136';
      context.stroke();
    }
  }]);

  return Slingshot;
}();

var sun = new Body({
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

var earth = new Body({
  name: "Earth",
  mass: 5.972e24,
  vx: 0,
  vy: 29783,
  px: -1 * AU,
  py: 0,
  radius: 2,
  linewidth: 1,
  strokestyle: 'lightblue'
});

var mercury = new Body({
  name: "Mercury",
  mass: 0.330e24,
  vx: 47400,
  vy: 0,
  px: 0,
  py: 57.9e6 * 1000,
  radius: 2,
  linewidth: 1,
  strokestyle: '#956e46'
});

var venus = new Body({
  name: "Venus",
  mass: 4.87e24,
  vx: 0,
  vy: -35000,
  px: 108.2e6 * 1000,
  py: 0,
  radius: 2,
  linewidth: 1,
  strokestyle: '#BBBF67'
});

var scene = new Scene();
scene.addObject(sun);
scene.addObject(earth);
scene.addObject(mercury);
scene.addObject(venus);
scene.render();
scene.sling();

$(window).bind("resize", function () {
  scene.canvas.width = $(window).width();
  scene.canvas.height = $(window).height();
});

var fps = 24;
function draw() {
  setTimeout(function () {
    requestAnimationFrame(draw);

    scene.render();
  }, 1000 / fps);
}
draw();
