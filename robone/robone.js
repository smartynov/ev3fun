#!/usr/bin/nodejs

"use strict";

/*

ALGO:
1. run forward random 0.2-0.7 meters
2. turn in random direction 0-180
3. if (obstacle forward) turn random 70-180 degrees
4. if (bumped) reverse with turning in random direction
5. repeat

States/commands:
- forward
- reverse (with turning)
- turn (angle)
- forward with turn
- wait (sleep)

*/

var Robone = function (_ev3dev) {
  var self = this;
  
  self.log = function () {
    console.log.apply(null, arguments);
  };
  
  //
  // init motors & sensors
  //
  self.init = function (_ev3dev) {
    self.log('+init');

    self.ev3dev = _ev3dev;
    self.maxSpeed = 87;
    self.maxDist = 89;
    self.minDist = 19;
    self.rotation = null;

    // init motors
    self.motors = [
      new self.ev3dev.Motor('outA'),
      new self.ev3dev.Motor('outD')
    ];
    self.motors.map(function (m) {
      m.rampUpSp = 0;
      m.rampDownSp = 0;
      m.timeSp = 0;
      m.runMode = 'forever';
      m.regulationMode = 'off';
      m.dutyCycleSp = 0;
      m.run = 1;
    });
    
    // init sensors
    self.sensors = {
      dist: new self.ev3dev.Sensor('in2'),
      bump: new self.ev3dev.Sensor('in4')
    };
    
    process.on('exit', self.cleanup);
    process.on('SIGINT', self.cleanup);
    process.on('uncaughtException', self.cleanup);
    
    self.log('-init', self);
  }
  
  //
  // stop motors and exit
  //
  self.cleanup = function (err) {
    self.log('+cleanup('+err+')');
    if (err) console.log(err.stack);
    self.motors.map(function (m) {
      m.dutyCycleSp = 0;
      m.run = 0;
    });
    process.exit();
  };
  
  //
  // reschedule next cycle
  //
  self.recycle = function (from, to) {
    var time = 100;
    if (from>0) time = from;
    if (to>from) time += Math.floor(Math.random()*(to-from));
    self.log('+recycle('+from+','+to+') = '+time);
    if (self.timeout) clearTimeout(self.timeout);
    self.timeout = setTimeout(self.cycle, time);
  };
  
  //
  // run cycle - all logic here
  //
  self.cycle = function () {
    self.log('+cycle');
    
    // watch for bump
    if (self.sensors.bump.getValue(0)) {
      // reverse for 1-2 seconds
      self.log('*cycle: BUMP! reversing');
      self.rotation = Math.floor(2*Math.random());
      self.motors[0+self.rotation].dutyCycleSp = -self.maxSpeed;
      self.motors[1-self.rotation].dutyCycleSp = 0;
      self.rotation = Math.floor(2*Math.random());
      self.recycle(1000,3000);
      return;
    }
    
    // watch distance
    var dist = self.sensors.dist.getValue(0);
    self.log('*cycle: dist='+dist);
    if (dist > self.maxDist) {
      self.motors[0].dutyCycleSp = self.maxSpeed;
      self.motors[1].dutyCycleSp = self.maxSpeed;
      self.rotation = Math.floor(2*Math.random());
    }
    else {
      var radius = (dist <= self.minDist) ? 0 : Math.tan(0.5*Math.PI*(dist-self.minDist)/(self.maxDist-self.minDist));
      var diff = 0.25;
      self.motors[0+self.rotation].dutyCycleSp = self.maxSpeed;
      self.motors[1-self.rotation].dutyCycleSp = self.maxSpeed * (radius-diff) / (radius+diff);
    }
    
    // schedule next cycle
    self.recycle();
  };
  
  //
  // just start
  //
  self.run = function () {
    self.log("+run");
    self.cycle();
  };
  
  self.init(_ev3dev);
  
  return self;
};


// start this beast
new Robone(require("ev3dev")).run();

