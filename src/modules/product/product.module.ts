import { Module } from '@nestjs/common';
import { ProductResolver } from './product.resolver';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';

@Module({
  providers: [ProductResolver, ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
