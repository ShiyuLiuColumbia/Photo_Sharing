var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

//schema setup 
var userSchema = new mongoose.Schema({
    username: String,
    password: String
});


//'passport-local-mongoose' has many built-in functions to have passport interact with mongoose, so that we can create a new user in mongoose more easily.
userSchema.plugin(passportLocalMongoose);


var User = mongoose.model('User', userSchema);

//export model so that we can use them in other files
module.exports = User;