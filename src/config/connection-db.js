const { Client } = require('pg')

const dbcon = new Client({
    connectionString: 'postgres://qnnzcmtrzvgejs:b73244ddb81f838fe4df53f98c7dda5fa8355b3db08e7948e873c03f1bcb8c70@ec2-52-3-2-245.compute-1.amazonaws.com:5432/ddejhu7nle8dbl',
    ssl: {
        rejectUnauthorized: false
    }
});

dbcon.connect(err => {
    if (err) {
        console.log("ERRO!!! NAO FOI POSSIVEL CONECTAR NO BANCO");
        console.log( { err });
    } else {
        console.log("BANCO CONECTADO COM SUCESSO");
    }
});

module.exports = {
    dbcon
}