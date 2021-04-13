let AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;
let dspNodes;
let mergeChannelNode;
let convolverNode;
let splitChannelNode;

window.requestAnimFrame = (function() {
    return  window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 1000 / 60);
            };
  })();
  
var lang = document.getElementById("langeleik");
document.body.addEventListener('keydown', function(e) {fretting(e, true)});
document.body.addEventListener('keyup', function(e) {fretting(e, false)});

const w = lang.clientWidth;
const h = lang.clientHeight;

const nStrings = 8;

let fretsDown = [false, false, false, false, false, false, false, false, false, false, false, false, false, false];
let fretTuning = [0.1111, 0.2099, 0.25, 0.3333, 0.4074, 0.4733, 0.5, 0.1111, 0.2099, 0.25, 0.3333, 0.4074, 0.4733, 0.5];

class LangString {
    constructor(height, width, number, parent) {
        this.height = height;
        this.width = width;
        this.number = number;
        this.parent = parent;
        this.x = 0;
        this.y = this.height;
        this.a = 0;
        this.force = 0;


        this.canvas = document.createElement("canvas");
        this.canvas.id = "LangString-" + this.number;
        this.canvas.style.width = "inherit";
        this.canvas.style.height = this.height + "px";
        this.canvas.style.position = "relative";
        this.parent.appendChild(this.canvas);

        this.canvas.onmouseleave = (e) => {
            var rect = e.target.getBoundingClientRect();
            var pos = (e.clientX - rect.left) / rect.width;
            play(this.number, pos);
            this.force = 5;
        }
        
        this.ctx = this.canvas.getContext("2d");
        this.render();
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = "#000000";
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
        this.ctx.bezierCurveTo(
        this.x, this.y + Math.sin(this.a) * this.force * 2,
        this.x + this.width, this.y + Math.sin(this.a) * this.force * 2,
        this.x + this.width, this.y);
        this.ctx.stroke();
        this.force *= 0.99;
        this.a += 0.5;
    }
}

    this.buildSplashScreen();

function buildLangeleik() {
    const stringHeight = h / 20;

    var langStrings = new Array(nStrings);
    for (var i = nStrings-1; i >= 0; i--) {
        langStrings[i] = new LangString(stringHeight, w*0.5, i, lang);
    }
    
    function render() {
        requestAnimationFrame(() => {render()});
        langStrings.forEach(langString => {
            langString.render();
        });
    }

    init();
    render();
}

function buildSplashScreen() {
    var button = document.createElement("button");
    button.innerHTML = "Play the Langeleik";
    button.className = "playbutton";
    this.lang.appendChild(button);
    button.onclick = () => {
        this.buildLangeleik();
        this.lang.removeChild(button);
    }
}


async function init()
{
    audioCtx = new AudioContext();
    
    dspNodes = new Array(nStrings);
    await audioCtx.audioWorklet.addModule('stiffstring-processor.js');

    mergeChannelNode = audioCtx.createChannelMerger(8);
    convolverNode = audioCtx.createConvolver();
    // Load impulse response
    let IR = await fetch("./IR.wav");
    let IRbuffer = await IR.arrayBuffer();
    convolverNode.buffer = await audioCtx.decodeAudioData(IRbuffer);
    splitChannelNode = audioCtx.createChannelSplitter(2);

    let stringLengths = [0.85, 0.80, 0.75, 0.71, 0.66, 0.52, 0.57, 0.53];
    let stringFrequencies = [440.0, 440.0, 440.0, 440.0, 659.25, 554.37, 659.25, 554.37]; // Tuning from book +1 octave
    // let stringFrequencies = [220.0, 220.0, 220.0, 220.0, 329.63, 220.0, 277.18, 329.63]; // Tuning from book +0 octave

    for (let i = 0; i < nStrings; i++) {
        dspNodes[i] = new AudioWorkletNode(audioCtx, 'stiffstring-processor', {
            processorOptions: {
                fs: audioCtx.sampleRate,
                length: 1,
                frequency: stringFrequencies[i],
                radius: (i+1) * 2.2e-4,
            }
        });

        dspNodes[i].connect(mergeChannelNode);
    }
    
    mergeChannelNode.connect(convolverNode);
    convolverNode.connect(splitChannelNode);
    splitChannelNode.connect(audioCtx.destination);
}

async function play(i, inputPoint)
{
    if (!audioCtx) await init();
    let strumForceNode = audioCtx.createBufferSource();
    let strumBuffer = audioCtx.createBuffer(1, 128, audioCtx.sampleRate);
    let buffer = strumBuffer.getChannelData(0);
    let point = Math.abs(Math.floor(128*inputPoint));
    // Let's do some Hann windowing for strumming
    let hann = [0.0, 0.5, 1, 0.5, 0.0];
    let windowCounter = 0;
    for (var n = 0; n < 128; n++) {
        if (n >= point-2 && n <= point+2) {
            buffer[n] = hann[windowCounter];
            windowCounter++;
        } else {
            buffer[n] = 0;
        }
    }
    strumForceNode.buffer = strumBuffer;
    strumForceNode.connect(dspNodes[i]);
    strumForceNode.start(audioCtx.currentTime);
}

function fretting(e, down) {
    // Diatonic major scale pythagorean tuning
        switch (e.code) {
        case "KeyM":
                fretsDown[13] = down;
            break;
        case "KeyN":
                fretsDown[12] = down;
            break;
        case "KeyB":
                fretsDown[11] = down;
            break;
        case "KeyV":
                fretsDown[10] = down;
            break;
        case "KeyC":
                fretsDown[9] = down;
            break;
        case "KeyX":
                fretsDown[8] = down;
            break;
        case "KeyZ":
                fretsDown[7] = down;
            break;
        case "KeyJ":
                fretsDown[6] = down;
            break;
        case "KeyH":
                fretsDown[5] = down;
            break;
        case "KeyG":
                fretsDown[4] = down;
            break;
        case "KeyF":
                fretsDown[3] = down;
            break;
        case "KeyD":
                fretsDown[2] = down;
            break;
        case "KeyS":
                fretsDown[1] = down;
            break;
        case "KeyA":
                fretsDown[0] = down;
            break;
        default:
            break;
    }   
    let fret = fretsDown.lastIndexOf(true);
    if (fret >= 0) {
        dspNodes[0].parameters.get('frettingpoint').setValueAtTime(fretTuning[fret], audioCtx.currentTime);
    }
    else {
        dspNodes[0].parameters.get('frettingpoint').setValueAtTime(0.0, audioCtx.currentTime);
    }
}