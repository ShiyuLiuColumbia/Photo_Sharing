var express = require('express'); 
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var methodOverride = require('method-override');
var flash = require('connect-flash');

var port = 8000;
//set up the Experience model, it is defined in ./models/experience
var Experience = require('./models/experience');
var Comment = require('./models/comment');
var User = require('./models/user');


// //since ./seeds export a function name, so seedDB here is. a fucntion name.
// var seedDB = require('./seeds');
// seedDB();


/***** initialiazation part *****/

//tell node we will use .ejs as our default static files so that we do not need to write 'res.render(landing.ejs)'
//our static .ejs files must be stored in /project_folder/views
app.set('view engine', 'ejs');

//set up body-parser
app.use(bodyParser.urlencoded({extended: true}));

//set up static files directory
app.use(express.static(__dirname+'/public'));

//connect to database 'trip_sharing'. When we use mongoose.connect(DATABASE_NAME) and mongoose will help us to create it if it does not exist now
// mongoose.connect('mongodb://localhost/trip_sharing', { useNewUrlParser: true })
mongoose.connect('mongodb://shiyu:liu1996227@ds223609.mlab.com:23609/trip_sharing', { useNewUrlParser: true })

//express-session CONFIGURATION
app.use(require('express-session')({
    secret: 'I love zijing',
    resave: false,
    saveUninitialized: false
}));
//PASSWORD CONFIGURATION
app.use(passport.initialize());
app.use(passport.session());
//tell passport to use 'passport-local-mongoose' strategy. User.authenticate() is the function built in 'passport-local-mongoose'
passport.use(new LocalStrategy(User.authenticate()));
//tell passport to serialize and deserialize using bulit in functions in 'passport-local-mongoose'
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());  

//req.user is the user-info in user database, it is defined by passport
//we set req.locals.currentUser = req.user, so that we do not need to pass {currentUser:req.user} in each res.render(TEMPLATE_NAME);
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});

//tell express  we will use '_method' as route overrider
app.use(methodOverride('_method'));

/*******************************/





/***** routes part ************/
//The welcome page
app.get('/', function(req, res){
    res.render('landing');
});

// ===================
// experiences routes
// ===================

//INDEX
app.get('/experiences', function(req, res){
    //Get all trip experiences from DB 
    //Experience.find({FIND_CONDITION}, CALLBACK_FUNCTION);
    Experience.find({},function(err, all_trip_experiences){
        if(err){
            console.log(err)
        }
        else{
            res.render('experiences/index', {all_trip_experiences:all_trip_experiences});
        }
    });
});

//CREATE - create a new trip
app.post('/experiences', isLoggedIn, function(req, res){
    //get data from form and use body-parser here to parse the body of the request
    var experience_title = req.body.experience_title;
    var image = req.body.image;
    var description = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }

    var new_experience = {experience_title: experience_title, image: image, description: description, author: author};

    Experience.create(new_experience, function(err, newly_create_experience){
        if(err){
            console.log(err);
        }
        else{
            console.log('Successfully insert a new experience:');
            console.log(newly_create_experience);
            res.redirect('/experiences');
        }
    });

});

//NEW - show form to create new trip
app.get('/experiences/new', isLoggedIn, function(req, res){
    res.render('experiences/new');
});

//SHOW - shows more info about trip
app.get('/experiences/:id', function(req, res){
    // Experience.findById(ID, CALLBACK);
    //since we use data references to associate data, we only have comment_id in our experience data collection,
    //so we use Experience.findById(id).populate().exet(CALLBACK) to show comments completely.
    Experience.findById(req.params.id).populate('comments').exec(function(err, foundExperience){
        if(err){
            console.log(err);
        }
        else{
            res.render('experiences/show', {foundExperience: foundExperience});
        }
    });
});

//EDIT
app.get('/experiences/:id/edit', checkExperienceOwnership, function(req, res){
    Experience.findById(req.params.id, function(err, foundExperience){
        res.render('experiences/edit', {foundExperience: foundExperience});
    });
});
//UPDATE
app.put('/experiences/:id', checkExperienceOwnership, function(req, res){
    //find and update the experience
    // findByIdAndUpdate(ID, UPDATEINFO, CALLBACK)
    Experience.findByIdAndUpdate(req.params.id, req.body.experience, function(err, updatedExperience){
        if(err){
            console.log(err)
        } else {
            res.redirect('/experiences/'+req.params.id);
        }
    });
});

