export const calcDiceMultiplier=(chance:number)=>Math.max(1.01,99/chance);
export const calcMinesMultiplier=(picks:number,mines:number)=>Number((1+picks*(0.12+mines/25)).toFixed(2));
