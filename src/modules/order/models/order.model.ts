import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { User } from "../../user/models/user.model";
import { Product } from "../../product/models/product.model";

@ObjectType()
export class Order {
    @Field(() => Int)
    id: number;

    @Field(() => Int)
    userId: number;

    @Field(() => Int)
    productId: number;

    @Field(() => Int)
    quantity: number;

    @Field(() => Float)
    totalPrice: number;

    @Field()
    status: string;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;

    @Field(() => User, { nullable: true })
    user?: User;

    @Field(() => Product, { nullable: true })
    product?: Product;
}




