import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const store = await redisStore({
          socket: {
            host: configService.get<string>('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6379),
          },
          password: configService.get<string>('REDIS_PASSWORD'),
          ttl: configService.get<number>('REDIS_TTL', 3600), // 1 hour default
        });
        return {
          store,
        };
      },
      inject: [ConfigService],
      isGlobal: true, // Để sử dụng ở mọi module
    }),
  ],
  exports: [CacheModule],
})
export class RedisModule {}

