import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v2 as cloudinary } from 'cloudinary';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async createUser(email: string, password: string, cvUrl?: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        cvUrl,
      },
    });
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.findUserByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
  async updateUserCV(userId: number, cvUrl: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { cvUrl },
    });
  }

  generateSignedUrl() {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        upload_preset: 'kq6ywrbn',
      },
      process.env.CLOUDINARY_API_SECRET,
    );

    const signedUrl = `https://api.cloudinary.com/v1_1/junaidbukhari/image/upload`;

    return {
      signedUrl,
      timestamp,
      signature,
      api_key: process.env.CLOUDINARY_API_KEY,
    };
  }
}
