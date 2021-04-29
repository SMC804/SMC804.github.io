clear;
fs = 44100;
s = 0.2;

L = 0.85;

radius = 4e-04;
rho = 1200;

f0 = 220;

Area = pi*radius^2;

T = (2*f0*L)^2 * rho * Area;
%T = 60;
In = (pi*radius^4)/4;

Emod = 2e9;
k = 1/fs;

sigma0 = 1.38;
sigma1 = 1.3e-3;

kappa = sqrt(Emod*In/rho/Area); % Stiffness
c = sqrt(T/rho/Area);
h = sqrt((c^2*k^2+4*sigma1*k+sqrt((c^2*k^2+4*sigma1*k)^2+16*kappa^2*k^2))/2);

N = floor(L/h);
h = L/N;
uNext = zeros(N+3,1);
u = zeros(N+3,1);
uPrev = zeros(N+3,1);
range = 3:N+1;
out = zeros(fs*s,1);

excdursec = 0.005;
excdursamp = round(excdursec * fs);
excidx = (0:excdursamp-1)'/excdursamp;
excforce = 0.5;

excvec = [(excforce/2) * (1 - cos(pi * excidx)); zeros(3*fs, 1)];

excpointmeter = 0.52;
excpoint = floor(excpointmeter/h);
excspread = zeros(N+3, 1);
excspread(excpoint+2:excpoint+3) = [1 - excpointmeter/h + excpoint; excpointmeter/h - excpoint];
excspread = excspread / h;

Dxfwd = eye(N+4, N+3);
for i=2:N+4
    Dxfwd(i,i-1) = -1;
end
Dxfwd = Dxfwd / h;

Dxbwd = -Dxfwd';

Dxx = Dxbwd * Dxfwd;
Dxxxx = Dxx^2;

K = 1e15;
alpha = 1.001;


nFinger = 3;
psiFinger = zeros(nFinger, 1);

fingerpos = [0.1; L/4; L/2];
fingeridx = floor(fingerpos/h);
Jfinger = zeros(N+3, nFinger);
for i = 1:nFinger
    Jfinger(fingeridx(i)+2:fingeridx(i)+3, i) = [1 - fingerpos(i)/h + fingeridx(i); fingerpos(i)/h - fingeridx(i)];
end
Ifinger = Jfinger';
Jfinger = Jfinger / h;
fingerstart = 5e-3 * ones(nFinger, 1);
fingerstop = [-1e-3 -2e-3 -5e-4];

fingerVStart = [0;-2;-3];
fingerV = fingerVStart;
fingerV = fingerVStart * 0;
fingerMass = [2e-4; 1e-4; 1e-4];
fingerPrev = fingerstart;
finger = fingerstart;
fingerNext = zeros(nFinger, 1);
fingerforce = zeros(nFinger, 1);

etaFingerPrev = -fingerPrev;
etaFinger = -finger;
etaFingerNext = zeros(nFinger, 1);


%
excvec = excvec * 0;

for n = 1:fs*s
   if n == 1
        fingerV(3) = fingerVStart(3);
    end
    tension = T * Dxx * u;
    stiffness = Emod * In * Dxxxx * u;
    lossindpd = 2 * rho * Area * sigma0 * (u - uPrev) / k;
    lossdpd = 2 * rho * Area * sigma1 * (Dxx * u  - Dxx * uPrev) / k;
    
    inertial = rho * Area * (-2 * u + uPrev) / k^2;
   
    gfinger = sqrt(K*(alpha + 1)/2)*max(etaFinger, 0).^((alpha - 1)/2);
