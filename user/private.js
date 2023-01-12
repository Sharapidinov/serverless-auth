const AWS = require('aws-sdk')
const {sendResponse} = require('../functions/index')

const dynamodb = new AWS.DynamoDB.DocumentClient()

module.exports.handler = async (event) => {
  try {
    const {email} = JSON.parse(event.body)

    const getItemParams = {
      TableName: process.env.DYNAMODB_CUSTOMER_TABLE,
      Key: {"email": email}
    }

    const result = await dynamodb.get(getItemParams).promise()

    if (!Object.keys(result).length) {
      return sendResponse(404, {message: 'Requested data not found'})
    }

    return sendResponse(200, {
      consumed_capacity: result.ConsumedCapacity,
      data: result.Item
    })
  } catch (error) {
    const message = error.message ? error.message : 'Internal server error'
    return sendResponse(500, {message})
  }
}