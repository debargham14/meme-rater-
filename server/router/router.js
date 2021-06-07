const route = require("express").Router();
const controller = require("../controller/controller");
const user = require ("../controller/user");
const store = require("../middleware/multer");
const { ensureAuthenticated, forwardAuthenticated } = require ("../passport/auth");
//adding the routes to visit the register and login page

route.get("/register", forwardAuthenticated, (req, res) => res.render('register'));
route.post("/register", user.register);
route.get("/signin", forwardAuthenticated, (req, res) => res.render('signin'));
route.post("/signin", user.signin);
route.get("/logout", ensureAuthenticated, user.logout);

//routes
route.get("/dashboard", ensureAuthenticated ,controller.home);
//maximums 12 images can be posted at a time
route.post("/uploadmultiple", store.array("images", 12), controller.uploads);
route.post("/posts/:id/act", controller.updateVotes);
route.get("/orderbyupvotes",  ensureAuthenticated, controller.orderByUpvotes); //route handler for handling the sort by feature based on upvote count on a post (high -low)
route.get("/orderbydownvotes",  ensureAuthenticated, controller.orderByDownvotes); //route handler for handling the sort by feature based on downvote count on a post (low - high)

module.exports = route;
