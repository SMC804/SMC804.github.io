%% STIFF STRING
fs = 88200;
s = 3;

%L = 1; %Length of string in meters
L = 0.65;
T = 60;
radius = 4.6e-04;
%rho = 1140;
rho = 5.25e-3;

%Area = pi*radius^2;
Area = 1;
I = (pi*radius^4)/4;
%Emod = 2.7e9;
E = 2e11;
k = 1/fs;
%sigma0 = 0.01;
sigma0=1.38;
%sigma1 = 0.005;
sigma1 = 1.3e-4;
kappa = sqrt(Emod*I/rho/Area); % Stiffness
c = sqrt(T/rho/Area);
%h = sqrt((c^2*k^2+4*sigma1*k+sqrt((c^2*k^2+4*sigma1*k)^2+16*kappa^2*k^2))/2);
h = sqrt(k*(T*k/rho + 4*sigma1 + sqrt((T*k/rho + 4*sigma1)^2 + 16*E*I/rho))/2);
N = floor(L/h);
h = L/N;
uNext = zeros(N+3,1);
u = zeros(N+3,1);
uPrev = zeros(N+3,1);


excdursec = 0.005;
excdursamp = round(excdursec * fs);
excidx = (0:excdursamp-1)'/excdursamp;
excforce = 1;

excvec = (excforce/2) * (1 - cos(pi * excidx));
excvec = excvec * k^2 / rho / h / den;

excpoint = round(0.52/h) + 3;


u(excpoint) = excvec(2);
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
fretposmeter = [0.2 0.25 0.3];
fretindices = floor(fretposmeter/h);
fretalphas = fretposmeter/h - fretindices;
nFrets = length(fretposmeter);
fretinterpol = zeros(nFrets, N + 3);
for i=1:nFrets
    fretinterpol(i,fretindices(i)+2) = (1 - fretalphas(i));
    fretinterpol(i,fretindices(i)+3) = fretalphas(i);
end

fretinterpol = fretinterpol / h;
fretheight = -0.0005 * ones(nFrets, 1);


etaNext = zeros(nFrets, 1);
eta = zeros(nFrets, 1);
etaPrev = zeros(nFrets, 1);
%v = VideoWriter('slap.avi');
%v.FrameRate = 120;
%open(v);

for n = 1:fs*s
    uNext(range) = E*u(range-2) + C*u(range-1) +A*u(range) + C*u(range+1) + E*u(range+2) + D*uPrev(range-1) + B*uPrev(range) + D*uPrev(range+1);
    
    if (n+2 <= excdursamp)
        uNext(excpoint) = uNext(excpoint) + excvec(n+2);
    end
    
    uNext(1) = -uNext(3);
    uNext(N+3) = -uNext(N+1);
    
    etaNext = fretheight - h * fretinterpol * uNext;
    etaNext = 0.5 * (etaNext + abs(etaNext));
    
    fretForce = (fretK * k^2 / (alpha + 1)) * ((etaNext.^(alpha + 1) - etaPrev.^(alpha + 1)) ./ (etaNext - etaPrev) / rho / den);
    fretForce(~isfinite(fretForce)) = 0;
    
    uNext = uNext + fretinterpol' * fretForce;
    
    etaPrev = eta;
    eta = etaNext;
    
    uPrev = u;
    u = uNext;
    plot(uNext);
    hold on;
    ylim([-2e-3, 2e-3]);
    plot(fretposmeter/h+2, fretheight, 'r*');
    hold off;
    %frame = getframe(gcf);
    %writeVideo(v, frame);
    drawnow;
    out(n) = uPrev(50);
end
%close(v);
plot(out);
soundsc(out,fs);
