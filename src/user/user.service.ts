import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {
    constructor (
        private prisma: PrismaService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {}

    async create(dataUser: any) {
        const user = await this.prisma.user.create({ data: dataUser });
        // Invalidate cache for users list
        await this.cacheManager.del('users:all');
        return user;
    }

    async findAll() {
        // Check cache first
        const cachedUsers = await this.cacheManager.get('users:all');
        if (cachedUsers) {
            return cachedUsers;
        }

        // If not in cache, query database
        const users = await this.prisma.user.findMany();
        
        // Store in cache with TTL 1 hour
        await this.cacheManager.set('users:all', users, 3600);
        
        return users;
    }

    async findOne(id: number) {
        // Check cache first
        const cacheKey = `user:${id}`;
        const cachedUser = await this.cacheManager.get(cacheKey);
        if (cachedUser) {
            return cachedUser;
        }

        // If not in cache, query database
        const user = await this.prisma.user.findUnique({ where: { id } });
        
        if (user) {
            // Store in cache with TTL 1 hour
            await this.cacheManager.set(cacheKey, user, 3600);
        }
        
        return user;
    }

    async update(id: number, dataUser: any) {
        const user = await this.prisma.user.update({
            where: { id },
            data: dataUser
        });

        // Invalidate cache
        await this.cacheManager.del(`user:${id}`);
        await this.cacheManager.del('users:all');

        return user;
    }

    async delete(id: number) {
        const user = await this.prisma.user.delete({ where: { id } });

        // Invalidate cache
        await this.cacheManager.del(`user:${id}`);
        await this.cacheManager.del('users:all');

        return user;
    }
}
