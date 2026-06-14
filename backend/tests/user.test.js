const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

describe('User Endpoints', () => {
  let userAToken, userBToken, userAId, userBId;

  beforeEach(async () => {
    const resA = await request(app).post('/api/auth/register').send({ name: 'User A', email: 'a@example.com', password: 'password123' });
    userAToken = resA.body.token;
    userAId = resA.body.user.id;

    const resB = await request(app).post('/api/auth/register').send({ name: 'User B', email: 'b@example.com', password: 'password123' });
    userBToken = resB.body.token;
    userBId = resB.body.user.id;
  });

  describe('GET /api/users/:id', () => {
    it('should return public profile without private fields', async () => {
      const res = await request(app)
        .get(`/api/users/${userBId}`)
        .set('Authorization', `Bearer ${userAToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('name', 'User B');
      expect(res.body).not.toHaveProperty('email');
      expect(res.body).not.toHaveProperty('passwordHash');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should allow user to update their own profile', async () => {
      const res = await request(app)
        .put(`/api/users/${userAId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ name: 'User A Updated', location: 'New York' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('User A Updated');
      expect(res.body.location).toBe('New York');
    });

    it('should not allow user to update another users profile', async () => {
      const res = await request(app)
        .put(`/api/users/${userBId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ name: 'Hacked Name' });
      
      expect(res.statusCode).toBe(403);
    });
  });
});
