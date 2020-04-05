/***
 * This web service is based on AWS and coded by Nodejs express
 */

// load required js library
let express = require('express');
let mysql = require('mysql');
let app = express();

// initlize  the parameters of connection tables`
let con = mysql.createConnection({
    host     : process.env.RDS_HOSTNAME || 'csci5409-part.c2vryhkngaoi.us-east-2.rds.amazonaws.com',
    user     : process.env.RDS_USERNAME || 'admin',
    password : process.env.RDS_PASSWORD || '12345678',
    port     : process.env.RDS_PORT || '3306'
});
let db = process.env.RDS_MYSQL_DB || 'csci5409';
let table = process.env.RDS_MYSQL_TABLE || 'part';
// indicate default db
let sql = "use " + db;
con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Result: " + JSON.stringify(result));
    });
});

// a empty return from root
app.get ('/', (req, res) => {
    res.send ('Hello world from Express/Nodejs');
});

// scan the table, return all the results (Method: GET, can be tested on browser directly)
app.get('/readall', function (req, res) {
    sql = "select * from " + table;
    con.query(sql, function (err, result) {
        if (err) {
            res.status(500).send(JSON.stringify(err));
        } else {
            res.status(500).send(JSON.stringify(result));
        }
    });
});

// create a new part (Replace: part_no with the demand part no you want to search, for example:  0 ;  Replace: part_desc with the updated value)
app.post('/create/:part_no?/:part_desc?', function (req, res) {
    req.body = req.body || {};
    req.query = req.query || {};
    req.params = req.params || {};
    let req_part_no = req.body.part_no || req.query.part_no || req.params.part_no;
    let req_part_desc = req.body.part_desc || req.query.part_desc || req.params.part_desc;

    sql = "INSERT INTO "+ table +" SET `part_no` = "+ req_part_no +", `part_desc` = '"+ req_part_desc +"';";
    con.query(sql, function (err, result) {
        if (err) {
            res.status(500).send(JSON.stringify(err));
        } else {
            res.status(200).send(JSON.stringify(result));
        }
    });

});

// read one part
app.get('/read/:part_no?', function (req, res) {
    req.body = req.body || {};
    req.query = req.query || {};
    req.params = req.params || {};
    let req_part_no = req.body.part_no || req.query.part_no || req.params.part_no;
    sql = "select * from  "+ table +" where `part_no` = "+ req_part_no +";";
    con.query(sql, function (err, result) {
        if (err) {
            res.status(500).send(JSON.stringify(err));
        } else {
            res.status(200).send(JSON.stringify(result));
        }
    });
});

// update a part (Replace: part_no with the demand part no you want to search, for example:  0 ;  Replace: part_desc with the updated value)
app.post('/update/:part_no?/:part_desc?', function (req, res) {
    req.body = req.body || {};
    req.query = req.query || {};
    req.params = req.params || {};
    let req_part_no = req.body.part_no || req.query.part_no || req.params.part_no;
    let req_part_desc = req.body.part_desc || req.query.part_desc || req.params.part_desc;
    sql = "update "+ table +" SET `part_desc` = '"+ req_part_desc +"' where `part_no` = "+ req_part_no +";";
    con.query(sql, function (err, result) {
        if (err) {
            res.status(500).send(JSON.stringify(err));
        } else {
            res.status(200).send(JSON.stringify(result));
        }
    });
});

// delete one part
app.post('/delete/:part_no?', function (req, res) {
    req.body = req.body || {};
    req.query = req.query || {};
    req.params = req.params || {};
    let req_part_no = req.body.part_no || req.query.part_no || req.params.part_no;

    sql = "delete from  "+ table +" where `part_no` = "+ req_part_no +";";
    con.query(sql, function (err, result) {
        if (err) {
            res.status(500).send(JSON.stringify(err));
        } else {
            res.status(200).send(JSON.stringify(result));
        }
    });
});

let port = process.env.PORT || 3000;

let server = app.listen(port, function () {
    console.log('Server running at http://127.0.0.1:' + port + '/');
});