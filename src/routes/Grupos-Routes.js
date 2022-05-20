const { Router } = require('express');

const {GruposControllers} = require('../controllers/Grupos-Controllers')

const gruposControllers = new GruposControllers();

const routes = Router();


routes.get('/lista/:id', gruposControllers.inicio) ;
routes.get('/criar', gruposControllers.criargrupos) ;
routes.get('/grupodetalhe/:id', gruposControllers.grupodetalhe) ;
routes.post('/criar', gruposControllers.adicionargrupos) ;


module.exports = routes;