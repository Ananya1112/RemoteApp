import speech_recognition as sr
from time import ctime
import webbrowser
import pyttsx3 
import sys

engine = pyttsx3.init()
engine.setProperty('rate',150) 
r = sr.Recognizer()

def record_audio(ask=False):
    with sr.Microphone() as source:
        # if ask:
        #     print(ask)
        audio = r.listen(source)
        try:
            voice_data = r.recognize_google(audio)
            # print(voice_data)
        except sr.UnknownValueError:
            print('Sorry,I did not get that')
        return voice_data


def respond(voice_data):
    if 'concentration' in voice_data:
        text = "The air Concentrations are "+str(sys.argv[1]+" and "+str(sys.argv[2]))
        engine.say(text)
        engine.runAndWait()
    if 'time' in voice_data:
        print(ctime()[0:16])
        engine.say(ctime()[0:16])
        engine.runAndWait()
    if "on" in voice_data:
        print("1")
    if "off" in voice_data:
        print("0")
    # if 'search' in voice_data:
    #     engine.say("What do you want to search for")
    #     engine.runAndWait()
    #     search = record_audio()
    #     url = 'https://googl.com/search?q=' + search
    #     webbrowser.get().open(url)
    #     engine.say('Here is what i found')
    #     engine.runAndWait()

# print('say something')
voice_data = record_audio()
respond(voice_data)

