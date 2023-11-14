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

const blogsInDB = async () => {
    const blogs = await Blog.find({});
    return blogs.map((blog) => blog.toJSON());
};

const usersInDB = async () => {
    const users = await User.find({});
    return users.map((user) => user.toJSON());
};

module.exports = {
    testBlogs,
    blogsInDB,
    usersInDB,
};
