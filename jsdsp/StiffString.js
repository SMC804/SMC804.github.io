
/*
Code generated with Faust version 2.30.5
Compilation options: -lang wasm-ib -es 1 -scal -ftz 2
*/

function getJSONStiffString() {
	return '{"name": "StiffString","filename": "StiffString.dsp","version": "2.30.5","compile_options": "-lang wasm-ib -es 1 -scal -ftz 2","library_list": ["/usr/local/share/faust/stdfaust.lib","/usr/local/share/faust/maths.lib","/usr/local/share/faust/fds.lib","/usr/local/share/faust/signals.lib","/usr/local/share/faust/basics.lib"],"include_pathnames": ["/usr/local/share/faust","/usr/local/share/faust","/usr/share/faust","Faust","/mnt/c/Users/david/OneDrive - Aalborg Universitet/Langeleik/SMC804.github.io/Faust"],"size": 716,"inputs": 0,"outputs": 2,"meta": [ { "basics.lib/name": "Faust Basic Element Library" },{ "basics.lib/version": "0.1" },{ "compile_options": "-lang wasm-ib -es 1 -scal -ftz 2" },{ "fds.lib/author": "Riccardo Russo" },{ "fds.lib/name": "Faust Finite Difference Schemes Library" },{ "fds.lib/version": "0.0" },{ "filename": "StiffString.dsp" },{ "maths.lib/author": "GRAME" },{ "maths.lib/copyright": "GRAME" },{ "maths.lib/license": "LGPL with exception" },{ "maths.lib/name": "Faust Math Library" },{ "maths.lib/version": "2.3" },{ "name": "StiffString" },{ "signals.lib/name": "Faust Signal Routing Library" },{ "signals.lib/version": "0.0" }],"ui": [ {"type": "vgroup","label": "StiffString","items": [ {"type": "button","label": "Excite","address": "/StiffString/Excite","index": 0},{"type": "hslider","label": "InputPoint","address": "/StiffString/InputPoint","index": 12,"init": 0.5,"min": 0,"max": 1,"step": 0.001},{"type": "hslider","label": "OutputPoint","address": "/StiffString/OutputPoint","index": 700,"init": 28,"min": 0,"max": 56,"step": 0.01}]}]}';
}
function getBase64CodeStiffString() { return "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AsACOALEAkEAQQAqArwCOALAAkEAQQAqAswCOALQAkEAQQAqAsgCOALMAkEAQQAqAtgCOALcAkEAQQAqAtQCOALYAkEAQQAqAuQCOALoAkEAQQAqAuACOALkAkEAQQAqAvACOAL0AkEAQQAqAuwCOALwAkEAQQAqAvwCOAKAA0EAQQAqAvgCOAL8AkEAQQAqAogDOAKMA0EAQQAqAoQDOAKIA0EAQQAqApQDOAKYA0EAQQAqApADOAKUA0EAQQAqAqADOAKkA0EAQQAqApwDOAKgA0EAQQAqAqwDOAKwA0EAQQAqAqgDOAKsA0EAQQAqArgDOAK8A0EAQQAqArQDOAK4A0EAQQAqAsQDOALIA0EAQQAqAsADOALEA0EAQQAqAtADOALUA0EAQQAqAswDOALQA0EAQQAqAtwDOALgA0EAQQAqAtgDOALcA0EAQQAqAugDOALsA0EAQQAqAuQDOALoA0EAQQAqAvQDOAL4A0EAQQAqAvADOAL0A0EAQQAqAoAEOAKEBEEAQQAqAvwDOAKABEEAQQAqAowEOAKQBEEAQQAqAogEOAKMBEEAQQAqApgEOAKcBEEAQQAqApQEOAKYBEEAQQAqAqQEOAKoBEEAQQAqAqAEOAKkBEEAQQAqArAEOAK0BEEAQQAqAqwEOAKwBEEAQQAqArwEOALABEEAQQAqArgEOAK8BEEAQQAqAsgEOALMBEEAQQAqAsQEOALIBEEAQQAqAtQEOALYBEEAQQAqAtAEOALUBEEAQQAqAuAEOALkBEEAQQAqAtwEOALgBEEAQQAqAuwEOALwBEEAQQAqAugEOALsBEEAQQAqAvgEOAL8BEEAQQAqAvQEOAL4BEEAQQAqAoQFOAKIBUEAQQAqAoAFOAKEBUEAQQAqApAFOAKUBUEAQQAqAowFOAKQBUEAQQAqApwFOAKgBUEAQQAqApgFOAKcBUEAQQAqAqgFOAKsBUEAQQAqAqQFOAKoBUEAQQAqArQFOAK4BUEAQQAqArAFOAK0BUEAQQAqAsAFOALEBSAIQQRqIQggCEEEIAFsSARADAIMAQsLCwuFgICAAABBAA8LhYCAgAAAQQIPC4uAgIAAACAAIAFqKgIADwuJgICAAABBACgCyAUPC46AgIAAACAAIAEQACAAIAEQCQuFl4CAAAE7f0EAIQFBACECQQAhA0EAIQRBACEFQQAh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MCwib3V0cHV0cyI6IDIsIm1ldGEiOiBbIHsgImJhc2ljcy5saWIvbmFtZSI6ICJGYXVzdCBCYXNpYyBFbGVtZW50IExpYnJhcnkiIH0seyAiYmFzaWNzLmxpYi92ZXJzaW9uIjogIjAuMSIgfSx7ICJjb21waWxlX29wdGlvbnMiOiAiLWxhbmcgd2FzbS1pYiAtZXMgMSAtc2NhbCAtZnR6IDIiIH0seyAiZmRzLmxpYi9hdXRob3IiOiAiUmljY2FyZG8gUnVzc28iIH0seyAiZmRzLmxpYi9uYW1lIjogIkZhdXN0IEZpbml0ZSBEaWZmZXJlbmNlIFNjaGVtZXMgTGlicmFyeSIgfSx7ICJmZHMubGliL3ZlcnNpb24iOiAiMC4wIiB9LHsgImZpbGVuYW1lIjogIlN0aWZmU3RyaW5nLmRzcCIgfSx7ICJtYXRocy5saWIvYXV0aG9yIjogIkdSQU1FIiB9LHsgIm1hdGhzLmxpYi9jb3B5cmlnaHQiOiAiR1JBTUUiIH0seyAibWF0aHMubGliL2xpY2Vuc2UiOiAiTEdQTCB3aXRoIGV4Y2VwdGlvbiIgfSx7ICJtYXRocy5saWIvbmFtZSI6ICJGYXVzdCBNYXRoIExpYnJhcnkiIH0seyAibWF0aHMubGliL3ZlcnNpb24iOiAiMi4zIiB9LHsgIm5hbWUiOiAiU3RpZmZTdHJpbmciIH0seyAic2lnbmFscy5saWIvbmFtZSI6ICJGYXVzdCBTaWduYWwgUm91dGluZyBMaWJyYXJ5IiB9LHsgInNpZ25hbHMubGliL3ZlcnNpb24iOiAiMC4wIiB9XSwidWkiOiBbIHsidHlwZSI6ICJ2Z3JvdXAiLCJsYWJlbCI6ICJTdGlmZlN0cmluZyIsIml0ZW1zIjogWyB7InR5cGUiOiAiYnV0dG9uIiwibGFiZWwiOiAiRXhjaXRlIiwiYWRkcmVzcyI6ICIvU3RpZmZTdHJpbmcvRXhjaXRlIiwiaW5kZXgiOiAwfSx7InR5cGUiOiAiaHNsaWRlciIsImxhYmVsIjogIklucHV0UG9pbnQiLCJhZGRyZXNzIjogIi9TdGlmZlN0cmluZy9JbnB1dFBvaW50IiwiaW5kZXgiOiAxMiwiaW5pdCI6IDAuNSwibWluIjogMCwibWF4IjogMSwic3RlcCI6IDAuMDAxfSx7InR5cGUiOiAiaHNsaWRlciIsImxhYmVsIjogIk91dHB1dFBvaW50IiwiYWRkcmVzcyI6ICIvU3RpZmZTdHJpbmcvT3V0cHV0UG9pbnQiLCJpbmRleCI6IDcwMCwiaW5pdCI6IDI4LCJtaW4iOiAwLCJtYXgiOiA1Niwic3RlcCI6IDAuMDF9XX1dfQ=="; }

