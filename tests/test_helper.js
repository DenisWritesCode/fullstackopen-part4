const Blog = require('../models/blog');
const User = require('../models/user');

const testBlogs = [
    {
        title: 'Blog 001',
        author: 'John Doe',
        url: 'test.url.com',
        likes: 5,
    },
    {
        title: 'Test Blog 002',
        author: 'John Test Doe',
        url: 'test.url.com',
        likes: 0,
    },
];

const testUsers = [
    {
        username: 'user001',
        name: 'John Doe',
    },
    {
        username: 'user002',
        name: 'John Doe 002',
    },
];

const blogsInDB = async () => {
    const blogs = await Blog.find({});
    return blogs.map((blog) => blog.toJSON());
};

const usersInDB = async () => {
    console.log('userInDB');
    const users = await User.find({});
    return users.map((user) => user.toJSON());
};

module.exports = {
    testBlogs,
    blogsInDB,
    testUsers,
    usersInDB,
};
