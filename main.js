let AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;
let dspNode;

async function init()
{
    audioCtx = new AudioContext();
    
    // pass folder name of wasm file
    factory = new StiffString(audioCtx, 'binary');
    dspNode = await factory.load();
    dspNode.connect(audioCtx.destination);

    // description of the input parameters set in Faust (e.g. sliders, buttons etc)
    console.log(dspNode.getParams());
}

async function play()
{
    if (!audioCtx) await init();
    // press button down
    dspNode.setParamValue('/StiffString/Play', true);
    
    // release button (need to shortly wait)
    setTimeout(() => dspNode.setParamValue('/StiffString/Play', false), 50);
}
