// Modules Printer
const SerialPort = require('serialport');
const Printer = require('thermalprinter');
var fs = require('fs');
// const exec = require('child_process').exec;

// Modules Hardware
const five  = require('johnny-five');
const Raspi = require('raspi-io').RaspiIO;

const icon = require('./Components/matrix-icons');
const anims = require('./Components/matrixFns');
const firebase = require('firebase');
const firebaseConfig = require('dotenv').config();

let firestore = null;

const config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

if (!firebase.apps.length) {

  firestore = firebase.initializeApp(config).firestore()
  messagesDB = firestore.collection('Messages');

  console.log('Firebase initialised 🔥')
}

let readCounter = 0;
let readData = [];

const databaseFile = './Components/readData.txt';

fs.readFile(databaseFile,'utf8', (err, data) => {
  if( err ){
    // do nothing
  }
  console.log('fetched array')
  if( data ){
    readData = data.split(",");
  }
});


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

});



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
        console.log('LittlePrinter is ready');
      });
  });
});


let observer = messagesDB.onSnapshot(snapshot => {

  anims.sinusAnim( matrix, icon.sinus , 500 );

  snapshot.forEach(doc => {

    if( readData.length > 0 && readData.indexOf(doc.id) <= -1 ){

      let d = new Date( doc.data().Date.seconds * 1000)//.toLocaleString("de-DE", {timeZone: "Australia/Brisbane"});
      let printDate = d.getFullYear().toString().substring(2) + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + +d.getHours() + ":" + d.getMinutes();

      let printName = doc.data().Name;
      let addOnSpaces = 17 - printName.length;
      for( let i = 0; i < addOnSpaces; i++ ){
        printName = printName + ' ';
      }

      if( printName.length > 17 ){
        printName = printName.slice(0, ( 17 - printName.length ) );
      }

      printer
        .horizontalLine(16)
        .printLine(printName + ' ' + printDate)
        .printLine('------')
        .printLine(doc.data().Message)
        .printLine(' ')
        .printLine(' ')
        .print(function() {
          resetPrinterSettings();
          console.log('Printed Message', doc.data().Message);
          // initIntervals();
        });

      readData.push( doc.id );
      console.log('wrote file')
      fs.writeFile(databaseFile, readData.join(','), (err) => {
        if (err) {
          console.log('❌ Error')
        };
        console.log('The file has been saved!');
      });
    }

    if( readCounter === 0 ){
      readData.push( doc.id )
    }

  });

  if( readCounter === 0 && readData.length <= 0 ){
    fs.writeFile(databaseFile, readData.join(','), (err) => {
      if (err) {
        console.log('❌ Error')
      };
      console.log('The file has been saved!');
    });
  }

  readCounter++;
}, err => {
  console.log(`Encountered error: ${err}`);
});

// function shutdownLittlePrinter(){
//   console.log('LittlePrinter is shutting down 😴');
//   // matrix.draw(icon.boot);

//   setTimeout( function(){
//     // matrix.clear();
//     shutdown(function(output){
//       console.log(output);
//     });
//   }, 1200);
//   //process.exit();
// }
// function shutdown(callback){
//   exec('shutdown now', function(error, stdout, stderr){ callback(stdout); });
// }
