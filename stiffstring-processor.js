class StiffStringProcessor extends AudioWorkletProcessor 
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

        this.prevU = new Array(this.N+3).fill(0);
        this.currU = new Array(this.N+3).fill(0);
        this.nextU = new Array(this.N+3).fill(0);

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
                name: 'frettingpoint',
                defaultValue: 0,
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

    process (inputs, outputs, parameters)
    {
        const output = outputs[0][0];
        const input = inputs[0][0];

        let pluckingpoint = parameters['pluckingpoint'][0] * this.L;
        let pluckingidx = Math.floor(pluckingpoint/this.h);
        let pluckingalpha = pluckingpoint/this.h - pluckingidx;

        let listeningpoint = Math.round(parameters['listeningpoint'][0] * this.N);
        let frettingpoint = Math.round(parameters['frettingpoint'][0] * (this.N - 1)) + 1;
        for (let i = 0; i < output.length; i++) 
        {
            this.currU[frettingpoint] = 0;

            if (frettingpoint == 1) {
                // simply supported at the "nut"
                this.currU[frettingpoint - 1] = -this.currU[frettingpoint + 1];
            } else {
                // clamped when fretted, otherwise repeated fretting causes instability
                this.currU[frettingpoint - 1] = 0;
            }

            for (let l = 2; l < this.N+1; l++)
            {
                this.nextU[l] = this.b1*this.currU[l-2] + this.b2*this.currU[l-1] + this.b3*this.currU[l] + this.b2*this.currU[l+1] + this.b1*this.currU[l+2]
                                + this.c1*this.prevU[l-1] + this.c2*this.prevU[l] + this.c1*this.prevU[l+1];

            }

            if (input !== undefined) {
                this.nextU[pluckingidx+2] += (1 - pluckingalpha) * input[i] / this.h;
                this.nextU[pluckingidx+3] += pluckingalpha * input[i] / this.h;
            }

            for (let l = 2; l < this.N+1; l++) {
                this.nextU[l] *= this.factor;
            }

            this.nextU[this.N+2] = -this.nextU[this.N];
            this.nextU[0] = -this.nextU[2];
            output[i] = this.nextU[listeningpoint];
            this.prevU = this.currU;
            this.currU = this.nextU;

            this.nextU = new Array(this.N+3).fill(0);
        }
        return true;
    }
}

registerProcessor('stiffstring-processor', StiffStringProcessor);