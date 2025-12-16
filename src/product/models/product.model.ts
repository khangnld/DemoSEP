import { Field, Float, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Product {
    @Field(() => Int)
    id: number;

    @Field()
    name: string;

    @Field({ nullable: true })
    description?: string;

    @Field(() => Float)
    price: number;

    @Field(() => Int)
    stock: number;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}




