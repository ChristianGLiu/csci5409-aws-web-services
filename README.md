# CSCI 5409 CLoud COmputing Course 
## AWS Elastic Beanstalk + DynamoDB / MySQL / No DATABSE + Nodejs Express
#### (note: I created this tutorials for course materials as teaching assistant, so it is recommended to use for education only)

#### NO DATABASE sample code: app-no-db.js
#### MYSQL sample code: app.js
#### DynamoDB.js code: app-DynamoDB.js
This code is based on AWS official tutorial sample code https://github.com/aws-samples/eb-node-express-signup, which unfortunately using quite old AWS SDK 1.6.
The original code only provide putItem (add) operation against to DynamoDB, plus it doesn't have capability to utilize the new AWS SDK 2.2+ DocumentClient API.

Therefore, I added and enhanced the create, read, update and delete operation based on latest AWS SDK API, plus I removed unnecessary SNS function which is not required for our course.

####Sample Code REST services call specification:

Return All Records:
http://csci6409.us-east-2.elasticbeanstalk.com/readall   (Method: GET, can be tested on browser directly)

Return Certain Record based on “Part_no”  (Method: GET, can be tested on browser directly)
http://csci6409.us-east-2.elasticbeanstalk.com/read/:part_no  (Replace :part_no with the demand part no you want to search, for example:  0 )

Update One Record: (Method: POST  - test in demo or use POSTMAN post request)
http://csci6409.us-east-2.elasticbeanstalk.com/read/:part_no/:part_desc (Replace :part_no with the demand part no you want to search, for example:  0 ;  Replace: part_desc with the updated value)

Delete One Record (Method: POST  - test in demo or use POSTMAN post request): 
http://csci6409.us-east-2.elasticbeanstalk.com/delete/:part_no (Replace :part_no with the demand part no you want to delete, for example:  0 )


####Demonstration:

Semple Source Code
https://github.com/chrisliu01/csci5409-aws-web-services

API Demo
http://csci6409.us-east-2.elasticbeanstalk.com/




####References (assume you are in the region “us-east-2”, otherwise replace it with your own region):

Creating Nodejs application in ELB environment:
https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/awseb-dg.pdf#nodejs-getstarted

Manage IAM Role (Important: let your app to get access to AWS native DynamoDB)
https://console.aws.amazon.com/iam/home?region=us-east-2#/roles

Manage DynamoDB:
https://us-east-2.console.aws.amazon.com/dynamodb/home?region=us-east-2

Manage ELB :
https://us-east-2.console.aws.amazon.com/elasticbeanstalk/home?region=us-east-2

DynamoDB JavaScript API
https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.NodeJs.03.html

Create AWS RDS (if you use reational database other than DynamoDB)
https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_Tutorials.WebServerDB.CreateDBInstance.html

WEB SERVICES TESTING: POSTMAN | SOUPUI
https://www.postman.com/



####Recommended videos (you as a TA) to watch if you are relatively new to JS:

•	https://www.youtube.com/watch?v=2mVR_Qgx_RU

