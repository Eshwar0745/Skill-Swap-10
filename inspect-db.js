const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/skillswap').then(async () => {
  const Exchange = require('./backend/models/Exchange');
  const ex = await Exchange.find({}).populate('requester provider').lean();
  console.log(JSON.stringify(ex.map(e => ({
    id: e._id, 
    req: e.requester?.name, 
    prov: e.provider?.name, 
    status: e.status
  })), null, 2));
  process.exit();
}).catch(e => {
  console.error(e);
  process.exit(1);
});
