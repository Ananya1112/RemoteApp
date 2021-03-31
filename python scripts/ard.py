import serial
import time
from firebase import firebase
ArduinoSerial = serial.Serial('COM1', 9600)
time.sleep(2)
print(ArduinoSerial.readline())
firebase = firebase.FirebaseApplication("https://remote-b7c6f-default-rtdb.firebaseio.com/", None)
while 1:
    var1 = firebase.get('/Led1',None)
    if var1 == 1:
        ArduinoSerial.write('1'.encode())
    if var1 == 0:
        ArduinoSerial.write('2'.encode())
    var2 = firebase.get('/Led2',None)
    if var2 == 1:
        ArduinoSerial.write('3'.encode())
    if var2 == 0:
        ArduinoSerial.write('4'.encode())
    var3 = firebase.get('/Fan',None)
    if var3 == 1:
        ArduinoSerial.write('5'.encode())
    if var3 == 0:
        ArduinoSerial.write('6'.encode())