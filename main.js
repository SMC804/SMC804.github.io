// Web Audio Context object
let AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

// Web Audio processing nodes
let dspNodes;
let stringGainNodes;
let mergeChannelNode;
let dryGainNode;
let wetGainNode;
let convolverNode;
let splitChannelNode;
let gainNode;
let audioOnNode;

// Parameters
let gain = 0.80;
let mousedownToStrum = false;
let mouseIsDown = false;
const nStrings = 8;
const nFrets = 14;
var stringHeight;
let fretTuning = [0.1091, 0.2063, 0.2508, 0.3326, 0.4054, 0.4703, 0.5,
                  0.5546, 0.6032, 0.6254, 0.6663, 0.7027, 0.7351, 0.75];
let fretKeys = ["B", "C#", "D", "E", "F#", "G#", "A",
                "B", "C#", "D", "E", "F#", "G#", "A"];
let fretsDown = Array(fretTuning.length).fill(false);
let stringLengths = [0.85, 0.80, 0.75, 0.71, 0.66, 0.57, 0.53, 0.52];
let stringFrequencies = [220.0, 220.3, 220.6, 220.9, 329.63, 440.0, 277.18, 329.63];

// Advanced parameters
let advancedParametersEnabled = true;
let controlSliders = new Array();
let wetMix = 0.6;
let K = 1e14;
let alpha = 3.0;
let maxStrumForce = 40;
let strumDurationDivider = 5;
let stringGainVal = new Array(nStrings).fill(70);
stringGainVal[0] = 200;
let fingerStartVal = new Array(nFrets).fill(5e-3);
let fingerStopVal = new Array(nFrets).fill(-1e-3);
let initialFingerVVal = new Array(nFrets).fill(-5);
let fingermassVal = new Array(nFrets).fill(1e-4);

// String vibration animation
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

// Bind event listeners  
var lang = document.getElementById("langeleik");
document.body.addEventListener('keydown', e => {fretting(e, true)});
document.body.addEventListener('keyup', e => {fretting(e, false)});
document.body.addEventListener('mousedown', e => {mouseIsDown = true});
document.body.addEventListener('mouseup', e => {mouseIsDown = false});

// Call the resize funtion whenever the window size changes to redraw stuff
window.onload = resizeCanvas;
window.onresize = resizeCanvas;

// Called on page load
this.buildSplashScreen();

class LangString {
    // Langeleik string class 
    // Draws the string and attaches mouse interaction events to play() function

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
    // Class for easy creation of multiple slider parameters

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

// Redraw some Langeleik elements when page size is changed
function resizeCanvas() {
    var canvas = document.getElementById("langeleikBody");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    drawFrets();
}

// Create Langeleik strings and controls
// Calls Web Audio init function
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

    // Advanced parameters ---- start ----
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
    // Advanced parameters ---- end ----

    document.getElementById("generalControls").style.visibility = "visible";
    init();
    drawFrets();
    render();
}

// Helper function so we can download all the parameter values as json
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }

// Build initial splash screen on load. 
// This is done because we cannot initialize audio in Chrome before user interaction 
function buildSplashScreen() {
    var button = document.getElementById("playbutton");
    button.onclick = () => {
        this.buildLangeleik();
        this.lang.removeChild(button);
    }
    var exampleButton = document.getElementById("exampleButton");
    exampleButton.onclick = () => {
        var overlay = document.getElementById("overlay");
        overlay.style.display = "block";
        overlay.onclick = () => {
            document.getElementById("overlay").style.display = "none";
            var iframe = document.getElementById("video");
            var src = iframe.src;
            iframe.src = src;
        }
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
        var instructions = document.getElementById("instructions");
        instructions.style.visibility = showAdvancedParametersCheckbox.checked ? "hidden" : "visible";
        instructions.style.height = showAdvancedParametersCheckbox.checked ? "0" : "auto";
        document.getElementById("advancedSettings").style.visibility =
            showAdvancedParametersCheckbox.checked ? "visible" : "hidden";
    }
}

// Control functions for some advanced parameters ---- start ----
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
// Control functions for some advanced parameters ---- end ----

