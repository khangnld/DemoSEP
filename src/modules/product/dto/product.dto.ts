import { IsNotEmpty, IsOptional, IsNumber, IsString, Min } from "class-validator";
import { Field, Float, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateProductDto {
    @Field(() => String)
    @IsNotEmpty()
    @IsString()
    name: string;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    description?: string;

    @Field(() => Float)
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    price: number;

    @Field(() => Int, { nullable: true })
    @IsOptional()
    @IsNumber()
    @Min(0)
    stock?: number;
}

@InputType()
export class UpdateProductDto {
    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    name?: string;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    description?: string;

    @Field(() => Float, { nullable: true })
    @IsOptional()
    @IsNumber()
    @Min(0)
    price?: number;

    @Field(() => Int, { nullable: true })
    @IsOptional()
    @IsNumber()
    @Min(0)
    stock?: number;
}




