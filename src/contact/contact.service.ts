import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ContactService {
  constructor(private readonly mailService: MailerService) {} 

  async sendEmail(contactData: {
    name: string;
    email: string;
    message: string;
  }) {
    const mailOptions = {
      from: contactData.email,
      to: 'ashrafulasif260@gmail.com',
      subject: `New Contact Form Submission from ${contactData.name}`,
      text: `Name: ${contactData.name}\nEmail: ${contactData.email}\nMessage: ${contactData.message}`,
    };

    try {
      await this.mailService.sendMail(mailOptions);
      return { message: 'Email sent successfully!' };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email.');
    }
  }
}
