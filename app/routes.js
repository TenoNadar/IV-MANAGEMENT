module.exports = function(app, passport) {

    // normal routes ===============================================================
    
        // show the home page (will also have our login links)
        app.get('/', function(req, res) {
            res.render('index.ejs');
        });
    
        // PROFILE SECTION =========================
       
        // LOGOUT ==============================
        app.get('/logout', function(req, res) {
            req.logout();
            res.redirect('/index');
        });
    
    // =============================================================================
    // AUTHENTICATE (FIRST LOGIN) ==================================================
    // =============================================================================
    
        // locally --------------------------------
            // LOGIN ===============================
            // show the login form
            app.get('/login', function(req, res) {
                res.render('signup.ejs', { message: req.flash('loginMessage') });
            });
    
            // process the login form
            app.post('/login', passport.authenticate('local-login', {
                successRedirect : '/index', // redirect to the secure profile section
                failureRedirect : '/signup', // redirect back to the signup page if there is an error
                failureFlash : true // allow flash messages
            }));
    
            // SIGNUP =================================
            // show the signup form
            app.get('/signup', function(req, res) {
                res.render('signup.ejs', { message: req.flash('signupMessage') });
            });
    
            // process the signup form
            app.post('/signup', passport.authenticate('local-signup', {
                successRedirect : '/index', // redirect to the secure profile section
                failureRedirect : '/signup', // redirect back to the signup page if there is an error
                failureFlash : true // allow flash messages
            }));
    
        // facebook -------------------------------
    
            // send to facebook to do the authentication
            app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['public_profile', 'email'] }));
    
            // handle the callback after facebook has authenticated the user
            app.get('/auth/facebook/callback',
                passport.authenticate('facebook', {
                    successRedirect : '/index',
                    failureRedirect : '/signup'
                }));
    
        // twitter --------------------------------
    
            // send to twitter to do the authentication
            app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));
    
            // handle the callback after twitter has authenticated the user
            app.get('/auth/twitter/callback',
                passport.authenticate('twitter', {
                    successRedirect : '/index',
                    failureRedirect : '/'
                }));
    
    
        // google ---------------------------------
    
    // =============================================================================
    // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
    // =============================================================================
    
        // locally --------------------------------
            app.get('/connect/local', function(req, res) {
                res.render('signup.ejs', { message: req.flash('loginMessage') });
            });
            app.post('/connect/local', passport.authenticate('local-signup', {
                successRedirect : '/index', // redirect to the secure profile section
                failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
                failureFlash : true // allow flash messages
            }));
    
        // facebook -------------------------------
    
            // send to facebook to do the authentication
            app.get('/connect/facebook', passport.authorize('facebook', { scope : ['public_profile', 'email'] }));
    
            // handle the callback after facebook has authorized the user
            app.get('/connect/facebook/callback',
                passport.authorize('facebook', {
                    successRedirect : '/index',
                    failureRedirect : '/signup'
                }));
    
        // twitter --------------------------------
    
            // send to twitter to do the authentication
            app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));
    
            // handle the callback after twitter has authorized the user
            app.get('/connect/twitter/callback',
                passport.authorize('twitter', {
                    successRedirect : '/index',
                    failureRedirect : '/signup'
                }));
    
    
        // google ---------------------------------
    
         
    // =============================================================================
    // UNLINK ACCOUNTS =============================================================
    // =============================================================================
    
    
        // local -----------------------------------
        app.get('/unlink/local', isLoggedIn, function(req, res) {
            var user            = req.user;
            user.local.email    = undefined;
            user.local.password = undefined;
            user.save(function(err) {
                res.redirect('/');
            });
        });
    
        // facebook -------------------------------
        app.get('/unlink/facebook', isLoggedIn, function(req, res) {
            var user            = req.user;
            user.facebook.token = undefined;
            user.save(function(err) {
                res.redirect('/');
            });
        });
    
        // twitter --------------------------------
        app.get('/unlink/twitter', isLoggedIn, function(req, res) {
            var user           = req.user;
            user.twitter.token = undefined;
            user.save(function(err) {
                res.redirect('/');
            });
        });
    
        // google ---------------------------------
     
    
    };
    
    // route middleware to ensure user is logged in
    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();
    
        res.redirect('/');
    }
