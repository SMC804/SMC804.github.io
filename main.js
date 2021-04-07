let AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;
let dspNodes;
let mergeChannelNode;
let convolutionNode;
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

let fretsDown = [false, false, false, false, false, false, false];
let fretTuning = [0.1111, 0.2099, 0.25, 0.3333, 0.4074, 0.4733, 0.5];

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
    for (var i = 0; i < nStrings; i++) {
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
    convolutionNode = audioCtx.createConvolver();
    splitChannelNode = audioCtx.createChannelSplitter(2);

    // let stringLengths = [0.85, 0.80, 0.75, 0.71, 0.66, 0.52, 0.57, 0.53];
    // let stringFrequencies = [110.0, 110.0, 138.59, 164.81, 220.0, 277.18, 329.63, 440.0];
    let stringFrequencies = [220.0, 220.0, 277.18, 329.63, 220.0, 277.18, 329.63, 440.0];
    // let stringFrequencies = [220.0, 277.18, 329.63, 220.0, 277.18, 329.63, 440.0, 220.0];

    for (let i = 0; i < nStrings; i++) {
        dspNodes[i] = new AudioWorkletNode(audioCtx, 'stiffstring-processor', {
            processorOptions: {
                fs: audioCtx.sampleRate,
                length: 1,
                frequency: stringFrequencies[i],
                radius: (i+1) * 1.5e-4,
            }
        });

        dspNodes[i].connect(mergeChannelNode);
    }
    
    mergeChannelNode.connect(splitChannelNode);
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
    let hann = [0.25, 0.75, 1, 0.75, 0.25];
    let windowCounter = 0;
    for (var n = 0; n < 128; n++) {
        if (n >= point-2 && n <= point+2) {
            buffer[n] = hann[windowCounter]*0.5;
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
    console.log(e.code, down);
    switch (e.code) {
        case "KeyJ":
            if(down) {
                dspNodes[0].parameters.get('frettingpoint').setValueAtTime(fretTuning[6], audioCtx.currentTime);
                fretsDown[6] = true;
            } else {
                fretsDown[6] = false;
            }
            break;
        case "KeyH":
            if(down) {
                dspNodes[0].parameters.get('frettingpoint').setValueAtTime(fretTuning[5], audioCtx.currentTime);
                fretsDown[5] = true;
            } else {
                fretsDown[5] = false;
            }
            break;
        case "KeyG":
            if(down) {
                dspNodes[0].parameters.get('frettingpoint').setValueAtTime(fretTuning[4], audioCtx.currentTime);
                fretsDown[4] = true;
            } else {
                fretsDown[4] = false;
            }
            break;
        case "KeyF":
            if(down) {
                dspNodes[0].parameters.get('frettingpoint').setValueAtTime(fretTuning[3], audioCtx.currentTime);
                fretsDown[3] = true;
            } else {
                fretsDown[3] = false;
            }
            break;
        case "KeyD":
            if(down) {
                dspNodes[0].parameters.get('frettingpoint').setValueAtTime(fretTuning[2], audioCtx.currentTime);
                fretsDown[2] = true;
            } else {
                fretsDown[2] = false;
            }
            break;
        case "KeyS":
            if(down) {
                dspNodes[0].parameters.get('frettingpoint').setValueAtTime(fretTuning[1], audioCtx.currentTime);
                fretsDown[1] = true;
            } else {
                fretsDown[1] = false;
            }
            break;
        case "KeyA":
            if(down) {
                dspNodes[0].parameters.get('frettingpoint').setValueAtTime(fretTuning[0], audioCtx.currentTime);
                fretsDown[0] = true;
            } else {
                fretsDown[0] = false;
            }
            break;
        default:
            break;
    }   
    if (fretsDown.every((val) => val === false)) {
        dspNodes[0].parameters.get('frettingpoint').setValueAtTime(0.0, audioCtx.currentTime);
    }
}