%     fingerforce = 0;
    fingerNext = fingerMass .* (2 * finger - fingerPrev) / k^2 - fingerforce;
    fingerNext = fingerNext + gfinger .* psiFinger - gfinger.^2 .* etaFingerPrev / 4;
    
    af = fingerMass / k^2 + gfinger.^2 / 4;
    as = rho * Area / k^2 * ones(N+3, 1);
    
    uNext = tension - lossindpd + lossdpd - stiffness - inertial + excspread * excvec(n);
    
    factor = (gfinger(3)^2/(4*af(3)) - 1) * gfinger(3)^2/4;
    idx = fingeridx(3);
    x1 = as(1) - factor * Ifinger(3, idx+2)^2 / h;
    x2 = -factor * (Ifinger(3, idx+3) - Ifinger(3, idx+3)^2) / h;
    x3 = -factor * (Ifinger(3, idx+3) - Ifinger(3, idx+3)^2) / h;
    x4 = as(1) - factor * Ifinger(3, idx+3)^2 / h;
    
    A = diag(as);
    for i=1:nFinger
        uNext = uNext - Jfinger(:,i) * gfinger(i) * psiFinger(i) + Jfinger(:,i) * etaFingerPrev(i) * gfinger(i)^2 / 4 + Jfinger(:,i) * gfinger(i)^2 * fingerNext(i) / (4*af(i));
        A = A - (gfinger(i)^2/(4*af(i)) - 1) * gfinger(i)^2/4 * Jfinger(:,i) * Ifinger(i,:);
    end
    
    if etaFinger(3) > 0
        test = uNext(idx+2:idx+3)'/[x1 x2; x3 x4]';
        det = 1/(x1*x4 - x2*x3);
        q1 = uNext(idx+2);
        q2 = uNext(idx+3);
        
        test2 = det * (x4*q1 - x2*q2);
        test3 = det * (-x3*q1 + x1*q2);
    end
    
    uNext = (uNext'/A')';

    uNext(2) = 0;
    uNext(1) = -uNext(3);
    uNext(N+3) = -uNext(N+1);
    uNext(N+2) = 0;
    
    
    for i=1:nFinger
        fingerNext(i) = (fingerNext(i) + gfinger(i)^2/4 * Ifinger(i,:) * uNext) / af(i);   
        etaFingerNext(i) = Ifinger(i,:) * uNext - fingerNext(i);
        if fingerNext(i) < fingerstop(i)
            fingerV(i) = 0;
        end  
        
%         if etaFingerNext(i) > 1e-3
%             fingerV(i) = fingerVStart(i);
%         end
    end

    
   
    
    if n == fs/2
        fingerV(2) = fingerVStart(2);
    end
    currFingerV = (fingerNext - fingerPrev) / (2*k);
    
    fingerforce = (gfinger.^2/4 .* (etaFingerNext - etaFingerPrev) + gfinger .* psiFinger);
    %fingerforce(fingerforce < 0) = 0;
    
    
    for i=1:nFinger
       fingerforce(i) = fingerforce(i) + fingerMass(i) * (currFingerV(i) - fingerV(i))/2/k;
    end
    
    psiFinger = psiFinger + (etaFingerNext - etaFingerPrev) / 2;
    
    uPrev = u;
    u = uNext;
    etaFingerPrev = etaFinger;
    etaFinger = etaFingerNext;

    fingerPrev = finger;
    finger = fingerNext;

    
    
    if n == round(1.5 * fs)
        etaFinger(3) = 0;
        etaFingerPrev(3) = 0;
        etaFingerNext(3) = 0;
        fingerPrev(3) = fingerstart(3);
        finger(3) = fingerstart(3);
        fingerNext(3) = fingerstart(3);
        
        excvec(n+1:n+length(excidx)) = (0.1/2) * (1 - cos(pi * excidx));

        excpointmeter = fingerpos(3);
        excpoint = floor(excpointmeter/h);
        excspread = zeros(N+3, 1);
        excspread(excpoint+2:excpoint+3) = [1 - excpointmeter/h + excpoint; excpointmeter/h - excpoint];
        excspread = excspread / h;
    end
    
    out(n) = uNext(floor(0.55/h)+2);
% 
%         plot(h*(0:N), uNext(2:N+2));
%         hold on;
%         plot(fingerpos, fingerNext, 'b.');
%         ylim([-2e-2, 6e-3]);
%         hold off;
%         drawnow;


end

plot(out);
soundsc(out,fs);
