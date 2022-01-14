const execSync = require('child_process').execSync;

console.log('Building A-Frame:\n' + execSync('cd aframe && yarn build').toString());
console.log('Building babylon.js:\n' + execSync('cd babylonjs && yarn build').toString());
console.log('Building three.js:\n' + execSync('cd threejs && yarn build').toString());
console.log('Building Web:\n' + execSync('cd web && yarn build').toString());
console.log('Building Wonderland:\n' + execSync('cd wonderland && yarn build').toString());
console.log('Building zestyFormats:\n' + execSync('cd utils && yarn build').toString());
