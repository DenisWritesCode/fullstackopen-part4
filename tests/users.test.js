const mongoose = require('mongoose');
const supertest = require('supertest');
const helper = require('./test_helper');
const app = require('../app');
const api = supertest(app);
const User = require('../models/user');

describe('Saving users', () => {
    beforeEach(async () => {
        await User.deleteMany({});
        await User.insertMany(helper.testUsers);
    });
    test('GET /api/users', async () => {
        await api
            .get('/api/users')
            .expect(200)
            .expect('Content-type', /application\/json/);
        // const users = await api.get('/api/users');
        // const usersInDB = await helper.usersInDB();
        // console.log('userInDB: ', usersInDB);
        // expect(users).toHaveLength(helper.testUsers.length);
    });
});

afterAll(async () => {
    await mongoose.connection.close();
});
