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
  // fetch the keys from the database dynamo db where table name is botkeys and primary key is keyName


  var telegramKey = await getEntitiesByAttribute('botkeys', 'keyName', 'telegramKey');
  var weatherAPI = await getEntitiesByAttribute('botkeys', 'keyName', 'weatherAPI');
  var telegramKey = telegramKey[0].keyValue;
  var weatherAPI = weatherAPI[0].keyValue;
  // console.log(telegramKey[0].keyValue, weatherAPI[0].keyValue);
  return {telegramKey, weatherAPI};
  }

  // create a post route to handle the form submission
  @Post('update-keys')
  @Render('result')
  postUpdateKeysPage(@Body() body) {
  //update the keys in the database dynamo db where table name is botkeys and primary key is keyName
  const {telegramKey, weatherAPI} = body;
 
  updateBotEntity('botkeys',  {id: 'telegramKey', attributeName:"keyValue", attributeValue:telegramKey});
  updateBotEntity('botkeys', {id: 'weatherAPI', attributeName:"keyValue", attributeValue:weatherAPI});
  
  return  ({entity: "Bot Keys"})

  }

  
  //get the list of all the users
  @Get('list-users')
  @Render('list-users')
  async getListUsersPage() {
    const users = await getEntities('teleBot');
    const user_arr = users.Items;
    return { user_arr};
  }

  //post route to block the user
  @Post('block-user')
  @Render('result')
  blockUser(@Body() body) {
    try {
      const { 'userId': userId } = body; // Access userId using the key 'block-user'

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
}





