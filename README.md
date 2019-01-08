# Photo-sharing Website
## 1. Overview
- A full stack web service with RESTful architecture and MEN stack(MongoDB, Express, Node.js) for photo-sharing and reviewing.
- Implemented user authentication with Passport.js and utilized Multer to upload photos to Cloudinary.
- Designed the Ajax based front end with jQuery, Bootstrap and deployed the app to heroku.

## 2. Packages
Use `$npm install <package-name> --save` to install packages listed blow.
- [Express](https://github.com/expressjs/express) - Web framework on node.js
- [ejs](https://github.com/mde/ejs) - Embedded JavaScript templates 
- [Mongoose](https://mongoosejs.com/) - ODM used in node.js to manipulate MongoDB
- [express-session](https://github.com/expressjs/session) Simple session middleware for Express
- [Passport](http://www.passportjs.org/), [passport-local](http://www.passportjs.org/packages/passport-local/), [passport-local-mongoose](https://github.com/saintedlama/passport-local-mongoose) - Passport is used to simplify authentication in node.js, passport-local is the local strategy, passport-local-mongoose is used to simplify manipulating user-table in Mongo
- [method-override](https://github.com/expressjs/method-override) - override HTTP method(PUT, UPDATE, DELETE)
- [connect-flash](https://github.com/jaredhanson/connect-flash) - Flash message middleware for Connect and Express
- [multer](https://github.com/expressjs/multer) - Node.js middleware for handling `multipart/form-data`
- [cloudinary](https://github.com/cloudinary/cloudinary_npm) - Cloudinary NPM for node.js integration

## 3. Directory
- **/models** - Database models in MongoDB
- **/node_modules** - Packages
- **/public** - Static files(images, CSS, JS)
- **/views** - ejs files
- **app.js** - backend

## 4. Start
`$node app.js`
