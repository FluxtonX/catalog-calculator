const averageDollarAge = 5.0; // example inflated age
// let's simulate what cfaPhase1 does for Multiple:
let cfaMultiple = 0;
if (averageDollarAge < 1) cfaMultiple = 3.5;
else if (averageDollarAge < 2) cfaMultiple = 5.0;
else if (averageDollarAge < 3) cfaMultiple = 7.5;
else if (averageDollarAge < 5) cfaMultiple = 10.0;
else cfaMultiple = 13.0; // or something similar
console.log('Multiple:', cfaMultiple);