/*
 faust2wasm: GRAME 2017-2019
*/

'use strict';

if (typeof (AudioWorkletNode) === "undefined") {
    alert("AudioWorklet is not supported in this browser !")
}

class StiffStringNode extends AudioWorkletNode {

    constructor(context, baseURL, options) {
        super(context, 'StiffString', options);

        this.baseURL = baseURL;
        this.json = options.processorOptions.json;
        this.json_object = JSON.parse(this.json);

        // JSON parsing functions
        this.parse_ui = function (ui, obj) {
            for (var i = 0; i < ui.length; i++) {
                this.parse_group(ui[i], obj);
            }
        }

        this.parse_group = function (group, obj) {
            if (group.items) {
                this.parse_items(group.items, obj);
            }
        }

        this.parse_items = function (items, obj) {
            for (var i = 0; i < items.length; i++) {
                this.parse_item(items[i], obj);
            }
        }

        this.parse_item = function (item, obj) {
            if (item.type === "vgroup"
                || item.type === "hgroup"
                || item.type === "tgroup") {
                this.parse_items(item.items, obj);
            } else if (item.type === "hbargraph"
                || item.type === "vbargraph") {
                // Keep bargraph adresses
                obj.outputs_items.push(item.address);
            } else if (item.type === "vslider"
                || item.type === "hslider"
                || item.type === "button"
                || item.type === "checkbox"
                || item.type === "nentry") {
                // Keep inputs adresses
                obj.inputs_items.push(item.address);
                obj.descriptor.push(item);
                // Decode MIDI
                if (item.meta !== undefined) {
                    for (var i = 0; i < item.meta.length; i++) {
                        if (item.meta[i].midi !== undefined) {
                            if (item.meta[i].midi.trim() === "pitchwheel") {
                                obj.fPitchwheelLabel.push({
                                    path: item.address,
                                    min: parseFloat(item.min),
                                    max: parseFloat(item.max)
                                });
                            } else if (item.meta[i].midi.trim().split(" ")[0] === "ctrl") {
                                obj.fCtrlLabel[parseInt(item.meta[i].midi.trim().split(" ")[1])]
                                    .push({
                                        path: item.address,
                                        min: parseFloat(item.min),
                                        max: parseFloat(item.max)
                                    });
                            }
                        }
                    }
                }
                // Define setXXX/getXXX, replacing '/c' with 'C' everywhere in the string
                var set_name = "set" + item.address;
                var get_name = "get" + item.address;
                set_name = set_name.replace(/\/./g, (x) => { return x.substr(1, 1).toUpperCase(); });
                get_name = get_name.replace(/\/./g, (x) => { return x.substr(1, 1).toUpperCase(); });
                obj[set_name] = (val) => { obj.setParamValue(item.address, val); };
                obj[get_name] = () => { return obj.getParamValue(item.address); };
                //console.log(set_name);
                //console.log(get_name);
            }
        }

        this.output_handler = null;

        // input/output items
        this.inputs_items = [];
        this.outputs_items = [];
        this.descriptor = [];

        // MIDI
        this.fPitchwheelLabel = [];
        this.fCtrlLabel = new Array(128);
        for (var i = 0; i < this.fCtrlLabel.length; i++) { this.fCtrlLabel[i] = []; }

        // Parse UI
        this.parse_ui(this.json_object.ui, this);

        // Set message handler
        this.port.onmessage = this.handleMessage.bind(this);
        try {
            if (this.parameters) this.parameters.forEach(p => p.automationRate = "k-rate");
        } catch (e) { }
    }

