const { dbcon } = require("../config/connection-db");

class GruposControllers {

    async inicio(req, res) {
        const logado = { logado: false };
        if (req.session.user) {
            logado.logado = true;
        } else {
            logado.logado = false;
        }

        const test_numero = req.params.id * 2
        if (!test_numero) {

            res.redirect("/grupos/lista/1");
        } else {

            const { id } = req.params;

            const { rows } = await dbcon.query(
                `SELECT g.*, u.username FROM Grupos g inner join  users u on u.id = g.owner order by g.id desc limit 5 OFFSET ${(parseInt(id) - 1) * 5
                }`
            );
            const count = (await dbcon.query(`select count(*) from grupos`)).rows[0]
                .count;
            const resposta = [];

            await Promise.all(
                rows.map(async (data) => {
                    let dataCompleta = data;
                    let consulta_membros = await (
                        await dbcon.query(
                            `select count(*) from permissaos where id_grupo =${data.id}`
                        )
                    ).rows[0].count;
                    dataCompleta.quantidademembros = consulta_membros;
                    resposta.push(dataCompleta);
                })
            );

            const pages = Math.ceil(parseInt(count) / 5);

            if (id > pages && pages >= 1) {
                res.redirect("/grupos/lista/1");
            } else if (id <= 0) {
                res.redirect("/grupos/lista/1");
            }

            res.render("home", {
                rows: resposta,
                maxpage: pages,
                ativo: parseInt(id),
                logado: logado.logado,
                usuario: req.session.user,
            });
        }
    }

    async criargrupos(req, res) {
        if (req.session.user) {
            res.render("addgrupo");
        } else {
            res.redirect("/grupos/lista/1");
        }
    }

    async adicionargrupos(req, res) {
        const { nome } = req.body;

        if (!req.session.user) {
            res.redirect("/grupos/lista/1");
        } else {
            let result = await dbcon.query(
                `INSERT INTO grupos(owner, nome) VALUES (${req.session.user.id}, '${nome}')  RETURNING * `
            );
            if (result.rows[0]) {
                const { id } = result.rows[0]
                let result2 = await dbcon.query(
                    `INSERT INTO Permissaos (id_grupo, id_user, permissao) VALUES (${id},${req.session.user.id}, 'r' ) RETURNING *`
                );


                res.redirect("/grupos/lista/1");

            }

            res.redirect("/grupos/lista/1");
        }
    }


    async grupodetalhe(req, res) {

        res.render('grupodetalhe')



    }

}

module.exports = { GruposControllers };