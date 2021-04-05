class StiffStringProcessor extends AudioWorkletProcessor 
{

    constructor(options)
    {
        super(options);

        this.L = 1;
        this.T = 150;
        this.radius = options.processorOptions.radius;
        this.rho = 1140;
        this.Area = Math.PI*this.radius**2;
        this.I = (Math.PI*this.radius**4)/4;
        this.Emod = 2.7e9;
        this.k = 1/options.processorOptions['fs'];
        this.sigma0 = 0.01;
        this.sigma1 = 0.005;
        this.kappa = Math.sqrt(this.Emod*this.I/this.rho/this.Area); 
        this.c = Math.sqrt(this.T/this.rho/this.Area);
        this.h = Math.sqrt((this.c**2*this.k**2+4*this.sigma1*this.k+Math.sqrt((this.c**2*this.k**2+4*this.sigma1*this.k)**2+16*this.kappa**2*this.k**2))/2);
        this.N = Math.floor(this.L/this.h);
        this.h = this.L/this.N;

        this.prevU = new Array(this.N+1).fill(0);
        this.currU = new Array(this.N+1).fill(0);
        this.nextU = new Array(this.N+1).fill(0);

        var den = 1+this.sigma0*this.k;
        this.A = ((2-2*this.c**2*this.k**2/this.h**2-4*this.sigma1*this.k/this.h**2-6*this.kappa**2*this.k**2/this.h**4)/den);
        this.B = ((this.sigma0*this.k-1+4*this.sigma1*this.k/this.h**2)/den);
        this.C = ((this.c**2*this.k**2/this.h**2+2*this.sigma1*this.k/this.h**2+4*this.kappa**2*this.k**2/this.h**4)/den);
        this.D = ((-2)*this.sigma1*this.k/den/this.h**2);
        this.E = ((-(this.kappa**2))*this.k**2/den/this.h**4);

        this.fret = 1;

        this.playing = false;
        this.excite = 0;
    }

    static get parameterDescriptors () {
        return [
            {
                name: 'listeningpoint',
                defaultValue: 0.4,
                minValue: 0,
                maxValue: 1,
                automationRate: 'k-rate'
            },

            {
                name: 'excitationpoint',
                defaultValue: 0.4,
                minValue: 0,
                maxValue: 1,
                automationRate: 'k-rate'
            },

            {
                name: 'excite',
                defaultValue: 0,
                minValue: 0,
                maxValue: 1,
                automationRate: 'k-rate'
            },

            {
                name: 'fret',
                defaultValue: 1,
                minValue: 0,
                maxValue: 1,
                automationRate: 'k-rate'
            }
        ];
    } 

    process (inputs, outputs, parameters)
    {
        const output = outputs[0][0];
        
        let listeningpoint = Math.round(parameters['listeningpoint'][0] * this.N);
        let excitationpoint = Math.round(parameters['excitationpoint'][0] * this.N);
        let excite = parameters['excite'][0];

        let N = Math.round(parameters['fret'][0] * this.N);

        if (N != this.N)
        {
            this.prevU[N - 1] = 0;
            this.prevU[N] = 0;
            this.currU[N - 1] = 0;
            this.currU[N] = 0;
        }

        if (excite != this.excite)
        {
            // excitation: hann window length 7 (N = 6)
            for (let i = Math.max(2, excitationpoint-3); i <= Math.min(N-1, excitationpoint+3); i++) {
                this.prevU[i] = 0.5 * (1 - Math.cos(2 * Math.PI * (i - 3) / 6));
                this.currU[i] = this.prevU[i];
            }

            this.excite = excite;
        }

        for (let i = 0; i < output.length; i++) 
        {
            for (let l = 2; l < N - 1; l++)
            {
                this.nextU[l] = this.E*this.currU[l-2] + this.C*this.currU[l-1] + this.A*this.currU[l] + this.C*this.currU[l+1] + this.E*this.currU[l+2]
                                + this.D*this.prevU[l-1] + this.B*this.prevU[l] + this.D*this.prevU[l+1];

            }
            output[i] = this.nextU[listeningpoint];
            this.prevU = this.currU;
            this.currU = this.nextU;
            this.nextU = new Array(this.N+1).fill(0);
        }
        return this.playing;
    }
}

registerProcessor('stiffstring-processor', StiffStringProcessor);