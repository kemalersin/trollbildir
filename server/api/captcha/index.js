var express = require('express');
var controller = require('./captcha.controller');


var ExpressBrute = require('express-brute');

var store = new ExpressBrute.MemoryStore();
var bruteforce = new ExpressBrute(store, {
    freeRetries: 50,
    maxWait: 5000
});

var router = express.Router();

router.get('/', bruteforce.prevent, controller.create);

module.exports = router;
