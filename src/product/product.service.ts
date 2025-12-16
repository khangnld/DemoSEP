import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ProductService {
    constructor(
        private prisma: PrismaService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {}

    async create(dataProduct: any) {
        const product = await this.prisma.product.create({ data: dataProduct });
        // Invalidate cache for products list
        await this.cacheManager.del('products:all');
        return product;
    }

    async findAll() {
        // Check cache first
        const cachedProducts = await this.cacheManager.get('products:all');
        if (cachedProducts) {
            return cachedProducts;
        }

        // If not in cache, query database
        const products = await this.prisma.product.findMany();
        
        // Store in cache with TTL 1 hour
        await this.cacheManager.set('products:all', products, 3600);
        
        return products;
    }

    async findOne(id: number) {
        // Check cache first
        const cacheKey = `product:${id}`;
        const cachedProduct = await this.cacheManager.get(cacheKey);
        if (cachedProduct) {
            return cachedProduct;
        }

        // If not in cache, query database
        const product = await this.prisma.product.findUnique({ where: { id } });
        
        if (product) {
            // Store in cache with TTL 1 hour
            await this.cacheManager.set(cacheKey, product, 3600);
        }
        
        return product;
    }

    async update(id: number, dataProduct: any) {
        const product = await this.prisma.product.update({
            where: { id },
            data: dataProduct
        });

        // Invalidate cache
        await this.cacheManager.del(`product:${id}`);
        await this.cacheManager.del('products:all');

        return product;
    }

    async delete(id: number) {
        const product = await this.prisma.product.delete({ where: { id } });

        // Invalidate cache
        await this.cacheManager.del(`product:${id}`);
        await this.cacheManager.del('products:all');

        return product;
    }
}


