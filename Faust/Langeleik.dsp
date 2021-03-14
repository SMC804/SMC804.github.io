import("stdfaust.lib");
stiffstring = library("StiffString.lib");

strings(i) = stiffstring[radius = (i+1)*1e-4;];

nStrings = 8;

forceModel(i) = button("ExciteString%i") : ba.impulsify;
inPoint(i) = hslider("InputPoint%i",0.5,0,1,0.001) : *(strings(i).nPoints - 1);
outPoint(i) = hslider("OutputPoint%i",floor(strings(i).nPoints/2),0,strings(i).nPoints-1,0.01) : si.smoo;

// only changing radius right now for simplicity, for values see StiffString.lib
instrument = sum(i,nStrings,
    forceModel(i)<:
    fd.linInterp1D(strings(i).nPoints,inPoint(i)):
    strings(i).process:
    fd.linInterp1DOut(strings(i).nPoints,outPoint(i))
);

process = instrument : /(nStrings) <: _,_;