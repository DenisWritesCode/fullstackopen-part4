const mongoose = require('mongoose');
const supertest = require('supertest');
const helper = require('./test_helper');
const app = require('../app');
const api = supertest(app);
const bcrypt = require('bcrypt');

const Blog = require('../models/blog');
const User = require('../models/user');

describe('Some blogs are saved', () => {
    beforeEach(async () => {
        await Blog.deleteMany({});
        await Blog.insertMany(helper.testBlogs);
    }, 30000);
    test('GET /api/blogs', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-type', /application\/json/);
    });

    test('The unique identifier for blog posts is named id', async () => {
        const blogs = await api.get('/api/blogs');

        expect(blogs.body[0].id).toBeDefined();
    });

    describe('adding new blogs', () => {
        beforeEach(async () => {
            await User.deleteMany({});

            const passwordHash = await bcrypt.hash('password', 10);
            const user = new User({
                username: 'username',
                name: 'User Name',
                blogs: [],
                passwordHash,
            });

            await user.save();
        }, 30000);
        test('making a post request to /api/blogs creates a new blog', async () => {
            const user = {
                username: 'username',
                password: 'password',
            };
            const authorisedUser = await api.post('/api/login').send(user);

            const blogsAtStart = await helper.blogsInDB();

            const newBlog = {
                title: 'Test Blog 003',
                author: 'John Test Doe',
                url: 'test.url.com',
                likes: 7,
            };

            await api
                .post('/api/blogs')
                .send(newBlog)
                .set('Authorization', `Bearer ${authorisedUser.body.token}`)
                .expect(201)
                .expect('Content-type', /application\/json/);

            const response = await api.get('/api/blogs');
            const contents = response.body.map((blog) => blog.title);
            expect(response.body).toHaveLength(blogsAtStart.length + 1);
            expect(contents).toContain(newBlog.title);
        });
        test('creating a new blog without proper credentials fails', async () => {
            const user = {
                username: 'username',
                password: 'passwords',
            };
            const authorisedUser = await api.post('/api/login').send(user);

            const blogsAtStart = await helper.blogsInDB();

            const newBlog = {
                title: 'Test Blog 004',
                author: 'John Test Doe',
                url: 'test.url.com',
                likes: 9,
            };

            await api
                .post('/api/blogs')
                .send(newBlog)
                .set('Authorization', `Bearer ${authorisedUser.body.token}`)
                .expect(401)
                .expect('Content-type', /application\/json/);

            const response = await api.get('/api/blogs');
            const contents = response.body.map((blog) => blog.title);
            expect(response.body).toHaveLength(blogsAtStart.length);
            expect(contents).not.toContain(newBlog.title);
        });

        test('missing likes property defaults to 0', async () => {
            const newBlog = {
                title: 'Test Blog 004',
                author: 'John Test Doe',
                url: 'test.url.com',
            };

            const user = {
                username: 'username',
                password: 'password',
            };
            const authorisedUser = await api.post('/api/login').send(user);

            await api
                .post('/api/blogs')
                .send(newBlog)
                .set('Authorization', `Bearer ${authorisedUser.body.token}`)
                .expect(201)
                .expect('Content-type', /application\/json/);

            const response = await api.get('/api/blogs');
            const contents = response.body.map((blog) => blog.likes);
            expect(contents).toContain(0);
        });

        test('missing title or url properties get a 400 bad request response', async () => {
            const user = {
                username: 'username',
                password: 'password',
            };
            const authorisedUser = await api.post('/api/login').send(user);
            const blogWithoutTitle = {
                author: 'John Test Doe',
                url: 'test.url.com',
                likes: 7,
            };

            const blogWithoutUrl = {
                title: 'Test Blog',
                author: 'John Test Doe',
                likes: 7,
            };

            await api
                .post('/api/blogs')
                .send(blogWithoutTitle)
                .set('Authorization', `Bearer ${authorisedUser.body.token}`)
                .expect(400);
            await api
                .post('/api/blogs')
                .send(blogWithoutUrl)
                .set('Authorization', `Bearer ${authorisedUser.body.token}`)
                .expect(400);
        });
    });

    describe('deleting a blog post', () => {
        beforeEach(async () => {
            await Blog.deleteMany({});
            await User.deleteMany({});

            const passwordHash = await bcrypt.hash('password', 10);
            let user = new User({
                username: 'username',
                name: 'User Name',
                blogs: [],
                passwordHash,
            });

            await user.save();

            const users = await User.find({});
            user = users[0];

            const blogs = helper.testBlogs.map(
                (blog) =>
                    new Blog({
                        title: blog.title,
                        author: blog.author,
                        url: blog.url,
                        likes: blog.likes,
                        user: user.id,
                    })
            );

            const blogsSavePromises = blogs.map((blog) => {
                blog.save();
                user.blogs = user.blogs.concat(blog.id);
            });
            await Promise.all(blogsSavePromises);
            await user.save();
        }, 30000);
        test('delete a single blog post', async () => {
            const user = {
                username: 'username',
                password: 'password',
            };
            const authorisedUser = await api.post('/api/login').send(user);
            const blogs = await helper.blogsInDB();
            const blogToDelete = blogs[0];

            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .set('Authorization', `Bearer ${authorisedUser.body.token}`)
                .expect(204);

            const blogsAfterDelete = await helper.blogsInDB();
            expect(blogsAfterDelete).toHaveLength(blogs.length - 1);

            const blogTitles = blogsAfterDelete.map((blog) => blog.title);
            expect(blogTitles).not.toContain(blogToDelete.title);
        });
    });

    describe('updating a blog post', () => {
        test('update entire blog post', async () => {
            const updatedBlog = {
                title: 'Updated blog',
                author: 'Doe John',
                url: 'url.test.com',
                likes: 777,
            };

            const blogToUpdate = await helper.blogsInDB();
            await api
                .put(`/api/blogs/${blogToUpdate[0].id}`)
                .send(updatedBlog)
                .expect(200);

            const updatedBlogs = await helper.blogsInDB();
            const blogTitles = updatedBlogs.map((blog) => blog.title);
            expect(blogTitles).toContain(updatedBlog.title);
        });
    });
});

describe('Saving users', () => {
    beforeEach(async () => {
        await User.deleteMany({});

        const passwordHash = await bcrypt.hash('secretPassword', 10);
        const firstUser = new User({
            username: 'firstTestUser',
            name: 'Test User',
            passwordHash,
        });

        await firstUser.save();
    }, 30000);
    test('adding new users works with unique user name', async () => {
        const usersAtStart = await helper.usersInDB();

        const newUser = {
            username: 'username',
            name: 'Name',
            password: 'userPassword',
        };

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-type', /application\/json/);

        const usersAtEnd = await helper.usersInDB();
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

        const usernames = usersAtEnd.map((user) => user.username);
        expect(usernames).toContain(newUser.username);
    });
    test('adding an already existing username fails', async () => {
        const usersAtStart = await helper.usersInDB();

        const existingUser = {
            username: 'firstTestUser',
            name: 'Different Name',
            password: 'differentPassword',
        };

        const result = await api
            .post('/api/users')
            .send(existingUser)
            .expect(400)
            .expect('Content-type', /application\/json/);

        expect(result.body.error).toContain('expected `username` to be unique');

        const usersAtEnd = await helper.usersInDB();
        expect(usersAtEnd).toHaveLength(usersAtStart.length);
    });
});

afterAll(async () => {
    await mongoose.connection.close();
});
