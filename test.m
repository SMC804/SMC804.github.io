%% STIFF STRING
fs = 44100;
s = 3;

L = 0.65;
T = 60;
radius = 3e-04;
%rho = 1140;
rho = 5.25e-3;

%Area = pi*radius^2;
Area = 1;
I = (pi*radius^4)/4;
%Emod = 2.7e9;
Emod = 2e11;
k = 1/fs;
%sigma0 = 0.01;
sigma0=1.38;
%sigma1 = 0.005;
sigma1 = 1.3e-4;
kappa = sqrt(Emod*I/rho/Area); % Stiffness
c = sqrt(T/rho/Area);
%h = sqrt((c^2*k^2+4*sigma1*k+sqrt((c^2*k^2+4*sigma1*k)^2+16*kappa^2*k^2))/2);
h = sqrt(k*(T*k/rho + 4*sigma1 + sqrt((T*k/rho + 4*sigma1)^2 + 16*Emod*I/rho))/2);
N = floor(L/h);
h = L/N;
uNext = zeros(N+3,1);
u = zeros(N+3,1);
uPrev = zeros(N+3,1);




lambdaSq = ((c*k)/h)^2;
range = 3:N+1;
out = zeros(fs*s,1);
K = kappa;
den = 1+sigma0*k;
A = ((2-2*c^2*k^2/h^2-4*sigma1*k/h^2-6*K^2*k^2/h^4)/den);
B = ((sigma0*k-1+4*sigma1*k/h^2)/den);
C = ((c^2*k^2/h^2+2*sigma1*k/h^2+4*K^2*k^2/h^4)/den);
D = ((-2)*sigma1*k/den/h^2);
E = ((-(K^2))*k^2/den/h^4);

alpha = 2.3;
fretK = 1e11;
fretposmeter = [0.2];
fretindices = floor(fretposmeter/h);
fretalphas = fretposmeter/h - fretindices;
nFrets = length(fretposmeter);
fretinterpol = zeros(nFrets, N + 3);
for i=1:nFrets
    fretinterpol(i,fretindices(i)+2) = (1 - fretalphas(i));
    fretinterpol(i,fretindices(i)+3) = fretalphas(i);
end

excdursec = 0.01;
excdursamp = round(excdursec * fs);
excidx = (0:excdursamp-1)'/excdursamp;
excforce = 1;

excvec = (excforce/2) * (1 - cos(pi * excidx));

excpointmeter = 0.52;
excpoint = floor(excpointmeter/h) + 2;
excinterpol = zeros(N+3, 1);
excinterpol(excpoint:excpoint+1) = [1 - excpointmeter/h + excpoint; excpointmeter/h - excpoint];
excinterpol = excinterpol / h;

u(excpoint) = excvec(2);

fretinterpol = fretinterpol / h;
fretheight = -0.001 * ones(nFrets, 1);

fingermeter = 0.15;
fingerpoint = floor(fingermeter/h) + 2;
fingerinterpol = zeros(N+3, 1);
fingerinterpol(fingerpoint:fingerpoint+1) = [1 - fingermeter/h + fingerpoint; fingermeter/h - fingerpoint];
fingerinterpol = fingerinterpol / h;
dist = 1.55e-2;
mpsa = dist / (fs * dist / 2);
fingerdisp = [(0.05e-2:-mpsa:-1.5e-2)'; -1.5e-2 * ones(s*fs, 1)];

fingerK = 1e6;
beta = 1;

etaNext = zeros(nFrets, 1);
eta = zeros(nFrets, 1);
etaPrev = zeros(nFrets, 1);
%v = VideoWriter('slap.avi');
%v.FrameRate = 120;
%open(v);

etaF = 0;
etaFNext = 0;
etaFPrev = 0;

for n = 1:fs*s
    uNext(range) = E*u(range-2) + C*u(range-1) +A*u(range) + C*u(range+1) + E*u(range+2) + D*uPrev(range-1) + B*uPrev(range) + D*uPrev(range+1);
    
    if (n+2 <= excdursamp)
        uNext = uNext + k^2 * (excinterpol * excvec(n+2)) / rho / den;
    end
    
    uNext(1) = -uNext(3);
    uNext(N+3) = -uNext(N+1);
    
    etaNext = fretheight - h * fretinterpol * uNext;
    %etaNext = 0.5 * (etaNext + abs(etaNext));
    
    fretForce = (fretK * k^2 / (alpha + 1)) * ((max(etaNext, 0).^(alpha + 1) - max(etaPrev, 0).^(alpha + 1)) ./ (etaNext - etaPrev) / rho / den);
    fretForce(~isfinite(fretForce)) = 0;
    
    etaFNext = h*fingerinterpol' * uNext - fingerdisp(n+2);
    
    fingerForce = (fingerK / (alpha + 1)) * ((max(etaFNext, 0)^(alpha + 1) - max(etaFPrev, 0)^(alpha+1)) / (etaFNext - etaFPrev));
    if ~isfinite(fingerForce)
        fingerForce = 0;
    end
    
    loss = ((etaFNext - etaFPrev) / (2*k)) * fingerK * max(etaFNext, 0)^alpha;
    fingerForce = fingerForce + loss;
    if ~isfinite(fingerForce)
        fingerForce = 0;
    end
    
    uNext = uNext + fretinterpol' * fretForce;
    
    %uNext = uNext - k^2 * (fingerinterpol * fingerForce) / rho / den;
    
    etaPrev = eta;
    eta = etaNext;
    
    etaFPrev = etaF;
    etaF = etaFNext;
    
    uPrev = u;
    u = uNext;
    plot(uNext);
    hold on;
    ylim([-3e-3, 3e-3]);
    plot(fretposmeter/h+2, fretheight, 'r*');
    %plot(fingerpoint, fingerdisp(n+2), 'b.');
    hold off;
    %frame = getframe(gcf);
    %writeVideo(v, frame);
    drawnow;
    out(n) = uPrev(10);
end
%close(v);
plot(out);
soundsc(out,fs);