    // To be called by the message port with messages coming from the processor
    handleMessage(event) {
        var msg = event.data;
        if (this.output_handler) {
            this.output_handler(msg.path, msg.value);
        }
    }

    // Public API

    /**
     * Destroy the node, deallocate resources.
     */
    destroy() {
        this.port.postMessage({ type: "destroy" });
        this.port.close();
    }

    /**
     *  Returns a full JSON description of the DSP.
     */
    getJSON() {
        return this.json;
    }

    // For WAP
    async getMetadata() {
        return new Promise(resolve => {
            let real_url = (this.baseURL === "") ? "main.json" : (this.baseURL + "/main.json");
            fetch(real_url).then(responseJSON => {
                return responseJSON.json();
            }).then(json => {
                resolve(json);
            })
        });
    }

    /**
     *  Set the control value at a given path.
     *
     * @param path - a path to the control
     * @param val - the value to be set
     */
    setParamValue(path, val) {
        // Needed for sample accurate control
        this.parameters.get(path).setValueAtTime(val, 0);
    }

    // For WAP
    setParam(path, val) {
        // Needed for sample accurate control
        this.parameters.get(path).setValueAtTime(val, 0);
    }

    /**
     *  Get the control value at a given path.
     *
     * @return the current control value
     */
    getParamValue(path) {
        return this.parameters.get(path).value;
    }

