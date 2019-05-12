const SerialPort = require('serialport')
let sp = new SerialPort('/dev/ttyUSB0', {
    baudRate: 19200
});
const Printer = require('thermalprinter');
 
// var path = __dirname + '/images/nodebot.png';
 
sp.on('open',function() {
    var printer = new Printer(sp);
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
                console.log('done');
                process.exit();
            });
    });
});