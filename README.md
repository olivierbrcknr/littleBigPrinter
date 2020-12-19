# LittleBigPrinter

In times of instant messaging, a small analog printer makes it way into the light, connecting people. It is meant to hang in a shared apartment, an office, or wherever you like and when a message arrives, it is meant to be seen by whoever sees it. No private hidden message, no hiding behind a smartphone screen and writing with one specific friend, no constant alert status, waiting for the next message.  

*LittleBigPrinter — the fax machine for millennials.*

Send a message here → [Messenger](https://little-big-printer-messenger.now.sh/)

![LittleBigPrinter](00_img/title.jpg)

If you like this project, please also check out my other project → [FlipDot Communicator](https://github.com/olivierbrcknr/flipdot-communicator)

## Hardware Setup

*I refactored this project from an Raspberry Pi to an ESP32, as this is more lightweight code and runs more stable.*

### Components

* ESP32
* [Adafruit Thermal Printer](https://www.adafruit.com/product/597)
* [LED Matrix](https://www.adafruit.com/product/1080)
* [Power Supply 5V 3A](https://www.meanwell-web.com/en-gb/ac-dc-single-output-enclosed-power-supply-output-rs--15--5)

### Case

What is needed to build the case and wall mount:

* 230 ✕ 160 mm, 3 mm thick acrylic glass. You can find the laser file here: [`00_case/laser.dxf`](00_case/laser.dxf)
* 12 M3✕10 mm screws (+ 2-3 additional ones for cutting threads)
* 4 M3 nuts
* 4 aluminium tubes, Ø5 mm (inside ~ Ø2.5mm to cut in a M3 thread) 
* A **three** core cable for power supply

![Assembly](00_img/assembly.png)

### Pin Setup

**!!!! CHANGE**

|ESP32           |Components         | 
|----------------|-------------------|
|4 (5V)          |Power Supply +     |
|6 (GND)         |Power Supply -     |
|2 (5V)          |LED Matrix +       |
|9 (GND)         |LED Matrix -       |
|3 (GPIO 2 / SDA)|LED Matrix D       |
|5 (GPIO 3 / SCL)|LED Matrix C       |
|GND            |Printer Serial GND |
|19              |Printer Tx         |
|18              |Printer Rx         |



|Printer   |Other Components|
|----------|----------------|
|Tx        |TTY Rx          |
|Rx        |TTY Tx          |
|Serial GND|Rasp 14 (GND)   |
|Vin       |Power Supply +  |
|GND       |Power Supply -  |


## Software

### Flashing The ESP32

The software for the ESP32 is built using the [Arduino IDE](https://www.arduino.cc/en/software). You can find all the files here → [`LittleBigPrinter-Software/`](LittleBigPrinter-Software)

### Libraries to install

You will need to install these libraries for the code to work:

* [ESP32](https://github.com/espressif/arduino-esp32)
* [Firebase ESP32](https://github.com/mobizt/Firebase-ESP32)
* [Adafruit LED Backpack](https://github.com/adafruit/Adafruit_LED_Backpack)
* [Adafruit Thermal Printer Library](https://github.com/adafruit/Adafruit-Thermal-Printer-Library)
* [Adafruit RTClib](https://github.com/adafruit/RTClib)

### Flash the ESP32

Next, open the [`.ino`](LittleBigPrinter-Software/LittleBigPrinter-Software.ino) file. Add your credentials to the `credentials.h` file. The placeholders are these ones:

```cpp
#define FIREBASE_HOST "YOUR_FIREBASE_PROJECT.firebaseio.com"
#define FIREBASE_AUTH "YOUR_FIREBASE_DATABASE_SECRET"
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
```

If you are not sure where to find the Firebase credentials, this [stackoverflow question](https://stackoverflow.com/questions/37418372/firebase-where-is-my-account-secret-in-the-new-console) will help you.

Finally flash it onto the board. Now you should be all set up!

## ToDos

- [ ] Implement multi printer usage (per IDs within the database)
- [ ] Add a buzzer to acoustically inform about new messages
- [ ] Add a RGB LED and button (or something completely different) to change the paper color entry