const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const OfferedSkill = require('../models/OfferedSkill');
const RequestedSkill = require('../models/RequestedSkill');

describe('Match Endpoints', () => {
  let userAToken, userBToken, userCToken;
  let userAId, userBId, userCId;

  beforeEach(async () => {
    // Create User A (Alice)
    const resA = await request(app).post('/api/auth/register').send({ name: 'Alice', email: 'alice@example.com', password: 'password123' });
    userAToken = resA.body.token;
    userAId = resA.body.user.id;

    // Create User B (Bob)
    const resB = await request(app).post('/api/auth/register').send({ name: 'Bob', email: 'bob@example.com', password: 'password123' });
    userBToken = resB.body.token;
    userBId = resB.body.user.id;

    // Create User C (Charlie)
    const resC = await request(app).post('/api/auth/register').send({ name: 'Charlie', email: 'charlie@example.com', password: 'password123' });
    userCToken = resC.body.token;
    userCId = resC.body.user.id;

    // Setup Skills for true reciprocal match between A and B
    // Alice offers Python, wants Java
    await request(app).post('/api/offered-skills').set('Authorization', `Bearer ${userAToken}`).send({ title: 'Python', description: 'Advanced python' });
    await request(app).post('/api/requested-skills').set('Authorization', `Bearer ${userAToken}`).send({ title: 'Java', description: 'Beginner java' });

    // Bob offers Java, wants Python
    await request(app).post('/api/offered-skills').set('Authorization', `Bearer ${userBToken}`).send({ title: 'Java', description: 'Java programming' });
    await request(app).post('/api/requested-skills').set('Authorization', `Bearer ${userBToken}`).send({ title: 'Python', description: 'Python scripts' });

    // Charlie offers C++, wants Python (Charlie wants Python from Alice, but Alice doesn't want C++) -> One-sided match
    await request(app).post('/api/offered-skills').set('Authorization', `Bearer ${userCToken}`).send({ title: 'C++', description: 'Modern C++' });
    await request(app).post('/api/requested-skills').set('Authorization', `Bearer ${userCToken}`).send({ title: 'Python', description: 'Learn python' });
  });

  describe('GET /api/matches/reciprocal', () => {
    it('should return only true reciprocal matches', async () => {
      const res = await request(app)
        .get('/api/matches/reciprocal')
        .set('Authorization', `Bearer ${userAToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.matches).toHaveLength(1); // Should only match with Bob
      expect(res.body.matches[0].user._id).toBe(userBId);
      expect(res.body.matches[0].skillsICanTeachThem).toContain('Python');
      expect(res.body.matches[0].skillsTheyCanTeachMe).toContain('Java');
    });

    it('should not return matches for one-sided demands', async () => {
      const res = await request(app)
        .get('/api/matches/reciprocal')
        .set('Authorization', `Bearer ${userCToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.matches).toHaveLength(0); // Charlie has no reciprocal matches
    });
  });
});
