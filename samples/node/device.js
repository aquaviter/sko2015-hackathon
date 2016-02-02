var configuration         = require("./config")
var mockImplementation    = require("./mockImplementation");
var senseHat              = require("./senseHat");
var awsIot                = require('aws-iot-device-sdk');
var reportingFrequency    = 1000;
var mock                  = new mockImplementation();
var hat                   = new senseHat();
var IoTIntegrationReady   = false; // not enabled until 2 seconds after connection
//var thingShadows          = null;
var thingShadows          = null;
var stateSchema           = require("./stateSchema");
var deviceState           = new stateSchema();

function initialiseIoT()
{
  console.log("Initialising AWS IoT...");
  thingShadows = awsIot.thingShadow({
    keyPath:  configuration.IoT.keyPath,
    certPath: configuration.IoT.certPath,
      caPath: configuration.IoT.caPath,
    clientId: configuration.IoT.thingName,
      region: configuration.IoT.region
  });
  
  thingShadows.on('connect', iot_onConnect); 
  thingShadows.on('offline', iot_onOffline); 
  thingShadows.on('error',   iot_onError); 
  thingShadows.on('status',  iot_onStatus);
  thingShadows.on('delta',   iot_onDelta);
  thingShadows.on('timeout', iot_onTimeout );
}

function updateIoTShadow(overwriteDesired, desiredState)
{
    if ( configuration.SEND_TO_IOT && IoTIntegrationReady )
    {
      try
      {                 
          //
          // 
          //
          var newState = 
          {
              "state":
              {
                "reported": deviceState
              }
          };
          
          if ( overwriteDesired )
          {
            newState.state["desired"] = desiredState;
          }
          
          thingShadows.update(configuration.IoT.thingName, newState );
          
      }
      catch(ex)
      {
        console.log("EXCEPTION: " + ex.message);
      }
    }
    else
    {
      // Ignore the request
    }
}

function main()
{
  console.log("");
  console.log("");
  console.log("*******************************************************");
  console.log("** ");
  console.log("** SKO Hackathon - Sample IoT device");
  console.log("** ");
  
  if (configuration.mock.enabled)
  {
    console.log("** Mock mode has been enabled - no sensor hardware will be read!");
  }
  else
  {
    console.log("** Listening to sensor hardware");
  } 
  console.log("** ");
  console.log("*******************************************************");
  console.log("");
  console.log("");
  
  if (!configuration.mock.enabled)
  {
    //
    // Start the real sensor service
    //
    hat.startService();
    
    hat.on("onsensorupdate", function (data)
    {
        onSensorUpdate(data);
    });
  }
  else
  {
    // 
    // Start the mock service
    //
    mock.startMockService();
    
    /*
    mock.on("onmockmessagesend", function (msgToSend) 
    {
      console.log("onmockmessagesend: " + msgToSend);
      relayMessageFromOtherEdisonToMobile(msgToSend);   
    });    
    */
    
    mock.on("onmocksensorupdate", function (data)
    {
      onSensorUpdate(data);
    });
  }

  initialiseIoT();   
}

function onSensorUpdate(sensorData)
{
  if ( IoTIntegrationReady )
  {
    console.log('Update sensor - ' + JSON.stringify(sensorData));
    
    deviceState.temperature = sensorData.temperature; 
    
    updateIoTShadow(false);
  }
}

function iot_onTimeout(thingName, clientToken) 
{
  console.log('received timeout '+' on '+thingName+': '+ clientToken);
}    

function iot_onStatus(thingName, stat, clientToken, stateObject) 
{
  switch ( stat )
  {
    default:
    {
      //console.log('STATUS: received '+stat+' on '+thingName+': ');//+ JSON.stringify(stateObject));
    }
    break;
  }
}

function handleDelta_Servo(in_stateObject, out_desiredStateObject)
{
  var newState = in_stateObject.state;
  console.log("DELTA ==> " + JSON.stringify(newState));
  //
  // If the incoming state actually contains an 'servo' property... 
  // 
  if ( newState.servo != null )
  {
    out_desiredStateObject["servo"] = {};
    
    if ( newState.servo.speed != null )
    {
      out_desiredStateObject.servo["speed"] = newState.servo.speed;
      deviceState.servo.speed     = newState.servo.speed;
    }
      
    if ( newState.servo.direction != null )
    {
      out_desiredStateObject.servo["direction"] = newState.servo.direction;
      deviceState.servo.direction = newState.servo.direction;
    }    
  }
}

function iot_onDelta(thingName, stateObject) 
{
  /*
  console.log('-----------------------------------')
  console.log('Got a delta ' + JSON.stringify(stateObject));
  console.log('-----------------------------------')
  */
  
  //
  // Clear desired state object. We rebuild this state, updating
  // it to match the key/val pairs that we are prepared to honour.
  //
  var desiredStateObject = {};
  
  handleDelta_Servo(stateObject, desiredStateObject);
  // handle other things ----
  
  //
  // We are now in sync as far as we are prepared to go
  // so we update the shadow and re-write the desired state 
  //
  updateIoTShadow(true, null);//desiredStateObject); 
  
  //
  // And also update our physical state to match the desired state
  //
  updateDeviceStateLocal();
  
}

function iot_onOffline() 
{
    console.log('offline');
}

function iot_onError(error) 
{
    console.log('error', error);
}

function iot_onConnect() 
{
  console.log('Connected to AWS IoT - registering thing shadow');
  
  // 
  // After connecting to the AWS IoT platform, 
  // register interest in the Thing Shadow  
  // 
  thingShadows.register( configuration.IoT.thingName, 
  {
        persistentSubscribe: true 
  });

  console.log('Registered. Waiting for recommended timeout...');
  
  // 
  // Note that the delay is not required for subsequent updates; only 
  // the first update after a Thing Shadow registration using default 
  // parameters requires a delay.  See API documentation for the update 
  // method for more details. 
  //   
  setTimeout(syncDeviceStateFromShadow, 2000);
}   
 
function syncDeviceStateFromShadow()
{
  enableIoTIntegration();
  updateIoTShadow(false);
} 

function enableIoTIntegration()
{
  if ( !IoTIntegrationReady )
  {
    console.log("IoT integration now enabled!");
    IoTIntegrationReady = true;
  }  
}

function updateDeviceStateLocal()
{
  // TODO - somehow update our physical state  
}

main();
 
