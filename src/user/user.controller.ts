import {
  Body,
  Controller,
  Post,
  Put,
  Param,
  ParseIntPipe,
  HttpException,
  HttpStatus,
  UseGuards,
  Get,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('signed-url')
  getSignedUrl() {
    return this.userService.generateSignedUrl();
  }

  @Post('login')
  async login(@Body() req) {
    const user = await this.userService.validateUser(req.email, req.password);
    if (!user) {
      return { message: 'Invalid credentials' };
    }
    return this.authService.login(user);
  }
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

  @UseGuards(JwtAuthGuard)
  @Put(':id/cv')
  async updateUserCV(
    @Param('id', ParseIntPipe) id: number,
    @Body('cvUrl') cvUrl: string,
  ) {
    return this.userService.updateUserCV(id, cvUrl);
  }
}
