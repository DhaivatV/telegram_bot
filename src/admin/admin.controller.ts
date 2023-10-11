import { Controller, Get, Res, Req, UseGuards, Render, Post, Body, Redirect } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import * as AWS from 'aws-sdk';
import {updateBotEntity, deleteUserEntity, updateUserEntity, getEntities, addOrUpdateEntitiy, getEntitiesByAttribute} from './../../utils/dynamo'


@Controller('admin')
export class AdminController {
  
  @Get()
  @UseGuards(AuthGuard('google'))
  @Render('index')
  getAdminDashboard(@Req() request: Request) {
    const { email, firstName, lastName, picture } = request.user as {
      email: string;
      firstName: string;
      lastName: string;
      picture: string;
    };

    return { email, firstName, lastName, picture };
  }

  @Get('update-keys')
  @Render('update-keys')
  async getUpdateKeysPage() {
  

  var telegramKey = await getEntitiesByAttribute('botkeys', 'keyName', 'telegramKey');
  var weatherAPI = await getEntitiesByAttribute('botkeys', 'keyName', 'weatherAPI');
  var telegramKey = telegramKey[0].keyValue;
  var weatherAPI = weatherAPI[0].keyValue;
  return {telegramKey, weatherAPI};
  }


  @Post('update-keys')
  @Render('result')
  postUpdateKeysPage(@Body() body) {
  
  const {telegramKey, weatherAPI} = body;

  if(telegramKey != ''){
    const entityObject = { id: 'telegramKey', attributeName: 'keyValue', attributeValue: telegramKey };
    updateBotEntity('botkeys', entityObject);
  }
  if(weatherAPI != ''){
    const entityObject = { id: 'weatherAPI', attributeName: 'keyValue', attributeValue: weatherAPI };
    updateBotEntity('botkeys', entityObject);
  }
  
  return  ({entity: "Bot Keys Updated"})

  }

  

  @Get('list-users')
  @Render('list-users')
  async getListUsersPage() {
    const users = await getEntities('teleBot');
    const user_arr = users.Items;
    return { user_arr};
  }


  @Post('block-user')
  @Render('result')
  blockUser(@Body() body) {
    try {
      const { 'userId': userId } = body; 

      const entityObject = { id: userId, attributeName: 'isBlocked', attributeValue: true };
      // console.log(entityObject);
      updateUserEntity('teleBot', entityObject);
      return { entity: 'User blocked' };
    } catch (error) {
      console.error('Error blocking user:', error);
      return { entity: 'Error blocking user' };
    }
  }

  @Post('delete-user')
  @Render('result')
  deleteUser(@Body() body) {
    try {
      const { 'delete-user': userId } = body;
      console.log(userId);

      deleteUserEntity('teleBot', userId);

      return { entity: 'User Deleted' };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { entity: 'Error deleting user' };
    }
  }

  @Post('unblock-user')
  @Render('result')
  unblockUser(@Body() body) {
    try {
      const { 'unblock-user': userId } = body; 

      const entityObject = { id: userId, attributeName: 'isBlocked', attributeValue: false };
      // console.log(entityObject);
      updateUserEntity('teleBot', entityObject);
      return { entity: 'User unblocked' };
    } catch (error) {
      console.error('Error unblocking user:', error);
      return { entity: 'Error unblocking user' };
    }
  }
  
}





