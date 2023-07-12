import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.model';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { username, password, role, bossId } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10); 
    const user = new this.userModel({
      username,
      password: hashedPassword,
      role,
      bossId,
    });

    return user.save();
  }

  async findUserByUsername(username: string): Promise<User> {
    return this.userModel.findOne({ username }).exec();
  }

  async findAllUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findUsersByRole(role: string): Promise<User[]> {
    return this.userModel.find({ role }).exec();
  }

  async changeUserBoss(username: string, bossId: string): Promise<User> {
    const subordinate = await this.findUserByUsername(username);
    const boss = await this.findUserById(bossId);
  
    if (!subordinate || !boss)
      throw new NotFoundException('User not found');
    
  console.log(boss.role)
    if (boss.role !== 'boss') 
      boss.role = 'boss';
    subordinate.bossId = bossId;
    await Promise.all([
      this.userModel.updateOne({ _id: subordinate.id }, subordinate),
      this.userModel.updateOne({ _id: boss.id }, boss),
    ]);
    return subordinate;
  }
  async findUsersByBossId(bossId: string): Promise<User[]> {
    return this.userModel.find({ bossId }).exec();
  }

  async findUserById(userId: string): Promise<User> {
    return this.userModel.findById(userId).exec();
  }

  async getUsersByRole(userRole: string, currentUserId: string): Promise<User[]> {
    if (userRole === 'administrator') {
      // Логіка для отримання всіх користувачів
      return await this.userModel.find().exec();
    } else if (userRole === 'boss') {
      // Логіка для отримання підчинених користувачів
        const subordinates = await this.userModel.find({ bossId: currentUserId }).exec();
        // Додати поточного користувача до списку підчинених
        return [await this.findUserById(currentUserId), ...subordinates];
      }
      else {
      // Логіка для отримання тільки власного користувача
      const currentUser = await this.userModel.findById(currentUserId).exec();
      if (currentUser) {
        return [currentUser];
      }
    }
    return [];
  }

async isBossOfUser(bossId: string, username: string): Promise<boolean> {
  const user = await this.userModel.findOne({ username }).exec();
  if (!user) {
    throw new NotFoundException('User not found');
  }
  return user.bossId === bossId;
}

async findUserIdByUsername(username: string): Promise<string> {
  const user = await this.userModel.findOne({ username }).exec();
  if (user) {
    return user.id;
  }
  return null; 
}
}