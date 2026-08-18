const fs = require('fs');
let b = fs.readFileSync('balance/balance.jsx', 'utf-8');
b = b.replace(/\/\* CEO Tomás Manazza \n\/\* \{new Date\(\)\.getFullYear\(\)\} <\/p> <\/div> <\/div> \); \*\/ \*\//g, 
`// CEO Tomás Manazza 
// {new Date().getFullYear()}
</p> </div> </div> );`);
fs.writeFileSync('balance/balance.jsx', b);
