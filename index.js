// Some code was taken from Lecture 23's example (savingdata.js)

let globalCart = [];

// Import express. Supported by Node.js, lets us include modules in our project.
let express = require('express');

const session = require('express-session');
const { v4: uuidv4 } = require('uuid');

const model = require('./model/model.js');
const { Model } = require('mongoose');

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
app.use(express.json());

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

app.get('/cart', (req, res) => {
    reloadCart(req, res);
    //res.render('cart',{username: req.session.username, cart: {}})
});

app.get('/purchase',(req,res) => {
    globalCart = [];
    reloadCart(req, res);
})

app.post('/signup', (request, response) => {
    let accountData = {
        username: request.body.username,
        password: request.body.password,
        email: request.body.email,
        cart: ['iPhone X','899.00','https://i.dummyjson.com/data/products/2/1.jpg',1,],
        items: [{productName: 'iPhone X',price: '899.00',image: 'https://i.dummyjson.com/data/products/2/1.jpg',amount: 1}]
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

app.post('/removeItem', (request, response) => {
    let pname = request.body.productName;
    let ind = globalCart.indexOf(pname);
    globalCart.splice(ind, 4);
    reloadCart(request, response);
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

// for some reason the array in the database kept coming as undefined. So I had to use a 'globalCart'
app.post('/addToCart', (request, response) => {
    console.log("Request received", request.body);
    console.log(request.session.username);

    model.Account.find({username : request.session.username})
    .then(function(result) {
        console.log(result);
        
        let body = request.body;
        //let newAccount = new Model.Account();
        /*
        if(typeof result.cart === 'undefined') {
            // new data
            result.cart = [body.productName, body.price, body.image, 1];
            globalCart.push(body.productName, body.price, body.image, 1);
        }
        */
        // new item
        if (!globalCart.includes(body.productName)) {
            //result.cart.push(body.productName, body.price, body.image, 1);
            globalCart.push(body.productName, body.price, body.image, 1);
        }
        // add one to the cart if exists
        else {
            //let amountIndex = result.cart.indexOf(body.productName) + 3;
            let amountGlobalIndex = globalCart.indexOf(body.productName) + 3;
            //result.cart[amountIndex] += 1;
            globalCart[amountGlobalIndex] += 1;
        }
        /*
        let accountData = {
            username: result.username,
            password: result.password,
            email: result.email,
            cart: result.cart
        }

        let newAccount = new model.Account(accountData);

        model.Account.updateOne({ username: request.session.username }, accountData)
        .then((res) => {
            if (res.modifiedCount == 1) {
                console.log('Update successful');
            } else {
                console.log('Update failed validation: ', res);
            }
        }).catch((err) => {
            console.error('Unable to update student:', err);
        });
        */
        
    }).catch((err) => {
        console.log(err);
    });

});

app.post('/updateCart', (request, response) => {
    model.Account.find({username : request.session.username})
    .then(function(result) {
        // set the amount to the value
        let item = request.body.productName;
        //result.cart[result.cart.indexOf(item) + 3] = request.body.amount;
        if(globalCart.indexOf(item) !== -1) {
            globalCart[globalCart.indexOf(item) + 3] = request.body.amount;
            reloadCart(request, response);
        }
        /*
        model.Account.updateOne({ username: request.session.username }, {$set: {cart: result.cart}}, {upsert: true})
        .then((res) => {
            if (res.modifiedCount == 1) {
                console.log('Update successful');
                reloadCart(request, response);
            } else {
                console.log('Update failed validation: ', res);
                reloadCart(request, response);
            }
        }).catch((err) => {
            console.error('Unable to update student:', err);
            reloadCart(request, response);
        });
        */
    }).catch((err) => {
        console.log(err);
    });
});

function reloadCart(request, response) {
    model.Account.find({username : request.session.username})
    .then(function (account) {
        let thisCart = globalCart;
        /*
        if(typeof account.cart === 'undefined') {
            console.log("account items",account.items);
            // put some sample data
            thisCart = ['iPhone X','899.00','https://i.dummyjson.com/data/products/2/1.jpg',1,
            'MacBook Pro','1749.00','https://i.dummyjson.com/data/products/6/1.png',3,
                'Brown Perfume','40.00','https://i.dummyjson.com/data/products/12/1.jpg',1];
            console.log("Cart is undefined", request.session.username);
        }
        else {
            thisCart = account.cart;
            console.log(account.cart);
        }
        */
        // calculate sum
        let sum = 0;
        for(let i = 0; i < thisCart.length; i+=4) {
            sum += thisCart[i+1] * thisCart[i+3];
        }

        response.render('cart', {
            username: request.session.username,
            cart: thisCart,
            sum: sum
        });
    });
}

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