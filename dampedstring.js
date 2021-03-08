class CircularBuffer
{
    constructor(size)
    {
        this.buffer = new Array(size).fill(0);
        this.size = size;
    }

    read(idx)
    {
        while (idx < 0) idx += this.size;
        return this.buffer[idx % this.size];
    }

    write(idx, val)
    {
        this.buffer[idx % this.size] = val;
    }
}

class DampedStringProcessor extends AudioWorkletProcessor 
{

    constructor(options)
    {
        super(options);

        this.playing = true;

        this.L = 1;
        this.f0 = 400;
        this.sigma0 = 1;
        this.sigma1 = 0.005;

        this.k = 1.0 / 44100;
        this.c = 2 * this.L * this.f0;

        this.h = Math.sqrt(this.c * this.c * this.k * this.k + 4 * this.sigma1 * this.k);
        console.log(this.h);
        console.log(this.c * this.k);
        this.N = Math.floor(this.L / this.h);
        this.h = 1.0 * this.L / this.N;

        this.lambdasq = Math.pow(this.c*this.k / this.h, 2);

        this.prevU = new Array(this.N+1).fill(0);
        this.currU = new Array(this.N+1).fill(0);
        this.nextU = new Array(this.N+1).fill(0);

        // excitation: hann window length 7 (N = 6)
        for (let i = 3; i <= 9; i++) {
            this.prevU[i] = 0.5 * (1 - Math.cos(2 * Math.PI * (i - 3) / 6));
            this.currU[i] = this.prevU[i];
        }

        this.port.onmessage = (e) => {
            if (e.data == 'stop') {
                this.playing = false;
            }
        }
    }

    static get parameterDescriptors () {
        return [
            {
                name: 'listeningpoint',
                defaultValue: 0.3,
                minValue: 0,
                maxValue: 1,
                automationRate: 'k-rate'
            },
        ];
    } 

    process (inputs, outputs, parameters)
    {
        const output = outputs[0][0];
        
        let listeningpoint = Math.round(parameters['listeningpoint'][0] * this.N);

        for (let i = 0; i < output.length; i++) 
        {
            for (let l = 1; l < this.N; l++)
            {
                let freqdependent = 2 * this.sigma1 * this.k * (this.currU[l+1] - 2*this.currU[l] + this.currU[l-1] - this.prevU[l+1] + 2 * this.prevU[l] - this.prevU[l-1]) / (this.h * this.h);
                this.nextU[l] = (2 * this.currU[l] - this.prevU[l] + this.lambdasq * (this.currU[l+1] - 2*this.currU[l] + this.currU[l-1]) + 2 * this.sigma0 * this.k * this.prevU[l] + freqdependent) / (1 + 2*this.sigma0 * this.k);
            }
            output[i] = this.nextU[listeningpoint];
            this.prevU = this.currU;
            this.currU = this.nextU;
            this.nextU = new Array(this.N+1).fill(0);
        }
        return this.playing;
    }
}

registerProcessor('damped-string-processor', DampedStringProcessor)