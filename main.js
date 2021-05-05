let AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;
let dspNodes;
let stringGainNodes;
let mergeChannelNode;
let dryGainNode;
let wetGainNode;
let convolverNode;
let splitChannelNode;
let gainNode;
let audioOnNode;

let gain = 0.80;
let mousedownToStrum = false;
let mouseIsDown = false;

const nStrings = 8;
const nFrets = 14;

// Advanced parameters
let advancedParametersEnabled = true;
let controlSliders = new Array();
let wetMix = 0.8;
let K = 1e14;
let alpha = 3.0;
let maxStrumForce = 10;
let strumDurationDivider = 10;
let stringGainVal = new Array(nStrings).fill(100);
let fingerStartVal = new Array(nFrets).fill(5e-3);
let fingerStopVal = new Array(nFrets).fill(-1e-3);
let initialFingerVVal = new Array(nFrets).fill(-5);
let fingermassVal = new Array(nFrets).fill(1e-4);

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

//let fretsDown = [false, false, false, false, false, false, false, false, false, false, false, false, false, false];
let fretTuning = [0.1091, 0.2063, 0.2508, 0.3326, 0.4054, 0.4703, 0.5, 0.5546, 0.6032, 0.6254, 0.6663, 0.7027, 0.7351, 0.75]; // ((L-PrevFret)/17.817)+PrevFret
// let fretTuning = [0.1111, 0.2099, 0.25, 0.3333, 0.4074, 0.4733, 0.5]; // Pythagorean
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
        this.mouseentertime = 0;

        this.canvas = document.createElement("canvas");
        this.canvas.id = "LangString-" + this.number;
        this.canvas.className = "LangString";
        this.canvas.style.height = this.height + "px";
        this.parent.appendChild(this.canvas);

        this.canvas.onmouseenter = (e) => {
            if (!(mousedownToStrum && !mouseIsDown)) {
                this.mouseentertime = Date.now();
            }
        }

        this.canvas.onmouseleave = (e) => {
            if (!(mousedownToStrum && !mouseIsDown)) {
                var duration = Date.now() - this.mouseentertime;
                var rect = e.target.getBoundingClientRect();
                var pos = (e.clientX - rect.left) / rect.width;
                play(this.number, pos, duration);
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

class ControlSlider {
    constructor(parent, label, func, min, max, value, step=1.0, index=0) {
        this.box = document.createElement("div");
        this.box.className = "controls";
        this.box.innerHTML = label;
        this.slider = document.createElement("input");
        this.slider.id = label;
        this.slider.type = "range";
        this.slider.step = step;
        this.slider.min = min;
        this.slider.max = max;
        this.slider.value = value;
        this.index = index;
        this.func = func;
        this.slider.oninput = () => {
            this.func(this.slider.value, this.index);
        }
        this.box.appendChild(this.slider);
        parent.appendChild(this.box);

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

    for (var i = nStrings-1; i >= 0; i--) {
        langStrings[i] = new LangString(stringHeight, canvas.clientWidth, i, stringDiv);
    }
    
    function render() {
        requestAnimationFrame(() => {render()});
        langStrings.forEach(langString => {
            langString.render();
        });
    }

    // Advanced parameters
    var advancedSettings = document.createElement("div");
    advancedSettings.className = "footer";
    advancedSettings.id = "advancedSettings";
    controlSliders.push(new ControlSlider(advancedSettings,"IR wet", setWetMix, 0.0, 1.0, wetMix, 0.01));
    controlSliders.push(new ControlSlider(advancedSettings,"K", setKValue, 1e12, 1e16, K));
    controlSliders.push(new ControlSlider(advancedSettings,"Alpha", setAlpha, 1.0, 4.0, alpha, 0.01));
    controlSliders.push(new ControlSlider(advancedSettings,"Max. strum force", 
        (val) => {
            maxStrumForce = val;
        }, 1, 100, maxStrumForce));
    controlSliders.push(new ControlSlider(advancedSettings,"Strum dur. div.", 
        (val) => {
            strumDurationDivider = val;
        }, 0.1, 20, strumDurationDivider, 0.1));
    for(var i = 0; i < nStrings; i++) {
        controlSliders.push(new ControlSlider(advancedSettings,"string " + i + " gain", 
        (val, index) => {
            stringGainVal[index] = val;
            stringGainNodes[index].gain.setValueAtTime(val, audioCtx.currentTime); 
        }, 1, 1000, stringGainVal[i], 1, i));
    }    
    for(var i = 0; i < nFrets; i++) {
        var fretName = "F"+(i+1) + ": ";
        controlSliders.push(new ControlSlider(advancedSettings,fretName+"fingerStart", 
        (val, index) => {
            fingerStartVal[index] = val;
            dspNodes[0].parameters.get(`fret${index}fingerstart`).setValueAtTime(val, audioCtx.currentTime); 
        }, 1e-3, 1e-2, fingerStartVal[i], 1e-4, i));
        controlSliders.push(new ControlSlider(advancedSettings,fretName+"fingerStop", 
        (val, index) => {
            fingerStopVal[index] = val;
            dspNodes[0].parameters.get(`fret${index}fingerstop`).setValueAtTime(val, audioCtx.currentTime); 
        }, -1e-2, -1e-3, fingerStopVal[i], 1e-4, i));
        controlSliders.push(new ControlSlider(advancedSettings,fretName+"initialFingerV", 
        (val, index) => {
            initialFingerVVal[index] = val;
            dspNodes[0].parameters.get(`fret${index}initialfingerv`).setValueAtTime(val, audioCtx.currentTime); 
        }, -10, -2, initialFingerVVal[i], 0.1, i));
        controlSliders.push(new ControlSlider(advancedSettings,fretName+"fingerMass", 
        (val, index) => {
            fingermassVal[index] = val;
            dspNodes[0].parameters.get(`fret${index}fingermass`).setValueAtTime(val, audioCtx.currentTime); 
        }, 1e-4, 1e-2, fingermassVal[i], 1e-5, i));
    }

    let body = document.getElementsByTagName("BODY")[0];
    body.appendChild(advancedSettings);
    let saveButton = document.createElement("button");
    saveButton.innerHTML = "Save values";
    saveButton.onclick = () => {
        var v = {};
        v["wetMix"] = wetMix;
        v["K"] = K;
        v["alpha"] = alpha;
        v["maxStrumForce"] = maxStrumForce;
        v["strumDurationDivider"] = strumDurationDivider;
        for(var i = 0; i < nStrings; i++){
            v["stringGainVal_"+i] = stringGainVal[i];
        }
        for(var i = 0; i < nFrets; i++){
            v["fingerStartVal_"+i] = fingerStartVal[i];
            v["fingerStopVal_"+i] = fingerStopVal[i];
            v["initialFingerVVal_"+i] = initialFingerVVal[i];
            v["fingermassVal_"+i] = fingermassVal[i];
        }
        console.log(v);
        var json = JSON.stringify(v, null, 2);
        console.log(json);
        download("langeleik.json", json);
    }
    advancedSettings.appendChild(saveButton);
    advancedSettings.style.visibility = "hidden";

    document.getElementById("generalControls").style.visibility = "visible";
    init();
    drawFrets();
    render();
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
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
    var showAdvancedParametersCheckbox = document.getElementById("advancedParametersCheckbox");
    showAdvancedParametersCheckbox.oninput = () => {
        document.getElementById("advancedSettings").style.visibility = showAdvancedParametersCheckbox.checked ? "visible" : "hidden";
    }
}

function setWetMix(val) {
    wetMix = val;
    dryGainNode.gain.setValueAtTime(1.0-wetMix, audioCtx.currentTime);
    wetGainNode.gain.setValueAtTime(wetMix, audioCtx.currentTime);
}

function setKValue(val) {
    K = val;
    dspNodes[0].parameters.get("K").setValueAtTime(K, audioCtx.currentTime);
}

function setAlpha(val) {
    alpha = val;
    dspNodes[0].parameters.get("alpha").setValueAtTime(alpha, audioCtx.currentTime);
}

function drawFrets() 
{
    var canvas = document.getElementById("langeleikBody");
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var fretWidth = canvas.width / 80;
    fretsDown.forEach((down, idx) => {
        var fretPosX = canvas.width * fretTuning[idx];
        ctx.beginPath()
        ctx.fillStyle = "#582817";
        ctx.fillRect(fretPosX-fretWidth/2, (12*stringHeight)-3, fretWidth, stringHeight);
        if(down) {
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
    stringGainNodes = new Array(nStrings);
    await audioCtx.audioWorklet.addModule('string-processors.js');

    mergeChannelNode = audioCtx.createChannelMerger(8);
    convolverNode = audioCtx.createConvolver();
    // Load impulse response
    let IR = await fetch("./IR.wav");
    let IRbuffer = await IR.arrayBuffer();
    dryGainNode = audioCtx.createGain();
    dryGainNode.gain.value = 1 - wetMix;
    wetGainNode = audioCtx.createGain();
    wetGainNode.gain.value = wetMix;
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

    stringGainNodes[0] = audioCtx.createGain();
    stringGainNodes[0].gain.value = stringGainVal[0];
    dspNodes[0].connect(stringGainNodes[0]);
    stringGainNodes[0].connect(mergeChannelNode);

    for (let i = 1; i < nStrings; i++) {
        dspNodes[i] = new AudioWorkletNode(audioCtx, 'string-processor', {
            processorOptions: {
                fs: audioCtx.sampleRate,
                length: stringLengths[i],
                frequency: stringFrequencies[i],
                radius: 4.6e-4,
            }
        });

        stringGainNodes[i] = audioCtx.createGain();
        stringGainNodes[i].gain.value = stringGainVal[i];
        dspNodes[i].connect(stringGainNodes[i]);
        stringGainNodes[i].connect(mergeChannelNode);
    }
    
    mergeChannelNode.connect(wetGainNode);
    mergeChannelNode.connect(dryGainNode);
    wetGainNode.connect(convolverNode);
    dryGainNode.connect(gainNode);
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

async function play(i, inputPoint, duration)
{
    if (!audioCtx) await init();

    let pluckForce = Math.max((maxStrumForce-duration/strumDurationDivider), 0.1)
    let pluckDur = 0.0005;
    let pluckNode = createPluckNode(pluckForce, pluckDur);
    dspNodes[i].parameters.get('pluckingpoint').setValueAtTime(inputPoint, audioCtx.currentTime);
    pluckNode.connect(dspNodes[i]);
    pluckNode.start(audioCtx.currentTime);
}

function fretting(e, down) {
    // Tuning: https://archive.siam.org/careers/pdf/guitar.pdf
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
    for (let i = 0; i < fretsDown.length; i++)
    {
        if (fretsDown[i]) dspNodes[0].parameters.get(`fret${i}pressed`).value = 1;
        else              dspNodes[0].parameters.get(`fret${i}pressed`).value = 0;
    }
    drawFrets();
}