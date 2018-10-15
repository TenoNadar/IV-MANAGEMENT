var express = require('express');
app = express();
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

paypal.configure({
  mode: 'sandbox',
  client_id:
    'AT1KV7uheH4jE_FWJNrDrBVYoTA4OvmUj52aH-FqSJqDCHsBCQr9XxPxA2MrucBSDI9FciP0i4RsgYCA',
  client_secret:
    'EL8T_KTwLCHjGxV4oAUC2q3cCHFftTS3Up-X2YEhFrpy_r2S4sEJkwYsiC8gbR9MZz4dqLhQ3QbsR95F',
});

// Misc Setups

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(
  session({
    secret: 'ilovescotch', // session secret
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

require('./app/routes.js')(app, passport);
app.post('/join', (req, res) => {
  res.send('Successfully Joined The contest');
});
app.get('/', (req, res) => {
  res.render('index');
});
app.get('/signup', (req, res) => {
  res.send('signup');
});
app.post('/index', (req, res) => {
  res.render('index');
});
app.post('/pay', (req, res) => {
  const create_payment_json = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal',
    },
    redirect_urls: {
      return_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: 'Italy',
              sku: '001',
              price: '999.00',
              currency: 'USD',
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: 'USD',
          total: '999.00',
        },
        description: 'Hat for the best team ever',
      },
    ],
  };

  paypal.payment.create(create_payment_json, function(error, payment) {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === 'approval_url') {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});

app.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: 'USD',
          total: '999.00',
        },
      },
    ],
  };

  paypal.payment.execute(paymentId, execute_payment_json, function(
    error,
    payment
  ) {
    if (error) {
      console.log(error.response);
      throw error;
    } else {
      console.log(JSON.stringify(payment));
      res.send('Success');
    }
  });
});

app.get('/cancel', (req, res) => res.send('Cancelled'));

app.listen(3000, process.env.IP, function() {
  var appConsoleMsg = 'server has started: ';
  console.log(appConsoleMsg);
});
