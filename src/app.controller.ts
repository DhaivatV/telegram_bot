
import { GoogleOAuthGuard } from './google-oauth.guard';
import { Controller, Get, Request, UseGuards, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('auth')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @UseGuards(GoogleOAuthGuard)
  async googleAuth(@Request() req) {}

  @Get('google-redirect')
  @UseGuards(GoogleOAuthGuard)
  googleAuthRedirect(@Request() req) {
    return this.appService.googleLogin(req);
  }

  
}

@Controller()
export class RootController {
  @Get()
  @Render('home') 
  root() {

    const data = { message: 'Hello, World!' };
    return data;
  }
}