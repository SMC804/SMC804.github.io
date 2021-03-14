import("stdfaust.lib");
stiffstring = component("StiffString.lib");

nPoints = 100;
nStrings = 8;

forceModel(i) = button("ExciteString%i") : ba.impulsify;
inPoint(i) = hslider("InputPoint%i",0.5,0,1,0.001) : *(nPoints - 1);
outPoint = hslider("OutputPoint",floor(nPoints/2),0,nPoints-1,0.01) : si.smoo;

// only changing radius right now for simplicity, for values see StiffString.lib
strings = sum(i,nStrings,
    forceModel(i)<:
    fd.linInterp1D(nPoints,inPoint(i)):
    stiffstring[radius = (i+1) * 1e-4;]:
    fd.linInterp1DOut(nPoints,outPoint)
);

process = strings : /(nStrings) <: _,_;