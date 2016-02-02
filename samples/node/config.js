//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Configure these values
//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

//var DEVICE_NAME    = "SenseHat";
var DEVICE_NAME    = "granny-nanny-monitor";
var IOT_KEY_PATH   = '/home/pi/privatekey.pem';
var IOT_CERT_PATH  = '/home/pi/cert.pem';
var IOT_CA_PATH    = '/home/pi/rootca.pem';
var IOT_REGION     = 'eu-west-1';
var AWS_REGION     = 'eu-west-1';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Leave these as they are - pre-configured for use in the sample script 
//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

var config = {}

config.aws = {};
config.IoT = {};

//
// IoT
//
config.IoT.thingName = DEVICE_NAME;
config.IoT.keyPath   = IOT_KEY_PATH;
config.IoT.certPath  = IOT_CERT_PATH;
config.IoT.caPath    = IOT_CA_PATH;
config.IoT.region    = IOT_REGION;

//
// General
//
config.SEND_TO_IOT = true;
config.DEVICE_NAME = DEVICE_NAME;

//
// AWS
//
config.aws.AWS_REGION = AWS_REGION;

//
// Mock
//
config.mock         = {};
config.mock.enabled = false;

//
// Export
//
module.exports = config;

