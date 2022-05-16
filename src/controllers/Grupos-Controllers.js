
const {dbcon} = require('../config/connection-db');

 class GruposControllers {

    async inicio (req, res) {
        
        
        const  {id} = req.params;

        const { rows } = await dbcon.query(`SELECT * FROM Grupos g inner join  users u on u.id = g.owner limit 5 OFFSET ${(parseInt(id)-1)*5}`);
        const count = (await dbcon.query(`select count(*) from grupos`)).rows[0].count;
        const resposta = [];
        
        rows.map(data => {


        })
        
        const pages = Math.ceil(parseInt(count)/5)
         
        res.render('home', { rows: rows, maxpage: pages, ativo: parseInt(id) })

    }


}

module.exports = {GruposControllers}