var express = require('express');
var router = express.Router({mergeParams:true});
var con = require("./config");
var pg = require('pg');
var pool = new pg.Pool(con);
let predavac = {
    provjeriMail: async function (mail, res) {
        try {
            const client = await pool.connect();
            const result = await
                    client.query(`SELECT * FROM predavac WHERE email = $1;`, [mail]);
                client.release();
                return result.rows;
            } catch (err) {
                return res.render(err);
            }
        },
    provjeriUsername: async function (ime, res) {
        try {
            const client = await pool.connect();
            const result = await
                client.query(`SELECT * FROM predavac WHERE username = $1;`, [ime]);
            client.release();
            return result.rows;
        } catch (err) {
            return res.render(err);
        }
    },
    dodajPredavaca: async function (ime, email, sifra, req, res) {
        try {
            const client = await pool.connect();
            await client.query(`INSERT INTO predavac(username, sifra, email) VALUES($1, $2, $3)`,
                [ime, sifra, email]);
            client.release();
        } catch (err) {
            return res.render(err);
        }
    },
    izvuciHash: async function(email, req, res){
        try {
            const client = await pool.connect();
            const result = await client.query(`SELECT sifra FROM predavac 
                                WHERE email = $1`, [email]);
            client.release();
            console.log(result.rows[0].sifra);
            return result.rows[0].sifra;
        } catch (err) {
            return res.render(err);
        }
    },
    dajPredavaca: async function(email, req, res){
        try {
            const client = await pool.connect();
            const result = await client.query(`SELECT * FROM predavac 
                                WHERE email = $1`, [email]);
            client.release();
            let token = {
                id : result.rows[0].id,
                email : result.rows[0].email
            }
            return token;
        } catch (err) {
            return res.render(err);
        }
    },
    dodajPredavanje: async function (id_predavaca, naziv, kod, vrijeme_poc, broj, req, res) {
        try {
            const client = await pool.connect();
            await client.query(`INSERT INTO predavanja(id_predavaca, naziv, kod, vrijeme_pocetka, broj_ponavljanja)
                VALUES($1, $2, $3, $4, $5)`,
                [id_predavaca, naziv, kod, vrijeme_poc, broj]);
            client.release();
        } catch (err) {
            return res.render(err);
        }
    },
    brojPredavanja: async function(req, res){
        try {
            const client = await pool.connect();
            const result = await client.query(`SELECT Count(*) FROM predavanja;`, []);
            client.release();
            return result.rows[0].count;
        } catch (err) {
            return res.render(err);
        }
    },
    prikaziPredavanja: async function(id, req, res){
        try {
            const client = await pool.connect();
            const result = await client.query(`SELECT * FROM predavanja 
                                WHERE id_predavaca = $1`, [id]);
            client.release();

            return result.rows;
        } catch (err) {
            return res.render(err);
        }
    },
    dajPredavanje: async function(kod, req, res){
        try {
            const client = await pool.connect();
            const result = await client.query(`SELECT * FROM predavanja 
                                WHERE kod = $1`, [kod]);
            client.release();
            return result.rows;
        } catch (err) {
            return res.render(err);
        }
    },
    updatePredavanje: async function(naziv, pocetak, ponavljanje, id, req, res){
        try {
            const client = await pool.connect();
            await client.query(`UPDATE predavanja 
                                      SET naziv = $1, vrijeme_pocetka = $2, broj_ponavljanja = $3
                                WHERE id = $4`, [naziv, pocetak, ponavljanje, id]);
            client.release();
        } catch (err) {
            return res.render(err);
        }
    },
    dodajPubliku: async function(kod, req, res){
        try {
            const client = await pool.connect();
            await client.query(`INSERT INTO publika(kod)
                VALUES($1)`,
                [kod]);
            client.release();
        } catch (err) {
            return res.render(err);
        }
    },
    dodajPubliku: async function(kod, req, res){
        try {
            const client = await pool.connect();
            await client.query(`INSERT INTO publika(kod)
                VALUES($1)`,
                [kod]);
            client.release();
        } catch (err) {
            return res.render(err);
        }
    },
    dajPubliku: async function(kod, req, res){
        try {
            const client = await pool.connect();
            const result = await client.query(`SELECT COUNT(*) FROM publika 
                                WHERE kod = $1`, [kod]);
            client.release();
            return result.rows;
        } catch (err) {
            return res.render(err);
        }
    },
    ubaciReview: async function(kod, value, req, res){
        try {
            const client = await pool.connect();
            await client.query(`INSERT INTO review(kod, ocjena) VALUES($1, $2)`, [kod, value]);
            client.release();
        } catch (err) {
            return res.render(err);
        }
    },
    dajProsjekReview: async function(kod, req, res){
        try {
            const client = await pool.connect();
            result = await client.query(`SELECT AVG(ocjena) FROM REVIEW
                                        WHERE kod = $1`, [kod]);
            client.release();
        } catch (err) {
            return res.render(err);
        }
    },
    ubaciSliku: async function(id, url, req, res){
        try {
            const client = await pool.connect();
            await client.query(`UPDATE predavanja SET url = $1
                                 WHERE id = $2`, [url, id]);
            client.release();
        } catch (err) {
            return res.render(err);
        }
    },
    dajSliku: async function(kod, req, res){
        try {
            const client = await pool.connect();
            const result = await client.query(`SELECT url FROM predavanja
                                 WHERE kod = $1`, [kod]);
            client.release();
            return result.rows[0];
        } catch (err) {
            return res.render(err);
        }
    },
    delSve: function(req, res, next){

        pool.connect(function (err, client, done) {
            if (err) {
                return res.send(err);
            }
            client.query(`DELETE FROM pitanja WHERE kod_predavanja IN (
                    SELECT kod FROM predavanja WHERE id = $1);`, [req.params.id], function (err, result) {
                done();
                if (err) {
                    return res.send(err);
                } else {
                    console.log("HMM");
                    pool.connect(function (err, client, done) {
                        if (err) {
                            return res.send(err);
                        }
                        client.query(`DELETE FROM predavanja WHERE id = $1;`, [req.params.id], function (err, result) {
                            done();
                            if (err) {
                                return res.send(err);
                            } else {
                                next();
                            }
                        });
                    });
                }
            });
        });
    },
};

module.exports = predavac;