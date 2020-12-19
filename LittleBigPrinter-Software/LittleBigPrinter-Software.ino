#include "credentials.h"
#include "icons.h"

#include <RTClib.h>

// Firebase
#include <WiFi.h>
#include <FirebaseESP32.h>

String db = "/LittleBigPrinter";
String path = db + "/Messages";

FirebaseData firebaseData;
FirebaseJsonData jsonData;
FirebaseJson json;
FirebaseJsonArray arr;
void printResult(FirebaseData &data);

// Printer
#include <Adafruit_Thermal.h>
#include <SoftwareSerial.h>
#define TX_PIN 19 // Arduino transmit  YELLOW WIRE  labeled RX on printer
#define RX_PIN 18 // Arduino receive   GREEN WIRE   labeled TX on printer

SoftwareSerial mySerial(RX_PIN, TX_PIN); // Declare SoftwareSerial obj first
Adafruit_Thermal printer(&mySerial);     // Pass addr to printer constructor

// Matrix
#include <Wire.h>
#include <Adafruit_GFX.h>
#include "Adafruit_LEDBackpack.h"

Adafruit_8x8matrix matrix = Adafruit_8x8matrix();

int sendDataPrevMillis = 0;
int initCheckTime = 3000;
int checkTime = 5 * 1000; // in ms

bool isPrinting = false;

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
  printer.println(F(" "));
  printer.println(F(" "));
  Serial.println("// LittleBigPrinter is ready");
  
  printer.sleep();
}

void loop() {

  if (millis() - sendDataPrevMillis > initCheckTime){
    sendDataPrevMillis = millis();
    checkForMessages();
    initCheckTime = checkTime;
  }
  
}

void checkForMessages() {
  Serial.println("------------------------------------");
  Serial.println("Get Data...");
  if (Firebase.get(firebaseData, path))
  {   
    
    Serial.println("------------------------------------");
    Serial.println();

    if( firebaseData.dataType() == "json" ){

      FirebaseJson &json = firebaseData.jsonObject();

      Serial.println("Pretty printed JSON data:");
      String jsonStr;
      json.toString(jsonStr, true);
      Serial.println(jsonStr);
      Serial.println(); 
      
      size_t len = json.iteratorBegin();
      String key, value = "";
      int type = 0;

      String mName, mMsg, mDate, mID = "";
      bool isNewMessage = false;

      int messageCount = 0;
      
      for (size_t i = 0; i < len; i++)
      {
        json.iteratorGet(i, type, key, value);
        if( messageCount <= 1 ){

          if(value.indexOf("{") >= 0){
            if( messageCount < 1 ){
              mID = key;     
            }
            messageCount++;
          } 

          if(key.indexOf("Name") >= 0 ){
            mName = value;
          }

          if(key.indexOf("Message") >= 0 ){
            mMsg = value;
          }

          if(key.indexOf("Date") >= 0 ){
            mDate = value;
          }

        } // endIf isNewMessage
      }
      json.iteratorEnd(); 
      if( messageCount > 0 ){
        printMessage( mName, mMsg, mDate, mID );            
      }
    }
  } else {
    Serial.println("FAILED");
    Serial.println("REASON: " + firebaseData.errorReason());
    Serial.println("------------------------------------");
    Serial.println();
  }
}

// delete message
void deleteCurrentMessage( String id ) {
  Firebase.deleteNode(firebaseData, path + "/" + id);
}

// move to backup DB
void moveCurrentMessage( String n, String m, String t, String id ) {
  FirebaseJson json;
  json.set("Name", n);
  json.set("Message", m);
  json.set("Date", t);
  Firebase.pushJSON(firebaseData, db + "/Printed", json );
  deleteCurrentMessage( id );
}


void printMessage( String n, String m, String t, String id ){

  matrix.clear();
  matrix.drawBitmap(0, 0, sinus_icn, 8, 8, LED_ON);
  matrix.writeDisplay();
  delay(500);


  String whiteSpace = "";
  int whiteSpaceCount = 18 - n.length();
  for( int i = 0; i < whiteSpaceCount; i++ ){
    whiteSpace = whiteSpace + " ";
  }

  isPrinting = true;

  Serial.print("Printing message from ");
  Serial.println(n);
 
  printer.wake();
  printer.setDefault(); 

  // printer.println(F("Some Message"));
  printer.print(n);
  printer.print(whiteSpace);
  printer.println(t);
  printer.println(F("------"));
  printer.println(m);

  printer.println(F(" "));
  printer.println(F(" "));
  printer.println(F(" "));
  
  printer.sleep(); 

  isPrinting = false;

  moveCurrentMessage(n,m,t,id);
}
