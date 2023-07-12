import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import jwtConfig from './guards/jwt.config';
import { UserModule } from './user/user.module';
import { AuthController } from './user/auth/auth.controller';
import { AuthService } from './user/auth/auth.service';

@Module({ 
  imports: [JwtModule.register({
    secret: jwtConfig.secret,
    signOptions: { expiresIn: jwtConfig.expiresIn },
  }),MongooseModule.forRoot('mongodb+srv://Shimmer:AAmsp0VNKU9jf6IO@cluster0.y0iwcxi.mongodb.net/?retryWrites=true&w=majority')
  ,UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
