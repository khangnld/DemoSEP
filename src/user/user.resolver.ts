import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './models/user.model';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Resolver()
export class UserResolver {
    constructor (private userService: UserService){}

    @Query(() => [User])
    async users() {
        return await this.userService.findAll()
    }

    @Query(() => User, { nullable: true })
    async user(@Args('id') id: number) {
        return await this.userService.findOne(Number(id))
    }

    @Mutation(() => User)
    async createUser(@Args('userData') userData: CreateUserDto) {
        return await this.userService.create(userData)
    }

    @Mutation(() => User)
    async updateUser(
        @Args('id') id: number,
        @Args('userData') userData: UpdateUserDto
    ) {
        return await this.userService.update(Number(id), userData)
    }

    @Mutation(() => User)
    async deleteUser(@Args('id') id: number) {
        return await this.userService.delete(Number(id))
    }
}
