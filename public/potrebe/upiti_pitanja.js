var express = require('express');
var router = express.Router({mergeParams:true});
var con = require("./config");
var pg = require('pg');
var pool = new pg.Pool(con);
let pitanja = {
    dajPredavaca: async function (kod, req, res) {

        try {
            const client = await pool.connect();
            const result = await client.query(`SELECT id_predavaca FROM predavanja 
                                WHERE kod = $1`, [kod]);
            client.release();
            return result.rows;
        } catch (err) {
            return res.render(err);
        }
    },
    dodajPitanje: async function (kod, tekst, zab, req, res) {
        try {
            const client = await pool.connect();
            const result = await client.query(`INSERT INTO pitanja(kod_predavanja, tekst, sakriveno) 
                   VALUES($1, $2, $3) RETURNING *`,
                [kod, tekst, zab]);
            client.release();
            return result.rows[0];
        } catch (err) {
            return res.render(err);
        }
    },
    prikaziSvaPitanja: async function (kod, req, res) {
        try {
            const client = await pool.connect();
            const result = await client.query(`SELECT * FROM pitanja 
                                WHERE kod_predavanja = $1 
                                ORDER BY id`, [kod]);
            client.release();
            return result.rows;
        } catch (err) {
            return res.render(err);
        }
    },
    prikaziPitanja: async function (kod, req, res) {
        try {
            const client = await pool.connect();
            const result = await client.query(`SELECT * FROM pitanja 
                                WHERE kod_predavanja = $1 AND odgovoreno = $2 
                                AND sakriveno = $3 
                                ORDER BY id`, [kod, false, false]);
            client.release();
            return result.rows;
        } catch (err) {
            return res.render(err);
        }
    },
    prikaziOdgovorena: async function (kod, req, res) {
        try {
            const client = await pool.connect();
            const result = await client.query(`SELECT * FROM pitanja 
                                WHERE kod_predavanja = $1 AND odgovoreno = $2 
                                ORDER BY id`, [kod, true]);
            client.release();
            return result.rows;
        } catch (err) {
            return res.render(err);
        }
    },
    prikaziZabranjena: async function (kod, req, res) {
        try {
            const client = await pool.connect();
            const result = await client.query(`SELECT * FROM pitanja 
                                WHERE kod_predavanja = $1 AND sakriveno = $2 
                                ORDER BY id`, [kod, true]);
            client.release();
            return result.rows;
        } catch (err) {
            return res.render(err);
        }
    },

    prikaziPoBrojuLajkova: async function (kod, req, res) {
        try {
            const client = await pool.connect();
            const result = await client.query(`SELECT * FROM pitanja 
                                WHERE kod_predavanja = $1 AND odgovoreno = $2 
                                AND sakriveno = $3 
                                ORDER BY broj_lajkova DESC`, [kod, false, false]);
            client.release();
            return result.rows;
            //TO DO, otici na ejs i prikazati pitanja;
        } catch (err) {
            return res.render(err);
        }
    },
    povecajLike: async function (id, req, res) {
        try {
            const client = await pool.connect();
            const result = await client.query(`UPDATE pitanja
                                                SET broj_lajkova = broj_lajkova + 1 
                                WHERE id = $1 RETURNING broj_lajkova`, [id]);
            client.release();
            return result.rows[0];
        } catch (err) {
            return res.render(err);
        }
    },
    odgovoreno: async function (id, req, res) {
        try {
            id = id.slice(0, -3);
            const client = await pool.connect();
            //console.log(id);
            await client.query(`UPDATE pitanja
                                SET odgovoreno = $1 
                                WHERE id = $2`, [true, id]);
            client.release();
        } catch (err) {
            return res.render(err);
        }
    },
    zabRijeci: async function (req, res) {
        try {
            const client = await pool.connect();
            const result = await client.query(`SELECT * FROM zabranjenerijeci`, [])

            client.release();
            return result.rows;
            //TO DO, otici na ejs i prikazati pitanja;
        } catch (err) {
            return res.render(err);
        }
    },
    obrisiPitanje: async function (id, req, res) {
        id = id.slice(0, -3)
        try {
            const client = await pool.connect();
            const result = await client.query(`DELETE FROM pitanja WHERE id = $1`, [id])

            client.release();
            return result.rows;
        } catch (err) {
            return res.render(err);
        }
    },
    sakrijPitanje: async function (id, req, res) {
        id = id.slice(0, -3)
        try {
            const client = await pool.connect();
            const result = await client.query(`UPDATE pitanja SET sakriveno = $1 WHERE id = $2`, [true, id])

            client.release();
            return result.rows;
        } catch (err) {
            return res.render(err);
        }
    },
    prebrojOdgovorena: async function (kod, req, res) {
        try {
            const client = await pool.connect();
            const result = await client.query(`SELECT COUNT(*) as odgovorena FROM pitanja
                                            WHERE kod_predavanja = $1 AND odgovoreno = $2`, [kod, true]);

            client.release();
            return result.rows[0];
        } catch (err) {
            return res.render(err);
        }
    },
    prebrojSakrivena: async function (kod, req, res) {
        try {
            const client = await pool.connect();
            const result = await client.query(`SELECT COUNT(*) as sakrivena FROM pitanja
                                           WHERE kod_predavanja = $1 AND sakriveno = $2`, [kod, true]);

            client.release();
            return result.rows[0];
        } catch (err) {
            return res.render(err);
        }
    },

    prebrojPitanja: async function (kod, req, res) {
            try {
                const client = await pool.connect();
                const result = await client.query(`SELECT COUNT(*) broj_pitanja FROM pitanja
                                           WHERE kod_predavanja = $1`, [kod]);

                client.release();
                return result.rows[0];
            } catch (err) {
                return res.render(err);
            }
        },
}
module.exports = pitanja;