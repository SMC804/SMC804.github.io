mkdir -p jsdsp;

dspname="Langeleik";
faust2wasm -worklet Faust/$dspname.dsp;
mv $dspname.js $dspname-processor.js $dspname.wasm jsdsp;