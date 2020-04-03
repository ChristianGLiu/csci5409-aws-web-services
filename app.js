/***
 * This web service is based on AWS and coded by Nodejs express
 */

// load required js library
let AWS = require('aws-sdk');
let express = require('express');

// initilize the parameters of dynamodb tables
AWS.config.region = process.env.REGION;
let ddb = new AWS.DynamoDB();
let ddbTable = process.env.TABLE; // comes from options.config in .ebextensions folder for best pratics, or you can directly replace it with your hardcoded table name
let app = express();

// a empty return from root
app.get ('/', (req, res) => {
    res.send ('Hello world from Express/Nodejs');
});

// scan the table, return all the results (Method: GET, can be tested on browser directly)
app.get('/readall', function (req, res) {
    let params = {
        TableName: ddbTable, // give it your table name
        Select: "ALL_ATTRIBUTES"
    };
    ddb.scan(params, function (err, data) {
        if (err) {
            let returnStatus = 500;
            res.status(returnStatus).send(JSON.stringify(err, null, 4));
        } else {
            res.status(200).send(data['Items']);
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

    let item = {
        'part_no': {'N': req_part_no},
        'part_desc': {'S': req_part_desc}
    };

    let messageObj = {
        'Message': 'Part_no: ' + req_part_no + "\r\nPart_desc: " + req_part_desc,
        'Subject': 'New part added (' + req_part_desc + ')'
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
            res.status(200).send(messageObj);
        }

    });

});

// read one part
app.get('/read/:part_no?', function (req, res) {
    req.body = req.body || {};
    req.query = req.query || {};
    req.params = req.params || {};
    let req_part_no = req.body.part_no || req.query.part_no || req.params.part_no;
    let params = {
        AttributesToGet: [
            "part_no",
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
            res.status(returnStatus).send(err);
        } else {
            res.status(200).send(data['Item']);
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
    let params = {
        TableName: ddbTable,
        Key: {
            'part_no': {N: req_part_no}
        },
        UpdateExpression: "set part_desc = :x",
        ExpressionAttributeValues: {
            ":x": {S: req_part_desc}
        },
        ReturnValues: "UPDATED_NEW"
    };

    ddb.updateItem(params, function (err, data) {
        if (err) {
            let returnStatus = 500;
            res.status(returnStatus).send(err);
        } else {
            data['msg'] = 'successfully updated:' + req_part_no;
            res.status(200).send(data);
        }
    });
});

// delete one part
app.post('/delete/:part_no?', function (req, res) {
    req.body = req.body || {};
    req.query = req.query || {};
    req.params = req.params || {};
    let req_part_no = req.body.part_no || req.query.part_no || req.params.part_no;
    let params = {
        TableName: ddbTable,
        Key: {
            'part_no': {N: req_part_no}
        }
    };

// Call DynamoDB to delete the item from the table
    ddb.deleteItem(params, function (err, data) {
        if (err) {
            let returnStatus = 500;
            res.status(returnStatus).send(err);
        } else {
            data['msg'] = 'successfully deleted:' + req_part_no;
            res.status(200).send(data);
        }
    });
});

let port = process.env.PORT || 3000;

let server = app.listen(port, function () {
    console.log('Server running at http://127.0.0.1:' + port + '/');
});