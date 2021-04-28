let AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;
let dspNodes;
let mergeChannelNode;
let convolverNode;
let splitChannelNode;
let gainNode;
let audioOnNode;

let gain = 0.80;
let mousedownToStrum = false;
let mouseIsDown = false;

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
document.body.addEventListener('keydown', e => {fretting(e, true)});
document.body.addEventListener('keyup', e => {fretting(e, false)});
document.body.addEventListener('mousedown', e => {mouseIsDown = true});
document.body.addEventListener('mouseup', e => {mouseIsDown = false});

window.onload = resizeCanvas;
window.onresize = resizeCanvas;

var stringHeight;

const nStrings = 8;

//let fretsDown = [false, false, false, false, false, false, false, false, false, false, false, false, false, false];
//let fretTuning = [0.1111, 0.2099, 0.25, 0.3333, 0.4074, 0.4733, 0.5, 0.1111, 0.2099, 0.25, 0.3333, 0.4074, 0.4733, 0.5];
let fretTuning = [0.1111, 0.2099, 0.25, 0.3333, 0.4074, 0.4733, 0.5];
let fretsDown = Array(fretTuning.length).fill(false);

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
        this.canvas.className = "LangString";
        this.canvas.style.height = this.height + "px";
        this.parent.appendChild(this.canvas);

        this.canvas.onmouseleave = (e) => {
            if (!(mousedownToStrum && !mouseIsDown)) {
                var rect = e.target.getBoundingClientRect();
                var pos = (e.clientX - rect.left) / rect.width;
                play(this.number, pos);
                this.force = 5;
            }
        }
        
        this.ctx = this.canvas.getContext("2d");
        this.render();
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = "#000000";
        this.ctx.lineWidth = 4;
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

function resizeCanvas() {
    var canvas = document.getElementById("langeleikBody");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}

