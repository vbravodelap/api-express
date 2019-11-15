'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3999;

mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/api_rest_node', {useNewUrlParser: true, useUnifiedTopology: true},)
    .then(() => {

        app.listen(port, () => {
            console.log('servidor corriendo');
        })

    }).catch(error => {
        console.log(error);
    });