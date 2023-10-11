import { Injectable, Logger } from '@nestjs/common';
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
import * as AWS from 'aws-sdk';
import { Cron, CronExpression } from '@nestjs/schedule';
import {updateEntity, getEntities, addOrUpdateEntitiy, getEntitiesByAttribute} from './../../utils/dynamo'
import { get } from 'http';
import * as dotenv from 'dotenv';
dotenv.config();




@Injectable()
export class TelegramService {

  private readonly bot: any;
  private logger = new Logger(TelegramService.name);
  private dynamoDB: AWS.DynamoDB;

  
  constructor() {

    async function initializeBot() {
      const abc = await getEntities('botkeys');
      const res = abc.Items[0].keyValue;
      this.bot = new TelegramBot(res, { polling: true });
      this.bot.on('message', this.onReceiveMessage);
    }
    
    initializeBot.bind(this)();
    AWS.config.update({
      region: process.env.AWS__DEFAULT_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    });
    this.dynamoDB = new AWS.DynamoDB();
  }

  getTelegramkey = async () => {
    const abc = await getEntities('botkeys')
    const res = abc.Items[0].keyValue
    return res
  }

  async registerUser(userId: string, username: string): Promise<boolean> {
    try {
      const params = {
        TableName: 'teleBot',
        Item: {
          'username': { S: username },
          'userId': { S: userId.toString() },
          'location': { S: 'N/A' }, 
          'isBlocked': { BOOL: false }, 
        },
      };
  
      await this.dynamoDB.putItem(params).promise();
      return true;
    } catch (error) {
      console.error('Error registering user:', error);
      return false;
    }
  }

  onReceiveMessage = async (msg: any) => {
    this.logger.log(msg);
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.first_name;
  
    if (msg.text === '/start') {
  
      const registeredUser = await this.registerUser(userId, username);
      if (registeredUser) {
        this.sendMessage(chatId, `Welcome, ${username}! Please provide your location using /setlocation.`);
      } else {
        this.sendMessage(chatId, `Welcome back, ${username}!`);
      }
    } else if (msg.text === '/setlocation') {
  
      this.sendMessage(chatId, 'Please enter your new location:');
    } else if (msg.text && msg.text.startsWith('/weather')) {
      const user = await this.findUser(userId);
      if (!user || user.location === 'N/A') {
        this.sendMessage(chatId, "Please provide your location using /setlocation.");
        return;
      }
  
      const placeName = user.location;
      this.getWeatherInfo(placeName)
        .then((weatherInfo) => {
          this.sendMessage(chatId, weatherInfo);
        })
        .catch((error) => {
          this.sendMessage(chatId, "Sorry, something went wrong while fetching weather data.");
        });
    } else if (msg.text) {
  
      await this.updateLocation(userId, msg.text);
      this.sendMessage(chatId, 'Location updated successfully.');
    }
  }
  

  sendMessage = (userID: string, message: string) => {
    this.bot.sendMessage(userID, message);
  }

  async updateLocation(userId: string, location: string): Promise<boolean> {
    try {
      const params = {
        TableName: 'teleBot',
        Key: {
          'userId': { S: userId.toString() },
        },
        UpdateExpression: 'set #location = :location',
        ExpressionAttributeNames: {
          '#location': 'location',
        },
        ExpressionAttributeValues: {
          ':location': { S: location },
        },
      };

      await this.dynamoDB.updateItem(params).promise();
      return true;
    }
    catch (error) {
      console.error('Error updating location:', error);
      return false;
    }
  }

  async findUser(userId: string): Promise<{ username: string; userId: string; location: string } | null> {
    try {
      const params = {
        TableName: 'teleBot',
        Key: {
          'userId': { S: userId.toString() },
        },
      };

      const data = await this.dynamoDB.getItem(params).promise();
      if (data.Item) {
        const username = data.Item.username.S;
        const location = data.Item.location.S;
        return { username, userId, location };
      }

      return null;
    } catch (error) {
      console.error('Error finding user:', error);
      return null;
    }
  }

  async getWeatherInfo(placeName: string): Promise<string> {
    try {
      const apiKey = await getEntities('botkeys');
      const res = apiKey.Items[1].keyValue;
      const options = {
        method: 'GET',
        url: 'https://api.tomorrow.io/v4/weather/realtime',
        params: { location: placeName, apikey: res },
        headers: { accept: 'application/json' }
      };

      const response = await axios.request(options);
      const weatherData = response.data.data.values;

      if (weatherData) {
        const temperature = weatherData.temperature.toFixed(2); 
        const humidity = weatherData.humidity;
        const weatherDescription = this.getWeatherDescription(weatherData.weatherCode);

        return `Weather in ${placeName}:\nTemperature: ${temperature}°C\nHumidity: ${humidity}%\nCondition: ${weatherDescription}`;
      } else {
        return "Weather data not found for the specified location.";
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
      throw error;
    }
  }

  getWeatherDescription(weatherCode: number) {
   
    const weatherDescriptions = {
      1102: "Clear Sky",
      
    };

    return weatherDescriptions[weatherCode] || "Unknown";
  }

  @Cron(CronExpression.EVERY_12_HOURS)
  async sendWeatherUpdate() {
    const params = {
      TableName: 'teleBot',
    };

    const data = await this.dynamoDB.scan(params).promise();
    if (data.Items) {
      for (const item of data.Items) {
        const userId = item.userId.S;
        const location = item.location.S;
        const placeName = location;
        const isBlocked = item.isBlocked.BOOL; 
        if (!isBlocked) {
          const weatherInfo = await this.getWeatherInfo(placeName);
          this.sendMessage(userId, weatherInfo);
          console.log(`Sent weather update to user ${userId}`);
        }
      }
    }
  }

}
