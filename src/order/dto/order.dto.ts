import { IsNotEmpty, IsOptional, IsNumber, IsString, Min, IsIn } from "class-validator";
import { Field, Float, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateOrderDto {
    @Field(() => Int)
    @IsNotEmpty()
    @IsNumber()
    userId: number;

    @Field(() => Int)
    @IsNotEmpty()
    @IsNumber()
    productId: number;

    @Field(() => Int)
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    quantity: number;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    @IsIn(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
    status?: string;
}

@InputType()
export class UpdateOrderDto {
    @Field(() => Int, { nullable: true })
    @IsOptional()
    @IsNumber()
    userId?: number;

    @Field(() => Int, { nullable: true })
    @IsOptional()
    @IsNumber()
    productId?: number;

    @Field(() => Int, { nullable: true })
    @IsOptional()
    @IsNumber()
    @Min(1)
    quantity?: number;

    @Field(() => Float, { nullable: true })
    @IsOptional()
    @IsNumber()
    @Min(0)
    totalPrice?: number;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    @IsIn(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
    status?: string;
}




