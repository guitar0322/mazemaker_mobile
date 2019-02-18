var router = require('express').Router();
var register = require('./register/index');
var login = require('./login/index');
var rank = require('./rank/index');
var tutorial = require('./tutorial/index');

router.use('/register',register);
router.use('/login',login);
router.use('/rank',rank);
router.use('/tutorial', tutorial);

module.exports = router;