    // For WAP
    getParam(path) {
        return this.parameters.get(path).value;
    }

    /**
     * Setup a control output handler with a function of type (path, value)
     * to be used on each generated output value. This handler will be called
     * each audio cycle at the end of the 'compute' method.
     *
     * @param handler - a function of type function(path, value)
     */
    setOutputParamHandler(handler) {
        this.output_handler = handler;
    }

    /**
     * Get the current output handler.
     */
    getOutputParamHandler() {
        return this.output_handler;
    }

    getNumInputs() {
        return parseInt(this.json_object.inputs);
    }

    getNumOutputs() {
        return parseInt(this.json_object.outputs);
    }

    // For WAP
    inputChannelCount() {
        return parseInt(this.json_object.inputs);
    }

    outputChannelCount() {
        return parseInt(this.json_object.outputs);
    }

    /**
     * Returns an array of all input paths (to be used with setParamValue/getParamValue)
     */
    getParams() {
        return this.inputs_items;
    }

    // For WAP
    getDescriptor() {
        var desc = {};
        for (const item in this.descriptor) {
            if (this.descriptor.hasOwnProperty(item)) {
                if (this.descriptor[item].label != "bypass") {
                    desc = Object.assign({ [this.descriptor[item].label]: { minValue: this.descriptor[item].min, maxValue: this.descriptor[item].max, defaultValue: this.descriptor[item].init } }, desc);
                }
            }
        }
        return desc;
    }

    /**
     * Control change
     *
     * @param channel - the MIDI channel (0..15, not used for now)
     * @param ctrl - the MIDI controller number (0..127)
     * @param value - the MIDI controller value (0..127)
     */
    ctrlChange(channel, ctrl, value) {
        if (this.fCtrlLabel[ctrl] !== []) {
            for (var i = 0; i < this.fCtrlLabel[ctrl].length; i++) {
                var path = this.fCtrlLabel[ctrl][i].path;
                this.setParamValue(path, StiffStringNode.remap(value, 0, 127, this.fCtrlLabel[ctrl][i].min, this.fCtrlLabel[ctrl][i].max));
                if (this.output_handler) {
                    this.output_handler(path, this.getParamValue(path));
                }
            }
        }
    }

    /**
     * PitchWeel
     *
     * @param channel - the MIDI channel (0..15, not used for now)
     * @param value - the MIDI controller value (0..16383)
     */
    pitchWheel(channel, wheel) {
        for (var i = 0; i < this.fPitchwheelLabel.length; i++) {
            var pw = this.fPitchwheelLabel[i];
            this.setParamValue(pw.path, StiffStringNode.remap(wheel, 0, 16383, pw.min, pw.max));
            if (this.output_handler) {
                this.output_handler(pw.path, this.getParamValue(pw.path));
            }
        }
    }

    /**
     * Generic MIDI message handler.
     */
    midiMessage(data) {
        var cmd = data[0] >> 4;
        var channel = data[0] & 0xf;
        var data1 = data[1];
        var data2 = data[2];

        if (channel === 9) {
            return;
        } else if (cmd === 11) {
            this.ctrlChange(channel, data1, data2);
        } else if (cmd === 14) {
            this.pitchWheel(channel, (data2 * 128.0 + data1));
        }
    }

    // For WAP
    onMidi(data) {
        midiMessage(data);
    }

    /**
     * @returns {Object} describes the path for each available param and its current value
     */
    async getState() {
        var params = new Object();
        for (let i = 0; i < this.getParams().length; i++) {
            Object.assign(params, { [this.getParams()[i]]: `${this.getParam(this.getParams()[i])}` });
        }
        return new Promise(resolve => { resolve(params) });
    }

    /**
     * Sets each params with the value indicated in the state object
     * @param {Object} state 
     */
    async setState(state) {
        return new Promise(resolve => {
            for (const param in state) {
                if (state.hasOwnProperty(param)) this.setParam(param, state[param]);
            }
            try {
                this.gui.setAttribute('state', JSON.stringify(state));
            } catch (error) {
                console.warn("Plugin without gui or GUI not defined", error);
            }
            resolve(state);
        })
    }

    /**
     * A different call closer to the preset management
     * @param {Object} patch to assign as a preset to the node
     */
    setPatch(patch) {
        this.setState(this.presets[patch])
    }

