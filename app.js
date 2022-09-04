'use strict'
const ejsLint = require('ejs-lint');
const path = require('path');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth')
const errorController = require('./controllers/error')
const shopRoutes = require('./routes/shop')
const User = require('./models/user')
const mongoose = require('mongoose')
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session')
const MongoDBSession = require('connect-mongodb-session')(session)
const csrf = require('csurf')
const cookieParser = require('cookie-parser');
const flash = require('connect-flash')
const multer = require('multer')


const csrfProtection = csrf({ cookie: true });
const app = express();


const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.bnacrmq.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;

const store = new MongoDBSession({
    uri: MONGODB_URI,
    collection: 'sessions',

})
 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.filename + '-' + file.originalname)
    }
})

function fileFilter(req, file, cb) {

    // The function should call `cb` with a boolean
    // to indicate if the file should be accepted

    if (path.extname(file.originalname) === '.png' || path.extname(file.originalname) === '.jpg' || path.extname(file.originalname) === '.jpeg') {
        return cb(null, true)
    } else {
        cb(null, false);
    }


    // To accept the file pass `true`, like so:


    // You can always pass an error if something goes wrong:
    // cb(new Error('I don\'t have a clue!'))

}


app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(session({ secret: 'my secret', resave: false, saveUninitialized: false, store: store }))
// must be after session creation

app.use(cookieParser())
app.use(multer({ storage: storage, fileFilter: fileFilter }).single('image'))


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images',express.static(path.join(__dirname, 'images')));
console.log(path.join(__dirname, '/images'))

app.use(csrfProtection)
app.use(flash())

app.use((req, res, next) => {

    if (req.session.user) {
        User.findById(req.session.user._id)
            .then((user) => {
                console.log('user2', user)
                req.user = user;

                next();
            }).catch((err) => {
                console.log(err)
            })
    } else {
        next();
    }


})

// setting local variable that will be passed to every render function
app.use((req, res, next) => {

    // res.locals.isAuthenticated = req.session.isLoggedIn;
    var token = req.csrfToken();
    res.locals.csrfToken = token;
    next();
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);


app.use(errorController.get404);

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.bnacrmq.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`)
    .then((res) => {
        // console.log(res)
        app.listen(process.env.PORT || 3000)
        console.log('connect');
    }).catch((err) => {
        console.log(err)
    })





