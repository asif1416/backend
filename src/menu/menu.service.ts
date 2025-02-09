import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {ILike, Like, Repository} from 'typeorm';
import { Menu } from './menu.entity';
import { NotFoundError } from 'rxjs';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
  ) {}

  async getAllMenuItems(): Promise<Menu[]> {
    return this.menuRepository.find({ where: { available: true } });
  }

  async searchMenu(name: string): Promise<Menu[]> {

    return this.menuRepository.find({ where: { name: ILike(`%${name}%`), available: true }, take: 10 });
  }

  async getMenuItemsByCategory(category: string): Promise<Menu[]> {
    return this.menuRepository.find({ where: { category: Like(`%${category}%`), available: true } });
  }

  async getMenuItemById(id: number): Promise<Menu> {
    return this.menuRepository.findOne({ where: { id } });
  }
}
