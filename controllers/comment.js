'use strict'
var Topic = require('../models/topic');
var validator = require('validator');

var controller = {
    add: function(req, res) {
        var topicId = req.params.topicId

        Topic.findById(topicId).exec((err, topic) => {
            if(err){
                return res.status(200).send({ message: 'Error en la petición', status: 'error' });
            }

            if(!topic) {
                return res.status(404).send({ message: 'El tema no existe' });
            }

            if(req.body.content){
                try{
                    var validate_content = !validator.isEmpty(req.body.content);
                }catch(err) {
                    return res.status(200).send({message: 'El comentario no puede ir vacio.'});
                }

                if(validate_content) {
                    var comment = {
                        user: req.user.sub,
                        content: req.body.content,
                    }

                    topic.comments.push(comment);
                    topic.save((err) => {
                        if(err) {
                            return res.status(500).send({ message: 'Error en la petición' });
                        }

                        return res.status(200).send({
                            status: 'success.',
                            message: 'Comentario guardado',
                            topic
                        });
                    });

                }else {
                    return res.status(200).send({message: 'Error de validación.'});
                }
            }
        });
    },

    update: function(req, res) {
        return res.status(200).send({ message: 'Metodo actualizar comentario' });
    },

    delete: function(req, res) {
        return res.status(200).send({ message: 'Metodo eliminar comentario' });
    },
};

module.exports = controller;