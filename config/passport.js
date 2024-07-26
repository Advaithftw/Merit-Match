const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');



passport.use('signup', new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true,
    },
    async (req, username, password, done) => {
        try {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return done(null, false, { message: 'User already exists' });
            }


            
            const newUser = new User({
                username,
                password,
                points: 100  
            });

            await newUser.save();

            return done(null, newUser, { message: 'Signup successful' });
        } catch (err) {
            return done(err);
        }
    }
));


passport.use('login', new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password'
    },
    async (username, password, done) => {
        try {
            const user = await User.findOne({ username });
            if (!user) {
                console.log('User not found');
                return done(null, false, { message: 'Incorrect username' });
            }

            console.log('User found:', user);
            const isMatch = (password === user.password);
            console.log('Password match:', isMatch);

            if (!isMatch) {
                console.log('Incorrect password');
                return done(null, false, { message: 'Incorrect password' });
            }

            return done(null, user);
        } catch (error) {
            console.error('Error during authentication', error);
            return done(error);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});


passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'secret_key' 
};

passport.use('jwt', new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
        const user = await User.findById(jwt_payload.user.id); 
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (error) {
        return done(error, false);
    }
}));

module.exports = passport;
