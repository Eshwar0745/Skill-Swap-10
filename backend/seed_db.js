require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const OfferedSkill = require('./models/OfferedSkill');
const RequestedSkill = require('./models/RequestedSkill');
const Exchange = require('./models/Exchange');

async function seed() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    console.log('Clearing old data...');
    // Only clear Alice/Bob and dummy users to avoid wiping the user's actual account
    const usersToDelete = await User.find({ email: { $in: ['alice@example.com', 'bob@example.com', 'charlie@example.com', 'dave@example.com', 'eve@example.com'] } });
    const userIds = usersToDelete.map(u => u._id);
    
    await OfferedSkill.deleteMany({ user: { $in: userIds } });
    await RequestedSkill.deleteMany({ user: { $in: userIds } });
    await Exchange.deleteMany({ $or: [{ requester: { $in: userIds } }, { provider: { $in: userIds } }] });
    await User.deleteMany({ _id: { $in: userIds } });

    console.log('Creating users...');
    const passwordHash = await bcrypt.hash('password123', 10);

    const alice = await User.create({ name: 'Alice', email: 'alice@example.com', passwordHash, provider: 'local', bio: 'Python expert looking to learn Java', location: 'Seattle' });
    const bob = await User.create({ name: 'Bob', email: 'bob@example.com', passwordHash, provider: 'local', bio: 'Java developer wanting to script in Python', location: 'New York' });
    const charlie = await User.create({ name: 'Charlie', email: 'charlie@example.com', passwordHash, provider: 'local', bio: 'C++ veteran', location: 'San Francisco' });
    const dave = await User.create({ name: 'Dave', email: 'dave@example.com', passwordHash, provider: 'local', bio: 'Frontend React dev', location: 'Austin' });
    const eve = await User.create({ name: 'Eve', email: 'eve@example.com', passwordHash, provider: 'local', bio: 'Backend Node dev', location: 'Denver' });

    console.log('Creating skills...');

    // Alice: Offers Python, Wants Java
    await OfferedSkill.create({ user: alice._id, title: 'Python', description: 'I can teach you Python from scratch to advanced data analysis.' });
    await RequestedSkill.create({ user: alice._id, title: 'Java', description: 'I want to learn enterprise Java and Spring Boot.' });

    // Bob: Offers Java, Wants Python
    await OfferedSkill.create({ user: bob._id, title: 'Java', description: 'I have 5 years of Java experience. Can teach OOP and Spring.' });
    await RequestedSkill.create({ user: bob._id, title: 'Python', description: 'Need someone to teach me Python for AI/ML.' });

    // Charlie: Offers C++, Wants Python (One-sided match with Alice/Bob)
    await OfferedSkill.create({ user: charlie._id, title: 'C++', description: 'I teach memory management and high performance C++.' });
    await RequestedSkill.create({ user: charlie._id, title: 'Python', description: 'Looking to learn basic Python syntax.' });

    // Dave: Offers React, Wants Node.js
    await OfferedSkill.create({ user: dave._id, title: 'React', description: 'Frontend UI development with React and Next.js.' });
    await RequestedSkill.create({ user: dave._id, title: 'Node.js', description: 'I want to learn how to build APIs.' });

    // Eve: Offers Node.js, Wants React (Reciprocal with Dave)
    await OfferedSkill.create({ user: eve._id, title: 'Node.js', description: 'Backend development using Express and MongoDB.' });
    await RequestedSkill.create({ user: eve._id, title: 'React', description: 'I need help building user interfaces.' });

    console.log('Seeding complete!');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

seed();
