const express = require('express');
var router = express.Router();
var path = require('path');
//
router.get('/', (req, res) => {
    console.log("home pe session: ", req.session);
    res.sendFile(path.join(__dirname, '/../public/index.html'));
});
//
router.get('/login', (req, res) => {
    if (req.session.userid) {
        res.redirect('/logs');
    } else {
        res.sendFile(path.join(__dirname, '/../public/login.html'));
    }
});
//
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '/../public/register.html'));
});
//
//
router.post('/login', function (req, res) {
    var user = {
        email: req.body.email,
        pass: req.body.pass
    };
    var mysql = require('mysql');
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'aakash',
        database: 'imdb2'
    });
    var loginUser = 'SELECT * FROM user WHERE email="' + user.email + '" AND pass="' + user.pass + '";';
    try {
        connection.query(loginUser, function (err, data) {
            var msg = '';
            if (err) {
                msg = 'Error connecting..';
                res.render('error', {
                    message: msg,
                    link: {
                        text: 'Home',
                        link: '/'
                    }
                });
            } else {
                if (data.length) {
                    req.session.userid = data[0].userid;
                    req.session.name = data[0].name;
                    req.session.email = data[0].email;
                    console.log("session", req.session);
                    res.redirect('/logs');
                } else {
                    msg = 'Invalid Email or Password!!';
                    res.render('error', {
                        message: msg,
                        link: {
                            text: 'Login',
                            link: '/login'
                        }
                    });
                }
            }
        });
    } catch (err) {
        res.render('error', {
            msg: "Error Occured!",
            link: {
                text: 'Home',
                link: '/'
            }
        });
        console.log("Error Occured!");
    }
});
//
router.post('/register', function (req, res) {
    var newUser = {
        name: req.body.name,
        email: req.body.email,
        pass: req.body.pass
    };
    if (newUser.name && newUser.email && newUser.pass) {
        var mysql = require('mysql');
        var connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'aakash',
            database: 'imdb2'
        });
        var createUser = 'INSERT INTO user(name,email,pass) VALUES("' + newUser.name + '","' + newUser.email + '","' + newUser.pass + '");';
        try {
            connection.query(createUser, function (err, data) {
                var msg = '';
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        msg = 'This email has already been registered!! Enter another email or Try logging in instead.';
                        res.render('error', {
                            message: msg,
                            link: {
                                text: 'Login',
                                link: '/login'
                            }
                        });
                    }
                } else {
                    msg = 'Registration Successful!';
                    res.render('success', {
                        message: msg,
                        link: {
                            text: 'Login',
                            link: '/login'
                        }
                    });
                }
            });
        } catch (err) {
            res.render('error', {
                message: "Error Occured!",
                link: {
                    text: 'Home',
                    link: '/'
                }
            });
            console.log("Error Occured!");
        }
    } else {
        res.render('error', {
            msg: "Enter credentials properly!!",
            link: {
                text: 'Back',
                link: '/register'
            }
        });
    }
});
router.get('/getmovie', (req, res) => {
    var title = req.query.title;
    title = add(title);
    var url = 'http://www.omdbapi.com/?apikey=ec6483bd&plot=full&t=' + title;
    var request = require('request');
    var reqs = request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var mysql = require('mysql');
            var connection = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: 'aakash',
                database: 'imdb2'
            });
            var obj = JSON.parse(body);
            var findRating = 'SELECT AVG(rating) AS rtmRating FROM ur WHERE mid="' + obj.imdbID + '";';
            //try{
            connection.query(findRating, function (err, data) {
                var msg = '';
                if (err) {
                    msg = 'Server issues!!';
                    res.render('error', {
                        message: msg,
                        link: {
                            text: 'Home',
                            link: '/'
                        }
                    });
                } else {
                    console.log(data);
                    if (data.length) {
                        res.render('movie', {
                            rtmRating: JSON.parse(JSON.stringify(data)),
                            data: obj
                        });
                    } else {
                        res.render('error', {
                            message: "Could not load!",
                            link: {
                                text: "Home",
                                link: "/"
                            }
                        });
                    }
                }
            });
            //}
            /*catch (err) {
    res.render('error', {
        message: "Error Occured!"
        , link: {
            text: 'Home'
            , link: '/'
        }
    });
    console.log("Error Occured!");
}*/
        }
    });
});
router.post('/rate', (req, res) => {
    var rating = {
        rating: req.body.rating,
        mid: req.body.mid,
        mname: req.body.mname
    };
    console.dir(rating);
    var mysql = require('mysql');
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'aakash',
        database: 'imdb2'
    });
    var checkUserRating = 'SELECT * FROM ur WHERE userid="' + req.session.userid + '" AND mid="' + rating.mid + '";';
    var updateUserRating = 'UPDATE ur SET rating="' + rating.rating + '" WHERE userid="' + req.session.userid + '" AND mid="' + rating.mid + '";';
    if (req.session.userid) {
        try {
            connection.query(checkUserRating, function (err, data) {
                if (err) {
                    res.send({
                        loggedIn: true,
                        errorWhileRating: true,
                        message: "Unable to add your rating to database currently! Sorry for inconvinience."
                    });
                } else {
                    console.log(data);
                    if (data.length) {
                        try {
                            connection.query(updateUserRating, function (err, data2) {
                                var msg = '';
                                if (err) {
                                    msg = 'Unable to add your rating to database currently! Sorry for inconvinience.';
                                } else {
                                    msg = 'You updated your Rating to ' + rating.rating + ' stars for ' + rating.mname + '!';
                                }
                                res.send({
                                    loggedIn: true,
                                    errorWhileRating: false,
                                    message: msg
                                });
                            });
                        } catch (err) {
                            res.send({
                                loggedIn: true,
                                errorWhileRating: true,
                                message: 'Cannot Rate Currently!'
                            });
                            console.log("Error Occured!");
                        }
                    } else {
                        var addRating = 'INSERT INTO ur VALUES("' + req.session.userid + '","' + rating.mid + '","' + rating.mname + '","' + rating.rating + '");';
                        try {
                            connection.query(addRating, function (err, data3) {
                                var msg = '';
                                if (err) {
                                    msg = 'Unable to add your rating to database currently! Sorry for inconvinience.';
                                } else {
                                    msg = 'You submitted a Rating of ' + rating.rating + ' stars for ' + rating.mname + '!';
                                }
                                res.send({
                                    loggedIn: true,
                                    errorWhileRating: false,
                                    message: msg
                                });
                            });
                        } catch (err) {
                            res.send({
                                loggedIn: true,
                                errorWhileRating: true,
                                message: 'Cannot Rate Currently!'
                            });
                            console.log("Error Occured!");
                        }
                    }
                }
            });
        } catch (err) {
            res.send({
                loggedIn: true,
                errorWhileRating: true,
                message: 'Cannot Rate Currently!'
            });
            console.log("Error Occured!");
        }
    } else {
        res.send({
            loggedIn: false,
            errorWhileRating: false,
            message: 'Login first!'
        });
    }
});
router.get('/logs', function (req, res) {
    console.log("req.session : ", req.session);
    if (req.session.userid) {
        var mysql = require("mysql");
        var connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'aakash',
            database: 'imdb2'
        });
        var nm = req.session.name;
        var em = req.session.email;
        var findRating = 'SELECT * FROM ur WHERE userid="' + req.session.userid + '";';
        try {
            connection.query(findRating, function (err, rows) {
                if (err) {
                    res.render('error', {
                        msg: "Error",
                        link: {
                            text: "Home",
                            link: "/"
                        }
                    });
                } else {
                    if (rows.length) {
                        console.log(rows);
                        res.render('profile', {
                            name: nm,
                            email: em,
                            list: JSON.parse(JSON.stringify(rows))
                        });
                    } else {
                        console.log("no movies rated by this user");
                        res.render('profile', {
                            name: nm,
                            email: em,
                            list: null
                        });
                    }
                }
            });
        } catch (x) {
            res.render('error', {
                msg: "Error Occurred!!",
                link: {
                    text: "Home",
                    link: "/"
                }
            });
            console.log("Error Occured!");
        }
    } else {
        res.redirect("/login");
    }
});
//
router.get('/logout', function (req, res) {
    req.session.destroy(function () {
        console.log("User logged out!")
    });
    console.log("session after logout: ", req.session);
    res.redirect('/login');
});
//
router.get(function (req, res) {
    res.render('nf', {
        message: "Does Not Exist"
    });
});

function add(mname) {
    for (i = 0; i < mname.length; i++) {
        if (mname[i] == ' ') {
            mname = mname.replace(' ', '+');
        }
    }
    return mname;
}
module.exports = router;
