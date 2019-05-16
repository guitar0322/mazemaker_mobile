var router = require('express').Router();
var register = require('./register/index');
var login = require('./login/index');
var rank = require('./rank/index');
var tutorial = require('./tutorial/index');
var ticket = require('./ticket/index');
var adv = require('./adv/index');
var single = require('./single/index');
var stage = require('./stage/index');
var search = require('./search/index');
var addFriend = require('./addFriend/index');
var delFriend = require('./delFriend/index');
var acceptFriend = require('./acceptFriend/index');
var flist = require("./flist/index");
<<<<<<< HEAD
var notice = require("./notice/index");
=======
var reqlist = require("./reqlist/index");
>>>>>>> f4dc41e4cad26532674148d394e438a7e390dbd1

router.use('/register',register);
router.use('/login',login);
router.use('/rank',rank);
router.use('/tutorial', tutorial);
router.use('/ticket', ticket);
router.use('/adver', adv);
router.use('/single',single);
router.use('/stage', stage);
router.use('/search', search);
router.use('/addFriend', addFriend);
router.use('/delFriend', delFriend);
router.use('/acceptFriend', acceptFriend);
router.use('/flist', flist);
<<<<<<< HEAD
router.use('/notice', notice);
=======
router.use('/reqlist', reqlist);
>>>>>>> f4dc41e4cad26532674148d394e438a7e390dbd1

module.exports = router;