    static remap(v, mn0, mx0, mn1, mx1) {
        return (1.0 * (v - mn0) / (mx0 - mn0)) * (mx1 - mn1) + mn1;
    }

}

// Factory class
class StiffString {

    static fWorkletProcessors;

    /**
     * Factory constructor.
     *
     * @param context - the audio context
     * @param baseURL - the baseURL of the plugin folder
     */
    constructor(context, baseURL = "") {
        console.log("baseLatency " + context.baseLatency);
        console.log("outputLatency " + context.outputLatency);
        console.log("sampleRate " + context.sampleRate);

        this.context = context;
        this.baseURL = baseURL;
        this.pathTable = [];

        this.fWorkletProcessors = this.fWorkletProcessors || [];
    }

    heap2Str(buf) {
        let str = "";
        let i = 0;
        while (buf[i] !== 0) {
            str += String.fromCharCode(buf[i++]);
        }
        return str;
    }

    /**
     * Load additionnal resources to prepare the custom AudioWorkletNode. Returns a promise to be used with the created node.
     */
    async load() {
        try {
            const importObject = {
                env: {
                    memoryBase: 0,
                    tableBase: 0,
                    _abs: Math.abs,

                    // Float version
                    _acosf: Math.acos,
                    _asinf: Math.asin,
                    _atanf: Math.atan,
                    _atan2f: Math.atan2,
                    _ceilf: Math.ceil,
                    _cosf: Math.cos,
                    _expf: Math.exp,
                    _floorf: Math.floor,
                    _fmodf: (x, y) => x % y,
                    _logf: Math.log,
                    _log10f: Math.log10,
                    _max_f: Math.max,
                    _min_f: Math.min,
                    _remainderf: (x, y) => x - Math.round(x / y) * y,
                    _powf: Math.pow,
                    _roundf: Math.fround,
                    _sinf: Math.sin,
                    _sqrtf: Math.sqrt,
                    _tanf: Math.tan,
                    _acoshf: Math.acosh,
                    _asinhf: Math.asinh,
                    _atanhf: Math.atanh,
                    _coshf: Math.cosh,
                    _sinhf: Math.sinh,
                    _tanhf: Math.tanh,

                    // Double version
                    _acos: Math.acos,
                    _asin: Math.asin,
                    _atan: Math.atan,
                    _atan2: Math.atan2,
                    _ceil: Math.ceil,
                    _cos: Math.cos,
                    _exp: Math.exp,
                    _floor: Math.floor,
                    _fmod: (x, y) => x % y,
                    _log: Math.log,
                    _log10: Math.log10,
                    _max_: Math.max,
                    _min_: Math.min,
                    _remainder: (x, y) => x - Math.round(x / y) * y,
                    _pow: Math.pow,
                    _round: Math.fround,
                    _sin: Math.sin,
                    _sqrt: Math.sqrt,
                    _tan: Math.tan,
                    _acosh: Math.acosh,
                    _asinh: Math.asinh,
                    _atanh: Math.atanh,
                    _cosh: Math.cosh,
                    _sinh: Math.sinh,
                    _tanh: Math.tanh,

                    table: new WebAssembly.Table({ initial: 0, element: "anyfunc" })
                }
            };

            let real_url = (this.baseURL === "") ? "StiffString.wasm" : (this.baseURL + "/StiffString.wasm");
            const dspFile = await fetch(real_url);
            const dspBuffer = await dspFile.arrayBuffer();
            const dspModule = await WebAssembly.compile(dspBuffer);
            const dspInstance = await WebAssembly.instantiate(dspModule, importObject);

            let HEAPU8 = new Uint8Array(dspInstance.exports.memory.buffer);
            let json = this.heap2Str(HEAPU8);
            let json_object = JSON.parse(json);
            let options = { wasm_module: dspModule, json: json };

            if (this.fWorkletProcessors.indexOf(name) === -1) {
                try {
                    let re = /JSON_STR/g;
                    let StiffStringProcessorString1 = StiffStringProcessorString.replace(re, json);
                    let real_url = window.URL.createObjectURL(new Blob([StiffStringProcessorString1], { type: 'text/javascript' }));
                    await this.context.audioWorklet.addModule(real_url);
                    // Keep the DSP name
                    console.log("Keep the DSP name");
                    this.fWorkletProcessors.push(name);
                } catch (e) {
                    console.error(e);
                    console.error("Faust " + this.name + " cannot be loaded or compiled");
                    return null;
                }
            }
            this.node = new StiffStringNode(this.context, this.baseURL,
                {
                    numberOfInputs: (parseInt(json_object.inputs) > 0) ? 1 : 0,
                    numberOfOutputs: (parseInt(json_object.outputs) > 0) ? 1 : 0,
                    channelCount: Math.max(1, parseInt(json_object.inputs)),
                    outputChannelCount: [parseInt(json_object.outputs)],
                    channelCountMode: "explicit",
                    channelInterpretation: "speakers",
                    processorOptions: options
                });
            this.node.onprocessorerror = () => { console.log('An error from StiffString-processor was detected.'); }
            return (this.node);
        } catch (e) {
            console.error(e);
            console.error("Faust " + this.name + " cannot be loaded or compiled");
            return null;
        }
    }

