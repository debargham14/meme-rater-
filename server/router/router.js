const route = require ('express').Router()
const controller = require('../controller/controller');
const store = require ('../middleware/multer')
//routes
route.get ('/', controller.home);
route.post ('/uploadmultiple', store.array('images', 1), controller.uploads);

module.exports = route;