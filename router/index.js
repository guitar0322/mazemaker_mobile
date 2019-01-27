var router = require('express').Router();
var register = require('./register/index');
var login = require('./login/index');
var rank = require('./rank/index');
var match = require('./match/match');
var match_complete = require('./match/match_complete');
var match_cancel = require('./match/match_cancel');

router.use('/match', match);
router.use('/register',register);
router.use('/login',login);
router.use('/match/cancel', match_cancel);
router.use('/match/complete', match_complete);
router.use('/rank', rank);

module.exports = router;
