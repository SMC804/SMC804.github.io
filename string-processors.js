class StringProcessor extends AudioWorkletProcessor 
{

    constructor(options)
    {
        super(options);

        this.L = options.processorOptions.length;
        this.radius = options.processorOptions.radius;
        // this.rho = 1200;
        this.rho = 6000;
        this.Area = Math.PI*this.radius**2;
        this.I = (Math.PI*this.radius**4)/4;
        // this.Emod = 2e9;
        this.Emod = 180e9;
        this.k = 1/options.processorOptions['fs'];
        this.sigma0 = 1.38;
        this.sigma1 = 1.3e-4;
        this.T = (2*options.processorOptions.frequency*this.L)**2 * this.rho * this.Area;
        this.h = Math.sqrt(this.k/2*(this.T*this.k/this.rho/this.Area + 4*this.sigma1 + Math.sqrt((this.T*this.k/this.rho/this.Area + 4*this.sigma1)**2 + 16*this.Emod*this.I/this.rho/this.Area)));

        this.N = Math.floor(this.L/this.h);
        this.h = this.L/this.N;

        this.prevU = new Array(this.N-1).fill(0);
        this.currU = new Array(this.N-1).fill(0);
        this.nextU = new Array(this.N-1).fill(0);

        this.b1 = -this.Emod * this.I / this.h**4;
        this.b2 = (this.T*this.h**2 + 4*this.Emod*this.I + 2*this.rho*this.Area*this.sigma1*this.h**2/this.k) / this.h**4;
        this.b3 = (-2*this.T*this.h**2 -6*this.Emod*this.I - 2*this.rho*this.Area*this.sigma0*this.h**4/this.k - 4*this.rho*this.Area*this.sigma1*this.h**2/this.k + 2*this.rho*this.Area*this.h**4/this.k**2) / this.h**4;
        
        this.c1 = -2*this.rho*this.Area*this.sigma1/this.h**2/this.k;
        this.c2 = 2*this.rho*this.Area*this.sigma0/this.k + 4*this.rho*this.Area*this.sigma1/this.h**2/this.k - this.rho*this.Area/this.k**2;

        this.a = this.rho * this.Area / this.k**2;
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

    finalize()
    {
        for (let l = 0; l < this.N-1; l++) {
            this.nextU[l] /= this.a;
        }
        this.prevU = this.currU;
        this.currU = this.nextU;
        this.nextU = new Array(this.N-1);
    }

    process (inputs, outputs, parameters)
    {
        const output = outputs[0][0];

        this.processArguments(inputs, parameters);

        for (let i = 0; i < output.length; i++) 
        {
            this.updateString();
            this.updateForces(i);
            this.finalize();
            output[i] = this.currU[this.listeningpoint];
        }
        return true;
    }
}

class MelodyStringProcessor extends StringProcessor {

    constructor(options) {
        super(options);

        let nFrets = MelodyStringProcessor.NFRETS;

        this.K = 1e14;
        this.alpha = 3;

        this.sqrtKalpha = Math.sqrt(this.K * (this.alpha + 1) / 2);

        this.fretPos = options.processorOptions.fretPos;
        console.assert(this.fretPos.length === nFrets, `Expected ${nFrets} frets, got ${this.fretPos.length} frets`);
        
        this.fretIdx = new Array(nFrets);
        this.fretAlpha = new Array(nFrets);
        this.fingerStart = new Array(nFrets).fill(5e-3);
        this.fingerStop = new Array(nFrets).fill(-1e-3);
        this.initialFingerV = new Array(nFrets).fill(-5);
        this.fingerV = new Array(nFrets).fill(0.0);
        this.fingerMass = new Array(nFrets).fill(1e-4);

        this.fingerPrev = new Array(nFrets);
        this.fingerCurr = new Array(nFrets);
        this.fingerNext = new Array(nFrets);

        this.etaPrev = new Array(nFrets);
        this.etaCurr = new Array(nFrets);
        this.etaNext = new Array(nFrets);

        this.psi = new Array(nFrets).fill(0.0);
        this.g = new Array(nFrets);

        this.fingerForce = new Array(nFrets).fill(0.0);

        for (let i = 0; i < nFrets; i++) {
            this.fretPos[i] *= this.L;
            this.fretIdx[i] = Math.floor(this.fretPos[i] / this.h);
            this.fretAlpha[i] = this.fretPos[i] / this.h - this.fretIdx[i];
            this.fretIdx[i] -= 1;
            this.fingerPrev[i] = this.fingerStart[i];
            this.fingerCurr[i] = this.fingerStart[i];

            this.etaPrev[i] = -this.fingerPrev[i];
            this.etaCurr[i] = -this.fingerCurr[i];
        }

        this.fretPressed = new Array(nFrets).fill(0.0);
    }

    processArguments(inputs, parameters)
    {
        super.processArguments(inputs, parameters);

        let nFrets = MelodyStringProcessor.NFRETS;
        for (let i = 0; i < nFrets; i++) {
            let fretPressed = parameters[`fret${i}pressed`][0];

            if (fretPressed !== this.fretPressed[i]) {
                if (fretPressed) {
                    // fret newly pressed. start moving finger
                    this.fingerV[i] = this.initialFingerV[i];
                } else {
                    // fret released. teleport finger to starting position and rewrite history
                    this.etaPrev[i] = 0;
                    this.etaCurr[i] = 0;
                    this.etaNext[i] = 0;
                    
                    this.fingerPrev[i] = this.fingerStart[i];
                    this.fingerCurr[i] = this.fingerStart[i];
                    this.fingerNext[i] = this.fingerStart[i];
                    
                    this.fingerV[i] = 0;
                    this.psi[i] = 0;
                }
            }
            this.fretPressed[i] = fretPressed;
        }
    }

    updateForces(i)
    {
        super.updateForces(i);

        let nFrets = MelodyStringProcessor.NFRETS;

        this.af = new Array(nFrets);
        this.g = new Array(nFrets);
        for (let j = 0; j < nFrets; j++)
        {
            this.af[j] = this.fingerMass[j] / this.k**2;
            this.fingerNext[j] = this.fingerMass[j] * (2 * this.fingerCurr[j] - this.fingerPrev[j]) / this.k**2 - this.fingerForce[j];

            if (this.etaCurr[j] > 0) {
                this.g[j] = this.sqrtKalpha * this.etaCurr[j] ** ((this.alpha - 1)/2);
                this.fingerNext[j] += this.g[j] * this.psi[j] - this.g[j]**2 * this.etaPrev[j] / 4;
                let gsqdiv4 = this.g[j] ** 2 / 4;
                this.af[j] += gsqdiv4;

                let idx = this.fretIdx[j];

                this.nextU[idx] += (1 - this.fretAlpha[j])/this.h * (-this.g[j]*this.psi[j] + this.etaPrev[j]*gsqdiv4 + this.fingerNext[j]*gsqdiv4/this.af[j]);
                this.nextU[idx+1] += this.fretAlpha[j]/this.h * (-this.g[j]*this.psi[j] + this.etaPrev[j]*gsqdiv4 + this.fingerNext[j]*gsqdiv4/this.af[j]);

                // solving system of lin eq.
                let factor = (gsqdiv4 / this.af[j] - 1) * gsqdiv4;
                let x1 = this.a - factor * (1 - this.fretAlpha[j])**2 / this.h;
                let x2 = -factor * (this.fretAlpha[j] - this.fretAlpha[j]**2) / this.h;
                let x3 = -factor * (this.fretAlpha[j] - this.fretAlpha[j]**2) / this.h;
                let x4 = this.a - factor * this.fretAlpha[j]**2 / this.h;

                let det = 1/(x1*x4 - x2*x3); // determinant of matrix [x1 x2; x3 x4]

                let q1 = this.nextU[idx];
                let q2 = this.nextU[idx+1];

                this.nextU[idx] = (det*this.a) * (x4*q1 - x2*q2); // multiplication by a gets reversed in finalize
                this.nextU[idx+1] = (det*this.a) * (-x3*q1 + x1*q2);

                this.fingerNext[j] += gsqdiv4 * ((1 - this.fretAlpha[j])*this.nextU[idx]/this.a + this.fretAlpha[j]*this.nextU[idx+1]/this.a);
            }
            
            else {
                this.g[j] = 0;
            }
        }
    }

    finalize() {
        let nFrets = MelodyStringProcessor.NFRETS;
        for (let l = 0; l < this.N-1; l++) {
            this.nextU[l] /= this.a;
        }
        for (let i = 0; i < nFrets; i++) {
            let idx = this.fretIdx[i];
            this.fingerNext[i] /= this.af[i];
            this.etaNext[i] = (1 - this.fretAlpha[i])*this.nextU[idx] + this.fretAlpha[i]*this.nextU[idx+1] - this.fingerNext[i];
            if (this.fingerNext[i] < this.fingerStop[i])
                this.fingerV[i] = 0;

            let currV = (this.fingerNext[i] - this.fingerPrev[i]) / (2*this.k);
            this.fingerForce[i] = this.g[i]**2/4 * (this.etaNext[i] - this.etaPrev[i]) + this.g[i] * this.psi[i];
            this.fingerForce[i] += this.fingerMass[i] * (currV - this.fingerV[i])/this.k;
            this.psi[i] += (this.etaNext[i] - this.etaPrev[i]) / 2;
        }

        this.prevU = this.currU;
        this.currU = this.nextU;
        this.nextU = new Array(this.N-1);

        this.fingerPrev = this.fingerCurr;
        this.fingerCurr = this.fingerNext;
        this.fingerNext = new Array(nFrets);

        this.etaPrev = this.etaCurr;
        this.etaCurr = this.etaNext;
        this.etaNext = new Array(nFrets);

    }

    // This needs to be statically defined so that the parameterDescriptor matches
    static get NFRETS() { return 7; }

    static get parameterDescriptors()
    {
        let desc = super.parameterDescriptors;
        for (let i = 0; i < MelodyStringProcessor.NFRETS; i++) {
            desc = desc.concat([
                {   
                    name: `fret${i}pressed`,
                    defaultValue: 0,
                    minValue: 0,
                    maxValue: 1,
                    automationRate: 'k-rate'
                },
            ]);
        }
        return desc;
    }
}

registerProcessor('string-processor', StringProcessor);
registerProcessor('melodystring-processor', MelodyStringProcessor);