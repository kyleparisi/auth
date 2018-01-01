var session = require("express-session");
var DynamoDBStore = require("connect-dynamodb")({ session: session });
var options = {
  // Optional DynamoDB table name, defaults to 'sessions'
  // table: 'myapp-sessions',
  // Optional path to AWS credentials and configuration file
  // AWSConfigPath: './path/to/credentials.json',
  // Optional JSON object of AWS credentials and configuration
  // AWSConfigJSON: {
  //   accessKeyId: ,
  //   secretAccessKey: ,
  //   region: 'us-east-1'
  // },
  // Optional client for alternate endpoint, such as DynamoDB Local
  // client: new AWS.DynamoDB({ endpoint: new AWS.Endpoint('http://localhost:8000')}),
  // Optional ProvisionedThroughput params, defaults to 5
  // readCapacityUnits: 25,
  // writeCapacityUnits: 25
};
module.exports = session({
  store: new DynamoDBStore(options),
  secret: process.env.SECRET,
  resave: true,
  saveUninitialized: true
});
