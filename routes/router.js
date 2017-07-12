const express = require('express');
var router = express.Router();
var path = require('path');
var bcrypt = require('bcryptjs');
//
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/../public/index.html'));
});
//
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '/../public/login.html'));
});
//
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '/../public/register.html'));
});
//
//
router.post('/login', function (req, res) {
    var user = {
        email: req.body.email
        , pass: req.body.pass
    };
    var mysql = require('mysql');
    var connection = mysql.createConnection({
        host: 'localhost'
        , user: 'root'
        , password: 'aakash'
        , database: 'imdb2'
    });
    var loginUser = 'SELECT * FROM user WHERE email="' + user.email + '" AND pass="' + user.pass + '";';
    try {
        connection.query(loginUser, function (err, data) {
            var msg = '';
            if (err) {
                msg = 'Error';
                res.send(msg);
            }
            else {
                if (data.length) {
                    //msg = 'Logged in as ' + data[0].name;
                    res.render('profile', {
                        name: data[0].name
                    });
                }
                else {
                    msg = 'Invalid Email or Password!!';
                    res.send(msg);
                }
            }
        });
    }
    catch (err) {
        res.send("Error Occured!");
        console.log("Error Occured!");
    }
});
//
router.post('/register', function (req, res) {
    var newUser = {
        name: req.body.name
        , email: req.body.email
        , pass: req.body.pass
    };
    if (newUser.name && newUser.email && newUser.pass) {
        var mysql = require('mysql');
        var connection = mysql.createConnection({
            host: 'localhost'
            , user: 'root'
            , password: 'aakash'
            , database: 'imdb2'
        });
        var createUser = 'INSERT INTO user(name,email,pass) VALUES("' + newUser.name + '","' + newUser.email + '","' + newUser.pass + '");';
        try {
            connection.query(createUser, function (err, data) {
                var msg = '';
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        msg = 'This email has already been registered!! Enter another email or Try logging in instead.';
                    }
                }
                else {
                    msg = 'Successful User Insertion';
                }
                res.send(msg);
            });
        }
        catch (err) {
            res.send("Error Occured!");
            console.log("Error Occured!");
        }
    }
    else {
        res.send("Enter credentials properly!!");
    }
});
module.exports = router;