//DESTROY
app.delete('/experiences/:id', checkExperienceOwnership, function(req, res){
    Experience.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect('/experiences');
        } else {
            res.redirect('/experiences')
        }
    });
});


// ===================
// comments routes
// ===================
//NEW COMMENT FORM
app.get('/experiences/:id/comments/new', isLoggedIn, function(req, res){
    //find experience by id, send it to new.ejs
    Experience.findById(req.params.id, function(err, experience){
        if(err){
            console.log(err);
        } else {
            res.render('comments/new', {experience: experience});
        }
    });
    
});

//CREATE
app.post('/experiences/:id/comments', isLoggedIn, function(req, res){
    //lookup experience by id
    Experience.findById(req.params.id, function(err, experience){
        if(err){
            console.log(err);
        } else {
            //create new comment
            // since we pass the parameter by comment[text] and comment[author], we can simply use req.body.comment here
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                } else {
                    // add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    //connect new comment to experience
                     experience.comments.push(comment);
                     experience.save();

                     //redirect to experience show page
                     res.redirect('/experiences/' + experience._id);
                }
            });
        }
    });
});

//EDIT
app.get('/experiences/:id/comments/:comment_id/edit',checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            res.redirect(back);
        }else{
            res.render('comments/edit', {experience_id: req.params.id, foundComment:foundComment});
        }
    });
    
});

//UPDATE
app.put('/experiences/:id/comments/:comment_id',checkCommentOwnership , function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            console.log(err);
            res.redirect('back');
        } else {
            res.redirect('/experiences/'+req.params.id);
        }
    });
});

//DESTROY
app.delete('/experiences/:id/comments/:comment_id',checkCommentOwnership , function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect('/experiences/' + req.params.id);
        } else {
            res.redirect('/experiences/' + req.params.id);
        }
    });
});


// ===================
// Auth routes
// ===================
app.get('/register', function(req, res){
    res.render('register');
});

app.post('/register', function(req, res){
    var newUser = new User({username: req.body.username});
    //User.register is the built in function in 'passport-local-mongoose'
    //User.register(newUser, newUser_password, CALLBACK);
    User.register(newUser, req.body.password, function(err, newlyUser){
        if(err){
            req.flash('error', err.message);
            return res.redirect('/register');
        }
        //after creating the new user, we use passport.authenticate to auth this new user.
        //local implies that we use local strategy, we can then use like facebook, google.
        passport.authenticate('local')(req, res, function(){
            req.flash('success', 'Welcome '+ newlyUser.username);
            res.redirect('/experiences');
        });
    });
});

app.get('/login', function(req, res){
    res.render('login');
});

// to use passport.authenticate in login, we use middleware. Its format is app.post('login',middleware, CALLBACK);
app.post('/login', passport.authenticate('local', 
    {
        successRedirect: '/experiences',
        failureRedirect: 'login'
    }), function(req, res){});


// *** the difference beteen we use passport.authenticate differently in register from in login is that when we register, we have to 
// *** create the new user first, then we authenticate them. While in login, we defautly make sure they are in database.

app.get('/logout', function(req, res){
    req.logout();
    req.flash('success', 'Successfully Logout!');
    res.redirect('/experiences');
});

//middleware we will use to check whether the user has logged in
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        req.flash('error', 'Please Login First!');
        res.redirect('/login');
    }
}

function checkExperienceOwnership(req, res, next){
    if(req.isAuthenticated()){
        Experience.findById(req.params.id, function(err, foundExperience){
            if(err){
                req.flash('error', err);
                console.log(err);
            } else {
                // foundExperience.author.id is a mongoose object, while req.user._id is a string
                if(foundExperience.author.id.equals(req.user._id)){
                    next();
                } else {
                    req.flash('error', 'You don\'t have permission to do that');
                    res.redirect('back');
                }
                
            }
        });
    } else {
        res.redirect('back');
    }
}

function checkCommentOwnership(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                req.flash('error', err);
                console.log(err);
            } else {
                // foundExperience.author.id is a mongoose object, while req.user._id is a string
                if(foundComment.author.id.equals(req.user._id)){
                    next();
                } else {
                    req.flash('error', 'You don\'t have permission to do that');
                    res.redirect('back');
                }
                
            }
        });
    } else {
        res.redirect('back');
    }
}

// app.listen(port, function(){
//     console.log('The trip-experience sharing server is running on port: '+port)
// });

app.listen(process.env.PORT, process.env.IP, function(){
    console.log('The trip-experience sharing server is running on port: '+port)
});

