// Include the cluster module
let cluster = require('cluster');

// Code to run if we're in the master process
if (cluster.isMaster) {

    // Count the machine's CPUs
    let cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (let i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

    // Listen for terminating workers
    cluster.on('exit', function (worker) {

        // Replace the terminated workers
        console.log('Worker ' + worker.id + ' died :(');
        cluster.fork();

    });

// Code to run if we're in a worker process
} else {
    let AWS = require('aws-sdk');
    let express = require('express');
    let bodyParser = require('body-parser');
    let serverResp = '';




    AWS.config.region = process.env.REGION;

    let ddb = new AWS.DynamoDB();

    let ddbTable =  process.env.TABLE;
    let app = express();

    app.set('view engine', 'ejs');
    app.set('views', __dirname + '/views');
    app.use(bodyParser.urlencoded({extended:false}));

    app.get('/', function(req, res) {
        res.render('index', {
            static_path: 'static',
            serverResp: serverResp,
            theme: process.env.THEME || 'flatly',
            flask_debug: process.env.FLASK_DEBUG || 'false'
        });
    });

    app.post('/create', function(req, res) {
        let item = {
            'part_no': {'N': req.body.part_no},
            'part_desc': {'S': req.body.part_desc}
        };

        let messageObj = {'Message': 'Part_no: ' + req.body.part_no + "\r\nPart_desc: " + req.body.part_desc,
            'Subject': 'New part added ('+req.body.part_desc+')'};



        ddb.putItem({
            'TableName': ddbTable,
            'Item': item,
            'Expected': { part_no: { Exists: false } }
        }, function(err, data) {
            if (err) {
                let returnStatus = 500;

                if (err.code === 'ConditionalCheckFailedException') {
                    returnStatus = 409;
                }

                serverResp += '\r\n'+res+'\r\n';
                res.render('index', {
                    static_path: 'static',
                    serverResp: serverResp,
                    theme: process.env.THEME || 'flatly',
                    flask_debug: process.env.FLASK_DEBUG || 'false'
                });
                console.log('DDB Error: ' + err);
            } else {

                serverResp += "\r\n" + JSON.stringify(messageObj);
                res.render('index', {
                    static_path: 'static',
                    serverResp: serverResp,
                    theme: process.env.THEME || 'flatly',
                    flask_debug: process.env.FLASK_DEBUG || 'false'
                });
            }
        });
    });

    app.get('/readall', function(req, res) {
        let dynamoClient = new AWS.DynamoDB.DocumentClient();
        let params = {
            TableName: ddbTable, // give it your table name
            Select: "ALL_ATTRIBUTES"
        };

        dynamoClient.scan(params, function(err, data) {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                serverResp += "\r\n" + JSON.stringify(err);
                res.render('index', {
                    static_path: 'static',
                    serverResp: serverResp,
                    theme: process.env.THEME || 'flatly',
                    flask_debug: process.env.FLASK_DEBUG || 'false'
                });
            } else {
                serverResp += "\r\nGetItem succeeded:" + JSON.stringify(data);
                res.render('index', {
                    static_path: 'static',
                    serverResp: serverResp,
                    theme: process.env.THEME || 'flatly',
                    flask_debug: process.env.FLASK_DEBUG || 'false'
                });
                console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            }
        });
    });


    app.get('/read', function(req, res) {
        let item = {
            'part_no': {'N': req.body.part_no},
            'part_desc': {'S': req.body.part_desc}
        };

        let params = {
            TableName: ddbTable,
            Key: {
                'order_id': {N: req.body.part_no}
            },
            'Expected': { part_no: { Exists: true } }
        };

        ddb.getItem(params, function(err, data) {
            let messageObj = {'Message': data,
                'Subject': 'updated part ('+req.body.part_desc+')'};
            if (err) {
                let returnStatus = 500;

                if (err.code === 'ConditionalCheckFailedException') {
                    returnStatus = 409;
                }

                serverResp += "\r\n" + JSON.stringify(err);
                res.render('index', {
                    static_path: 'static',
                    serverResp: serverResp,
                    theme: process.env.THEME || 'flatly',
                    flask_debug: process.env.FLASK_DEBUG || 'false'
                });
            } else {
                serverResp += "\r\n" + JSON.stringify(messageObj);
                serverResp += "\r\nGetItem succeeded:" + JSON.stringify(data);
                res.render('index', {
                    static_path: 'static',
                    serverResp: serverResp,
                    theme: process.env.THEME || 'flatly',
                    flask_debug: process.env.FLASK_DEBUG || 'false'
                });
            }
        });
    });


    app.post('/update', function(req, res) {

        let item = {
            'part_no': {'N': req.body.part_no},
            'part_desc': {'S': req.body.part_desc}
        };

        let params = {
            TableName: ddbTable,
            Key: {
                'order_id': {N: req.body.part_no}
            },
            'Expected': { part_no: { Exists: true } }
        };

// Call DynamoDB to delete the item from the table
        ddb.deleteItem(params, function(err, data) {
            if (err) {
                console.log("Error", err);
                serverResp += "\r\n" + JSON.stringify(err);
                res.render('index', {
                    static_path: 'static',
                    serverResp: serverResp,
                    theme: process.env.THEME || 'flatly',
                    flask_debug: process.env.FLASK_DEBUG || 'false'
                });
            } else {
                console.log("Success", data);
                serverResp += "\r\nGetItem succeeded:" + JSON.stringify(data);
                res.render('index', {
                    static_path: 'static',
                    serverResp: serverResp,
                    theme: process.env.THEME || 'flatly',
                    flask_debug: process.env.FLASK_DEBUG || 'false'
                });
            }
        });

        ddb.putItem({
            'TableName': ddbTable,
            'Item': item,
            'Expected': { order_id: { Exists: false } }
        }, function(err, data) {
            let messageObj = {'Message': 'Part_no: ' + req.body.part_no + "\r\nPart_desc: " + req.body.part_desc,
                'Subject': 'updated part ('+req.body.part_desc+')'};
            if (err) {
                let returnStatus = 500;

                if (err.code === 'ConditionalCheckFailedException') {
                    returnStatus = 409;
                }
                serverResp += "\r\n" + JSON.stringify(err);
                res.render('index', {
                    static_path: 'static',
                    serverResp: serverResp,
                    theme: process.env.THEME || 'flatly',
                    flask_debug: process.env.FLASK_DEBUG || 'false'
                });
            } else {
                serverResp += "\r\nUpdateItem succeeded:" + JSON.stringify(messageObj);
                res.render('index', {
                    static_path: 'static',
                    serverResp: serverResp,
                    theme: process.env.THEME || 'flatly',
                    flask_debug: process.env.FLASK_DEBUG || 'false'
                });
            }
        });
    });


    app.post('/delete', function(req, res) {
        let params = {
            TableName: ddbTable,
            Key: {
                'order_id': {N: req.body.order_id}
            },
            'Expected': { order_id: { Exists: true } }
        };

// Call DynamoDB to delete the item from the table
        ddb.deleteItem(params, function(err, data) {
            if (err) {
                console.log("Error", err);
                serverResp += "\r\n" + JSON.stringify(err);
                res.render('index', {
                    static_path: 'static',
                    serverResp: serverResp,
                    theme: process.env.THEME || 'flatly',
                    flask_debug: process.env.FLASK_DEBUG || 'false'
                });
            } else {
                console.log("Success", data);
                serverResp += "\r\nDeleteItem succeeded:" + JSON.stringify(data);
                res.render('index', {
                    static_path: 'static',
                    serverResp: serverResp,
                    theme: process.env.THEME || 'flatly',
                    flask_debug: process.env.FLASK_DEBUG || 'false'
                });
            }
        });
    });

    let port = process.env.PORT || 3000;

    let server = app.listen(port, function () {
        console.log('Server running at http://127.0.0.1:' + port + '/');
    });
}