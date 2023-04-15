// Some code taken from Lecture 23

const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/ecommerce');
let Schema = mongoose.Schema;

// Create Schema instance for accounts collection
let accountSchema = new Schema({
    username: {type: String,
        unique: [true, 'username is taken'],
        require: [true, 'please enter a username'],
        index: true
    },
    password: {type: String,
        validate: [/^.{8,}$/,'password must be at least 8 characters']
    },
    email: {type: String,
        validate: [/^(.+)@(.+)\.(.+)$/,'must be a valid email address'],
        unique: [true, 'email is already taken'],
        index: true
    },
    cart: Array
}, {
    collection: 'accounts'
});

// Here we export our module (node.js) to make it available in a different file (savingdata.js)
// See L23SL14 - An example Schema
module.exports.Account = mongoose.model('account', accountSchema);
