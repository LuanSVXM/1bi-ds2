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
                rows.map(async(data) => {
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
            msgs: [],
            quantidademsg: 0,
            page: 1

        }

        if (req.session.user) {
            parametros.logado = true
            console.log(`select * from permissaos where id_grupo=${id} and id_user=${req.session.user.id}`)
            let { rows } = await dbcon.query(`select * from permissaos where id_grupo=${id} and id_user=${req.session.user.id}`)
            console.log(rows)
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

                    let countmsg = await (await dbcon.query(`select count(*) as quantidade from mensagem_grupo left join users on users.id = mensagem_grupo.id_user  where id_grupo=${rows2.rows[0].id}`)).rows
                    parametros.quantidademsg = countmsg[0].quantidade
                    parametros.msgs = rows3.rows


                } else {
                    console.log(rows3)
                }




            }

        }
        console.log(parametros.ver, parametros.escrever, parametros.quantidademsg)

        res.render('grupodetalhe', {...parametros, id })

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

            if (req.session.user.email == email) {
                erros.push('Não é possivel adicionar voce mesmo ao grupo')

                res.render("erro", { processo: "adicionar membro", erros: erros });
            }

            const { rows } = await dbcon.query(`select * from grupos where id = ${grupo_id}`)
            if (rows) {

                if (rows[0].owner == id) {

                    const usuario = await (await dbcon.query(`select * from users where email='${email}'`)).rows

                    if (usuario[0] == undefined) {
                        erros.push('Usuario com esse email não encontrado')

                        res.render("erro", { processo: "adicionar membro", erros: erros });
                    } else {

                        let result2 = await dbcon.query(
                            `INSERT INTO Permissaos (id_grupo, id_user, permissao) VALUES (${grupo_id},${usuario[0].id}, '${permissao}' ) RETURNING *`
                        );

                        if (result2.rows[0] == undefined) {

                            erros.push('Erro ao adicionar a permissao por favor tente novamente')

                            res.render("erro", { processo: "adicionar membro", erros: erros });

                        } else {

                            res.redirect(`/grupos/grupodetalhe/${grupo_id}`)

                        }

                    }


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


    async grupodetalhe2(req, res) {

        const { pagina } = req.body

        console.log(pagina)

        const { id } = req.params;
        const parametros = {
            logado: false,
            escrever: false,
            ver: false,
            grupo: [],
            usuario: req.session.user,
            msgs: [],
            quantidademsg: 0,
            page: 1,
        }

        if (req.session.user) {
            parametros.logado = true
            console.log(`select * from permissaos where id_grupo=${id} and id_user=${req.session.user.id}`)
            let { rows } = await dbcon.query(`select * from permissaos where id_grupo=${id} and id_user=${req.session.user.id}`)
            console.log(rows)
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
                let paginacao = pagina * 10;
                let rows3 = await dbcon.query(`select mensagem_grupo.*, users.username from mensagem_grupo left join users on users.id = mensagem_grupo.id_user  where id_grupo=${rows2.rows[0].id} order by id_mens desc limit ${paginacao}`)
                if (rows3.rows[0]) {

                    let countmsg = await (await dbcon.query(`select count(*) as quantidade from mensagem_grupo left join users on users.id = mensagem_grupo.id_user  where id_grupo=${rows2.rows[0].id}`)).rows
                    parametros.quantidademsg = countmsg[0].quantidade
                    parametros.page = paginacao
                    parametros.msgs = rows3.rows


                } else {
                    console.log(rows3)
                }




            }

        }
        console.log(parametros.ver, parametros.escrever, parametros.quantidademsg, parametros.page)

        res.render('grupodetalhe', {...parametros, id })

    }



}

module.exports = { GruposControllers };