# LittleBigPrinter

In times of instant messaging, a small analog printer makes it way into the light, connecting people. It is meant to hang in a shared apartment, an office, or wherever you like and when a message arrives, it is meant to be seen by whoever sees it. No private hidden message, no hiding behind a smartphone screen and writing with one specific friend, no constant alert status, waiting for the next message.  

*LittleBigPrinter — the fax machine for millennials.*

Send a message here → [Messenger](https://little-big-printer-messenger.now.sh/)

![LittleBigPrinter](00_img/title.jpg)


## Hardware Setup

### Components

* [Raspberry Pi](https://www.raspberrypi.org/)
* [Adafruit Thermal Printer](https://www.adafruit.com/product/597)
* [LED Matrix](https://www.adafruit.com/product/1080)
* [Power Supply 5V 3A](https://www.meanwell-web.com/en-gb/ac-dc-single-output-enclosed-power-supply-output-rs--15--5)
* [USB to TTL Converter](https://www.amazon.de/SODIAL-USB-TTL-Konverter-Modul-eingebautem-CP2102/dp/B008RF73CS)

### Case

What is needed to build the case and wall mount:

* 230 ✕ 160 mm, 3 mm thick acrylic glass. You can find the laser file here: [`00_case/laser.dxf`](00_case/laser.dxf)
* 12 M3✕10 mm screws (+ 2-3 additional ones for cutting threads)
* 4 M3 nuts
* 4 aluminium tubes, Ø5 mm (inside ~ Ø2.5mm to cut in a M3 thread) 
* A **three** core cable for power supply

![Assembly](00_img/assembly.png)

### Pin Setup

|Raspberry Pi    |Components         |
|----------------|-------------------|
|4 (5V)          |Power Supply +     |
|6 (GND)         |Power Supply -     |
|2 (5V)          |LED Matrix +       |
|9 (GND)         |LED Matrix -       |
|3 (GPIO 2 / SDA)|LED Matrix D       |
|5 (GPIO 3 / SCL)|LED Matrix C       |
|14 (GND)        |Printer Serial GND |

|Printer   |Other Components|
|----------|----------------|
|Tx        |TTY Rx          |
|Rx        |TTY Tx          |
|Serial GND|Rasp 14 (GND)   |
|Vin       |Power Supply +  |
|GND       |Power Supply -  |


## Installation

### Prepare The Raspberry Pi

Download a [Raspbian](https://www.raspberrypi.org/documentation/installation/installing-images/) image and write it onto an SD card.

After the setup, allow SSH connections, to interface with it on your Computer. Therefore load the [`00_pi-setup/ssh`](00_pi-setup/ssh) onto the installation SD card's root.

After that load the [`00_pi-setup/wpa_supplicant.conf`](00_pi-setup/wpa_supplicant.conf), update it with your WiFi credentials and upload it to the SD card root as well.

Now install Raspbian onto the Raspberry Pi.

Once installed you should be able to access it on your computer terminal. To find it from your computer, install *arp-scan*, I recommend using [Homebrew](https://brew.sh/):

```sh
brew install arp-scan
```

Then run `sudo arp-scan --localnet`  and search for 'Raspberry'.

Once your have found the correct IP address, you should be able to log into its terminal using `ssh pi@<IP-address>`, the default password is `raspberry`

Enable GPIO and I2C to enable the hardware components to communicate with the Raspberry. To do so, open the configuration of the Raspberry by entering:

```sh
sudo raspi-config
```

Enable pigpiod by making it executable ([source](https://github.com/joan2937/pigpio/tree/master/util)):

```sh
sudo chmod +x /etc/init.d/pigpiod
```

Keep in mind to update you locale according to your location:

```sh
export LANGUAGE=en_GB.UTF-8
export LANG=en_GB.UTF-8
export LC_ALL=en_GB.UTF-8
locale-gen en_GB.UTF-8
sudo dpkg-reconfigure locales
```

Now we need to disable the power-safe mode, so that the printer keeps printing. Therefore we need to open and edit this file.

```sh
sudo nano /etc/network/interfaces
```

Then add or update the following lines to the document and save it:

```sh
allow-hotplug wlan0
iface wlan0 inet manual
post-up iw wlan0 set power_save off
```

Add to this file:

```sh
sudo nano /etc/xdg/lxsession/LXDE-pi/autostart
```

The following lines:

```sh
@lxpanel --profile LXDE-pi
@pcmanfm --desktop --profile LXDE-pi
point-rpi

# Run shell script to boot node js server
@sleep 5s # give time to start node server

# @sh /home/pi/Desktop/littleBigPrinter/boot.sh 
# this script automatically starts the node script within a terminal window
@lxterminal -e "/home/pi/Desktop/littleBigPrinter/boot.sh"

xset s off #
xset -dpms 
```

Finally update node-red, install [node js](https://nodejs.org/) and [yarn](https://yarnpkg.com/). This should to the trick:

```sh
sudo apt update
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install nodejs
curl -o- -L https://yarnpkg.com/install.sh | bash

curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update && sudo apt-get install yarn
```

More detailed description [here](https://www.hackster.io/IainIsCreative/setting-up-the-raspberry-pi-and-johnny-five-56d60f).

### Upload LittleBigPrinter Program

For easier upload of the repository files, connect via FTP to upload your code. The credentials for that are as follows:

```
Host = <IP-address>
Username = pi
Password = raspberry
Port = 22
```

Upload this folder to the Desktop and open it in your terminal window `cd Desktop/littleBigPrinter`.
Once in the folder hit `yarn install` to install all relevant dependencies.

To let the printer automatically start the script on boot, edit the *.bashrc* file, by hitting `sudo nano .bashrc` and add the following:

```sh
# Run node js server
echo "Starting NodeJS Server"
cd /home/pi/Desktop/littleBigPrinter
sudo yarn start
```

Now the printer should automatically start on reboot.

## ToDos

- [ ] Refactor the serial connection to get rid of TTY USB dongle → [Guide](https://learn.adafruit.com/networked-thermal-printer-using-cups-and-raspberry-pi/connect-and-configure-printer) 
- [ ] Implement multi printer usage (per IDs within the database)
- [ ] Add a buzzer to acoustically inform about new messages
- [ ] Add a RGB LED and button (or something completely different) to change the paper colour entry