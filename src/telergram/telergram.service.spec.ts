import { Test, TestingModule } from '@nestjs/testing';
import { TelergramService } from './telergram.service';

describe('TelergramService', () => {
  let service: TelergramService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TelergramService],
    }).compile();

    service = module.get<TelergramService>(TelergramService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
