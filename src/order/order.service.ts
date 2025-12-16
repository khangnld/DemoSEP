import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class OrderService {
    constructor(
        private prisma: PrismaService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {}

    async create(dataOrder: any) {
        // Validate user exists
        const user = await this.prisma.user.findUnique({
            where: { id: dataOrder.userId }
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Validate product exists and has enough stock
        const product = await this.prisma.product.findUnique({
            where: { id: dataOrder.productId }
        });
        if (!product) {
            throw new NotFoundException('Product not found');
        }
        if (product.stock < dataOrder.quantity) {
            throw new BadRequestException('Insufficient stock');
        }

        // Calculate total price
        const totalPrice = product.price * dataOrder.quantity;

        // Create order and update product stock in transaction
        const order = await this.prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    userId: dataOrder.userId,
                    productId: dataOrder.productId,
                    quantity: dataOrder.quantity,
                    totalPrice: totalPrice,
                    status: dataOrder.status || 'PENDING',
                },
                include: {
                    user: true,
                    product: true,
                },
            });

            // Update product stock
            await tx.product.update({
                where: { id: dataOrder.productId },
                data: { stock: { decrement: dataOrder.quantity } },
            });

            return newOrder;
        });

        // Invalidate cache
        await this.cacheManager.del('orders:all');
        await this.cacheManager.del(`product:${dataOrder.productId}`);

        return order;
    }

    async findAll() {
        // Check cache first
        const cachedOrders = await this.cacheManager.get('orders:all');
        if (cachedOrders) {
            return cachedOrders;
        }

        // If not in cache, query database
        const orders = await this.prisma.order.findMany({
            include: {
                user: true,
                product: true,
            },
        });

        // Store in cache with TTL 1 hour
        await this.cacheManager.set('orders:all', orders, 3600);

        return orders;
    }

    async findOne(id: number) {
        // Check cache first
        const cacheKey = `order:${id}`;
        const cachedOrder = await this.cacheManager.get(cacheKey);
        if (cachedOrder) {
            return cachedOrder;
        }

        // If not in cache, query database
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                user: true,
                product: true,
            },
        });

        if (order) {
            // Store in cache with TTL 1 hour
            await this.cacheManager.set(cacheKey, order, 3600);
        }

        return order;
    }

    async update(id: number, dataOrder: any) {
        // If updating quantity or product, need to handle stock
        if (dataOrder.quantity || dataOrder.productId) {
            const existingOrder = await this.prisma.order.findUnique({
                where: { id },
                include: { product: true },
            });

            if (!existingOrder) {
                throw new NotFoundException('Order not found');
            }

            // Handle stock updates in transaction
            const order = await this.prisma.$transaction(async (tx) => {
                // If changing product or quantity, adjust stock
                if (dataOrder.productId !== existingOrder.productId || dataOrder.quantity) {
                    // Return stock from old product
                    await tx.product.update({
                        where: { id: existingOrder.productId },
                        data: { stock: { increment: existingOrder.quantity } },
                    });

                    // Get new product
                    const newProduct = await tx.product.findUnique({
                        where: { id: dataOrder.productId || existingOrder.productId },
                    });

                    if (!newProduct) {
                        throw new NotFoundException('Product not found');
                    }

                    const newQuantity = dataOrder.quantity || existingOrder.quantity;
                    if (newProduct.stock < newQuantity) {
                        throw new BadRequestException('Insufficient stock');
                    }

                    // Deduct stock from new product
                    await tx.product.update({
                        where: { id: dataOrder.productId || existingOrder.productId },
                        data: { stock: { decrement: newQuantity } },
                    });

                    // Recalculate total price
                    if (dataOrder.productId || dataOrder.quantity) {
                        dataOrder.totalPrice = newProduct.price * newQuantity;
                    }
                }

                return await tx.order.update({
                    where: { id },
                    data: dataOrder,
                    include: {
                        user: true,
                        product: true,
                    },
                });
            });

            // Invalidate cache after transaction
            await this.cacheManager.del(`order:${id}`);
            await this.cacheManager.del('orders:all');
            if (dataOrder.productId || existingOrder.productId) {
                await this.cacheManager.del(`product:${dataOrder.productId || existingOrder.productId}`);
            }

            return order;
        }

        // Simple update without stock changes
        const order = await this.prisma.order.update({
            where: { id },
            data: dataOrder,
            include: {
                user: true,
                product: true,
            },
        });

        // Invalidate cache
        await this.cacheManager.del(`order:${id}`);
        await this.cacheManager.del('orders:all');

        return order;
    }

    async delete(id: number) {
        const order = await this.prisma.order.findUnique({
            where: { id },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        // Return stock when deleting order (if not delivered)
        let deletedOrder;
        if (order.status !== 'DELIVERED') {
            deletedOrder = await this.prisma.$transaction(async (tx) => {
                await tx.product.update({
                    where: { id: order.productId },
                    data: { stock: { increment: order.quantity } },
                });

                return await tx.order.delete({ where: { id } });
            });
        } else {
            deletedOrder = await this.prisma.order.delete({ where: { id } });
        }

        // Invalidate cache
        await this.cacheManager.del(`order:${id}`);
        await this.cacheManager.del('orders:all');
        await this.cacheManager.del(`product:${order.productId}`);

        return deletedOrder;
    }
}


