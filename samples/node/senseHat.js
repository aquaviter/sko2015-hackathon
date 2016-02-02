/*
SenseHat Implementation
*/
var SENSOR_TIMEOUT  = 1000;
var util            = require('util');
var events          = require('events');
var nodeimu         = require('nodeimu');

SenseHat.prototype.__proto__ = events.EventEmitter.prototype;

function SenseHat() {
    this.IMU = new nodeimu.IMU();
    events.EventEmitter.call(this);
}

SenseHat.prototype.startService = function() {
    setTimeout(this.doServiceInterrupt, 500, this);
    this.establishListener();
}

// Get data from sense hat, format, and emit onsensorupdate event
SenseHat.prototype.doServiceInterrupt = function(host) {
    host.IMU.getValue(function (err, data) {
        host.emit("onsensorupdate", data);
    });

    // Call ourselves again
    setTimeout(host.doServiceInterrupt, SENSOR_TIMEOUT, host);
}

SenseHat.prototype.establishListener = function() {
    var stdin = process.stdin;
    var host  = this;

    // without this, we would only get streams once enter is pressed
    stdin.setRawMode( true );

    // resume stdin in the parent process (node app won't quit all by itself
    // unless an error or process.exit() happens)
    stdin.resume();

    // i don't want binary, do you?
    stdin.setEncoding( 'utf8' );

    // on any data into stdin
    stdin.on( 'data', function(key) {
        // ctrl-c ( end of text )
        if ( key === '\u0003' ) {
            process.exit();
        }
    });
}

// export the class
module.exports = SenseHat;

//obj = new SenseHat();
//obj.startService();
