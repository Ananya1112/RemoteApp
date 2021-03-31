from firebase import firebase
import random
import time

firebase = firebase.FirebaseApplication("https://remote-b7c6f-default-rtdb.firebaseio.com/", None)
x = 10
while(x>1) :
    firebase.put('/table', "pm10", random.randint(0, 200))
    firebase.put('/table', "pm25",random.randint(0,150))
    firebase.put('/table', "ledb", random.random())
    time.sleep(1)
