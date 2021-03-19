import AWS from 'aws-sdk';

// Prevent connecting to real AWS
AWS.config.update({
  region: 'new haven',
  credentials: {
    accessKeyId: 'dummy key',
    secretAccessKey: 'dummy password',
  },
});

// Prevent dynamoose from making any requests
jest.mock('dynamoose');
