const nStrings = 8;

let AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;
let stringNodes = new Array(nStrings);

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

const w = lang.clientWidth;
const h = lang.clientHeight;


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
            console.log("Strum", this.number);
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
        this.x, this.y + Math.sin(this.a) * this.force,
        this.x + this.width, this.y + Math.sin(this.a) * this.force,
        this.x + this.width, this.y);
        this.ctx.stroke();
        this.force *= 0.99;
        this.a += 0.5;
    }
}

// if (baseAudioContext.state === "running") {
    // this.buildLangeleik();
// } else {
    this.buildSplashScreen();
// }

function buildLangeleik() {
    const stringHeight = h / 10;

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
    
    // pass folder name of wasm file
    for (let i = 0; i < nStrings; i++) {
        factory = new StiffString(audioCtx, './jsdsp/');
        stringNodes[i] = await factory.load();
        stringNodes[i].connect(audioCtx.destination);
        //stringNodes[i].setParamValue("/StiffString/Radius", (i+1) * 1e-4);
    }

    // description of the input parameters set in Faust (e.g. sliders, buttons etc)
    console.log(stringNodes[0].getParams());
}

async function play(i, inputPoint)
{
    if (!audioCtx) await init();
    // press button down
    stringNodes[i].setParamValue("/StiffString/InputPoint", inputPoint);
    stringNodes[i].setParamValue("/StiffString/Excite", true);
    
    // release button (need to shortly wait)
    setTimeout(() => stringNodes[i].setParamValue("/StiffString/Excite", false), 50);
}
