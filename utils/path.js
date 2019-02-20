const path = require('path');

// mainModule.filename: current project's main directory
// => // C:\Joon_Cloud\OneDrive\myApps\node\2ndPhase\express_server
// console.log(path.dirname(process.mainModule.filename)); 

module.exports = path.dirname(process.mainModule.filename);