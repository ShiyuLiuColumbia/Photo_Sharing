var mongoose = require('mongoose');

//schema setup 
var commentSchema = new mongoose.Schema({
    text: String,
    author: {
    	id: {
    		type: mongoose.Schema.Types.ObjectId,
    		ref: 'User'
    	},
    	username: String
    },
    createTime: String
});


var Comment = mongoose.model('Comment', commentSchema);

//export model so that we can use them in other files
module.exports = Comment;