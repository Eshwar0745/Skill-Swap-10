require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const OfferedSkill = require('../models/OfferedSkill');
const RequestedSkill = require('../models/RequestedSkill');
const Exchange = require('../models/Exchange');
const Review = require('../models/Review');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/';
const MONGO_DB = process.env.MONGO_DB || 'skillswap';

// All users will have this password
const DEFAULT_PASSWORD = 'Password123';

const users = [
  {
    name: 'Alice Johnson',
    email: 'alice@skillswap.com',
    bio: 'Full-stack developer with 5 years of experience. Love teaching React and Node.js!',
    location: 'San Francisco, CA',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
    offeredSkills: [
      { title: 'React Development', description: 'Build modern web apps with React', categories: ['Web Development', 'Programming'] },
      { title: 'Node.js Backend', description: 'Create scalable APIs', categories: ['Programming', 'Web Development'] }
    ],
    requestedSkills: [
      { title: 'UI/UX Design', description: 'Want to learn design principles', categories: ['Design', 'UI/UX Design'] },
      { title: 'Spanish Language', description: 'Beginner level Spanish', categories: ['Languages'] }
    ]
  },
  {
    name: 'Bob Smith',
    email: 'bob@skillswap.com',
    bio: 'Graphic designer and illustrator. Passionate about visual storytelling.',
    location: 'New York, NY',
    avatarUrl: 'https://i.pravatar.cc/150?img=2',
    offeredSkills: [
      { title: 'Adobe Photoshop', description: 'Photo editing and digital art', categories: ['Design', 'Graphic Design'] },
      { title: 'UI/UX Design', description: 'User interface and experience design', categories: ['Design', 'UI/UX Design'] }
    ],
    requestedSkills: [
      { title: 'React Development', description: 'Want to code my designs', categories: ['Web Development', 'Programming'] },
      { title: 'Photography', description: 'Improve my photography skills', categories: ['Photography'] }
    ]
  },
  {
    name: 'Carol Martinez',
    email: 'carol@skillswap.com',
    bio: 'Data scientist and machine learning engineer. Love working with Python.',
    location: 'Austin, TX',
    avatarUrl: 'https://i.pravatar.cc/150?img=3',
    offeredSkills: [
      { title: 'Python Programming', description: 'Data analysis and ML with Python', categories: ['Programming', 'Data Science'] },
      { title: 'Machine Learning', description: 'Build ML models', categories: ['Machine Learning', 'AI'] }
    ],
    requestedSkills: [
      { title: 'Guitar Playing', description: 'Learn acoustic guitar', categories: ['Music'] },
      { title: 'French Language', description: 'Intermediate French', categories: ['Languages'] }
    ]
  },
  {
    name: 'David Lee',
    email: 'david@skillswap.com',
    bio: 'Professional photographer and videographer. 10+ years capturing moments.',
    location: 'Los Angeles, CA',
    avatarUrl: 'https://i.pravatar.cc/150?img=4',
    offeredSkills: [
      { title: 'Photography', description: 'Portrait and landscape photography', categories: ['Photography'] },
      { title: 'Video Editing', description: 'Premier Pro and Final Cut', categories: ['Video Editing'] }
    ],
    requestedSkills: [
      { title: 'Business Strategy', description: 'Growing my photography business', categories: ['Business'] },
      { title: 'Social Media Marketing', description: 'Instagram and TikTok marketing', categories: ['Marketing'] }
    ]
  },
  {
    name: 'Emma Wilson',
    email: 'emma@skillswap.com',
    bio: 'Yoga instructor and wellness coach. Helping people find balance.',
    location: 'Portland, OR',
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
    offeredSkills: [
      { title: 'Yoga Teaching', description: 'Hatha and Vinyasa yoga', categories: ['Health & Fitness'] },
      { title: 'Meditation', description: 'Mindfulness and meditation techniques', categories: ['Health & Fitness'] }
    ],
    requestedSkills: [
      { title: 'Website Development', description: 'Build my yoga studio website', categories: ['Web Development'] },
      { title: 'Cooking', description: 'Healthy meal prep', categories: ['Cooking'] }
    ]
  },
  {
    name: 'Frank Garcia',
    email: 'frank@skillswap.com',
    bio: 'Mobile app developer specializing in iOS and Flutter.',
    location: 'Seattle, WA',
    avatarUrl: 'https://i.pravatar.cc/150?img=6',
    offeredSkills: [
      { title: 'iOS Development', description: 'Swift and SwiftUI', categories: ['Mobile Development', 'Programming'] },
      { title: 'Flutter Development', description: 'Cross-platform mobile apps', categories: ['Mobile Development', 'Programming'] }
    ],
    requestedSkills: [
      { title: 'Cloud Architecture', description: 'AWS and cloud deployment', categories: ['Programming'] },
      { title: 'Piano Playing', description: 'Learn classical piano', categories: ['Music'] }
    ]
  },
  {
    name: 'Grace Chen',
    email: 'grace@skillswap.com',
    bio: 'Content writer and copywriter. Words are my canvas.',
    location: 'Boston, MA',
    avatarUrl: 'https://i.pravatar.cc/150?img=7',
    offeredSkills: [
      { title: 'Content Writing', description: 'Blog posts, articles, and copy', categories: ['Writing'] },
      { title: 'Spanish Language', description: 'Fluent Spanish speaker', categories: ['Languages'] }
    ],
    requestedSkills: [
      { title: 'SEO Optimization', description: 'Improve my writing for SEO', categories: ['Marketing'] },
      { title: 'Graphic Design', description: 'Create blog graphics', categories: ['Design'] }
    ]
  },
  {
    name: 'Henry Taylor',
    email: 'henry@skillswap.com',
    bio: 'Professional chef with Italian cuisine expertise.',
    location: 'Chicago, IL',
    avatarUrl: 'https://i.pravatar.cc/150?img=8',
    offeredSkills: [
      { title: 'Cooking', description: 'Italian cuisine and pasta making', categories: ['Cooking'] },
      { title: 'Baking', description: 'Bread and pastry techniques', categories: ['Cooking'] }
    ],
    requestedSkills: [
      { title: 'Photography', description: 'Food photography for my restaurant', categories: ['Photography'] },
      { title: 'Video Editing', description: 'Create cooking tutorial videos', categories: ['Video Editing'] }
    ]
  },
  {
    name: 'Ivy Brown',
    email: 'ivy@skillswap.com',
    bio: 'Marketing manager with expertise in digital campaigns.',
    location: 'Miami, FL',
    avatarUrl: 'https://i.pravatar.cc/150?img=9',
    offeredSkills: [
      { title: 'Social Media Marketing', description: 'Instagram, Facebook, LinkedIn strategy', categories: ['Marketing'] },
      { title: 'Business Strategy', description: 'Growth hacking and business planning', categories: ['Business'] }
    ],
    requestedSkills: [
      { title: 'Data Analysis', description: 'Analyze marketing metrics', categories: ['Data Science'] },
      { title: 'Yoga Teaching', description: 'Personal wellness practice', categories: ['Health & Fitness'] }
    ]
  },
  {
    name: 'Jack Anderson',
    email: 'jack@skillswap.com',
    bio: 'Musician and music producer. Love all genres!',
    location: 'Nashville, TN',
    avatarUrl: 'https://i.pravatar.cc/150?img=10',
    offeredSkills: [
      { title: 'Guitar Playing', description: 'Acoustic and electric guitar', categories: ['Music'] },
      { title: 'Music Production', description: 'Ableton and Logic Pro', categories: ['Music'] }
    ],
    requestedSkills: [
      { title: 'Piano Playing', description: 'Learn keyboard for compositions', categories: ['Music'] },
      { title: 'Video Production', description: 'Create music videos', categories: ['Video Editing'] }
    ]
  },
  {
    name: 'Karen White',
    email: 'karen@skillswap.com',
    bio: 'Language teacher specializing in French and German.',
    location: 'Washington, DC',
    avatarUrl: 'https://i.pravatar.cc/150?img=11',
    offeredSkills: [
      { title: 'French Language', description: 'All levels from beginner to advanced', categories: ['Languages'] },
      { title: 'German Language', description: 'Conversational and business German', categories: ['Languages'] }
    ],
    requestedSkills: [
      { title: 'Web Development', description: 'Create language learning platform', categories: ['Web Development'] },
      { title: 'Podcast Production', description: 'Start a language podcast', categories: ['Other'] }
    ]
  },
  {
    name: 'Leo Kumar',
    email: 'leo@skillswap.com',
    bio: 'Cloud engineer and DevOps specialist.',
    location: 'Denver, CO',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    offeredSkills: [
      { title: 'Cloud Architecture', description: 'AWS, Azure, and Google Cloud', categories: ['Programming'] },
      { title: 'DevOps', description: 'CI/CD and infrastructure automation', categories: ['Programming'] }
    ],
    requestedSkills: [
      { title: 'Public Speaking', description: 'Present at tech conferences', categories: ['Other'] },
      { title: 'Writing', description: 'Technical blog writing', categories: ['Writing'] }
    ]
  },
  {
    name: 'Maria Rodriguez',
    email: 'maria@skillswap.com',
    bio: 'Craft expert specializing in woodworking and pottery.',
    location: 'Santa Fe, NM',
    avatarUrl: 'https://i.pravatar.cc/150?img=13',
    offeredSkills: [
      { title: 'Woodworking', description: 'Furniture making and carving', categories: ['Crafts'] },
      { title: 'Pottery', description: 'Ceramics and wheel throwing', categories: ['Crafts'] }
    ],
    requestedSkills: [
      { title: 'E-commerce', description: 'Sell my crafts online', categories: ['Business'] },
      { title: 'Photography', description: 'Product photography', categories: ['Photography'] }
    ]
  },
  {
    name: 'Nathan Green',
    email: 'nathan@skillswap.com',
    bio: 'Game developer and 3D artist.',
    location: 'San Diego, CA',
    avatarUrl: 'https://i.pravatar.cc/150?img=14',
    offeredSkills: [
      { title: 'Game Development', description: 'Unity and Unreal Engine', categories: ['Programming', 'Gaming'] },
      { title: '3D Modeling', description: 'Blender and Maya', categories: ['Design', 'Gaming'] }
    ],
    requestedSkills: [
      { title: 'Sound Design', description: 'Create game audio', categories: ['Music'] },
      { title: 'Marketing', description: 'Promote my indie game', categories: ['Marketing'] }
    ]
  },
  {
    name: 'Olivia Thompson',
    email: 'olivia@skillswap.com',
    bio: 'Personal trainer and nutrition coach.',
    location: 'Phoenix, AZ',
    avatarUrl: 'https://i.pravatar.cc/150?img=15',
    offeredSkills: [
      { title: 'Personal Training', description: 'Strength and cardio training', categories: ['Health & Fitness'] },
      { title: 'Nutrition Coaching', description: 'Meal planning and healthy eating', categories: ['Health & Fitness'] }
    ],
    requestedSkills: [
      { title: 'App Development', description: 'Build fitness tracking app', categories: ['Mobile Development'] },
      { title: 'Meditation', description: 'Add mindfulness to my practice', categories: ['Health & Fitness'] }
    ]
  },
  {
    name: 'Paul Jackson',
    email: 'paul@skillswap.com',
    bio: 'Data analyst and Excel wizard.',
    location: 'Dallas, TX',
    avatarUrl: 'https://i.pravatar.cc/150?img=16',
    offeredSkills: [
      { title: 'Data Analysis', description: 'Excel, SQL, and data visualization', categories: ['Data Science'] },
      { title: 'SEO Optimization', description: 'On-page and technical SEO', categories: ['Marketing'] }
    ],
    requestedSkills: [
      { title: 'Python Programming', description: 'Automate my workflows', categories: ['Programming'] },
      { title: 'Public Speaking', description: 'Present data insights', categories: ['Other'] }
    ]
  },
  {
    name: 'Quinn Martinez',
    email: 'quinn@skillswap.com',
    bio: 'Pianist and music teacher with classical training.',
    location: 'Atlanta, GA',
    avatarUrl: 'https://i.pravatar.cc/150?img=17',
    offeredSkills: [
      { title: 'Piano Playing', description: 'Classical and jazz piano', categories: ['Music'] },
      { title: 'Music Theory', description: 'Composition and harmony', categories: ['Music'] }
    ],
    requestedSkills: [
      { title: 'Guitar Playing', description: 'Learn fingerstyle guitar', categories: ['Music'] },
      { title: 'Recording Studio Setup', description: 'Home studio for teaching', categories: ['Music'] }
    ]
  },
  {
    name: 'Rachel Kim',
    email: 'rachel@skillswap.com',
    bio: 'Podcast host and audio engineer.',
    location: 'Minneapolis, MN',
    avatarUrl: 'https://i.pravatar.cc/150?img=18',
    offeredSkills: [
      { title: 'Podcast Production', description: 'Recording, editing, and publishing', categories: ['Other'] },
      { title: 'Public Speaking', description: 'Interviewing and presentation skills', categories: ['Other'] }
    ],
    requestedSkills: [
      { title: 'Social Media Marketing', description: 'Grow podcast audience', categories: ['Marketing'] },
      { title: 'Video Production', description: 'Create video podcasts', categories: ['Video Editing'] }
    ]
  },
  {
    name: 'Sam Patel',
    email: 'sam@skillswap.com',
    bio: 'E-commerce entrepreneur and Shopify expert.',
    location: 'Houston, TX',
    avatarUrl: 'https://i.pravatar.cc/150?img=19',
    offeredSkills: [
      { title: 'E-commerce', description: 'Shopify store setup and optimization', categories: ['Business'] },
      { title: 'Digital Marketing', description: 'Facebook and Google Ads', categories: ['Marketing'] }
    ],
    requestedSkills: [
      { title: 'Graphic Design', description: 'Create product mockups', categories: ['Design'] },
      { title: 'Copywriting', description: 'Product descriptions that convert', categories: ['Writing'] }
    ]
  },
  {
    name: 'Tina Nguyen',
    email: 'tina@skillswap.com',
    bio: 'Professional sports coach specializing in tennis.',
    location: 'San Jose, CA',
    avatarUrl: 'https://i.pravatar.cc/150?img=20',
    offeredSkills: [
      { title: 'Tennis Coaching', description: 'Beginner to advanced tennis', categories: ['Sports'] },
      { title: 'Fitness Training', description: 'Cardio and agility training', categories: ['Health & Fitness'] }
    ],
    requestedSkills: [
      { title: 'Nutrition Coaching', description: 'Sports nutrition for athletes', categories: ['Health & Fitness'] },
      { title: 'Video Analysis', description: 'Analyze player techniques', categories: ['Video Editing'] }
    ]
  }
];

