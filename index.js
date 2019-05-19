// Modules Printer
const SerialPort = require('serialport');
const Printer = require('thermalprinter');

// Modules Hardware
const five  = require('johnny-five');
const Raspi = require('raspi-io').RaspiIO;

// Other Modules
const exec = require('child_process').exec;
const imaps = require('imap-simple');
const simpleParser = require('mailparser').simpleParser;
const _ = require('lodash');

// own fns
const imapData = require('./imapData').imapData;
const icon = require('./matrix-icons');

let config = {
    imap: {
        user: imapData.user,
        password: imapData.password,
        host: imapData.host,
        port: 993,
        tls: true,
        authTimeout: 3000
    }
}

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

let printerReady = false;
let j5Ready = false;

let holdCounter = 0;

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
        printerReady = true;
        console.log('Printer ready 🖨');
        resetPrinterSettings();

        printer
            .printLine('// LittlePrinter is ready')
            .printLine(' ')
            .print(function() {
                resetPrinterSettings();
            });
    });
});


// IMAP –––––––––
function checkMails(){

    console.log('Checking for Mails ✉️');
    sinusAnim( icon.sinus , 3000 );

    imaps.connect(config).then(function (connection) {
        return connection.openBox('INBOX',false).then(function () {
            var delay = 24 * 3600 * 7; // check the last 7 days
            var yesterday = new Date();
            yesterday.setTime(Date.now() - delay);
            yesterday = yesterday.toISOString();
            var searchCriteria = ['UNSEEN', ['SINCE', yesterday]];
            var fetchOptions = {
                bodies: ['HEADER', 'TEXT', ''],
            };
            return connection.search(searchCriteria, fetchOptions).then(function (messages) {

                setTimeout( function(){
                    if(messages.length > 0){
                        console.log('You got mail 📬');
                        showIconFor(icon.check , 2000);
                    }else{
                        console.log('No new mail, sorry 📭');
                        showIconFor(icon.x , 2000);
                    }
                }, 3000);

                messages.forEach(function (item) {
                    var all = _.find(item.parts, { "which": "" })
                    var id = item.attributes.uid;
                    var idHeader = "Imap-Id: "+id+"\r\n";

                    simpleParser(idHeader+all.body, (err, mail) => {
                        printMail( mail );
                    });

                    // set mail to seen
                    connection.addFlags(item.attributes.uid, "\Seen");
                });
            });
        });
    });
}

// init Johnny-five
board.on('ready', () => {

    j5Ready = true;
    console.log('J5 Ready 🤖');

    // Setup hardware
    matrix = new five.Led.Matrix({
        addresses: [0x70],
        controller: "HT16K33",
        rotation: 1
    });

    let btn = new five.Button({
        pin: "P1-13",
        isPullup: true
    });


    btn.on("hold", function() {
        console.log( holdCounter );
        holdCounter++;
        if ( holdCounter >= 6 ) {
            shutdownLittlePrinter();
        }
    });
    btn.on("release", function(){
        holdCounter = 0;
    });
    btn.on('press', function(){
        checkMails();
    });

    // Run code
    matrix.clear();


    // check for mail every half hour
    let intervalTime = 60 * 60 * 1000 / 2;
    setInterval(checkMails, intervalTime);

});


function printMail( mail ){

    console.log('Printing Mail');
    //sinusAnim( icon.sinus , 3000 );

    printer
        .horizontalLine(16)
        .printLine(' ')
        .bold(true)
        .printLine(mail.from.text)
        .bold(false)
        .printLine(' ')
        //.printLine(mail.subject)
        .printLine(mail.text)
        .printLine(' ')
        .printLine(' ')
        .print(function() {
            resetPrinterSettings();
        });
}



function shutdownLittlePrinter(){
    console.log('LittlePrinter is shutting down 😴');
    shutdown(function(output){
        console.log(output);
    });
    //process.exit();
}
function shutdown(callback){
    exec('shutdown now', function(error, stdout, stderr){ callback(stdout); });
}


// Matrix functions
function showIconFor( icon , duration ) {

    matrix.clear();
    matrix.draw(icon);

    setTimeout(function(){
        matrix.clear();
    }, duration);
}

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