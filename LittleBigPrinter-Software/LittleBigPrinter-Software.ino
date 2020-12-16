#include "credentials.h"
#include "icons.h"

// Firebase
#include <WiFi.h>
#include <FirebaseESP32.h>

String path = "/LittleBigPrinter";

FirebaseData firebaseData;
FirebaseJsonData jsonData;
FirebaseJson json;
FirebaseJsonArray arr;
void printResult(FirebaseData &data);

// Printer
#include <Adafruit_Thermal.h>
#include <SoftwareSerial.h>
#define TX_PIN 6 // Arduino transmit  YELLOW WIRE  labeled RX on printer
#define RX_PIN 5 // Arduino receive   GREEN WIRE   labeled TX on printer

SoftwareSerial mySerial(RX_PIN, TX_PIN); // Declare SoftwareSerial obj first
Adafruit_Thermal printer(&mySerial);     // Pass addr to printer constructor

// Matrix
#include <Wire.h>
#include <Adafruit_GFX.h>
#include "Adafruit_LEDBackpack.h"

Adafruit_8x8matrix matrix = Adafruit_8x8matrix();

int sendDataPrevMillis = 0;
int checkTime = 60 * 1000; // in ms

String currentKey = "";

void setup() {

  Serial.begin(115200);

  // init WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED)
  {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();

  // init Firebase
  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
  Firebase.reconnectWiFi(true);
  
  Firebase.setReadTimeout(firebaseData, 1000 * 60);
  Firebase.setwriteSizeLimit(firebaseData, "small");
  firebaseData.setResponseSize(12288);

  Firebase.setFloatDigits(2);
  Firebase.setDoubleDigits(6);


  if (!Firebase.beginStream(firebaseData, path))
  {
      Serial.println("------------------------------------");
      Serial.println("Can't begin stream connection...");
      Serial.println("REASON: " + firebaseData.errorReason());
      Serial.println("------------------------------------");
      Serial.println();
  }

  matrix.begin(0x70);

  pinMode(7, OUTPUT); digitalWrite(7, LOW);
  mySerial.begin(19200);
  printer.begin(); 
  printer.println(F("// LittleBigPrinter is ready"));

  printer.sleep();
}

void loop() {

  if (millis() - sendDataPrevMillis > checkTime){
    sendDataPrevMillis = millis();
    checkForMessages();
  }
  
}

void checkForMessages() {
  Serial.println("------------------------------------");
  Serial.println("Get Data...");
  if (Firebase.get(firebaseData,  path))
  {   
    
    Serial.println("------------------------------------");
    Serial.println();

    if( firebaseData.dataType() == "json" ){

      FirebaseJson &json = firebaseData.jsonObject();
      /*
      Serial.println("Pretty printed JSON data:");
      String jsonStr;
      json.toString(jsonStr, true);
      Serial.println(jsonStr);
      Serial.println(); 
      */
      
      size_t len = json.iteratorBegin();
      String key, value = "";
      int type = 0;
      
      for (size_t i = 0; i < len; i++)
      {
        json.iteratorGet(i, type, key, value);

        // save latest key to variable to remember what to play
        if( i == 0 ){
          currentKey = key;
        }
      }
      json.iteratorEnd();      
    }
  } else {
    Serial.println("FAILED");
    Serial.println("REASON: " + firebaseData.errorReason());
    Serial.println("------------------------------------");
    Serial.println();
  }
}

void deleteCurrentMessage() {
  // remove one count just in case
  Firebase.deleteNode(firebaseData, path + "/Messages/" + currentKey);
}


void printMessage(){

  matrix.clear();
  matrix.drawBitmap(0, 0, sinus_icn, 8, 8, LED_ON);
  matrix.writeDisplay();
  delay(500);

  printer.wake();
  printer.setDefault(); 

  printer.println(F("Some Message"));

  printer.sleep(); 
}
