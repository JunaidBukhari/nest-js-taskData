import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

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
  async updateUserCV(userId: number, file: Express.Multer.File) {
    const formData = new FormData();
    const blob = new Blob([file.buffer], { type: file.mimetype });
    formData.append('file', blob, file.originalname);

    formData.append('upload_preset', 'kq6ywrbn');
    const response = await fetch(
      'https://api.cloudinary.com/v1_1/junaidbukhari/image/upload',
      {
        method: 'POST',
        body: formData,
      },
    );

    const data = await response.json();
    const cvUrl = data.secure_url;
    return this.prisma.user.update({
      where: { id: userId },
      data: { cvUrl },
    });
  }
}
