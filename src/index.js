const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const { dbcon } = require("./config/connection-db");
app.set("view engine", "ejs");
app.set("views", "./src/view");

// PARSER DOS FORMULÁRIOS
app.use(
    express.urlencoded({
        extended: true,
    })
);

// PARSER DAS REQUISIÇOES COM JSON
app.use(express.json());

const session = require("express-session");
app.use(
    session({
        secret: "chave secreta de criptografia",
        resave: false, // NAO SOBRESCREVER CASO NAO HAJA MODIFICAÇÕES,
        saveUninitialized: false,
        cookie: { secure: false },
    })
);

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.redirect("/grupos/lista/1");
});

app.get("/login", (req, res) => {
    res.redirect("/login.html");
});

app.post("/login", async(req, res) => {
    const { email, senha } = req.body;


    const erros = [];

    const vmail = await dbcon.query(
        `select * from users where email='${email.trim()}'`
    );

    if (vmail.rows[0] == undefined) {
        erros.push("Email não existe");
    }
    if (senha.trim() == "") {
        erros.push("senha não existe");
    }

    if (erros[0] != undefined) {
        res.render("erro", { processo: "login", erros: erros });
    } else {
        const confere = bcrypt.compareSync(senha, vmail.rows[0].senha);

        if (confere) {
            req.session.user = vmail.rows[0];
            res.redirect("/grupos/lista/1");
        } else {
            erros.push("Senhas não conferem");
            res.render("erro", { processo: "login", erros: erros });
        }
    }
});

app.get("/registrar", (req, res) => {
    res.redirect("/registro.html");
});


app.get("/deslogar", (req, res) => {
    req.session.destroy();

    res.redirect('/grupos/lista/1');

});

app.post("/registrar", async(req, res) => {
    const { username, email, senha } = req.body;

    const erros = [];

    const vuser = await dbcon.query(
        `select username from users where username='${username.trim()}'`
    );

    const vmail = await dbcon.query(
        `select email from users where email='${email.trim()}'`
    );

    if (vuser.rows[0] != undefined) {
        erros.push("Username já existe");
    }

    if (vmail.rows[0] != undefined) {
        erros.push("Email já utilizado");
    }

    if (email.trim() == "") {
        erros.push("Email vazio");
    }

    if (username.trim() == "") {
        erros.push("Username vazio");
    }

    if (senha.trim() == "") {
        erros.push("Senha vazia");
    }

    if (erros[0] == undefined) {
        const senhacripto = bcrypt.hashSync(senha, 10);

        const result = await dbcon.query(
            `INSERT INTO Users (username, senha, superUser, email) values ('${username}', '${senhacripto}', 'f', '${email}')`
        );

        res.redirect("/login");
    } else {
        res.render("erro", { processo: "Registro", erros: erros });
    }
});

const gruposRoutes = require("./routes/Grupos-Routes.js");
app.use("/grupos", gruposRoutes);

app.listen(9850, () => console.log(`Server iniciado na porta ${9850}`));