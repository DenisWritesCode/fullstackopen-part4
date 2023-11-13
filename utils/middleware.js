const logger = require('./logger');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const requestLogger = (request, response, next) => {
    logger.info('Method:', request.method);
    logger.info('Path:  ', request.path);
    logger.info('Body:  ', request.body);
    logger.info('---');
    next();
};

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (error, request, response, next) => {
    logger.error(error.message);

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' });
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message });
    } else if (error.name === 'JsonWebTokenError') {
        return response.status(401).json({ error: error.message });
    }

    next(error);
};

/**
 * A function to get the user token from the request object's authorization header
 */
const tokenExtractor = (request, response, next) => {
    // Authorization header
    const authorization = request.get('authorization');
    if (authorization && authorization.startsWith('Bearer')) {
        request.token = authorization.replace('Bearer ', '');
    } else {
        request.token = null;
    }

    next();
};

/**
 * A function to append the user to the request object
 */
const userExtractor = async (request, response, next) => {
    if (!request.token) {
        request.user = null;
    } else {
        const decodedToken = jwt.verify(request.token, process.env.SECRET);
        if (!decodedToken.id) {
            request.user = null;
        } else {
            request.user = await User.findById(decodedToken.id);
        }
    }

    next();
};

module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler,
    tokenExtractor,
    userExtractor,
};
