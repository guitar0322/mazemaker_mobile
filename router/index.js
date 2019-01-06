var router = require('express').Router();
var register = require('./register/index');
var login = require('./login/index');
router.use('/register',register);
router.use('/login',login);
module.exports = router;
