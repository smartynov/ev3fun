#!/usr/bin/nodejs

"use strict";

/*
 * ALGO:
 * 1. run forward random 0.2-0.7 meters
 * 2. turn in random direction 0-180
 * 3. if (obstacle forward) turn random 70-180 degrees
 * 4. if (bumped) reverse with turning in random direction
 * 5. repeat
 *
 * States/commands:
 * - forward
 * - reverse (with turning)
 * - turn (angle)
 * - forward with turn
 * - wait (sleep)
 * */

var Robone = function (_ev3dev) {
  var self = this;
  
  self.log = function () {
    console.log.apply(null, arguments);
  };
  
  self.init = function (_ev3dev) {
    self.log('+init');

    self.ev3dev = _ev3dev;
    
    // init motors
    self.motors = [
      new self.ev3dev.Motor('outA'),
      new self.ev3dev.Motor('outD')
    ];
    self.motors.map(function (m) {
      m.rampUpSp = 100;
      m.rampDownSp = 100;
      m.runMode = 'time';
      m.timeSp = 0;
    });
    
    // init sensors
    self.sensors = {
      bump: new self.ev3dev.Sensor('in4')
    };

    self.log('-init', self);
  }
  
  self.cmd = {
    forward: function (length) {
      self.log('+cmd/forward');
      self.motors.map(function (m) {
        m.dutyCycleSp = 70;
        m.timeSp = length;
        m.run = 1;
      });
    },
    forrot: function (length) {
      self.log('+cmd/forrot');
      var rmot = Math.floor(2*Math.random());
      self.motors.map(function (m, i) {
        if (i == revmot) {
          m.dutyCycleSp = -70;
          m.timeSp = length;
          m.run = 1;
        }
        else {
          m.run = 0;
        }
      });
    },
    revrot: function (length) {
      self.log('+cmd/revrot');
      var revmot = Math.floor(2*Math.random());
      self.motors.map(function (m, i) {
        if (i == revmot) {
          m.dutyCycleSp = -70;
          m.timeSp = length;
          m.run = 1;
        }
        else {
          m.run = 0;
        }
      });
    },
    stop: function (length) {
      self.log('+cmd/stop');
      self.motors.map(function (m) {
        m.dutyCycleSp = 0;
        m.run = 0;
      });
    }
  };
  
  self.watch = function () {
    self.log('+watch');
    if (self.sensors.bump.getValue(0))
      self.runcmd('revrot');
    setTimeout(self.watch, 100);
  };
  
  self.runcmd = function (force) {
    self.log('+runcmd('+force+')');
    clearTimeout(self.timeout);
    if (force) {
      self.state = force;
    }
    else {
      self.state = 'forward';
      //self.state = ['forward','forrot'][Math.floor(Math.random()*2)];
    }
    var len = Math.floor(600+Math.random(self.state == 'forward' ? 2500 : 1400));
    self.log('*runcmd '+self.state+' '+len);
    self.cmd[self.state](len+400);
    self.timeout = setTimeout(self.runcmd, len);
  };
  
  self.run = function () {
    self.log("+run");
    self.watch();
    self.runcmd();
  };
  
  self.init(_ev3dev);
  
  return self;
};


new Robone(require("ev3dev")).run();

