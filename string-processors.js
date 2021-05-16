class StringProcessor extends AudioWorkletProcessor 
{
    // Processor that calculates the general stiff string FDS to synthesize sound

    constructor(options)
    {
        super(options);

        this.L = options.processorOptions.length;       // string length
        this.radius = options.processorOptions.radius;  // string radius
        this.rho = 6000;                                // material density
        this.Area = Math.PI*this.radius**2;             // cross-sectional Area
        this.I = (Math.PI*this.radius**4)/4;            // moment of inertia
        this.Emod = 180e9;                              // Young's modulus
        this.k = 1/options.processorOptions['fs'];      // length of time step based on sample rate
        this.sigma0 = 1.38;                             // frequency-independent damping
        this.sigma1 = 1.3e-4;                           // frequency dependent damping

        // calculate string tension based on a desired pitch of the string
        this.T = (2*options.processorOptions.frequency*this.L)**2 * this.rho * this.Area;
        
        // lower bound for the grid spacing based on the stability condition of the FDS
        let hmin = Math.sqrt(this.k/2 * (
            this.T*this.k/this.rho/this.Area + 4*this.sigma1 
            + Math.sqrt(
                (this.T*this.k/this.rho/this.Area + 4*this.sigma1)**2 
                + 16*this.Emod*this.I/this.rho/this.Area
            )
        ));

        // number of spatial grid points based on string length and grid spacing
        this.N = Math.floor(this.L/hmin);
        this.h = this.L/this.N;

        // N.B: following the notational convention from the Bilbao book,
        // the grid has N+1 points u_0,...,u_N
        // under the simply supported boundary condition, u_0 and u_N are fixed to 0
        // leaving the N-1 points u_1,...,u_{N-1} as points that are actually updated 
        // at each time step
        this.prevU = new Array(this.N-1).fill(0);
        this.currU = new Array(this.N-1).fill(0);
        this.nextU = new Array(this.N-1).fill(0);

        // Coefficients for the current grid points
        this.b1 = -this.Emod * this.I / this.h**4;
        this.b2 = (this.T*this.h**2 + 4*this.Emod*this.I + 2*this.rho*this.Area*this.sigma1*this.h**2/this.k)
            / this.h**4;

        this.b3 = (-2*this.T*this.h**2 -6*this.Emod*this.I - 2*this.rho*this.Area*this.sigma0*this.h**4/this.k
            - 4*this.rho*this.Area*this.sigma1*this.h**2/this.k + 2*this.rho*this.Area*this.h**4/this.k**2) 
            / this.h**4;
        
        // Coefficients for the previous grid points
        this.c1 = -2*this.rho*this.Area*this.sigma1/this.h**2/this.k;
        this.c2 = 2*this.rho*this.Area*this.sigma0/this.k + 4*this.rho*this.Area*this.sigma1/this.h**2/this.k
            - this.rho*this.Area/this.k**2;

        // normalizing factor for a stiff string
        this.a = this.rho * this.Area / this.k**2;
    }

    // parameters can be set on the AudioWorkletNode containing this processor to
    // determine where on the string the audio is synthesized and where excitation 
    // is applied
    static get parameterDescriptors () {
        return [
            {
                name: 'listeningpoint',
                defaultValue: 0.8,
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
        // update the FDS by a linear combination of grid points at the current and previous
        // time steps

        // boundary points need special treatment
        // simply supported boundary: currU[-1] = 0, currU[-2] = -currU[0] and likewise on the other end
        let N = this.N;
        this.nextU[0] = (this.b3-this.b1)*this.currU[0] + this.b2*this.currU[1]
            + this.b1*this.currU[2] + this.c2*this.prevU[0] + this.c1*this.prevU[1];

        this.nextU[1] = this.b2*this.currU[0] + this.b3*this.currU[1] + this.b2*this.currU[2] + this.b1*this.currU[3]
            + this.c1*this.prevU[0] + this.c2*this.prevU[1] + this.c1*this.prevU[2];

        this.nextU[N-3] = this.b1*this.currU[N-5] + this.b2*this.currU[N-4] + this.b3*this.currU[N-3]
            + this.b2*this.currU[N-2] + this.c1*this.prevU[N-4] + this.c2*this.prevU[N-3] + this.c1*this.prevU[N-2];

        this.nextU[N-2] = (this.b3-this.b1)*this.currU[N-2] + this.b2*this.currU[N-3] + this.b1*this.currU[N-4]
            + this.c2*this.prevU[N-2] + this.c1*this.prevU[N-3];

        // now that that's taken care of, all other points play nice
        for (let l = 2; l < N-3; l++)
        {
            this.nextU[l] = this.b1*this.currU[l-2] + this.b2*this.currU[l-1] + this.b3*this.currU[l]
                + this.b2*this.currU[l+1] + this.b1*this.currU[l+2]
                + this.c1*this.prevU[l-1] + this.c2*this.prevU[l] + this.c1*this.prevU[l+1];
        }
    }

    updateForces(i) {
        // if a plucking force is supplied, add it to the point of excitation
        // using linear interpolation between grid points
        if (this.pluck !== undefined) {
            this.nextU[this.pluckingidx+1] += (1 - this.pluckingalpha) * this.pluck[i] / this.h;
            this.nextU[this.pluckingidx+2] += this.pluckingalpha * this.pluck[i] / this.h;
        }
    }

    processArguments(inputs, parameters) {
        // save supplied parameters (point of listening and excitation)
        // for further processing

        // stairs interpolation for the listening point
        this.listeningpoint = Math.round(parameters['listeningpoint'][0] * this.N);

        this.pluckingpoint = parameters['pluckingpoint'][0] * this.L;

        // convert the [0, 1] plucking point to a physical location
        // on the string and calculate linear interpolation parameters
        this.pluckingidx = Math.floor(this.pluckingpoint/this.h);
        if (this.pluckingidx >= this.N - 2) this.pluckingidx = this.N-2;
        this.pluckingalpha = this.pluckingpoint/this.h - this.pluckingidx;

        // extract the plucking force from the input buffer
        // this will be undefined if no pluck is active
        this.pluck = inputs[0][0];
    }

    finalize()
    {
        // after updating the FDS grid and applying forces,
        // divide every point by the normalizing factor and
        // advance the states

        for (let l = 0; l < this.N-1; l++) {
            this.nextU[l] /= this.a;
        }
        this.prevU = this.currU;
        this.currU = this.nextU;
        this.nextU = new Array(this.N-1);
    }

    process (inputs, outputs, parameters)
    {
        // point of entry into the AudioProcessor

        // this is called continuously by the WebAudio API
        // to produce 128 samples of output, corresponding to 
        // 128 time steps of the FDS simulation

        // the input, if it exists, is treated as the force of excitation

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

    // Extending the general stiff string processor class
    // with functionality for hammer-on / pull-off interaction

    constructor(options) {
        super(options);

        let nFrets = MelodyStringProcessor.NFRETS;

        // parameters affecting the "hardness" of the finger-string collision
        this.K = 1e15;
        this.alpha = 3;

        // for convenience
        this.sqrtKalpha = Math.sqrt(this.K * (this.alpha + 1) / 2);

        // the positions of the frets along the string as fractions of the string length 
        // e.g. 0.5 will always be the octave fret
        this.fretPos = options.processorOptions.fretPos;
        console.assert(this.fretPos.length === nFrets,
            `Expected ${nFrets} frets, got ${this.fretPos.length} frets`);
        
        // grid parameters of the frets
        this.fretIdx = new Array(nFrets);
        this.fretAlpha = new Array(nFrets);

        // parameters describing the movement of the finger

        // initial position of the finger above the string
        this.fingerStart = new Array(nFrets).fill(5e-3);

        // target position of the finger pressing down on the string
        this.fingerStop = new Array(nFrets).fill(-1e-3);

        // velocity with which the finger should hit the string
        this.initialFingerV = new Array(nFrets).fill(-5);
        
        // current desired velocity of the finger
        this.fingerV = new Array(nFrets).fill(0.0);

        // mass of the finger
        this.fingerMass = new Array(nFrets).fill(1e-4);

        // position of the fingers corresponding to the frets
        this.fingerPrev = new Array(nFrets);
        this.fingerCurr = new Array(nFrets);
        this.fingerNext = new Array(nFrets);

        // difference between finger and string height
        this.etaPrev = new Array(nFrets).fill(0.0);
        this.etaCurr = new Array(nFrets).fill(0.0);
        this.etaNext = new Array(nFrets).fill(0.0);

        // needed for collision calculation
        this.psi = new Array(nFrets).fill(0.0);
        this.g = new Array(nFrets);

        // pressing force applied to the finger
        this.fingerForce = new Array(nFrets).fill(0.0);

        // is the fret currently pressed or not
        this.fretPressed = new Array(nFrets).fill(0.0);

        for (let i = 0; i < nFrets; i++) {
            // convert to physical position in [m] 
            this.fretPos[i] *= this.L;

            // calculate index of the grid points affected by the fret
            // and interpolation parameters
            this.fretIdx[i] = Math.floor(this.fretPos[i] / this.h);
            this.fretAlpha[i] = this.fretPos[i] / this.h - this.fretIdx[i];
            this.fretIdx[i] -= 1;
            
            this.fingerPrev[i] = this.fingerStart[i];
            this.fingerCurr[i] = this.fingerStart[i];
            this.fingerNext[i] = this.fingerStart[i];
        }

        // With linear interpolation, each fret affects two grid points
        // It can cause numerical explosion if the points overlap,
        // so switch to stairs interpolation if overlaps occur
        for (let i = 0; i < nFrets-1; i++) {
            if (this.fretIdx[i] === this.fretIdx[i+1] - 1) {
                this.fretAlpha[i] = 0;
            }
        }
    }

    processArguments(inputs, parameters)
    {
        super.processArguments(inputs, parameters);

        // update collision and finger parameters from external input
        this.K = parameters['K'];
        this.alpha = parameters['alpha'];

        this.sqrtKalpha = Math.sqrt(this.K * (this.alpha + 1) / 2);

        let nFrets = MelodyStringProcessor.NFRETS;
        for (let i = 0; i < nFrets; i++) {
            this.fingerStart[i] = parameters[`fret${i}fingerstart`][0];
            this.fingerStop[i] = parameters[`fret${i}fingerstop`][0];
            this.initialFingerV[i] = parameters[`fret${i}initialfingerv`][0];
            this.fingerMass[i] = parameters[`fret${i}fingermass`][0];

            // update states of the frets if they changed
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

        // update the finger movement on each fret, and calculate collision if necessary
        for (let j = 0; j < nFrets; j++)
        {
            // normalizing factor of the update equation of the finger
            this.af[j] = this.fingerMass[j] / this.k**2;

            // update finger position based on mass, velocity and external force
            this.fingerNext[j] = this.fingerMass[j] * (2 * this.fingerCurr[j] - this.fingerPrev[j]) / this.k**2 
                - this.fingerForce[j];

            // eta > 0 means that the finger is below the string and we need 
            // to calculate the collision interaction 
            if (this.etaCurr[j] > 0) {
                this.g[j] = this.sqrtKalpha * this.etaCurr[j] ** ((this.alpha - 1)/2);

                let gsqdiv4 = this.g[j] ** 2 / 4; // convenience

                // see report: this is calculating q'^n_{f, j}
                this.fingerNext[j] += this.g[j] * this.psi[j] - gsqdiv4 * this.etaPrev[j];

                this.af[j] += gsqdiv4;

                let idx = this.fretIdx[j];

                // calculating q'^n_l
                this.nextU[idx] += (1 - this.fretAlpha[j])/this.h * (
                    -this.g[j]*this.psi[j] + this.etaPrev[j]*gsqdiv4 + this.fingerNext[j]*gsqdiv4/this.af[j]
                );
                this.nextU[idx+1] += this.fretAlpha[j]/this.h * (
                    -this.g[j]*this.psi[j] + this.etaPrev[j]*gsqdiv4 + this.fingerNext[j]*gsqdiv4/this.af[j]
                );

                // solving system of lin eq. to update finger and string position
                let factor = (gsqdiv4 / this.af[j] - 1) * gsqdiv4;
                let x1 = this.a - factor * (1 - this.fretAlpha[j])**2 / this.h;
                let x2 = -factor * (this.fretAlpha[j] - this.fretAlpha[j]**2) / this.h;
                let x3 = -factor * (this.fretAlpha[j] - this.fretAlpha[j]**2) / this.h;
                let x4 = this.a - factor * this.fretAlpha[j]**2 / this.h;

                let det = 1/(x1*x4 - x2*x3); // determinant of matrix [x1 x2; x3 x4]

                let q1 = this.nextU[idx];
                let q2 = this.nextU[idx+1];

                // in finalize, the grid points will be divided by this.a
                // but the solution of the system of lin. eq. is already normalized
                // so multiply by this.a to avoid needing special treatment in finalize
                this.nextU[idx] = (det*this.a) * (x4*q1 - x2*q2);
                this.nextU[idx+1] = (det*this.a) * (-x3*q1 + x1*q2);

                this.fingerNext[j] += gsqdiv4 * (
                    (1 - this.fretAlpha[j])*this.nextU[idx]/this.a + this.fretAlpha[j]*this.nextU[idx+1]/this.a
                );
            }
            
            else {
                this.g[j] = 0;
            }
        }
    }

    finalize() {
        let nFrets = MelodyStringProcessor.NFRETS;
        // normalize string FDS
        for (let l = 0; l < this.N-1; l++) {
            this.nextU[l] /= this.a;
        }

        for (let i = 0; i < nFrets; i++) {
            let idx = this.fretIdx[i];
            // normalize finger DFS
            this.fingerNext[i] /= this.af[i];

            // update eta with linear interpolation
            this.etaNext[i] = (1 - this.fretAlpha[i])*this.nextU[idx]
                + this.fretAlpha[i]*this.nextU[idx+1] - this.fingerNext[i];

            // once the desired point below the string is reached,
            // the desired velocity of the finger is set to 0
            if (this.fingerNext[i] < this.fingerStop[i])
                this.fingerV[i] = 0;

            // current velocity of the finger
            let currV = (this.fingerNext[i] - this.fingerPrev[i]) / (2*this.k);

            // calculate the external force that will be applied to the finger at the next
            // time step

            // collision force acting on the finger
            this.fingerForce[i] = this.g[i]**2/4 * (this.etaNext[i] - this.etaPrev[i]) + this.g[i] * this.psi[i];

            // force needed to accelerate to desired velocity
            this.fingerForce[i] += this.fingerMass[i] * (currV - this.fingerV[i])/this.k;

            // update psi
            this.psi[i] += (this.etaNext[i] - this.etaPrev[i]) / 2;
        }

        // advance all states

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
    static get NFRETS() { return 14; }

    static get parameterDescriptors()
    {
        let desc = super.parameterDescriptors;
        desc = desc.concat([
            {
                name: 'K',
                defaultValue: 1e14,
                minValue: 1e12,
                maxValue: 1e16,
                automationRate: 'k-rate'
            },
            {
                name: 'alpha',
                defaultValue: 3,
                minValue: 1,
                maxValue: 4,
                automationRate: 'k-rate'
            },
        ])

        // for each fret, define WebAudio parameters
        for (let i = 0; i < MelodyStringProcessor.NFRETS; i++) {
            desc = desc.concat([
                // is the fret currently pressed?
                {   
                    name: `fret${i}pressed`,
                    defaultValue: 0,
                    minValue: 0,
                    maxValue: 1,
                    automationRate: 'k-rate'
                },

                // finger parameters that affect the sound of the interaction
                {
                    name: `fret${i}fingerstart`,
                    defaultValue: 5e-3,
                    minValue: 1e-3,
                    maxValue: 1e-2,
                    automationRate: 'k-rate'
                },
                {
                    name: `fret${i}fingerstop`,
                    defaultValue: -1e-3,
                    minValue: -1e-2,
                    maxValue: -1e-3,
                    automationRate: 'k-rate'
                },
                {
                    name: `fret${i}initialfingerv`,
                    defaultValue: -5,
                    minValue: -10,
                    maxValue: -2,
                    automationRate: 'k-rate'
                },
                {
                    name: `fret${i}fingermass`,
                    defaultValue: 1e-4,
                    minValue: 1e-4,
                    maxValue: 1e-2,
                    automationRate: 'k-rate'
                },
            ]);
        }
        return desc;
    }
}

registerProcessor('string-processor', StringProcessor);
registerProcessor('melodystring-processor', MelodyStringProcessor);