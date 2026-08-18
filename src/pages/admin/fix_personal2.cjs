const fs = require('fs');

let pb = fs.readFileSync('balance/personalBalance.jsx', 'utf-8');
pb = pb.replace(/\/\* Update logic tailored for legacy compatibility \n\/\* \.\.\. \(omitted for brevity, assume simple update\) \*\/ \*\//g, 
`// Update logic tailored for legacy compatibility 
// ... (omitted for brevity, assume simple update)`);
fs.writeFileSync('balance/personalBalance.jsx', pb);
