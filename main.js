let AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;
let fs;

let dsNode;
let constantNode;

async function init()
{
    audioCtx = new AudioContext();
    fs = audioCtx.sampleRate;
    await audioCtx.audioWorklet.addModule('dampedstring.js');
}


async function play()
{
    if (!audioCtx) await init();

    constantNode = audioCtx.createConstantSource();

    dsNode = new AudioWorkletNode(audioCtx, 'damped-string-processor');

    constantNode.connect(dsNode);
    dsNode.connect(audioCtx.destination);

    constantNode.start();
}

function stop()
{
    dsNode.port.postMessage('stop');
    constantNode.stop();
}