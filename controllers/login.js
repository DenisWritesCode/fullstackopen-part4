const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const loginRouter = require('express').Router();
const User = require('../models/user');

loginRouter.post('/', async (request, response) => {
    // extract the username and password
    const { username, password } = request.body;

    // Find the user corresponding to the username
    const user = await User.findOne({ username });
    /*
     * check if that user has provided the correct password.
     * if the user is null, then it means no user for that username exists
     * if the user has a correct password then we are good.
     */

    const isPasswordCorrect =
        user === null
            ? false
            : await bcrypt.compare(password, user.passwordHash);

    // if user === true && isPasswordCorrect === true, only then is this block skipped.
    // 401 === unauthorized
    if (!(user && isPasswordCorrect)) {
        return response.status(401).json({
            error: 'invalid username or password',
        });
    }

    // create user for whom we will create the token
    const userForToken = {
        username: user.username,
        id: user._id,
    };

    // sign the token of the user
    const token = jwt.sign(userForToken, process.env.SECRET);

    // response OK
    response
        .status(200)
        .send({ token, username: user.username, name: user.name });
});

module.exports = loginRouter;
