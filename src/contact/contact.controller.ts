import { Controller, Post, Body } from '@nestjs/common';
import { ContactService } from './contact.service';
import { contactDto } from './contact.dto';
import { Public } from 'src/auth/auth.decorators';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Public()
  @Post()
  async sendEmail(
    @Body() contactData: contactDto,
  ) {
    return this.contactService.sendEmail(contactData);
  }
}