function buildLangeleik() {

    var canvas = document.getElementById("langeleikBody");
    stringHeight = canvas.clientHeight / 20;

    var langStrings = new Array(nStrings);
    var stringDiv = document.createElement("div");
    stringDiv.id = "StringDiv";
    stringDiv.style.height = 8*stringHeight + "px";
    stringDiv.style.paddingTop = 4*stringHeight + "px";
    lang.appendChild(stringDiv);

    // Inital stuff if we want to draw the langeleik
    // // var ctx = canvas.getContext("2d");
    // // var gradient = ctx.createLinearGradient(0,0,200,0);
    // // gradient.addColorStop(0, "#964B00");
    // // gradient.addColorStop(1, "#873C00");
    // // ctx.fillStyle = gradient;
    // // var cw = canvas.width;
    // // var ch = canvas.height;
    // // ctx.beginPath();
    // // ctx.moveTo(0,0.1*ch);
    // // ctx.arcTo(0.2*cw, 0.05*ch, 0.25*cw, 0, 0);
    // // ctx.arcTo(0.35*cw, 0.05*ch, 0.50*cw, 0, 0);
    // // ctx.arcTo(0.45*cw, 0.10*ch, 0.75*cw, 0.2*ch, 0);
    // // ctx.lineTo(cw, 0.2*ch);
    // // ctx.lineTo(cw, 0.8*ch);
    // // ctx.lineTo(0.75*cw, 0.8*ch);
    // // ctx.lineTo(0.50*cw, ch);
    // // ctx.lineTo(0.25*cw, ch);
    // // ctx.lineTo(0.0, 0.9*ch);
    // // ctx.lineTo(0,0);
    // // ctx.fill();
    // // ctx.stroke();

    for (var i = nStrings-1; i >= 0; i--) {
        langStrings[i] = new LangString(stringHeight, canvas.clientWidth, i, stringDiv);
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
    var button = document.getElementById("playbutton");
    button.onclick = () => {
        this.buildLangeleik();
        this.lang.removeChild(button);
    }
    var instructionsButton = document.getElementById("instructionsButton");
    instructionsButton.onclick = () => {
        console.log("Show instructions");
    }
    var soundCheckbox = document.getElementById("soundCheckbox");
    soundCheckbox.oninput = () => {
        if (soundCheckbox.checked == true) {
            audioOnNode.gain.setValueAtTime(1.0, audioCtx.currentTime);
        } else {
            audioOnNode.gain.setValueAtTime(0.0, audioCtx.currentTime);
        }
    }
    var gainSlider = document.getElementById("gainSlider");
    gainSlider.oninput = () => {
        gain = gainSlider.value / 100.0;
        gainNode.gain.setValueAtTime(gain, audioCtx.currentTime);
    }
    var mousedownCheckbox = document.getElementById("mousedownCheckbox");
    mousedownCheckbox.oninput = () => {
        mousedownToStrum = mousedownCheckbox.checked;
    }
}

function drawFrets() 
{
    var canvas = document.getElementById("langeleikBody");
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fretsDown.forEach((down, idx) => {
        if(down) {
            var fretPosX = canvas.width * fretTuning[idx];
            ctx.beginPath();
            ctx.arc(fretPosX, (12*stringHeight)+10, stringHeight, 0, 2 * Math.PI);
            ctx.fillStyle = "rgba(128,128,128, 0.3)";
            ctx.strokeStyle = "black";
            ctx.stroke();
            ctx.fill();
        }
    });
}

async function init()
{
    audioCtx = new AudioContext();
    
    dspNodes = new Array(nStrings);
    await audioCtx.audioWorklet.addModule('string-processors.js');

    mergeChannelNode = audioCtx.createChannelMerger(8);
    convolverNode = audioCtx.createConvolver();
    // Load impulse response
    let IR = await fetch("./IR.wav");
    let IRbuffer = await IR.arrayBuffer();
    convolverNode.buffer = await audioCtx.decodeAudioData(IRbuffer);
    gainNode = audioCtx.createGain();
    gainNode.gain.value = gain;
    audioOnNode = audioCtx.createGain();
    audioOnNode.gain.value = 1.0;
    splitChannelNode = audioCtx.createChannelSplitter(2);

    let stringLengths = [0.85, 0.80, 0.75, 0.71, 0.66, 0.52, 0.57, 0.53];
    // let stringFrequencies = [440.0, 440.0, 440.0, 440.0, 659.25, 554.37, 659.25, 554.37]; // Tuning from book +1 octave
    let stringFrequencies = [220.0, 220.0, 220.0, 220.0, 329.63, 220.0, 277.18, 329.63]; // Tuning from book +0 octave

    dspNodes[0] = new AudioWorkletNode(audioCtx, 'melodystring-processor', {
        processorOptions: {
            fs: audioCtx.sampleRate,
            length: stringLengths[0],
            frequency: stringFrequencies[0],
            radius: 4.6e-4,
            fretPos: fretTuning
        }
    });

    stringGain = 100;
    stringGainNode = audioCtx.createGain();
    stringGainNode.gain.value = stringGain;
    dspNodes[0].connect(stringGainNode);
    stringGainNode.connect(mergeChannelNode);

    for (let i = 1; i < nStrings; i++) {
        dspNodes[i] = new AudioWorkletNode(audioCtx, 'string-processor', {
            processorOptions: {
                fs: audioCtx.sampleRate,
                length: stringLengths[i],
                frequency: stringFrequencies[i],
                radius: 4.6e-4,
            }
        });

        stringGainNode = audioCtx.createGain();
        stringGainNode.gain.value = stringGain;
        dspNodes[i].connect(stringGainNode);
        stringGainNode.connect(mergeChannelNode);
    }
    
    mergeChannelNode.connect(convolverNode);
    convolverNode.connect(gainNode);
    gainNode.connect(audioOnNode);
    audioOnNode.connect(splitChannelNode);
    splitChannelNode.connect(audioCtx.destination);
}

function createPluckNode(maxForce, pluckDur)
{
    let pluckNode = audioCtx.createBufferSource();
    let pluckDurSamples = Math.round(pluckDur * audioCtx.sampleRate);
    let pluckBuffer = audioCtx.createBuffer(1, pluckDurSamples, audioCtx.sampleRate);
    let buffer = pluckBuffer.getChannelData(0);
    for (var n = 0; n < pluckDurSamples; n++) {
        buffer[n] = maxForce / 2 * (1 - Math.cos(Math.PI * n / pluckDurSamples));
    }
    pluckNode.buffer = pluckBuffer;
    return pluckNode;
}

async function play(i, inputPoint)
{
    if (!audioCtx) await init();

    let pluckDur = 0.005;
    let pluckForce = 1;
    let pluckNode = createPluckNode(pluckForce, pluckDur);
    dspNodes[i].parameters.get('pluckingpoint').setValueAtTime(inputPoint, audioCtx.currentTime);
    pluckNode.connect(dspNodes[i]);
    pluckNode.start(audioCtx.currentTime);
}

function fretting(e, down) {
    // Diatonic major scale pythagorean tuning
        switch (e.code) {
        //case "KeyM":
                //fretsDown[13] = down;
            //break;
        //case "KeyN":
                //fretsDown[12] = down;
            //break;
        //case "KeyB":
                //fretsDown[11] = down;
            //break;
        //case "KeyV":
                //fretsDown[10] = down;
            //break;
        //case "KeyC":
                //fretsDown[9] = down;
            //break;
        //case "KeyX":
                //fretsDown[8] = down;
            //break;
        //case "KeyZ":
                //fretsDown[7] = down;
            //break;
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
    for (let i = 0; i < fretsDown.length; i++)
    {
        if (fretsDown[i]) dspNodes[0].parameters.get(`fret${i}pressed`).value = 1;
        else              dspNodes[0].parameters.get(`fret${i}pressed`).value = 0;
    }
    drawFrets();
}