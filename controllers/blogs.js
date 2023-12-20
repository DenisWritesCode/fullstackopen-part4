const blogsRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Blog = require('../models/blog');

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
    if (!decodedToken.id) {
        return response.status(401).json({ error: 'token invalid' });
    }

    const user = request.user;
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

    saveResult.populate('user', {
        username: 1,
        name: 1,
    });
    response.status(201).json(saveResult);
});

blogsRouter.delete('/:id', async (request, response) => {
    // make sure the user delete a blog is the blog's creator
    const blogToDelete = await Blog.findById(request.params.id);
    if (!blogToDelete) {
        return response.status(204).end();
    }
    const decodedToken = jwt.verify(request.token, process.env.SECRET);
    if (!decodedToken.id) {
        return response
            .status(401)
            .json({ error: 'token invalid for deletion' });
    }
    const user = request.user;
    if (blogToDelete.user.toString() === user.id.toString()) {
        await Blog.findByIdAndDelete(request.params.id);
        response.status(204).end();
    } else {
        return response.status(401).end();
    }
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
