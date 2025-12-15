import { Module } from '@nestjs/common';
import { OrderResolver } from './order.resolver';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';

@Module({
  providers: [OrderResolver, OrderService],
  controllers: [OrderController],
})
export class OrderModule {}

