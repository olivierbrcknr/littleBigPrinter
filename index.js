// Modules Printer
const SerialPort = require('serialport');
const Printer = require('thermalprinter');
const path = require("path");

// Modules Hardware
const five = require('johnny-five');
const Raspi = require('raspi-io').RaspiIO;


// ——————————————————————————————————————————

// Variables 
const board = new five.Board({
  io: new Raspi()
});
let sp = new SerialPort('/dev/ttyUSB0', {
    baudRate: 19200
});
let printer = null;


function resetPrinterSettings(){
    printer
        .bold(false)
        .inverse(false)
        .big(false)
        .left();
}


 
// var path = __dirname + '/images/nodebot.png';




// init Printer
sp.on('open',function() {
    printer = new Printer(sp);
    printer.on('ready', function() {
        printer
            .indent(10)
            .horizontalLine(16)
            .bold(true)
            .indent(10)
            .printLine('first line')
            .bold(false)
            .inverse(true)
            .big(true)
            .right()
            .printLine('second line')
            // .printImage(path)
            .print(function() {
                console.log('Init Done');
                resetPrinterSettings();
            });
    });
});

// Matrix Symbols
const heart = [
    "01100110",
    "10011001",
    "10000001",
    "10000001",
    "01000010",
    "00100100",
    "00011000",
    "00000000"
];



board.on('ready', () => {

    console.log('Board Ready 🎛')


    // Setup hardware
    let matrix = new five.Led.Matrix({
        addresses: [0x70],
        controller: "HT16K33",
        rotation: 3,
    });

    let btn = new five.Button("P1-11");

    // Run code

    matrix.clear();

    btn.on("down", function() {
        matrix.draw(heart);
        printer
            .bold(true)
            .indent(10)
            .printLine('Button Pressed')
            .print(function() {
                setTimeout(function(){
                    matrix.clear();
                },1000);
            });
        console.log('down')
    });

});








