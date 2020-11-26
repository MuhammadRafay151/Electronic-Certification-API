const path = require('path'); 
   
console.log("Current directory:", __dirname); 
   
// Normalization of the absolute paths 
path1 = path.resolve(__dirname,'..', 'config', 'connection-org1.json'); 
console.log(path1) 