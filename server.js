const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
require('./config/passport'); 

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();

app.use(bodyParser.json());
app.use(passport.initialize());

app.use('/', authRoutes);
app.use('/', taskRoutes);

mongoose.connect('mongodb+srv://advaitht20:fyl2EOLkjnxoRCDw@cluster0.hpvtxt2.mongodb.net/', { ssl: true })
    .then(() => app.listen(3000, () => console.log('Server running on port 3000')))
    .catch(err => console.error(err));

