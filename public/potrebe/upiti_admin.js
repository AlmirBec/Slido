var express = require('express');
var router = express.Router({mergeParams:true});
var con = require("./config");
var pg = require('pg');
var pool = new pg.Pool(con);
var hash = require("./hashiranje");
let admin = {
    getPredavaci: function (req, res, next) {
        pool.connect(function (err, client, done) {
            if (err) {
                return res.send(err);
            }

            client.query(`SELECT * FROM predavac;`, [], function (err, result) {
                done();

                if (err) {
                    return res.send(err);
                } else {
                    req.predavac = result.rows;
                    next();
                }
            });
        });
    },
    delSve: function(req, res, next){

        pool.connect(function (err, client, done) {
            if (err) {
                return res.send(err);
            }
            client.query(`DELETE FROM pitanja WHERE kod_predavanja IN (
                    SELECT kod FROM predavanja WHERE id_predavaca = $1);`, [req.params.id], function (err, result) {
                done();
                if (err) {
                    return res.send(err);
                } else {
                    console.log("HMM");
                    pool.connect(function (err, client, done) {
                        if (err) {
                            return res.send(err);
                        }
                        client.query(`DELETE FROM predavanja WHERE id_predavaca = $1;`, [req.params.id], function (err, result) {
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
    delPredavaci: function(req, res, next) {

        pool.connect(function (err, client, done) {
            if (err) {
                return res.send(err);
            }
            client.query(`DELETE FROM predavac WHERE id = $1;`, [req.params.id], function (err, result) {
                done();
                if (err) {
                    return res.send(err);
                } else {
                    next();
                }
            });
        });
    },
    delVulgarizam: function (req, res, next) {

        pool.connect(function (err, client, done) {
            if (err) {
                return res.send(err);
            }

            client.query(`DELETE FROM zabranjenerijeci WHERE id = $1;`, [req.params.id], function (err, result) {
                done();

                if (err) {
                    return res.send(err);
                } else {
                    next();
                }
            });
        });
    },
    dodajPredavaca: function (req, res, next) {
        pool.connect(function (err, client, done) {
            if (err) {
                return res.send(err);
            }

            client.query(`INSERT INTO predavac(username, sifra) VALUES($1, $2)`,
                [req.body.username, req.body.password], function (err, result) {
                done();

                if (err) {
                    return res.send(400);
                } else {
                    next();
                }
            });
        });
    },
        getPredavanja: function (req, res, next) {
        pool.connect(function (err, client, done) {
            if (err) {
                return res.send(err);
            }

            client.query(`SELECT * FROM predavanja;`, [], function (err, result) {
                done();

                if (err) {
                    return res.send(err);
                } else {
                    req.predavanja = result.rows;
                    next();
                }
            });
        });
    },
    getPitanja: function (req, res, next) {
        pool.connect(function (err, client, done) {
            if (err) {
                return res.send(err);
            }

            client.query(`SELECT * FROM pitanja;`, [], function (err, result) {
                done();

                if (err) {
                    return res.send(err);
                } else {
                    req.pitanja = result.rows;
                    next();
                }
            });
        });
    },
    getVulgarizmi: function (req, res, next) {
        pool.connect(function (err, client, done) {
            if (err) {
                return res.send(err);
            }

            client.query(`SELECT * FROM zabranjenerijeci;`, [], function (err, result) {
                done();

                if (err) {
                    return res.send(err);
                } else {
                    req.vulgarizmi = result.rows;
                    next();
                }
            });
        });
    },
    delPredavanja: function (req, res, next) {

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
    },
    delPitanjaKod: function(req, res, next){
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
                    next();
                }
            });
        });
    },
    delPitanja: function (req, res, next) {
        pool.connect(function (err, client, done) {
            if (err) {
                return res.send(err);
            }

            client.query(`DELETE FROM pitanja WHERE id = $1;`, [req.params.id], function (err, result) {
                done();

                if (err) {
                    return res.send(err);
                } else {
                    next();
                }
            });
        });
    },
    provjeriUsername: async function (ime, res) {
        try {
            const client = await pool.connect();
            const result = await
                client.query(`SELECT * FROM admin WHERE username = $1;`, [ime]);
            client.release();
            return result.rows;
        } catch (err) {
            return res.render(err);
        }
    },
    provjeriSifru: async function (ime, sifra, res) {
        try {
            const client = await pool.connect();
            const result = await
                client.query(`SELECT sifra FROM admin WHERE sifra = $1 AND username = $2;`, [sifra, ime]);
            client.release();
            return result.rows;
        } catch (err) {
            return res.render(err);
        }
    },
    promijeniSifru: async function(sifra, sifra2, res){
        try {
            const client = await pool.connect();
            const result = await
                client.query(`UPDATE admin SET sifra = $1 WHERE sifra = $2;`, [sifra, sifra2]);
            client.release();
            return result.rows;
        } catch (err) {
            return res.render(err);
        }
    },
    provjeriLogin: async function(req, res, next){
        let errors = [];
        let ime = req.body.adminusername;
        let sifra = req.body.adminpassword;
        let postojiIme = await this.provjeriUsername(ime, res);
        console.log(postojiIme);
        if (postojiIme.length === 0) {
            errors.push({poruka: "Unijeli ste nepostojeci username"});
            return res.render('adminlogin', {title: "login", er: errors});
        }
        if(await hash.provjeriPoklapanje(sifra, postojiIme[0].sifra)){
            res.cookie("adminCookie", {ime:"admin"}, {maxAge: 4*60*60*1000});
            res.redirect("http://localhost:3000/admin");
        }
        else if(postojiIme[0].sifra === sifra){
            global.staraSifra = sifra;
            res.redirect("http://localhost:3000/admin/loginhash");
        }
        else{
            errors.push({poruka: "Unijeli ste neispravan password"});
            return res.render('adminlogin', {title: "login", er: errors});
        }

    },
    hashirajIizmijeni: async function(sifra, sifra2, req, res){
        let errors = [];
        if(sifra !== sifra2){
            errors.push({poruka: "Sifre se ne poklapaju"});
            return res.render('adminhash', {title: "login", er: errors});
        }
        let kript = await hash.hashirajSifru(sifra, req, res);
        await this.promijeniSifru(kript, staraSifra);
        res.cookie("adminCookie", {ime: "admin"}, {maxAge: 4*60*60*1000});
        res.redirect("http://localhost:3000/admin");
    },
    banuj: async function(id, datum, req, res){
        console.log(datum);
        try {
            const client = await pool.connect();
            const result = await
                client.query(`UPDATE predavac SET pristup = $1, datum_banovanja = $2 
                                WHERE id = $3;`, [false, datum, id]);
            client.release();
            return result.rows;
        } catch (err) {
            return res.render(err);
        }
    },
    odobriPristup: async function(id, req, res){
        try {
            const client = await pool.connect();
            const result = await
                client.query(`UPDATE predavac SET pristup = $1, datum_banovanja = $2 
                                WHERE id = $3;`, [true, null, id]);
            client.release();
            return result.rows;
        } catch (err) {
            return res.render(err);
        }
    },
    dodajVulgarizam: function(req, res, next){
        pool.connect(function (err, client, done) {
            if (err) {
                return res.send(err);
            }

            client.query(`INSERT INTO zabranjenerijeci(lista_rijeci)
                              VALUES($1)`, [req.body.vulgarizam], function (err, result) {
                done();

                if (err) {
                    return res.send(err);
                } else {
                    next();
                }
            });
        });
    },
}

module.exports = admin;