import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/Entity/users.entity';
import { AdminEntity } from 'src/Entity/admin.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtGuard } from './guard/jwt.guard';
import { JwtStrategy } from './strategy/jwt.strategy';
import { RoleGuard } from './guard/role.guard';
import { AdminTypeGuard } from './guard/admintype.guard';
import { AdminAcessLevelGuard } from './guard/accesslevel.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, AdminEntity]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.SECRETKEY,
        signOptions: { expiresIn: process.env.EXPIRESIN },
      }),
    }),
  ],
  providers: [AuthService,JwtGuard,JwtStrategy,RoleGuard,AdminTypeGuard,AdminAcessLevelGuard],
  
})
export class AuthModule {}
