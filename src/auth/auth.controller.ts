// src/auth/auth.controller.ts
import { Controller, Post, Body, UnauthorizedException, UseGuards, Patch, Req, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRole } from 'src/entities/user/user.entity';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
    throw new UnauthorizedException('Neispravni kredencijali. Email ili lozinka koju ste uneli nije ispravna');
  }
    return this.authService.login(user);
  }

  @Post('register')
async register(
  @Body()
  body: {
    email: string;
    password: string;
    name: string;
    surname: string;
    role?: UserRole;
  },
) {
  return this.authService.register(
    body.email,
    body.password,
    body.name,
    body.surname,
    body.role,
  );
}

 
  @UseGuards(JwtAuthGuard)
@Patch('change-password')
async changePassword(
  @Req() req,
  @Body() body: { oldPassword: string; newPassword: string },
) {
  console.log('REQ.USER:', req.user); // debug
  const userId = req.user.userId; // <--- ovde ide userId, ne sub
  const { oldPassword, newPassword } = body;

  return this.authService.changePassword(userId, oldPassword, newPassword);
}
}