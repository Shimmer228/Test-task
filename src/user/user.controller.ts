import { Body, Controller, Get, Post, Put, Param, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { UpdateUserBossDto } from './dto/update-user-boss.dto';
import { UsersService } from './user.service';
import { User } from './user.model';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { GetUser } from 'src/decorators/getUser.decorator';
import { NotFoundException } from '@nestjs/common';



@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get(':username')
  async getUserByUsername(@Param('username') username: string): Promise<User> {
    return this.userService.findUserByUsername(username);
  }
  @UseGuards(JwtAuthGuard)
  @Get("")
  async getUsers(@GetUser() user): Promise<User[]> {
    const role = user.role;
    return this.userService.getUsersByRole(role,await this.userService.findUserIdByUsername(user.username));
  }
  @UseGuards(JwtAuthGuard)
  @Post('bossChange')
  async changeUserBoss(
    @Body() updateUserBossDto: UpdateUserBossDto,
    @GetUser() user
  ): Promise<User> {
    const bossName  = updateUserBossDto.bossName;
    // Перевірка, чи користувач є поточним босом змінюваного користувача
    const bossId = await this.userService.findUserIdByUsername(user.username)
    const isCurrentBoss = await this.userService.isBossOfUser( bossId, updateUserBossDto.userName);
    if (!isCurrentBoss && user.role!= "administrator") {
      throw new UnauthorizedException('You are not authorized to change the boss of this user');
    }
  
    // Отримання інформації про нового босса за його іменем
    const newBoss = await this.userService.findUserByUsername(bossName);
    if (!newBoss) {
      throw new NotFoundException('New boss not found');
    }
  
    // Оновлення боса користувача
    return this.userService.changeUserBoss(updateUserBossDto.userName, newBoss.id);
  }
  
}