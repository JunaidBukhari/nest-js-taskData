import {
  Body,
  Controller,
  Post,
  Put,
  Param,
  ParseIntPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  async createUser(@Body() createUserRequest) {
    try {
      const existingUser = await this.userService.findUserByEmail(
        createUserRequest.email,
      );
      if (existingUser) {
        throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
      }
      const user = await this.userService.createUser(
        createUserRequest.email,
        createUserRequest.password,
        createUserRequest.cvUrl,
      );

      return user;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id/cv')
  async updateUserCV(
    @Param('id', ParseIntPipe) id: number,
    @Body('cvUrl') cvUrl: string,
  ) {
    return this.userService.updateUserCV(id, cvUrl);
  }
}
