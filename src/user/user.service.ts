import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {
    constructor (private prisma: PrismaService){}

    async create(dataUser: any) {
        return await this.prisma.user.create({ data: dataUser })
    }

    async findAll() {
        return await this.prisma.user.findMany()
    }

    async findOne(id: number) {
        return await this.prisma.user.findUnique({ where: { id } })
    }
}
