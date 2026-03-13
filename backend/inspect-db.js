const mongoose = require('mongoose');
const fs = require('fs');

mongoose.connect('mongodb://localhost:27017/skillswap').then(async () => {
  const Exchange = require('./models/Exchange');
  const ex = await Exchange.find({}).populate('requester provider').lean();
  const output = JSON.stringify(ex.map(e => ({
    id: e._id, 
    req: e.requester?.name, 
    reqEmail: e.requester?.email,
    prov: e.provider?.name, 
    provEmail: e.provider?.email,
    status: e.status
  })), null, 2);
  fs.writeFileSync('output.json', output);
  console.log("Wrote to output.json");
  process.exit();
}).catch(e => {
  fs.writeFileSync('output.json', String(e));
  process.exit(1);
});
