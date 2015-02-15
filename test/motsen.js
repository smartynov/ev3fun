#!/usr/bin/nodejs

"use strict";

var ev3dev = require("ev3dev");

//['outA','outD']
[]
.forEach(function(port){

// Run motor
console.log('Motor --------------'+port);
var motor = new ev3dev.Motor(port);
['dutyCycle', 'dutyCycleSp', 'portName', 'position',
    'positionSp', 'pulsesPerSecond', 'pulsesPerSecondSp',
    'rampDownSp', 'rampUpSp', 'regulationMode', 'run',
    'runMode', 'speedRegulationP', 'state', 'stopMode',
    'stopModes', 'timeSp', 'type'
].forEach(function (value) {
    console.log(value + ": " + motor[value]);
});

console.log('Setting motor properties...');
motor.rampUpSp = 100;
motor.rampDownSp = 100;
motor.runMode = 'time';
motor.timeSp = 1000;
motor.dutyCycleSp = 50;
console.log('Running motor...');
motor.run = 1;
console.log('--------------------');

});

//['in2','in3','in4']
['in4']
//[]
.forEach(function(port){

//Read sensor
console.log('Sensor -------------'+port);
var sensor = new ev3dev.Sensor(port);

[ 'portName', 'numValues', 'driverName',
    'mode', 'modes'
].forEach(function (value) {
    console.log(value + ": " + sensor[value]);
});

console.log('Testing sensor read...');
for(var i = 0; i < sensor.numValues; i++) {
    console.log('value ' + i + ': ' + sensor.getValue(i) + ', ' + sensor.getFloatValue(i));
}
console.log('--------------------')
});


console.log("Core motor and sensor test complete");

