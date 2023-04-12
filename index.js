// Some code was taken from Lecture 20's example (test_node.js)

// Import express. Supported by Node.js, lets us include modules in our project.
let express = require('express');

// Instantiate express application
let app = express();

app.set('port', 3000);

app.listen(app.get('port'), function () {
    console.log(`Listening for requests on port ${app.get('port')}.`);
});

// Setup a static server for all files in /public
app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/homepage.html');
});