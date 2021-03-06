const { Router } = require('express');

const { GruposControllers } = require('../controllers/Grupos-Controllers')

const gruposControllers = new GruposControllers();

const routes = Router();


routes.get('/lista/:id', gruposControllers.inicio);
routes.get('/criar', gruposControllers.criargrupos);
routes.get('/grupodetalhe/:id', gruposControllers.grupodetalhe);
routes.post('/grupodetalhe/:id', gruposControllers.grupodetalhe2);
routes.post('/criar', gruposControllers.adicionargrupos);
routes.post('/sendmsg', gruposControllers.enviarmsg);
routes.post('/addmembro', gruposControllers.adicionarmembro);


module.exports = routes;