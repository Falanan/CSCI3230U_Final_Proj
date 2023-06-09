// Some code taken from Lecture 23

const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/ecommerce');
let Schema = mongoose.Schema;

// Create Schema instance for accounts collection
let itemSchema = new Schema({
    amount: Number,
    productName: String,
    image: String,
    price: Number
}, {
    collection: 'items'
});
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
    cart: [],
    items: [itemSchema] 
}, {
    collection: 'accounts'
});

module.exports.Account = mongoose.model('account', accountSchema);
module.exports.Item = mongoose.model('item', itemSchema);
