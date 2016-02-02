#!/usr/bin/python
import paho.mqtt.client as mqtt
import ssl
import threading

from sense_hat import SenseHat

def main():
    client.on_connect = on_connect
    client.on_message = on_message

    client.tls_set( "/home/pi/rootca.pem",
                    certfile="/home/pi/cert.pem",
                    keyfile="/home/pi/privatekey.pem",
                    tls_version=ssl.PROTOCOL_TLSv1_2,
                    ciphers=None )

    client.connect("<YOUR ENDPOINT HERE>", 8883, 10)

    client.loop_forever()

def do_every(interval, worker_func, iterations = 0):
    if iterations != 1:
        threading.Timer (
            interval,
            do_every, [interval, worker_func, 0 if iterations == 0 else iterations-1]
        ).start()
    worker_func()

def publish_temp():
    temperature = sense.get_temperature() * 9/5 + 32
    humidity = sense.get_humidity()

    client.publish("SenseHat/sensors", '{"temperature":' + "%.2f" % temperature + ', "humidity":' + "%.2f" % humidity + '}"')
    print("Temperature: {0}, Humidity: {1}".format("%.2f" % temperature, "%.2f" % humidity))

def on_connect(client, userdata, flags, rc):
    print("Connected with result code " + str(rc))
    do_every(5, publish_temp)

def on_message(client, userdata, msg):
    print(msg.topic + " " + str(msg.payload))
	
if __name__ == '__main__':
    sense = SenseHat()
    client = mqtt.Client()
    main()
        
