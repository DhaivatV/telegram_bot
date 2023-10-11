  const AWS = require('aws-sdk');
  require('dotenv').config();
  const fs = require('fs');
  const { get } = require('http');
  require('dotenv').config();

  AWS.config.update({
    region: process.env.AWS__DEFAULT_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});
  const dynamo = new AWS.DynamoDB.DocumentClient();


  // DynamoDB functions
  async function getEntities(TABLE_NAME) {
    const params = {
      TableName: TABLE_NAME,
    };
    try {
      const result = await dynamo.scan(params).promise();
      return result;
    } catch (error) {
      console.log("36")
      handleDynamoError(error);
    }
  }




  async function addOrUpdateEntitiy(TABLE_NAME, entityObject) {
    console.log("66")
    const params = {
      TableName: TABLE_NAME,
      Item: entityObject,
    };
    try {
      const result = await dynamo.put(params).promise();
      return result;
    } catch (error) {
      handleDynamoError(error);
    }
      console.log("77")
  }


  async function getEntitiesByAttribute(TABLE_NAME, attributeName, attributeValue) {
    const params = {
      TableName: TABLE_NAME,
      FilterExpression: `${attributeName} = :value`,
      ExpressionAttributeValues: {
        ':value': attributeValue,
      },
    };
    try {
      const result = await dynamo.scan(params).promise();
      return result.Items;
    } catch (error) {
      handleDynamoError(error);
    }
  }

  function handleDynamoError(error) {
    console.error('DynamoDB Error:', error);
    throw error;
  }
 

  async function updateBotEntity(TABLE_NAME, entityObject) {

    const params = {
      TableName: TABLE_NAME,
      Key: {
        'keyName': entityObject.id
      },
      UpdateExpression: 'set #attrName = :attrValue',
      ExpressionAttributeNames: {
        '#attrName': entityObject.attributeName
      },
      ExpressionAttributeValues: {
        ':attrValue': entityObject.attributeValue
      }
    };
    try {
      const result = await dynamo.update(params).promise();
      return result;
    } catch (error) {
      handleDynamoError(error);
    }
  }

  async function updateUserEntity(TABLE_NAME, entityObject) {

    const params = {
      TableName: TABLE_NAME,
      Key: {
        'userId': entityObject.id
      },
      UpdateExpression: 'set #attrName = :attrValue',
      ExpressionAttributeNames: {
        '#attrName': entityObject.attributeName
      },
      ExpressionAttributeValues: {
        ':attrValue': entityObject.attributeValue
      }
    };
    try {
      const result = await dynamo.update(params).promise();
      return result;
    } catch (error) {
      handleDynamoError(error);
    }
  }

  async function deleteUserEntity(TABLE_NAME, userId) {
    const params = {
      TableName: TABLE_NAME,
      Key: {
        'userId': userId
      }
    };
    try {
      const result = await dynamo.delete(params).promise();
      return result;
    } catch (error) {
      handleDynamoError(error);
    }
  }




  module.exports = {
    updateBotEntity,   
    updateUserEntity,
    getEntities,
    deleteUserEntity,
    addOrUpdateEntitiy,
    getEntitiesByAttribute,
  };

