#!/usr/bin/python
# -*- coding: utf-8 -*-

from sense_hat import SenseHat

import paho.mqtt.client as paho
import ssl
from functools import wraps
import json
import time
import random

topic = '$aws/things/granny-nanny-monitor/shadow/update'
deviceid = "grannynannymonitor"

def sslwrap(func):
    @wraps(func)
    def bar(*args, **kw):
        kw['ssl_version'] = ssl.PROTOCOL_TLSv1_2
        return func(*args, **kw)
    return bar

def on_connect(client, userdata, flag, rc):
    print("Connected with result code "+str(rc))
    client.subscribe(topic)

def on_message(client, userdata, message):
    print("Subscribe to " + message.topic + " :" + str(message.payload))
    print message.payload

ssl.wrap_socket = sslwrap(ssl.wrap_socket)

mqttc = paho.Client()
mqttc.on_connect = on_connect
mqttc.on_message = on_message
mqttc.tls_set("rootca.pem",
               "cert.pem",
               "privatekey.pem")
mqttc.connect("data.iot.eu-west-1.amazonaws.com", 8883, 10)
mqttc.loop_forever()
