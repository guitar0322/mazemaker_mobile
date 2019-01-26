var router = require('express').Router();
var register = require('./register/index');
var login = require('./login/index');
var rank = require('./rank/index')
router.use('/register',register);
router.use('/login',login);
router.use('/rank',rank);
module.exports = router;