    async loadGui() {
        return new Promise((resolve, reject) => {
            try {
                // DO THIS ONLY ONCE. If another instance has already been added, do not add the html file again
                let real_url = (this.baseURL === "") ? "main.html" : (this.baseURL + "/main.html");
                if (!this.linkExists(real_url)) {
                    // LINK DOES NOT EXIST, let's add it to the document
                    var link = document.createElement('link');
                    link.rel = 'import';
                    link.href = real_url;
                    document.head.appendChild(link);
                    link.onload = (e) => {
                        // the file has been loaded, instanciate GUI
                        // and get back the HTML elem
                        // HERE WE COULD REMOVE THE HARD CODED NAME
                        var element = createStiffStringGUI(this.node);
                        resolve(element);
                    }
                } else {
                    // LINK EXIST, WE AT LEAST CREATED ONE INSTANCE PREVIOUSLY
                    // so we can create another instance
                    var element = createStiffStringGUI(this.node);
                    resolve(element);
                }
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    };

    linkExists(url) {
        return document.querySelectorAll(`link[href="${url}"]`).length > 0;
    }
}

// Template string for AudioWorkletProcessor

let StiffStringProcessorString = `

    'use strict';

    // Monophonic Faust DSP
    class StiffStringProcessor extends AudioWorkletProcessor {
        
        // JSON parsing functions
        static parse_ui(ui, obj, callback)
        {
            for (var i = 0; i < ui.length; i++) {
                StiffStringProcessor.parse_group(ui[i], obj, callback);
            }
        }
        
        static parse_group(group, obj, callback)
        {
            if (group.items) {
                StiffStringProcessor.parse_items(group.items, obj, callback);
            }
        }
        
        static parse_items(items, obj, callback)
        {
            for (var i = 0; i < items.length; i++) {
                callback(items[i], obj, callback);
            }
        }
        
        static parse_item1(item, obj, callback)
        {
            if (item.type === "vgroup"
                || item.type === "hgroup"
                || item.type === "tgroup") {
                StiffStringProcessor.parse_items(item.items, obj, callback);
            } else if (item.type === "hbargraph"
                       || item.type === "vbargraph") {
                // Nothing
            } else if (item.type === "vslider"
                       || item.type === "hslider"
                       || item.type === "button"
                       || item.type === "checkbox"
                       || item.type === "nentry") {
                obj.push({ name: item.address,
                         defaultValue: item.init,
                         minValue: item.min,
                         maxValue: item.max });
            }
        }
        
        static parse_item2(item, obj, callback)
        {
            if (item.type === "vgroup"
                || item.type === "hgroup"
                || item.type === "tgroup") {
                StiffStringProcessor.parse_items(item.items, obj, callback);
            } else if (item.type === "hbargraph"
                       || item.type === "vbargraph") {
                // Keep bargraph adresses
                obj.outputs_items.push(item.address);
                obj.pathTable[item.address] = parseInt(item.index);
            } else if (item.type === "vslider"
                       || item.type === "hslider"
                       || item.type === "button"
                       || item.type === "checkbox"
                       || item.type === "nentry") {
                // Keep inputs adresses
                obj.inputs_items.push(item.address);
                obj.pathTable[item.address] = parseInt(item.index);
            }
        }
     
        static get parameterDescriptors() 
        {
            // Analyse JSON to generate AudioParam parameters
            var params = [];
            StiffStringProcessor.parse_ui(JSON.parse(\`JSON_STR\`).ui, params, StiffStringProcessor.parse_item1);
            return params;
        }
       
        constructor(options)
        {
            super(options);
            this.running = true;
            
            const importObject = {
                    env: {
                        memoryBase: 0,
                        tableBase: 0,

                        // Integer version
                        _abs: Math.abs,

                        // Float version
                        _acosf: Math.acos,
                        _asinf: Math.asin,
                        _atanf: Math.atan,
                        _atan2f: Math.atan2,
                        _ceilf: Math.ceil,
                        _cosf: Math.cos,
                        _expf: Math.exp,
                        _floorf: Math.floor,
                        _fmodf: function(x, y) { return x % y; },
                        _logf: Math.log,
                        _log10f: Math.log10,
                        _max_f: Math.max,
                        _min_f: Math.min,
                        _remainderf: function(x, y) { return x - Math.round(x/y) * y; },
                        _powf: Math.pow,
                        _roundf: Math.fround,
                        _sinf: Math.sin,
                        _sqrtf: Math.sqrt,
                        _tanf: Math.tan,
                        _acoshf: Math.acosh,
                        _asinhf: Math.asinh,
                        _atanhf: Math.atanh,
                        _coshf: Math.cosh,
                        _sinhf: Math.sinh,
                        _tanhf: Math.tanh,

                        // Double version
                        _acos: Math.acos,
                        _asin: Math.asin,
                        _atan: Math.atan,
                        _atan2: Math.atan2,
                        _ceil: Math.ceil,
                        _cos: Math.cos,
                        _exp: Math.exp,
                        _floor: Math.floor,
                        _fmod: function(x, y) { return x % y; },
                        _log: Math.log,
                        _log10: Math.log10,
                        _max_: Math.max,
                        _min_: Math.min,
                        _remainder:function(x, y) { return x - Math.round(x/y) * y; },
                        _pow: Math.pow,
                        _round: Math.fround,
                        _sin: Math.sin,
                        _sqrt: Math.sqrt,
                        _tan: Math.tan,
                        _acosh: Math.acosh,
                        _asinh: Math.asinh,
                        _atanh: Math.atanh,
                        _cosh: Math.cosh,
                        _sinh: Math.sinh,
                        _tanh: Math.tanh,

                        table: new WebAssembly.Table({ initial: 0, element: 'anyfunc' })
                    }
            };
            
            this.StiffString_instance = new WebAssembly.Instance(options.processorOptions.wasm_module, importObject);
            this.json_object = JSON.parse(options.processorOptions.json);
         
            this.output_handler = function(path, value) { this.port.postMessage({ path: path, value: value }); };
            
            this.ins = null;
            this.outs = null;

            this.dspInChannnels = [];
            this.dspOutChannnels = [];

            this.numIn = parseInt(this.json_object.inputs);
            this.numOut = parseInt(this.json_object.outputs);

            // Memory allocator
            this.ptr_size = 4;
            this.sample_size = 4;
            this.integer_size = 4;
            
            this.factory = this.StiffString_instance.exports;
            this.HEAP = this.StiffString_instance.exports.memory.buffer;
            this.HEAP32 = new Int32Array(this.HEAP);
            this.HEAPF32 = new Float32Array(this.HEAP);

            // Warning: keeps a ref on HEAP in Chrome and prevent proper GC
            //console.log(this.HEAP);
            //console.log(this.HEAP32);
            //console.log(this.HEAPF32);

            // bargraph
            this.outputs_timer = 5;
            this.outputs_items = [];

            // input items
            this.inputs_items = [];
        
            // Start of HEAP index

            // DSP is placed first with index 0. Audio buffer start at the end of DSP.
            this.audio_heap_ptr = parseInt(this.json_object.size);

            // Setup pointers offset
            this.audio_heap_ptr_inputs = this.audio_heap_ptr;
            this.audio_heap_ptr_outputs = this.audio_heap_ptr_inputs + (this.numIn * this.ptr_size);

            // Setup buffer offset
            this.audio_heap_inputs = this.audio_heap_ptr_outputs + (this.numOut * this.ptr_size);
            this.audio_heap_outputs = this.audio_heap_inputs + (this.numIn * NUM_FRAMES * this.sample_size);
            
            // Start of DSP memory : DSP is placed first with index 0
            this.dsp = 0;

            this.pathTable = [];
         
            // Send output values to the AudioNode
            this.update_outputs = function ()
            {
                if (this.outputs_items.length > 0 && this.output_handler && this.outputs_timer-- === 0) {
                    this.outputs_timer = 5;
                    for (var i = 0; i < this.outputs_items.length; i++) {
                        this.output_handler(this.outputs_items[i], this.HEAPF32[this.pathTable[this.outputs_items[i]] >> 2]);
                    }
                }
            }
            
            this.initAux = function ()
            {
                var i;
                
                if (this.numIn > 0) {
                    this.ins = this.audio_heap_ptr_inputs;
                    for (i = 0; i < this.numIn; i++) {
                        this.HEAP32[(this.ins >> 2) + i] = this.audio_heap_inputs + ((NUM_FRAMES * this.sample_size) * i);
                    }
                    
                    // Prepare Ins buffer tables
                    var dspInChans = this.HEAP32.subarray(this.ins >> 2, (this.ins + this.numIn * this.ptr_size) >> 2);
                    for (i = 0; i < this.numIn; i++) {
                        this.dspInChannnels[i] = this.HEAPF32.subarray(dspInChans[i] >> 2, (dspInChans[i] + NUM_FRAMES * this.sample_size) >> 2);
                    }
                }
                
                if (this.numOut > 0) {
                    this.outs = this.audio_heap_ptr_outputs;
                    for (i = 0; i < this.numOut; i++) {
                        this.HEAP32[(this.outs >> 2) + i] = this.audio_heap_outputs + ((NUM_FRAMES * this.sample_size) * i);
                    }
                    
                    // Prepare Out buffer tables
                    var dspOutChans = this.HEAP32.subarray(this.outs >> 2, (this.outs + this.numOut * this.ptr_size) >> 2);
                    for (i = 0; i < this.numOut; i++) {
                        this.dspOutChannnels[i] = this.HEAPF32.subarray(dspOutChans[i] >> 2, (dspOutChans[i] + NUM_FRAMES * this.sample_size) >> 2);
                    }
                }
                
                // Parse UI
                StiffStringProcessor.parse_ui(this.json_object.ui, this, StiffStringProcessor.parse_item2);
                
                // Init DSP
                this.factory.init(this.dsp, sampleRate); // 'sampleRate' is defined in AudioWorkletGlobalScope  
            }

            this.setParamValue = function (path, val)
            {
                this.HEAPF32[this.pathTable[path] >> 2] = val;
            }

            this.getParamValue = function (path)
            {
                return this.HEAPF32[this.pathTable[path] >> 2];
            }

            // Init resulting DSP
            this.initAux();
        }
        
        process(inputs, outputs, parameters) 
        {
            var input = inputs[0];
            var output = outputs[0];
            
            // Check inputs
            if (this.numIn > 0 && (!input || !input[0] || input[0].length === 0)) {
                //console.log("Process input error");
                return true;
            }
            // Check outputs
            if (this.numOut > 0 && (!output || !output[0] || output[0].length === 0)) {
                //console.log("Process output error");
                return true;
            }
            
            // Copy inputs
            if (input !== undefined) {
                for (var chan = 0; chan < Math.min(this.numIn, input.length); ++chan) {
                    var dspInput = this.dspInChannnels[chan];
                    dspInput.set(input[chan]);
                }
            }
            
            /*
            TODO: sample accurate control change is not yet handled
            When no automation occurs, params[i][1] has a length of 1,
            otherwise params[i][1] has a length of NUM_FRAMES with possible control change each sample
            */
            
            // Update controls
            for (const path in parameters) {
                const paramArray = parameters[path];
                this.setParamValue(path, paramArray[0]);
            }
        
          	// Compute
            try {
                this.factory.compute(this.dsp, NUM_FRAMES, this.ins, this.outs);
            } catch(e) {
                console.log("ERROR in compute (" + e + ")");
            }
            
            // Update bargraph
            this.update_outputs();
            
            // Copy outputs
            if (output !== undefined) {
                for (var chan = 0; chan < Math.min(this.numOut, output.length); ++chan) {
                    var dspOutput = this.dspOutChannnels[chan];
                    output[chan].set(dspOutput);
                }
            }
            
            return this.running;
    	}
        
        handleMessage(event)
        {
            var msg = event.data;
            switch (msg.type) {
                case "destroy": this.running = false; break;
            }
        }
    }

    // Globals
    const NUM_FRAMES = 128;
    try {
        registerProcessor('StiffString', StiffStringProcessor);
    } catch (error) {
        console.warn(error);
    }
`;

const dspName = "StiffString";

// WAP factory or npm package module
if (typeof module === "undefined") {
    window.StiffString = StiffString;
    window.FaustStiffString = StiffString;
    window[dspName] = StiffString;
} else {
    module.exports = { StiffString };
}
