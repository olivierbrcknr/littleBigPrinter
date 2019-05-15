// Modules Printer
const SerialPort = require('serialport');
const Printer = require('thermalprinter');

// Modules Hardware
const five  = require('johnny-five');
const Raspi = require('raspi-io').RaspiIO;

const icon = require('./matrix-icons');

// ——————————————————————————————————————————

// Variables 
const board = new five.Board({
  io: new Raspi()
});
let sp = new SerialPort('/dev/ttyUSB0', {
    baudRate: 19200
});

let printer = null;
let matrix = null;

function resetPrinterSettings(){
    printer
        .bold(false)
        .inverse(false)
        .big(false)
        .left();
}

/*
//Printer commands

 var path = __dirname + '/images/nodebot.png';

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
.printImage(path)
.print(function() {
    console.log('Init Done');
    resetPrinterSettings();
});

*/



// init Printer
sp.on('open',function() {

    console.log('Serialport ready 🔌');
    
    printer = new Printer(sp);

    printer.on('ready', function() {
        console.log('Printer ready 🖨');
        resetPrinterSettings();

        printer.printLine('LittlePrinter is ready!').print(function() {
            resetPrinterSettings();
        });
    });
});

// init Johnny-five
board.on('ready', () => {

    console.log('J5 Ready 🤖');


    // Setup hardware
    matrix = new five.Led.Matrix({
        addresses: [0x70],
        controller: "HT16K33",
        rotation: 1
    });

    let btn = new five.Button("P1-11");

    // Run code
    matrix.clear();
    pulse( icon.check , 1 , 0.5 );

});


// Matrix functions
function sinusAnim( icon , duration ) {

    const time = 150;

    let frames = 10;
    if( duration ){ frames = duration / time }

    let frame = 0;
    matrix.clear();

    let prevIcon = icon;

    let anim = setInterval(nextFrame, time);
    
    function nextFrame() {
        if (frame >= frames) {
            clearInterval(anim);
            matrix.clear();
            frame = 0;
        } else {
            frame++;
            let dummy = [];
            let i = 0;
            prevIcon.forEach(function(string){
               dummy[i] = string.substring(1, 8) + string.substring(0);
               i++;
            });
            prevIcon = dummy;
            matrix.draw(prevIcon);
        }
    }
}

function pulse( icon , pulses , speed ) {

    const step = 10 * speed;
    let frames = pulses * (100 / step)*2;
    let time = 200;

    let anim = setInterval(nextFrame, time);

    let brightness = 0;
    let direction = 1
    let frame = 0;

    matrix.clear();

    function nextFrame() {
        if (frame >= frames) {
            clearInterval(anim);
            matrix.clear();
            frame = 0;
            matrix.brightness(100);
        } else {
            frame++;
            matrix.brightness(brightness);
            matrix.draw(icon);

            if( direction == 1 && brightness >= 100 ){
                direction = 0;
            }
            if( direction == 0 && brightness <= 0 ){
                direction = 1;
            }
            if(direction){
                brightness = brightness + step;
            }else{
                brightness = brightness - step
            }
        }
    }
}