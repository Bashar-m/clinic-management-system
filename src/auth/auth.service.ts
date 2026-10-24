import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ accessToken: string }> {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    try {
      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          passwordHash,
          phone: dto.phone,
        },
      });
      return this.issueToken(user.id, user.role);
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('Email already exists');
      }
      throw e;
    }
  }

  // issue a JWT token
  private issueToken(userId: string, role: Role) {
    return {
      accessToken: this.jwt.sign({ sub: userId, role }),
    };
  }

  // login a user
  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    const isMatch =
      existingUser &&
      (await bcrypt.compare(dto.password, existingUser.passwordHash));
    if (!isMatch) {
      throw new UnauthorizedException('email or password is incorrect');
    }
    return this.issueToken(existingUser.id, existingUser.role);
  }

  async getMe(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        phone: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
