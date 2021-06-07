module.exports = {
    ensureAuthenticated: (req, res, next) => {
        if(req.isAuthenticated()) {
            return next();
        }
        req.flash ('error_msg', 'Please login to view this resource');
        res.redirect('/signin');
    },
    forwardAuthenticated: function(req, res, next) {
        if (!req.isAuthenticated()) {
          return next();
        }
        res.redirect('/dashboard');      
    },

    backwardAuthenticated: function (req, res, next) {
        if(req.isAuthenticated()) {
            res.redirect('/signin');
        }
    }
}