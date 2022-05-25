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

        const { id } = req.params;
        const parametros = {
            logado: false,
            escrever: false,
            ver: false,
            grupo: [],
            usuario: req.session.user,
            msgs: []

        }

        if (req.session.user) {
            parametros.logado = true
            let { rows } = await dbcon.query(`select * from permissaos where id_grupo=${id} and id_user=${req.session.user.id}`)
            if (rows[0]) {
                if (rows[0].permissao == 'r') {
                    parametros.escrever = true;
                    parametros.ver = true
                } else {
                    parametros.ver = true
                }
            } else {
                parametros.logado = false
            }
        }

        if (id * 1 != 'NaN') {
            let rows2 = await dbcon.query(`select * from grupos where id=${id}`)
            if (rows2.rows[0]) {
                console.log('entrou aqui')
                parametros.grupo = rows2.rows[0]

                let rows3 = await dbcon.query(`select mensagem_grupo.*, users.username from mensagem_grupo left join users on users.id = mensagem_grupo.id_user  where id_grupo=${rows2.rows[0].id} order by id_mens desc limit 10`)
                if (rows3.rows[0]) {

                    parametros.msgs = rows3.rows


                } else {
                    console.log(rows3)
                }




            }

        }
        console.log(parametros.ver, parametros.escrever,)

        res.render('grupodetalhe', { ...parametros, id })

    }


    async enviarmsg(req, res) {

        if (req.session.user) {

            const { id } = req.session.user

            const { msg, grupo } = req.body

            const { rows } = await dbcon.query(`INSERT INTO mensagem_grupo(mensagem, id_grupo, id_user) VALUES ('${msg.trim()}', ${grupo}, ${id})  RETURNING *`)

            if (rows) {
                console.log(rows)
                res.redirect(`/grupos/grupodetalhe/${grupo}`)
            } else {
                res.redirect(`/`)
            }

        } else {
            res.redirect(`/login.html`)
        }



    }


    async adicionarmembro(req, res) {

        const erros = []

        const { permissao, email, grupo_id } = req.body

        if (req.session.user) {

            const { id } = req.session.user

            const { rows } = await dbcon.query(`select * from grupos where id = ${grupo_id}`)
            if (rows) {

                if (rows.owner == id) {

                    

                } else {

                    erros.push('Usuario não é dono deste grupo')

                    res.render("erro", { processo: "adicionar membro", erros: erros });

                }



            } else {

                erros.push('Falha ao conectar com o banco')

                res.render("erro", { processo: "adicionar membro", erros: erros });
            }

        } else {

            erros.push('usuario nao logado')

            res.render("erro", { processo: "adicionar membro", erros: erros });

        }




    }


}

module.exports = { GruposControllers };