async function seed() {
  try {
    // Connect to MongoDB
    await mongoose.connect(`${MONGO_URI}${MONGO_DB}`);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await OfferedSkill.deleteMany({});
    await RequestedSkill.deleteMany({});
    await Exchange.deleteMany({});
    await Review.deleteMany({});
    console.log('✅ Data cleared');

    // Hash the default password once
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12);

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create({
        name: userData.name,
        email: userData.email,
        passwordHash: hashedPassword,
        bio: userData.bio,
        location: userData.location,
        avatarUrl: userData.avatarUrl,
      });
      createdUsers.push({ ...userData, _id: user._id });
      console.log(`   ✓ Created ${user.name}`);
    }

    // Create skills
    console.log('🎯 Creating skills...');
    for (const userData of createdUsers) {
      // Create offered skills
      for (const skill of userData.offeredSkills) {
        await OfferedSkill.create({
          ...skill,
          user: userData._id,
          tags: skill.categories.map(c => c.toLowerCase().replace(/ /g, '-')),
        });
      }

      // Create requested skills
      for (const skill of userData.requestedSkills) {
        await RequestedSkill.create({
          ...skill,
          user: userData._id,
          tags: skill.categories.map(c => c.toLowerCase().replace(/ /g, '-')),
        });
      }
      console.log(`   ✓ Created skills for ${userData.name}`);
    }

    // Create some sample exchanges (connections)
    console.log('🤝 Creating sample exchanges...');
    const sampleExchanges = [
      { requester: createdUsers[0]._id, provider: createdUsers[1]._id, status: 'accepted' }, // Alice <-> Bob
      { requester: createdUsers[2]._id, provider: createdUsers[0]._id, status: 'accepted' }, // Carol <-> Alice
      { requester: createdUsers[3]._id, provider: createdUsers[4]._id, status: 'proposed' }, // David -> Emma
      { requester: createdUsers[5]._id, provider: createdUsers[2]._id, status: 'accepted' }, // Frank <-> Carol
      { requester: createdUsers[1]._id, provider: createdUsers[6]._id, status: 'accepted' }, // Bob <-> Grace
      { requester: createdUsers[7]._id, provider: createdUsers[3]._id, status: 'accepted' }, // Henry <-> David
      { requester: createdUsers[8]._id, provider: createdUsers[9]._id, status: 'proposed' }, // Ivy -> Jack
      { requester: createdUsers[10]._id, provider: createdUsers[11]._id, status: 'accepted' }, // Karen <-> Leo
    ];

    for (const exchange of sampleExchanges) {
      await Exchange.create({
        ...exchange,
        notes: 'Looking forward to learning from you!',
      });
    }
    console.log('✅ Sample exchanges created');

    // Create some sample reviews
    console.log('⭐ Creating sample reviews...');
    const sampleReviews = [
      { reviewer: createdUsers[0]._id, reviewee: createdUsers[1]._id, rating: 5, comment: 'Excellent teacher! Very patient and knowledgeable.' },
      { reviewer: createdUsers[1]._id, reviewee: createdUsers[0]._id, rating: 5, comment: 'Great experience learning React. Highly recommended!' },
      { reviewer: createdUsers[2]._id, reviewee: createdUsers[0]._id, rating: 4, comment: 'Very helpful and clear explanations.' },
      { reviewer: createdUsers[0]._id, reviewee: createdUsers[2]._id, rating: 5, comment: 'Amazing ML teacher. Made complex topics easy to understand.' },
      { reviewer: createdUsers[5]._id, reviewee: createdUsers[2]._id, rating: 5, comment: 'Learned so much about Python and data science!' },
      { reviewer: createdUsers[7]._id, reviewee: createdUsers[3]._id, rating: 5, comment: 'Fantastic photography tips. My food photos look professional now!' },
      { reviewer: createdUsers[1]._id, reviewee: createdUsers[6]._id, rating: 4, comment: 'Good Spanish lessons, very practical approach.' },
      { reviewer: createdUsers[10]._id, reviewee: createdUsers[11]._id, rating: 5, comment: 'Best DevOps mentor! Helped me set up my entire cloud infrastructure.' },
    ];

    for (const review of sampleReviews) {
      await Review.create({
        ...review,
        context: 'general',
      });
    }
    console.log('✅ Sample reviews created');

    // Display summary
    console.log('\n📊 SEED SUMMARY');
    console.log('================');
    console.log(`👥 Users created: ${createdUsers.length}`);
    console.log(`📧 All users have email format: <name>@skillswap.com`);
    console.log(`🔑 All users have password: ${DEFAULT_PASSWORD}`);
    console.log(`🤝 Exchanges created: ${sampleExchanges.length}`);
    console.log(`⭐ Reviews created: ${sampleReviews.length}`);
    console.log('\n✨ Sample login credentials:');
    console.log('   Email: alice@skillswap.com');
    console.log('   Email: bob@skillswap.com');
    console.log('   Email: carol@skillswap.com');
    console.log(`   Password: ${DEFAULT_PASSWORD}`);
    console.log('\n🎉 Database seeded successfully!\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
