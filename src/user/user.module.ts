import { Module } from "@nestjs/common";
import { UsersService } from "./user.service";
import { UsersController } from "./user.controller";
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from "./user.model";
import { APP_GUARD } from "@nestjs/core";
import { RolesGuard } from "src/guards/roles.guard";
import { AuthService } from "src/user/auth/auth.service";
import { AuthController } from "src/user/auth/auth.controller";
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from "src/guards/jwt.config";
import { AccessTokenStrategy } from "src/strategies/token.strategy";


@Module({
    imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]), 
      JwtModule.register({
        secret: jwtConfig.secret,
        signOptions: { expiresIn: jwtConfig.expiresIn },
        }),],
    controllers: [UsersController,AuthController],
    providers: [UsersService, AuthService, AccessTokenStrategy,
        {
        provide: APP_GUARD,
        useClass: RolesGuard,
      },
    ],

})
export class UserModule {}