mkdir -p jsdsp;

dspname="StiffString";
faust2wasm -worklet Faust/$dspname.dsp;
mv $dspname.js $dspname-processor.js $dspname.wasm jsdsp;