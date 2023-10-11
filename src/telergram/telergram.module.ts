import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TelegramService } from './telergram.service'; // Corrected import


@Module({
  providers: [TelegramService],
  imports: [ScheduleModule.forRoot()],
})
export class TelergramModule {}
