class StringProcessor extends AudioWorkletProcessor 
{

    constructor(options)
    {
        super(options);

        this.L = options.processorOptions.length;
        this.radius = options.processorOptions.radius;
        this.rho = 1140;
        this.Area = Math.PI*this.radius**2;
        this.I = (Math.PI*this.radius**4)/4;
        this.Emod = 2.7e9;
        this.k = 1/options.processorOptions['fs'];
        this.sigma0 = 1.3;
        this.sigma1 = 1.3e-4;
        this.kappa = Math.sqrt(this.Emod*this.I/this.rho/this.Area); 
        this.T = (2*options.processorOptions.frequency*this.L)**2 * this.rho * this.Area;
        this.c = Math.sqrt(this.T/this.rho/this.Area);
        this.h = Math.sqrt(this.k/2*(this.T*this.k/this.rho/this.Area + 4*this.sigma1 + Math.sqrt((this.T*this.k/this.rho/this.Area + 4*this.sigma1)**2 + 16*this.Emod*this.I/this.rho/this.Area)));

        this.N = Math.floor(this.L/this.h);
        this.h = this.L/this.N;

        this.prevU = new Array(this.N-1).fill(0);
        this.currU = new Array(this.N-1).fill(0);
        this.nextU = new Array(this.N-1).fill(0);

        this.printVal = true;

        this.b1 = -this.Emod * this.I / this.h**4;
        this.b2 = (this.T*this.h**2 + 4*this.Emod*this.I + 2*this.rho*this.Area*this.sigma1*this.h**2/this.k) / this.h**4;
        this.b3 = (-2*this.T*this.h**2 -6*this.Emod*this.I - 2*this.rho*this.Area*this.sigma0*this.h**4/this.k - 4*this.rho*this.Area*this.sigma1*this.h**2/this.k + 2*this.rho*this.Area*this.h**4/this.k**2) / this.h**4;
        
        this.c1 = -2*this.rho*this.Area*this.sigma1/this.h**2/this.k;
        this.c2 = 2*this.rho*this.Area*this.sigma0/this.k + 4*this.rho*this.Area*this.sigma1/this.h**2/this.k - this.rho*this.Area/this.k**2;

        this.factor = this.k**2 / this.rho / this.Area;
    }

    static get parameterDescriptors () {
        return [
            {
                name: 'listeningpoint',
                defaultValue: 0.7,
                minValue: 0,
                maxValue: 1,
                automationRate: 'k-rate'
            },
            {   
                name: 'pluckingpoint',
                defaultValue: 0.7,
                minValue: 0,
                maxValue: 1,
                automationRate: 'k-rate'
            }
        ];
    } 

    updateString() {
        // boundary points need special treatment
        // simply supported boundary: currU[-1] = 0, currU[-2] = -currU[0] and likewise on the other end
        let N = this.N;
        this.nextU[0] = (this.b3-this.b1)*this.currU[0] + this.b2*this.currU[1] + this.b1*this.currU[2] + this.c2*this.prevU[0] + this.c1*this.prevU[1];
        this.nextU[1] = this.b2*this.currU[0] + this.b3*this.currU[1] + this.b2*this.currU[2] + this.b1*this.currU[3]
                        + this.c1*this.prevU[0] + this.c2*this.prevU[1] + this.c1*this.prevU[2];

        this.nextU[N-3] = this.b1*this.currU[N-5] + this.b2*this.currU[N-4] + this.b3*this.currU[N-3] + this.b2*this.currU[N-2]
                        + this.c1*this.prevU[N-4] + this.c2*this.prevU[N-3] + this.c1*this.prevU[N-2];
        this.nextU[N-2] = (this.b3-this.b1)*this.currU[N-2] + this.b2*this.currU[N-3] + this.b1*this.currU[N-4] + this.c2*this.prevU[N-2] + this.c1*this.prevU[N-3];

        // now that that's taken care of, all other points play nice
        for (let l = 2; l < N-3; l++)
        {
            this.nextU[l] = this.b1*this.currU[l-2] + this.b2*this.currU[l-1] + this.b3*this.currU[l] + this.b2*this.currU[l+1] + this.b1*this.currU[l+2]
                            + this.c1*this.prevU[l-1] + this.c2*this.prevU[l] + this.c1*this.prevU[l+1];

        }
    }

    updateForces(i) {
        if (this.pluck !== undefined) {
            this.nextU[this.pluckingidx+1] += (1 - this.pluckingalpha) * this.pluck[i] / this.h;
            this.nextU[this.pluckingidx+2] += this.pluckingalpha * this.pluck[i] / this.h;
        }
    }

    processArguments(inputs, parameters) {
        this.listeningpoint = Math.round(parameters['listeningpoint'][0] * this.N);

        this.pluckingpoint = parameters['pluckingpoint'][0] * this.L;
        this.pluckingidx = Math.floor(this.pluckingpoint/this.h);
        if (this.pluckingidx >= this.N - 2) this.pluckingidx = this.N-2;
        this.pluckingalpha = this.pluckingpoint/this.h - this.pluckingidx;

        this.pluck = inputs[0][0];
    }

    normalize()
    {
        for (let l = 0; l < this.N-1; l++) {
            this.nextU[l] *= this.factor;
        }
    }

    advanceState()
    {
        this.prevU = this.currU;
        this.currU = this.nextU;
        this.nextU = new Array(this.N-1).fill(0);
    }

    process (inputs, outputs, parameters)
    {
        const output = outputs[0][0];

        this.processArguments(inputs, parameters);

        for (let i = 0; i < output.length; i++) 
        {
            this.updateString();
            this.updateForces(i);
            this.normalize();
            this.advanceState();
            output[i] = this.currU[this.listeningpoint];
        }
        return true;
    }
}

class MelodyStringProcessor extends StringProcessor {

    constructor(options) {
        super(options);
    }

    static get parameterDescriptors()
    {
        return super.parameterDescriptors.concat([
            {   
                name: 'frettingpoint',
                defaultValue: 0,
                minValue: 0,
                maxValue: 1,
                automationRate: 'k-rate'
            },
        ]);
    }
}

registerProcessor('string-processor', StringProcessor);


registerProcessor('melodystring-processor', MelodyStringProcessor);