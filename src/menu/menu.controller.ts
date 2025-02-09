import { Controller, Get, Param, Query } from '@nestjs/common';
import { MenuService } from './menu.service';
import { Menu } from './menu.entity';
import { Public } from 'src/auth/auth.decorators';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Public()
  @Get()
  async getAllMenuItems(): Promise<Menu[]> {
    return this.menuService.getAllMenuItems();
  }

  @Public()
  @Get('/search')
  async searchItems(@Query('name') name: string): Promise<Menu[]> {
    return this.menuService.searchMenu(name);
  }

  @Get('/category/:category')
  async getMenuItemsByName(@Param('category') category: string): Promise<Menu[]> {
    return this.menuService.getMenuItemsByCategory(category);
  }

  @Public()
  @Get('/:id')
  async getMenuItemById(@Param('id') id: number): Promise<Menu> {
    return this.menuService.getMenuItemById(id);
  }
}
