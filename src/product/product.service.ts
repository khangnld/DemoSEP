import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ProductService {
    constructor(private prisma: PrismaService) {}

    async create(dataProduct: any) {
        return await this.prisma.product.create({ data: dataProduct });
    }

    async findAll() {
        return await this.prisma.product.findMany();
    }

    async findOne(id: number) {
        return await this.prisma.product.findUnique({ where: { id } });
    }

    async update(id: number, dataProduct: any) {
        return await this.prisma.product.update({
            where: { id },
            data: dataProduct
        });
    }

    async delete(id: number) {
        return await this.prisma.product.delete({ where: { id } });
    }
}

