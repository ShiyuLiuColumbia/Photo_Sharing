var mongoose = require('mongoose');

//schema setup 
var experienceSchema = new mongoose.Schema({
    experience_title: String,
    image: String,
    description: String,
    //data association, associate comment with experience in one to many relationship. 
    //data association has two ways: 1.data embeded 2. data reference, we use 2 here
    //data reference will just store the object_id while data embedded will store all the data
    comments: [
    	{
    		type: mongoose.Schema.Types.ObjectId,
    		ref: 'Comment'
    	}
    ],
    author: {
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String
    }
});
//mongoose use the experienceSchema to build the collections named 'Experience' in database.
//Now we can use Experience.create(), Experience.find() etc.
var Experience = mongoose.model('Experience', experienceSchema);

//export model so that we can use them in other files
module.exports = Experience;