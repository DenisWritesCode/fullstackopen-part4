const mongoose = require('mongoose');
const supertest = require('supertest');
const helper = require('./test_helper');
const app = require('../app');
const api = supertest(app);

const Blog = require('../models/blog');

describe('Some blogs are saved', () => {
    beforeEach(async () => {
        await Blog.deleteMany({});
        await Blog.insertMany(helper.testBlogs);
    });
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
        test('making a post request to /api/blogs creates a new blog', async () => {
            const initialBlogs = await helper.blogsInDB();
            const newBlog = {
                title: 'Test Blog 003',
                author: 'John Test Doe',
                url: 'test.url.com',
                likes: 7,
            };

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(201)
                .expect('Content-type', /application\/json/);

            const response = await api.get('/api/blogs');
            const contents = response.body.map((blog) => blog.title);
            expect(response.body).toHaveLength(initialBlogs.length + 1);
            expect(contents).toContain(newBlog.title);
        });

        test('missing likes property defaults to 0', async () => {
            const newBlog = {
                title: 'Test Blog 004',
                author: 'John Test Doe',
                url: 'test.url.com',
            };

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(201)
                .expect('Content-type', /application\/json/);

            const response = await api.get('/api/blogs');
            const contents = response.body.map((blog) => blog.likes);
            expect(contents).toContain(0);
        });

        test('missing title or url properties get a 400 bad request response', async () => {
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

            await api.post('/api/blogs').send(blogWithoutTitle).expect(400);
            await api.post('/api/blogs').send(blogWithoutUrl).expect(400);
        });
    });

    describe('deleting a blog post', () => {
        test('delete a single blog post', async () => {
            const blogs = await helper.blogsInDB();
            const blogToDelete = blogs[0];

            await api.delete(`/api/blogs/${blogToDelete.id}`);

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

afterAll(async () => {
    await mongoose.connection.close();
});
