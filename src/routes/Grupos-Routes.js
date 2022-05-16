const { Router } = require('express');

const {GruposControllers} = require('../controllers/Grupos-Controllers')

const gruposControllers = new GruposControllers();

const routes = Router();


routes.get('/:id', gruposControllers.inicio) ;


module.exports = routes;