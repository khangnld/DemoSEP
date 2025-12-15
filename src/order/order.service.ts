import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class OrderService {
    constructor(private prisma: PrismaService) {}

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
        return await this.prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
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

            return order;
        });
    }

    async findAll() {
        return await this.prisma.order.findMany({
            include: {
                user: true,
                product: true,
            },
        });
    }

    async findOne(id: number) {
        return await this.prisma.order.findUnique({
            where: { id },
            include: {
                user: true,
                product: true,
            },
        });
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
            return await this.prisma.$transaction(async (tx) => {
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
        }

        // Simple update without stock changes
        return await this.prisma.order.update({
            where: { id },
            data: dataOrder,
            include: {
                user: true,
                product: true,
            },
        });
    }

    async delete(id: number) {
        const order = await this.prisma.order.findUnique({
            where: { id },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        // Return stock when deleting order (if not delivered)
        if (order.status !== 'DELIVERED') {
            return await this.prisma.$transaction(async (tx) => {
                await tx.product.update({
                    where: { id: order.productId },
                    data: { stock: { increment: order.quantity } },
                });

                return await tx.order.delete({ where: { id } });
            });
        }

        return await this.prisma.order.delete({ where: { id } });
    }
}

