/***
 * This web service is based on AWS and coded by Nodejs express
 * @type {{config: GlobalConfigInstance; Config: Config; WebIdentityCredentials: WebIdentityCredentials; Request: Request; EventListeners; AWSError: AWSError; TemporaryCredentials: TemporaryCredentials; CognitoIdentityCredentials: CognitoIdentityCredentials; EnvironmentCredentials: EnvironmentCredentials; HTTPOptions: HTTPOptions; HttpResponse: HttpResponse; SAMLCredentials: SAMLCredentials; ECSCredentials: ECSCredentials; Endpoint: Endpoint; CredentialProviderChain: CredentialProviderChain; Service: Service; ProcessCredentials: ProcessCredentials; ChainableTemporaryCredentials: ChainableTemporaryCredentials; EC2MetadataCredentials: EC2MetadataCredentials; IniLoader: IniLoader; Credentials: Credentials; FileSystemCredentials: FileSystemCredentials; SharedIniFileCredentials: SharedIniFileCredentials; Response: Response; MetadataService: MetadataService; RemoteCredentials: RemoteCredentials; HttpRequest: HttpRequest; ElasticTranscoder; MediaConnect; ConnectParticipant; Kafka; MobileAnalytics; SSM; SageMakerRuntime; LexRuntime; QLDBSession; Route53; Lightsail; MachineLearning; GameLift; PI; Chime; Route53Domains; GroundStation; WorkSpaces; S3; ElasticInference; ApiGatewayManagementApi; DynamoDBStreams; CloudWatchLogs; KinesisVideoSignalingChannels; MediaStoreData; LakeFormation; ApplicationInsights; DMS; ManagedBlockchain; MigrationHub; Polly; RDSDataService; ECS; ECR; ResourceGroupsTaggingAPI; Batch; AppSync; EC2InstanceConnect; MediaLive; Connect; Translate; SQS; ComprehendMedical; EMR; StepFunctions; MarketplaceCommerceAnalytics; DAX; DLM; ComputeOptimizer; CognitoSync; CodeStarNotifications; SESV2; EBS; DirectConnect; EC2; PinpointSMSVoice; IoTSecureTunneling; Imagebuilder; ServiceQuotas; ServiceCatalog; CodePipeline; CUR; SavingsPlans; Athena; KinesisVideoArchivedMedia; Backup; ES; DocDB; FMS; RDS; SES; LexModelBuildingService; AutoScaling; Shield; IoTAnalytics; MigrationHubConfig; Schemas; SSOOIDC; MarketplaceMetering; CodeStarconnections; TranscribeService; ELB; Iot; Budgets; Transfer; Personalize; Glacier; CodeBuild; SageMaker; APIGateway; Pricing; WorkMailMessageFlow; EKS; ForecastQueryService; ApiGatewayV2; ImportExport; DataExchange; CloudSearchDomain; IoTJobsDataPlane; ACMPCA; FraudDetector; MediaStore; GlobalAccelerator; Greengrass; WorkDocs; Kinesis; Redshift; LicenseManager; WAFV2; SNS; SecurityHub; Health; ELBv2; Mobile; MediaPackageVod; MarketplaceEntitlementService; CloudTrail; ServiceDiscovery; PersonalizeRuntime; Inspector; SSO; WorkMail; Discovery; CloudFormation; MQ; MediaConvert; CognitoIdentity; AppStream; SMS; MarketplaceCatalog; WAF; CloudWatchEvents; Signer; Route53Resolver; KinesisVideoMedia; ForecastService; CodeStar; DataPipeline; RAM; CodeCommit; Kendra; CloudHSM; RoboMaker; FSx; CodeGuruProfiler; IoT1ClickDevicesService; XRay; DirectoryService; SWF; Detective; CloudFront; SecretsManager; AccessAnalyzer; CloudWatch; ConfigService; SimpleDB; Organizations; QLDB; WorkLink; IoTEventsData; Firehose; S3Control; Rekognition; CostExplorer; IAM; CloudHSMV2; CloudSearch; ServerlessApplicationRepository; Lambda; AppMesh; Comprehend; Support; Amplify; ACM; OpsWorksCM; NetworkManager; GuardDuty; KMS; Cloud9; AugmentedAIRuntime; ElastiCache; DynamoDB; DataSync; Snowball; ApplicationAutoScaling; KinesisAnalyticsV2; KinesisVideo; MTurk; IotData; PinpointEmail; AppConfig; EFS; ResourceGroups; MediaTailor; IoTThingsGraph; AutoScalingPlans; CodeGuruReviewer; Outposts; CognitoIdentityServiceProvider; EventBridge; STS; DeviceFarm; ElasticBeanstalk; Neptune; Macie; Textract; IoT1ClickProjects; MediaPackage; KinesisAnalytics; OpsWorks; CloudDirectory; StorageGateway; Pinpoint; CodeDeploy; Glue; QuickSight; WAFRegional; AlexaForBusiness; PersonalizeEvents; IoTEvents}}
 */

// load required js library
let AWS = require('aws-sdk');
let express = require('express');

// initilize the parameters of dynamodb tables
AWS.config.region = process.env.REGION;
let ddb = new AWS.DynamoDB();
let ddbTable = process.env.TABLE; // comes from options.config for best pratics
let app = express();

// scan the table, return all the results
app.get('/readall', function (req, res) {
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
            res.status(200).send(data.items);
        }
    });
});

// create a new part
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
            res.status(200).send(messageObj);
        }

    });

});

// read one part
app.get('/read/:part_no?', function (req, res) {
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
            res.status(200).send(data);
        }
    });
});

// update a part
app.post('/update/:part_no?/:part_desc?', function (req, res) {

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
            console.log("Error", err);
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
            console.log("Error", err);
            let returnStatus = 500;

            res.status(returnStatus).send(err);
            return next();
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