####You can get started using the following steps:
  1. [Install the AWS Elastic Beanstalk Command Line Interface (CLI)](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html).
  2.	Create an AWS account if you did not. (we are in Halifax, so probably you will choose us-east-2 region)
  3.	Install the AWS Elastic Beanstalk Command Line Interface: http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html
  
  4.	Optional Step: Create an IAM Instance Profile named like “csci5409-aws-web-services”, the content like below (but do not have to be the same, it can also be edited on AWS console):
      {
  	  "Version": "2020-04-01",
  	  "Statement": [
  	    {
  	      "Effect": "Allow",
  	      "Action":   [ "dynamodb:DbName" ],
  	      "Resource": [ "*" ]
  	    },
  	    {
  	      "Effect": "Allow",
  	      "Action":   [ "sns:Publish" ],
  	      "Resource": [ "*" ]
  	    }
  	  ]
  	}
  
               More details you can always navigate on “https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/concepts-roles-instance.html” for more details of IAM application profile.
  
  5.	Run eb init -r <region> -p "Node.js" to initialize the folder for use with the CLI. Replace <region> with a region identifier such as us-east-2. 
  For interactive mode, run eb init then, 
  1) Pick a region of your choice. 
  2) Select the [ Create New Application ] option. 
  3) Enter the application name of your choice. 
  4) Answer yes to It appears you are using Node.js. Is this correct?. 
  5) Choose whether you want SSH access to the Amazon EC2 instances.
  (Note: If you choose to enable SSH and do not have an existing SSH key stored on AWS, the EB CLI requires ssh-keygen to be available on the path to generate SSH keys)

  6)	Complete your application coding on your local (will specifically talk about it later)
  
  I suggest webstorm IDE which complies with most industrial works in your career future.
  1)	In your application folder root, run “eb create --instance_profile csci5409-aws-web-services” to begin the creation of your environment. 
  2) Enter the environment name of your choice. 
  3) Enter the CNAME prefix you want to use for this environment.
  
   
  
  After finishing this step, you can login “https://us-east-2.console.aws.amazon.com/elasticbeanstalk/home?region=us-east-2#/applications” to config your application virually.
  
  Alternatively, if you find any difficulty to use CLI to config your application, you can always login https://us-east-2.console.aws.amazon.com/elasticbeanstalk/home?region=us-east-2#/newEnvironment?applicationName=tutorial&environmentType=LoadBalanced to complete your ELB application virtually.
  
  •	Choose the Platform that matches the language used by your application.
  
  •	For Application code, choose Sample application.
  
  •	Choose Review and launch.
  
  •	Review the available options. Choose the available option you want to use, and when you're ready, choose Create app.
  
   
  
  8.	Once done, run “eb open” to open the application in a browser.
  For example like this (You will notice the url is your pre-configured CNAME when setting up):
   
  
  9.	Create or connection with DB from your application on EB (https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/using-features.managing.db.html)
  
  •	Offer the permission to the DynamoDB:
  
  Add permissions to your environment's instances
  Your application runs on one or more EC2 instances behind a load balancer, serving HTTP requests from the Internet. When it receives a request that requires it to use AWS services, the application uses the permissions of the instance it runs on to access those services.
  
  As we mentioned in this tutorial, we are going to utilize the DynamoDB on AWS. We need to add the following managed policies to the default instance profile to grant the EC2 instances in your environment permission to access DynamoDB and Amazon SNS:
  
  AmazonDynamoDBFullAccess
  
  AmazonSNSFullAccess
  
  To add policies to the default instance profile
  
  o	Open the Roles page in the IAM console.
  
  o	Choose aws-elasticbeanstalk-ec2-role.
  
  o	On the Permissions tab, choose Attach policies.
  
  o	Select the managed policy for the additional services that your application uses. For example, AmazonSNSFullAccess or AmazonDynamoDBFullAccess.
  
  o	Choose Attach policy.
   
  
   
  
  •	Create DynamoDB tables:
  
  Amazon DynamoDB is a fully managed NoSQL database service that provides fast and predictable performance with seamless scalability. To create a DynamoDB table
  
  o	Open the Tables page in the DynamoDB management console. (https://console.aws.amazon.com/dynamodb/home?#tables:)
  
  o	Choose Create table.
  
  o	Type a Table name and Primary key.
  
  o	Choose the primary key type.
  
  o	Choose Create.
  
   
  
  
  •	Create Application Notification Topic (optional)
  
  If you want your application to track every requests against to your HTTP services, you need to setup AWS SNS on https://us-east-2.console.aws.amazon.com/sns/v3/home?region=us-east-2#/create-topic
   
  
  
  
  10.	 Download source code from https://github.com/chrisliu01/csci5409-aws-web-services to your reserved project folder. Run “eb deploy” and “eb open” again.
  
        9.   For every code change later on, you just need to run “eb deploy”.
  
2.	Create an AWS account if you did not. (we are in Halifax, so probably you will choose us-east-2 region)
3.	Install the AWS Elastic Beanstalk Command Line Interface: http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html

4.	Optional Step: Create an IAM Instance Profile named like “csci5409-aws-web-services”, the content like below (but do not have to be the same, it can also be edited on AWS console):
    {
	  "Version": "2020-04-01",
	  "Statement": [
	    {
	      "Effect": "Allow",
	      "Action":   [ "dynamodb:DbName" ],
	      "Resource": [ "*" ]
	    },
	    {
	      "Effect": "Allow",
	      "Action":   [ "sns:Publish" ],
	      "Resource": [ "*" ]
	    }
	  ]
	}

             More details you can always navigate on “https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/concepts-roles-instance.html” for more details of IAM application profile.

5.	Run eb init -r <region> -p "Node.js" to initialize the folder for use with the CLI. Replace <region> with a region identifier such as us-east-2. 
For interactive mode, run eb init then, 
1. Pick a region of your choice. 
2. Select the [ Create New Application ] option. 
3. Enter the application name of your choice. 
4. Answer yes to It appears you are using Node.js. Is this correct?. 
7. Choose whether you want SSH access to the Amazon EC2 instances.
(Note: If you choose to enable SSH and do not have an existing SSH key stored on AWS, the EB CLI requires ssh-keygen to be available on the path to generate SSH keys)

6.	Complete your application coding on your local (will specifically talk about it later)
I strongly suggest webstorm IDE which complies with most industrial works in your career future.
7.	In your application folder root, run “eb create --instance_profile csci5409-aws-web-services” to begin the creation of your environment. 
1. Enter the environment name of your choice. 
2. Enter the CNAME prefix you want to use for this environment.

 

After finishing this step, you can login “https://us-east-2.console.aws.amazon.com/elasticbeanstalk/home?region=us-east-2#/applications” to config your application virually.

Alternatively, if you find any difficulty to use CLI to config your application, you can always login https://us-east-2.console.aws.amazon.com/elasticbeanstalk/home?region=us-east-2#/newEnvironment?applicationName=tutorial&environmentType=LoadBalanced to complete your ELB application virtually.

•	Choose the Platform that matches the language used by your application.

•	For Application code, choose Sample application.

•	Choose Review and launch.

•	Review the available options. Choose the available option you want to use, and when you're ready, choose Create app.

 

8.	Once done, run “eb open” to open the application in a browser.
For example like this (You will notice the url is your pre-configured CNAME when setting up):
 

9.	Create or connection with DB from your application on EB (https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/using-features.managing.db.html)

•	Offer the permission to the DynamoDB:

Add permissions to your environment's instances
Your application runs on one or more EC2 instances behind a load balancer, serving HTTP requests from the Internet. When it receives a request that requires it to use AWS services, the application uses the permissions of the instance it runs on to access those services.

As we mentioned in this tutorial, we are going to utilize the DynamoDB on AWS. We need to add the following managed policies to the default instance profile to grant the EC2 instances in your environment permission to access DynamoDB and Amazon SNS:

AmazonDynamoDBFullAccess

AmazonSNSFullAccess

To add policies to the default instance profile

o	Open the Roles page in the IAM console.

o	Choose aws-elasticbeanstalk-ec2-role.

o	On the Permissions tab, choose Attach policies.

o	Select the managed policy for the additional services that your application uses. For example, AmazonSNSFullAccess or AmazonDynamoDBFullAccess.

o	Choose Attach policy.
 

 

•	Create DynamoDB tables:

Amazon DynamoDB is a fully managed NoSQL database service that provides fast and predictable performance with seamless scalability. To create a DynamoDB table

o	Open the Tables page in the DynamoDB management console. (https://console.aws.amazon.com/dynamodb/home?#tables:)

o	Choose Create table.

o	Type a Table name and Primary key.

o	Choose the primary key type.

o	Choose Create.

 


•	Create Application Notification Topic (optional)

If you want your application to track every requests against to your HTTP services, you need to setup AWS SNS on https://us-east-2.console.aws.amazon.com/sns/v3/home?region=us-east-2#/create-topic
 



10.	 Download source code from https://github.com/chrisliu01/csci5409-aws-web-services to your reserved project folder. Run “eb deploy” and “eb open” again.

      9.   For every code change later on, you just need to run “eb deploy”.


