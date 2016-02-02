#!/usr/bin/python
# -*- coding: utf-8 -*-

from sense_hat import SenseHat

import paho.mqtt.client as paho
import ssl
from functools import wraps
import json
import time
import pytz
from datetime import datetime


topic = 'foo/bar'
deviceid = 'granny-nanny-monitor'

interval = 1

def sense_data():
    sense = SenseHat()
    comx, comy, comz = sense.get_compass_raw().values()
    accx, accy, accz = sense.get_accelerometer_raw().values()
    gyrox, gyroy, gyroz = sense.get_accelerometer_raw().values()
    temperature = sense.get_temperature_from_humidity()
    humidity = sense.get_humidity()
    pressure = sense.get_pressure()

    timestamp = datetime.now().isoformat()

    if accy > 0.1 :
        drop_flg = 1
    else:
        drop_flg = 0
            

    message = { "deviceid": deviceid, \
                "timestamp" : timestamp, \
                "temperature" : temperature, \
                "humidity" : humidity, \
                "pressure" : pressure, \
                "comx" : comx, \
                "comy" : comy, \
                "comz" : comz, \
                "gyrox" : gyrox, \
                "gyroy" : gyroy, \
                "gyroz" : gyroz, \
                "accx" : accx, \
                "accy" : accy, \
                "accz" : accz, \
                "drop" : drop_flg
                 }
    print accx, accy, accz, drop_flg
    return message

def sslwrap(func):
    @wraps(func)
    def bar(*args, **kw):
        kw['ssl_version'] = ssl.PROTOCOL_TLSv1_2
        return func(*args, **kw)
    return bar

ssl.wrap_socket = sslwrap(ssl.wrap_socket)

mqttc = paho.Client()
mqttc.tls_set("rootca.pem",
               "cert.pem",
               "privatekey.pem")
mqttc.connect("data.iot.eu-west-1.amazonaws.com", 8883, 10)

while True:
    payload = json.dumps( sense_data() )
    print "Publish to " + topic + " : " + payload
    mqttc.publish(topic, payload, 0, False)
    time.sleep(interval)
