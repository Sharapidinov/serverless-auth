const AWS = require('aws-sdk')
const {sendResponse, validateInput} = require("../functions")

const cognito = new AWS.CognitoIdentityServiceProvider()
const dynamoDb = new AWS.DynamoDB.DocumentClient()

module.exports.handler = async (event) => {
  try {
    const isValid = validateInput(event.body)
    if (!isValid) {
      return sendResponse(400, {message: 'Invalid input'})
    }

    const {email, password, name} = JSON.parse(event.body)
    const {USER_POOL_ID, DYNAMODB_CUSTOMER_TABLE} = process.env

    const putParamsToDynamoDB = {
      TableName: DYNAMODB_CUSTOMER_TABLE,
      Item: {email, name, balance: 0}
    }
    await dynamoDb.put(putParamsToDynamoDB).promise()

    const params = {
      UserPoolId: USER_POOL_ID,
      Username: email,
      UserAttributes: [
        {
          Name: 'email',
          Value: email
        },
        {
          Name: 'email_verified',
          Value: 'true'
        }
      ],
      MessageAction: 'SUPPRESS'
    }
    const response = await cognito.adminCreateUser(params).promise()

    if (response.User) {
      const paramsForSetPass = {
        Password: password,
        UserPoolId: USER_POOL_ID,
        Username: email,
        Permanent: true
      }
      await cognito.adminSetUserPassword(paramsForSetPass).promise()
    }
    return sendResponse(200, {message: 'User registration successful'})
  } catch (error) {
    const message = error.message ? error.message + JSON.stringify(event.body) : 'Internal server error' + JSON.stringify(event.body)
    return sendResponse(500, {message})
  }
}

