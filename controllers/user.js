'use strict'

var validator = require('validator');
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var jwt = require('../services/jwt');
var fs = require('fs');
var path = require('path');

var controller = {
    save: function(req, res) {
        var params =  req.body

        try{
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        }catch(err) {
            return res.status(401).send({
                message: 'Error de validación.'
            });
        }
        

        if(validate_email && validate_name && validate_password && validate_surname) {

            var user = User();
            user.name = params.name;
            user.surname = params.surname;
            user.email = params.email.toLowerCase();
            user.role = 'ROLE-USER',
            user.image = null;

            User.findOne({ email: user.email }, (err, isserUser) => {
                if(err){
                    return res.status(500).send({
                        message: 'Error al comprobar duplicidad del usuario.'
                    });
                }

                if(!isserUser) {
                    bcrypt.hash(params.password, null, null, (err, hash) => {
                        user.password = hash;

                        user.save((err, user) => {
                            if(err){
                                return res.status(500).send({
                                    message: 'Error al crear el usuario.'
                                });
                            }

                            if(!user){
                                return res.status(500).send({
                                    message: 'El usuario no se ha guardado.'
                                });
                            }

                            return res.status(200).send({user, message: 'El usuario se ha creado'});
                        });

                    });

                }else {
                    return res.status(500).send({
                        message: 'El usuario ya existe en la base de datos.'
                    });
                }
            })

        }else{
            return res.status(400).send({
                message: 'La validación de los datos fue incorrecta.'
            });
        }
    },

    login: function(req, res) {
        var params = req.body;

        try{
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        }catch(err){
            return res.status(401).send({
                message: 'Error de validación.'
            });
        }
        

        if(!validate_password || !validate_email) {
            return res.status(401).send({
                message: 'Los datos son incorrectos.'
            });
        }

        User.findOne({ email: params.email.toLowerCase() }, (err, user) => {
            if(err) {
                return res.status(500).send({
                    message: 'Error al identificarse.'
                });
            }

            if(!user) {
                return res.status(404).send({
                    message: 'El usuario no existe.'
                });
            }

            bcrypt.compare(params.password, user.password, (err, check) => {

                if(check) {

                    if(params.gettoken) {
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    }else{
                        user.password = undefined;

                        return res.status(200).send({
                            status: 'success',
                            user
                        });
                    }

                    
                }else{
                    return res.status(404).send({
                        message: 'Las credenciales son invalidas'
                    });
                }

                
            });
        })
    },

    update: function(req, res) {
        var params = req.body;

        try{
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);  
        }catch(err){
            return res.status(200).send({
                message: 'Faltan datos por enviar' +err,
            });
        }
        
        delete params.password;
        var userId = req.user.sub; 

        if(req.user.email != params.email) {
            User.findOne({ email: params.email.toLowerCase() }, (err, user) => {
                if(err) {
                    return res.status(500).send({
                        message: 'Error al identificarse.'
                    });
                }
    
                if(user && user.email == params.email) {
                    return res.status(200).send({
                        message: 'El mail no puede ser modificado.'
                    });
                }
            });
        }else{
            User.findByIdAndUpdate({ _id: userId }, params, { new: true }, (err, userUpdated) => {
                if(err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar el usuario'
                    });
                }

                if(!userUpdated) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'No se ha actualizado el usuario'
                    });
                }

                return res.status(200).send({
                    status: 'success',
                    userUpdated
                });
            });
        }

        
    },

    uploadAvatar: function(req, res) {
        var file_name = 'sin avatar'

        if(!req.files) {
            return res.status(500).send({
                status: 'error',
                message: file_name
            });
        }

        var file_path = req.files.file.path;
        var file_split = file_path.split('\\');

        // **Advertencia en Linux o Mac
        // var file_split = file_path.split('/');

        var file_name = file_split[2];

        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif') {
            fs.unlink(file_path, (err) => {

                return res.status(200).send({
                    status: 'error',
                    message: 'La extensión del archivo no es valida.'
                });

            });
        }else {
            var userId = req.user.sub;

            User.findOneAndUpdate({ _id: userId }, {image: file_name}, {new: true}, (err, userUpdated) => {

                if(err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'No se pudo actualizar el usuario'
                    });
                }

                return res.status(200).send({
                    status: 'upload success',
                    userUpdated
                });
            });
        }
    },

    getAvatar: function(req, res) {
        var fileName = req.params.fileName;
        var pathFile = './uploads/users/' + fileName;

        fs.exists(pathFile, (exists) => {
            if(exists) {
                return res.sendFile(path.resolve(pathFile));
            }else{
                return res.status(404).send({
                    message: 'La imagen no existe'
                });
            }
        });
    },

    getUsers: function(req, res) {
        User.find().exec((err, users) => {
            if(err || !users) {
                return res.status(404).send({
                    message: 'No se encontrarion usuarios',
                    err
                });
            }

            return res.status(200).send({
                status: 'success',
                users
            });
        });
    },

    getUser: function(req, res) {
        var userId = req.params.userId;

        User.findById(userId).exec((err, user) => {
            if(err) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No se ha encontrado el usuario'
                });
            }

            return res.status(200).send({
                status: 'success',
                user
            });
        });
    }
};

module.exports = controller;
