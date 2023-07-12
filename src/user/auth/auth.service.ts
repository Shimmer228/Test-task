import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../../guards/jwt.config';
import { UsersService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User,UserSchema } from 'src/user/user.model';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<{ token: string }> {
    const { username, password, role, bossId } = createUserDto;   
    const existingUser = await this.userService.findUserByUsername(username);
    if (existingUser) {
      throw new Error('Username is already taken');
    }
    const newUser: User = {
      id: '',
      username,
      password,
      role,
      bossId,
    };
    const createdUser = await this.userService.createUser(newUser);
    const token = this.jwtService.sign(
      { username: createdUser.username, password: createdUser.password, role: createdUser.role },
      { secret: jwtConfig.secret, expiresIn: jwtConfig.expiresIn },
    );
    return { token };
  }

  async login(createUserDto: CreateUserDto): Promise<{ token: string }> {
    const { username, password } = createUserDto;
    const user = await this.userService.findUserByUsername(username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid username or password');
    }
    const token = this.jwtService.sign(
      { username: user.username, role: user.role },
      { secret: jwtConfig.secret, expiresIn: jwtConfig.expiresIn },
    );
    return { token };
  }
  
}
 