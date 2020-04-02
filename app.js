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
    let tableView = '';


    let scanTable = function (req, res) {
        let params = {
            TableName: ddbTable, // give it your table name
            Select: "ALL_ATTRIBUTES"
        };

        ddb.scan(params, function (err, data) {
            if (err) {
                let returnStatus = 500;

                if (err.code === 'ConditionalCheckFailedException') {
                    returnStatus = 409;
                }

                res.status(returnStatus).send(JSON.stringify(err, null, 4));
                console.log('DDB Error: ' + JSON.stringify(err, null, 4));
            } else {

                tableView = data;
                res.status(200).send(tableView);
            }
        });
    };


    AWS.config.region = process.env.REGION;

    let ddb = new AWS.DynamoDB();

    let ddbTable = process.env.TABLE;
    let app = express();

    app.set('view engine', 'ejs');
    app.set('views', __dirname + '/views');
    app.use(bodyParser.urlencoded({extended: false}));

    app.get('/', function (req, res) {
        res.render('index', {
            static_path: 'static',
            serverResp: serverResp,
            theme: process.env.THEME || 'flatly',
            flask_debug: process.env.FLASK_DEBUG || 'false',
            tableView: tableView

        });
    });

    app.post('/create', function (req, res) {
        let item = {
            'part_no': {'N': req.body.part_no},
            'part_desc': {'S': req.body.part_desc}
        };

        let messageObj = {
            'Message': 'Part_no: ' + req.body.part_no + "\r\nPart_desc: " + req.body.part_desc,
            'Subject': 'New part added (' + req.body.part_desc + ')'
        };


        ddb.putItem({
            'TableName': ddbTable,
            'Item': item,
            'Expected': {part_no: {Exists: false}}
        }, function (err, data) {
            if (err) {
                let returnStatus = 500;

                if (err.code === 'ConditionalCheckFailedException') {
                    returnStatus = 409;
                }

                res.status(returnStatus).send(err);
            } else {
                serverResp += "\r\n" + JSON.stringify(messageObj, null, 4);
                data.msg = serverResp;
                res.status(200).send(data);
            }

        });

    });

    app.get('/readall', function (req, res) {
        scanTable(req, res);
    });


    app.get('/read/:part_no', function (req, res) {
        let req_part_no = req.params.part_no || req.body.part_no || req.query.part_no;
        let params = {
            AttributesToGet: [
                "part_desc"
            ],
            TableName: ddbTable,
            Key: {
                "part_no": { "N" : req_part_no}
            }
        };

        ddb.getItem(params, function (err, data) {
            if (err) {
                let returnStatus = 500;

                if (err.code === 'ConditionalCheckFailedException') {
                    returnStatus = 409;
                }

                // err['requests'] = req;
                res.status(returnStatus).send(err);

            } else {
                res.status(200).send(data);
            }

            return next();
        });
    });


    app.post('/update', function (req, res) {

        let params = {
            TableName: ddbTable,
            Key: {
                'part_no': {N: req.body.part_no}
            },
            UpdateExpression: "set part_desc = :x",
            ExpressionAttributeValues: {
                ":x": req.body.part_desc
            },
            ReturnValues: "UPDATED_NEW",
            'Expected': {part_no: {Exists: true}}
        };

        ddb.update(params, function (err, data) {
            let messageObj = {
                'Message': 'Part_no: ' + req.body.part_no + "\r\nPart_desc: " + req.body.part_desc,
                'Subject': 'updated part (' + req.body.part_desc + ')'
            };
            if (err) {
                console.log("Error", err);
                let returnStatus = 500;

                if (err.code === 'ConditionalCheckFailedException') {
                    returnStatus = 409;
                }
                res.status(returnStatus).send(err);

            } else {
                serverResp += "\r\n" + JSON.stringify(messageObj, null, 4);
                data.msg = serverResp;
                res.status(200).send(data);
            }
        });
    });


    app.post('/delete', function (req, res) {
        let params = {
            TableName: ddbTable,
            Key: {
                'part_no': {N: req.body.part_no}
            },
            'Expected': {part_no: {Exists: true}}
        };

// Call DynamoDB to delete the item from the table
        ddb.deleteItem(params, function (err, data) {
            if (err) {
                console.log("Error", err);
                let returnStatus = 500;

                if (err.code === 'ConditionalCheckFailedException') {
                    returnStatus = 409;
                }
                res.status(returnStatus).send(err);

            } else {
                serverResp += "\r\n" + JSON.stringify(messageObj, null, 4);
                data.msg = serverResp;
                res.status(200).send(data);
            }
        });
    });

    let port = process.env.PORT || 3000;

    let server = app.listen(port, function () {
        console.log('Server running at http://127.0.0.1:' + port + '/');
    });
}