
const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.set('views', './src/view');

// PARSER DOS FORMULÁRIOS
app.use(express.urlencoded({
    extended: true,
}));

// PARSER DAS REQUISIÇOES COM JSON
app.use(express.json());

const session = require('express-session');
app.use(session({
    secret: 'chave secreta de criptografia',
    resave: false, // NAO SOBRESCREVER CASO NAO HAJA MODIFICAÇÕES,
    saveUninitialized: false,
    cookie: { secure: false }
}))


app.use(express.static('public'));


app.get('/', (req, res) => {
    res.redirect('/grupos/1')
});

const gruposRoutes = require('./routes/Grupos-Routes.js');
app.use('/grupos', gruposRoutes);




app.listen(3000, () => console.log(`Server iniciado na porta ${3000}`));
