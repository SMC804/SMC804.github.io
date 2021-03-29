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

        // excitation: hann window length 7 (N = 6)
        for (let i = 3; i <= 9; i++) {
            this.prevU[i] = 0.5 * (1 - Math.cos(2 * Math.PI * (i - 3) / 6));
            this.currU[i] = this.prevU[i];
        }

        var den = 1+this.sigma0*this.k;
        this.A = ((2-2*this.c**2*this.k**2/this.h**2-4*this.sigma1*this.k/this.h**2-6*this.kappa**2*this.k**2/this.h**4)/den);
        this.B = ((this.sigma0*this.k-1+4*this.sigma1*this.k/this.h**2)/den);
        this.C = ((this.c**2*this.k**2/this.h**2+2*this.sigma1*this.k/this.h**2+4*this.kappa**2*this.k**2/this.h**4)/den);
        this.D = ((-2)*this.sigma1*this.k/den/this.h**2);
        this.E = ((-(this.kappa**2))*this.k**2/den/this.h**4);
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
            for (let l = 2; l < this.N - 1; l++)
            {
                this.nextU[l] = this.E*this.currU[l-2] + this.C*this.currU[l-1] + this.A*this.currU[l] + this.C*this.currU[l+1] + this.E*this.currU[l+2]
                                + this.D*this.prevU[l-1] + this.B*this.prevU[l] + this.D*this.prevU[l+1];

            }
            output[i] = this.nextU[listeningpoint];
            this.prevU = this.currU;
            this.currU = this.nextU;
            this.nextU = new Array(this.N+1).fill(0);
        }
        return true;
    }
}

registerProcessor('stiffstring-processor', StiffStringProcessor);