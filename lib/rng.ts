export const rand=(min:number,max:number)=>Math.random()*(max-min)+min;
export const randInt=(min:number,max:number)=>Math.floor(rand(min,max+1));
export const pick=<T,>(items:T[])=>items[Math.floor(Math.random()*items.length)];
