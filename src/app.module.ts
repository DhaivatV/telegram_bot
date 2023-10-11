import { Module } from '@nestjs/common';
import { AppController, RootController } from './app.controller';
import { AppService } from './app.service';
import { TelergramModule } from './telergram/telergram.module';
import { GoogleStrategy } from './google.strategy';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [TelergramModule, ConfigModule.forRoot(), AdminModule,
  ],
  controllers: [AppController, RootController],
  providers: [AppService, GoogleStrategy],
})
export class AppModule {}
