import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { OrderService } from './order.service';
import { Order } from './models/order.model';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';

@Resolver()
export class OrderResolver {
    constructor(private orderService: OrderService) {}

    @Query(() => [Order])
    async orders() {
        return await this.orderService.findAll();
    }

    @Query(() => Order, { nullable: true })
    async order(@Args('id') id: number) {
        return await this.orderService.findOne(Number(id));
    }

    @Mutation(() => Order)
    async createOrder(@Args('orderData') orderData: CreateOrderDto) {
        return await this.orderService.create(orderData);
    }

    @Mutation(() => Order)
    async updateOrder(
        @Args('id') id: number,
        @Args('orderData') orderData: UpdateOrderDto
    ) {
        return await this.orderService.update(Number(id), orderData);
    }

    @Mutation(() => Order)
    async deleteOrder(@Args('id') id: number) {
        return await this.orderService.delete(Number(id));
    }
}




