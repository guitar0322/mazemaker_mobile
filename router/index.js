var router = require('express').Router();
var register = require('./register/index');
var login = require('./login/index');
<<<<<<< HEAD
var rank = require('./rank/index')
router.use('/register',register);
router.use('/login',login);
router.use('/rank',rank);
=======
var match = require('./match/match');
var match_complete = require('./match/match_complete');
var match_cancel = require('./match/match_cancel');

router.use('/match', match);
router.use('/register',register);
router.use('/login',login);
router.use('/match/cancel', match_cancel);
router.use('/match/complete', match_complete);

>>>>>>> 9f8b31ce68767e754eb4f67401f530969d88e8af
module.exports = router;
