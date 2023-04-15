// Some code was taken from Lecture 23's example (savingdata.js)

// Import express. Supported by Node.js, lets us include modules in our project.
let express = require('express');

const session = require('express-session');
const { v4: uuidv4 } = require('uuid');

const model = require('./model/model.js');

// Instantiate express application
let app = express();

// configuration
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.set('port', 3000);

app.listen(app.get('port'), function () {
    console.log(`Listening for requests on port ${app.get('port')}.`);
});

// Setup a static server for all files in /public
app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

app.use(session({
    genid: uuidv4,
    resave: false,
    saveUninitialized: false,
    secret: 'something'
}));

app.get('/', (req, res) => {
    res.redirect('/homepage');
});

app.get('/login', (req, res) => {
    res.render('login',{error: ''});
});

app.get('/logout', (req, res) => {
    req.session.username = '';
    res.redirect('/homepage');
});

app.get('/homepage', (req, res) => {
    res.render('homepage', 
    {username: req.session.username, 
        errObj: {emailErr: '',passwordErr: '',usernameErr: ''}
    });
});

app.post('/signup', (request, response) => {
    let accountData = {
        username: request.body.username,
        password: request.body.password,
        email: request.body.email,
        cart: []
    };

    let newAccount = new model.Account(accountData);
    newAccount.save()
    .then(function(res) {
        console.log('account added: ', res);
        // log them in, renders stuff too
        doLogin(request, response);

    }).catch(function(err) {
        // error signing up
        console.log(err);

        response.render('homepage',{
            username:'', 
            errObj: getValidationErrors(err)
        });
    });

});

app.post('/processLogin', (request, response) => {

    let uname = request.body.username;
    let pwd = request.body.password;

    model.Account.find({username: uname, password: pwd})
    .then(function(accountList) {
        // match
        if(accountList.length > 0) {
            // log them in
            doLogin(request, response);
        }

        // no match
        else {
            // send login error template
            response.render('login',{error: 'The username or password is not valid.'});
        }

    });

});

function doLogin(request, response) {
    request.session.username = request.body.username;
    response.redirect('/homepage');
}

function getValidationErrors(err) {
    let errObj = {emailErr: '',
                passwordErr: '',
                usernameErr: ''}

    if (err.name === 'ValidationError') {
        if (typeof err.errors.password !== 'undefined') {
            errObj.passwordErr = err.errors.password
        }
        if (typeof err.errors.username !== 'undefined') {
            errObj.usernameErr = err.errors.username
        }
        if (typeof err.errors.email !== 'undefined') {
            errObj.emailErr = err.errors.email
        }
    }

    return errObj;
}