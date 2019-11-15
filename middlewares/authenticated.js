'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
const SECRET_KEY = 'pJaReaow0RHNjj7NQriypOPxANN58krjQCtuFBjSKtMzNpLxob7vaXKF54Hxzy6Bv314KL7Qt7G0bwIwCHCHedZuq6LEIOcgTVjm';


exports.auth = function(req, res, next) {
    if(!req.headers.authorization) {
        return res.status(403).send({
            message: 'No cuenta con token de autenticación.'
        });
    }

    var token = req.headers.authorization;

    try{
        var payload = jwt.decode(token, SECRET_KEY);

        if(payload.exp <= moment().unix()){
            return res.status(403).send({
                message: 'El token ha expirado.'
            });
        }

    }catch(ex) {
        return res.status(404).send({
            message: 'El token no es valido. Error: '+ ex + '.'
        });
    }

    req.user = payload;

    next();
}