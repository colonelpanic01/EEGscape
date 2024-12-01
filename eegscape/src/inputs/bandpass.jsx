import Fili from "fili";

export function bandpass(samplingFreq, lowFreq, highFreq) {
  const firCalculator = new Fili.FirCoeffs();
  const coefficients = firCalculator.bandpass({
    order: 101,
    Fs: samplingFreq,
    F1: lowFreq, // Low cutoff frequency
    F2: highFreq, // High cutoff frequency
  });
  const filter = new Fili.FirFilter(coefficients);

  return (value) => filter.singleStep(value);
}
