const handlebars = require ('handlebars');
const User = require ('../model/userschema');
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

handlebars.registerHelper("isdefined", function (v1) {
    return (v1 !== undefined)
});

handlebars.registerHelper("checkNotEmpty", function (v1) {
    return (v1 != '')
});

exports.register = (req, res) => {
    const {username, email, password, password2} = req.body;
    let errors =[];

    //check the required fields
    if(!username  || !email || !password || !password2) {
        errors.push ({masg: 'Please fill in all details'});
    }

    //check password match
    if(password !== password2) {
        errors.push ({msg: 'Passwords donot match'});
    }

    //check pass length
    if(password.length < 6) {
        errors.push( {msg: 'Password should be atleast 6 characters'});
    }

    if (errors.length > 0) {
        res.render ('register', {
            errors,
            username, 
            email,
            password,
            password2
        });
    }
    else {
        //Validation passed 
        User.findOne({email: email})
            .then(user => {
                if(user) {
                    //User Exists
                    errors.push ({msg: 'Email is already registered'});
                    res.render ('register', {
                        errors,
                        username, 
                        email,
                        password,
                        password2
                    });
                } else {
                    const newUser = new User({
                        username, 
                        email, 
                        password
                    });
                    
                    //Hash Password
                    bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        //set password to hashed
                        newUser.password = hash;
                        //save the user
                        newUser.save()
                            .then(user => {
                                req.flash ('success_msg', 'You are now registered and can sign in');
                                res.redirect('/signin');
                            })
                            .catch(err => console.log(err));
                    }))
                }
            }); 
    }
}

exports.signin = async (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',      
        failureRedirect: '/signin',
        failureFlash: true
      })(req, res, next);
}

exports.logout = (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/signin');
}