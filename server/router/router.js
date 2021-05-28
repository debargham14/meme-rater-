const route = require ('express').Router()
const controller = require('../controller/controller');
const store = require ('../middleware/multer')
//routes
route.get ('/', controller.home);
//maximums 12 images can be posted at a time
route.post ('/uploadmultiple', store.array('images', 12), controller.uploads);
route.post ('/posts/:id/act', controller.updateVotes);

module.exports = route;