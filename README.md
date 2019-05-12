# Raspberry Pi Setup


## Install Raspbian

(Link)[https://www.raspberrypi.org/documentation/installation/installing-images/]


## Allow SSH connections

(Link)[https://hackernoon.com/raspberry-pi-headless-install-462ccabd75d0]

## Configure WiFi

(Link)[https://raspberrypi.stackexchange.com/questions/10251/prepare-sd-card-for-wifi-on-headless-pi]


## Find Raspberry in terminal

to find the IP, connect a screen/keyboard to the pi and open a terminal and write `ifconfig` and look for the ip address of `eth0` 
or to find it from your computer, install *arp-scan* `brew install arp-scan` and then run `sudo arp-scan --localnet --interface=en7` (en7 may be different on your machine)

`ssh pi@10.9.2.18` (← Enter here your Raspberry's IP address) password is `raspberry`

connect via FTP to upload your code 
```
Host = IP
Username = pi
Password = raspberry
Port = 22
```

## Node

update node-red, install node and yarn

```sh
sudo apt update
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash - 
sudo apt-get install nodejs 
curl -o- -L https://yarnpkg.com/install.sh | bash 

curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update && sudo apt-get install yarn
```

More detailed description (here)[https://www.hackster.io/IainIsCreative/setting-up-the-raspberry-pi-and-johnny-five-56d60f].

## Install software

The code is based on node js via yarn, so open the directory and hit `yarn install`.


## Run the node js server after boot

Edit this file
`sudo nano /home/pi/.config/lxsession/LXDE-pi/autostart`
And add this:
```sh
# Run shell script to boot node js server
@sh /home/pi/Desktop/vinylviz/boot.sh
@sleep 5s # give time to start node server
@xset s off
@xset -dpms
@xset s noblank
@chromium-browser --kiosk http://localhost:3000/
```
Then reboot. Chromium should automatically launch in fullscreen mode after the desktop has loaded.