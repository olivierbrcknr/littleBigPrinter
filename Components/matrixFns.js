
// Matrix functions
function showIconFor( matrix, icon , duration ) {

    matrix.clear();
    matrix.draw(icon);

    setTimeout(function(){
        matrix.clear();
    }, duration);
}

function sinusAnim( matrix, icon , duration ) {

    const time = 30;

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

function pulse( matrix, icon , pulses , speed ) {

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


module.exports.sinusAnim = sinusAnim;
