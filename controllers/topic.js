'use strict'

var controller = {
    save: function(req, res) {
        return res.status(200).send({
            message: 'controlador topic'
        });
    }
};

module.exports = controller;