const blogsRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Blog = require('../models/blog');
const User = require('../models/user');

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', {
        username: 1,
        name: 1,
    });
    response.json(blogs);
});

blogsRouter.get('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id).populate('user', {
        username: 1,
        name: 1,
    });
    if (blog) {
        response.json(blog);
    } else {
        response.status(404).end();
    }
});

blogsRouter.post('/', async (request, response) => {
    const body = request.body;

    // decode token to get the user details
    const decodedToken = jwt.verify(request.token, process.env.SECRET);
    console.log('decoded: ', decodedToken);
    if (!decodedToken.id) {
        return response.status(401).json({ error: 'token invalid' });
    }

    // find user by the decoded token data
    const user = await User.findById(decodedToken.id);
    console.log('decodedToken: ', decodedToken, user);
    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
        user: user._id,
    });

    const saveResult = await blog.save();
    // add newly saved blog to blogs array of user
    user.blogs = user.blogs.concat(saveResult._id);
    await user.save();

    response.status(201).json(saveResult);
});

blogsRouter.delete('/:id', async (request, response) => {
    await Blog.findByIdAndDelete(request.params.id);
    response.status(204).end();
});

blogsRouter.put('/:id', async (request, response) => {
    const body = request.body;

    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
    };

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
        new: true,
    });
    response.json(updatedBlog);
});

module.exports = blogsRouter;