// Draw the frets and corresponding notes on the melody string
function drawFrets() 
{
    var canvas = document.getElementById("langeleikBody");
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var fretWidth = canvas.width / 80;
    fretsDown.forEach((down, idx) => {
        var fretPosX = canvas.width * fretTuning[idx];
        ctx.beginPath()
        if (idx < 7) {
            ctx.fillStyle = "#FA533D";
        }
        else {
            ctx.fillStyle = "#3E8AFA";
        }

        ctx.fillRect(fretPosX-fretWidth/2, (12*stringHeight)-3, fretWidth, stringHeight*1.5);
        ctx.font = "12px Arial";
        // ctx.textAlign = "right";
        var txtYOffset = (idx % 2 == 0) ? 0 : 6; 
        ctx.fillText(fretKeys[idx],fretPosX-fretWidth/2, (14*stringHeight) + txtYOffset);
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

// Initializes Web Audio context, creates Web Audio nodes and audio routing graph
async function init()
{
    // Get audio context and initialize stuff for the string- and melody string processors
    audioCtx = new AudioContext();
    dspNodes = new Array(nStrings);
    stringGainNodes = new Array(nStrings);
    await audioCtx.audioWorklet.addModule('string-processors.js');

    // Create node to merge the eight string nodes into one channel
    mergeChannelNode = audioCtx.createChannelMerger(8);
    // Create convolver node and load impulse response for the body
    convolverNode = audioCtx.createConvolver();
    let IR = await fetch("./IR.wav");
    let IRbuffer = await IR.arrayBuffer();
    convolverNode.buffer = await audioCtx.decodeAudioData(IRbuffer);
    // Create two gain nodes for controlling the dry/wet mix of the impulse response
    dryGainNode = audioCtx.createGain();
    dryGainNode.gain.value = 1 - wetMix;
    wetGainNode = audioCtx.createGain();
    wetGainNode.gain.value = wetMix;
    // Create gain node for master gain and audio on/off 
    gainNode = audioCtx.createGain();
    gainNode.gain.value = gain;
    audioOnNode = audioCtx.createGain();
    audioOnNode.gain.value = 1.0;
    // Create node to split the output channel of the Langeleik model into two channels for stereo
    splitChannelNode = audioCtx.createChannelSplitter(2);
    // Create the melody string node
    dspNodes[0] = new AudioWorkletNode(audioCtx, 'melodystring-processor', {
        processorOptions: {
            fs: audioCtx.sampleRate,
            length: stringLengths[0],
            frequency: stringFrequencies[0],
            radius: 4.6e-4,
            fretPos: fretTuning
        }
    });
    // Create gain for the melody string node.
    stringGainNodes[0] = audioCtx.createGain();
    stringGainNodes[0].gain.value = stringGainVal[0];
    // Connect the nodes: melody string node -> gain node -> merge node
    dspNodes[0].connect(stringGainNodes[0]);
    stringGainNodes[0].connect(mergeChannelNode);

    // Create the seven drone string nodes
    for (let i = 1; i < nStrings; i++) {
        dspNodes[i] = new AudioWorkletNode(audioCtx, 'string-processor', {
            processorOptions: {
                fs: audioCtx.sampleRate,
                length: stringLengths[i],
                frequency: stringFrequencies[i],
                radius: 4.6e-4,
            }
        });

        // For each string create a gain node
        stringGainNodes[i] = audioCtx.createGain();
        stringGainNodes[i].gain.value = stringGainVal[i];
        // Connect string node -> gain node -> merge node
        dspNodes[i].connect(stringGainNodes[i]);
        stringGainNodes[i].connect(mergeChannelNode);
    }
    
    // Connect the merge node to both gain nodes in the dry/wet mix
    mergeChannelNode.connect(wetGainNode);
    mergeChannelNode.connect(dryGainNode);
    // Connect the gain node for wet mix to the convolver node
    wetGainNode.connect(convolverNode);
    // Connect both convolver node and dry gain nodes to the master gain node
    dryGainNode.connect(gainNode);
    convolverNode.connect(gainNode);
    // Connect master gain node to audio on/off gain node
    gainNode.connect(audioOnNode);
    // Connect audio on/off gain node to split channel node
    audioOnNode.connect(splitChannelNode);
    // Connect spit channel node to stereo output destination
    splitChannelNode.connect(audioCtx.destination);
}

// Returns a single one-shot buffer node with exitation force data
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

// Called by LangString UI object when strummed.
// Input is string index, strum location and duration between mouseenter and mouseleave events
async function play(i, inputPoint, duration)
{
    if (!audioCtx) await init();

    let pluckForce = Math.max((maxStrumForce-duration/strumDurationDivider), 0.1)
    let pluckDur = 0.0005;
    let pluckNode = createPluckNode(pluckForce, pluckDur);
    if (i == 0) inputPoint = 0.77;
    dspNodes[i].parameters.get('pluckingpoint').setValueAtTime(inputPoint, audioCtx.currentTime);
    pluckNode.connect(dspNodes[i]);
    pluckNode.start(audioCtx.currentTime);
}

// Called on keypress
// Input is key event code and whether key action is down or up
function fretting(e, down) {
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