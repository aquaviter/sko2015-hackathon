/*
MockImplementation
*/
var SENSOR_TIMEOUT  = 1000;
var util            = require("util");
var events          = require('events');
var mockServiceData = [
    { temperature: 30 },
];

MockImplementation.prototype.__proto__ = events.EventEmitter.prototype;

function MockImplementation()
{
    events.EventEmitter.call(this);
}

MockImplementation.prototype.startMockService = function()
{
    setTimeout(this.doMockServiceInterrupt, 500, this);
    this.establishKeyListenerForMockMode();
}

MockImplementation.prototype.doMockServiceInterrupt = function(host)
{
    //
    // Iterate through each of the mock sensors, bump their values by 'a bit'
    //
    for ( var sensor in mockServiceData )
    {
        var thisSensor = mockServiceData[sensor];
        thisSensor.temperature = ~~(thisSensor.temperature) + ((Math.random() > .05) ? 0.5 : -0.1); 
        
        //
        // Tell the app we heard from this pretend device
        //
        host.emit("onmocksensorupdate", thisSensor);
    }
    
    // Call ourselves again
    setTimeout(host.doMockServiceInterrupt, SENSOR_TIMEOUT, host);
}

MockImplementation.prototype.establishKeyListenerForMockMode = function()
{
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
    stdin.on( 'data', function( key ){
    // ctrl-c ( end of text )
    if ( key === '\u0003' ) {
        process.exit();
    }
    
    /*
    if ( key === 'm' || key === 'M' )
    {
        host.doMockSendMessage();
    }
    */
    });
}

MockImplementation.prototype.doMockSendMessage = function()
{
    this.emit("onmockmessagesend", JSON.stringify({data:"Hello World"}));  
}


// export the class
module.exports = MockImplementation;