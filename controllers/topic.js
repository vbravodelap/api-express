'use strict'

var validator = require('validator');
var Topic = require('../models/topic');

var controller = {
    save: function(req, res) {
        var params = req.body;

        try{
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            var validate_lang = !validator.isEmpty(params.lang);

        }catch(err) {
            return res.status(200).send({message: 'Faltan datos por enviar'});
        }

        if(validate_content && validate_lang && validate_title) {
            var topic = new Topic();
            topic.title = params.title;
            topic.content = params.content;
            topic.code = params.code;
            topic.lang = params.lang;
            topic.user = req.user.sub;

            topic.save((err, topicStored) => {

                if(err || !topicStored){
                    res.status(404).send({
                        status: 'error',
                        message: 'El tema no se ha guardado'
                    });
                }
                return res.status(200).send({
                    status: 'success',
                    topicStored
                });
            });

        }else {
            return res.status.send({message: 'Los datos no son validos'});
        }
    },

    getTopics: function(req, res) {
        if(req.params.page == '0' || !req.params.page || req.params.page == undefined || req.params.page == 0){
            var page = 1;
        }else{
            page = parseInt(req.params.page);
        }

        var options = {
            sort: { date: -1 },
            populate: 'user',
            limit: 5,
            page: page
        }

        Topic.paginate({}, options, (err, topics) => {
            if(err) {
                return res.status(500).send({
                    message: 'Error al hacer la consulta'
                });
            }

            if(!topics) {
                return res.status(404).send({
                    status: 'Not found',
                    message: 'No hay topics'
                });
            }

            return res.status(200).send({
                status: 'success',
                topics: topics.docs,
                totalDocs: topics.totalDocs,
                totalPages: topics.totalPages
            });
        });
    },

    getTopicsByUser: function(req, res) {
        var userId = req.params.user;

        Topic.find({
            user: userId
        }).sort([['date', 'descending']]).exec((err, topics) => {
            if(err) {
                return res.status(500).send({message: 'Error en la peticion'});
            }

            if(!topics){
                return res.status(404).send({message: 'Este usuario no tiene topics'});
            }

            return res.status(200).send({
                status: 'success',
                topics
            });
        });
    },

    getTopic: function(req, res) {
        var topicId = req.params.id;

        Topic.findById( topicId ).populate('user').exec((err, topic) => {
            if(err) {
                return res.status(500).send({ message: 'Error en la petición' });
            }

            if(!topic) {
                return res.status(404).send({ message: 'No se ha encontrado el tema', status: 'error' });
            }

            return res.status(200).send({
                status: 'success',
                topic
            });
        });
    },

    update: function(req, res) {
        var topicId = req.params.id;

        var params = req.body;

        try{
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            var validate_lang = !validator.isEmpty(params.lang);

        }catch(err) {
            return res.status(200).send({message: 'Faltan datos por enviar'});
        }
        
        if(validate_content && validate_lang && validate_title) {
            var update = {
                title: params.title,
                content: params.content,
                code: params.code,
                lang: params.lang
            }

            Topic.findOneAndUpdate({_id: topicId, user: req.user.sub}, update, { new: true }, (err, updatedTopic) => {
                if(err) {
                    return res.status(500).send({ message: 'Error en la consulta', err});
                }

                if(!updatedTopic){
                    return res.status(404).send({ message: 'No se ha actualizado el tema' });
                }

                return res.status(200).send({
                    status: 'success',
                    updatedTopic
                });
            });
            
        }else{
            return res.status(401).send({
                message: 'Error de validación'
            });
        }

        
    },

    delete: function(req, res) {
        var topicId = req.params.id;

        Topic.findOneAndDelete({ _id: topicId, user: req.user.sub }, (err, topicRemoved) => {
            if(err) {
                return res.status(500).send({ message: 'Error en la consulta', err});
            }
    
            if(!topicRemoved){
                return res.status(404).send({ message: 'No se ha eliminado el tema' });
            }

            return res.status(200).send({
                status: 'success',
                topicRemoved
            });
        });

        
    }
};

module.exports = controller;