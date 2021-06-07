const mongoose = require ('mongoose');

//schema to hold all the user 
const user = new mongoose.Schema ({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    
    password: {
        type: String,
        required: true,
    }
});
const User = mongoose.model ("user", user);
module.exports = User;