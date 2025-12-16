import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProductService } from './product.service';
import { Product } from './models/product.model';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Resolver()
export class ProductResolver {
    constructor(private productService: ProductService) {}

    @Query(() => [Product])
    async products() {
        return await this.productService.findAll();
    }

    @Query(() => Product, { nullable: true })
    async product(@Args('id') id: number) {
        return await this.productService.findOne(Number(id));
    }

    @Mutation(() => Product)
    async createProduct(@Args('productData') productData: CreateProductDto) {
        return await this.productService.create(productData);
    }

    @Mutation(() => Product)
    async updateProduct(
        @Args('id') id: number,
        @Args('productData') productData: UpdateProductDto
    ) {
        return await this.productService.update(Number(id), productData);
    }

    @Mutation(() => Product)
    async deleteProduct(@Args('id') id: number) {
        return await this.productService.delete(Number(id));
    }
}




