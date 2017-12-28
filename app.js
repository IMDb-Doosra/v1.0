const express = require('express');
var app = express();
var router = require('./routes/router.js');
app.use(express.static('public'));
//
//session
var session = require('express-session');
var cookie = require('cookie-parser');
app.use(cookie());
app.use(session({
    secret: 'imdbdoosra',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 86400000,
        expires: false
    }
}));
//
var ejs = require('ejs');
app.set('view engine', 'ejs');
//
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use('/', router);
//
app.listen(9718, function () {
    console.log("server started at 9718");
});
//omdb api key: ec6483bd
//http://www.omdbapi.com/?apikey=ec6483bd&t=The+Flash&Season=3&Episode=19
