import { Controller, Get, Post, Query, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PromotionsService, PromotionRecipient } from './promotions.service';

@Controller('promotions')
export class PromotionsController {
  constructor(private promotionsService: PromotionsService) {}

  @Get('birthday')
  @HttpCode(HttpStatus.OK)
  async getBirthdayPromotions(): Promise<{
    success: boolean;
    count: number;
    data: PromotionRecipient[];
  }> {
    const recipients = await this.promotionsService.getBirthdayPromotions();
    return { success: true, count: recipients.length, data: recipients };
  }

  @Get('holiday')
  @HttpCode(HttpStatus.OK)
  async getHolidayPromotions(
    @Query('month') month?: string,
    @Query('year') year?: string,
  ): Promise<{
    success: boolean;
    count: number;
    data: PromotionRecipient[];
  }> {
    const monthNum = month ? parseInt(month, 10) : undefined;
    const yearNum = year ? parseInt(year, 10) : undefined;
    const recipients = await this.promotionsService.getHolidayPromotions(monthNum, yearNum);
    return { success: true, count: recipients.length, data: recipients };
  }

  @Get('holidays/upcoming')
  @HttpCode(HttpStatus.OK)
  async getUpcomingHolidays(
    @Query('month') month?: string,
    @Query('year') year?: string,
  ): Promise<{
    success: boolean;
    data: { date: string; name: string }[];
  }> {
    const monthNum = month ? parseInt(month, 10) : undefined;
    const yearNum = year ? parseInt(year, 10) : undefined;
    const holidays = await this.promotionsService.getUpcomingHolidays(monthNum, yearNum);
    return { success: true, data: holidays };
  }

  @Get('recipients')
  @HttpCode(HttpStatus.OK)
  async getAllPromotionRecipients(): Promise<{
    success: boolean;
    birthday: PromotionRecipient[];
    holiday: PromotionRecipient[];
  }> {
    const recipients = await this.promotionsService.getAllPromotionRecipients();
    return { success: true, ...recipients };
  }

  @Post('mark-sent')
  @HttpCode(HttpStatus.OK)
  async markAsSent(@Body() body: {
    recipient: PromotionRecipient;
    holidayDate?: string;
    holidayName?: string;
  }): Promise<{ success: boolean; message: string }> {
    const holidayDate = body.holidayDate ? new Date(body.holidayDate) : null;
    await this.promotionsService.markAsSent(body.recipient, holidayDate, body.holidayName ?? null);
    return { success: true, message: 'Promotion marked as sent' };
  }

  @Post('mark-failed')
  @HttpCode(HttpStatus.OK)
  async markAsFailed(@Body() body: {
    recipient: PromotionRecipient;
    holidayDate?: string;
    holidayName?: string;
    error: string;
  }): Promise<{ success: boolean; message: string }> {
    const holidayDate = body.holidayDate ? new Date(body.holidayDate) : null;
    await this.promotionsService.markAsFailed(body.recipient, holidayDate, body.holidayName ?? null, body.error);
    return { success: true, message: 'Promotion marked as failed' };
  }

  @Get('logs')
  @HttpCode(HttpStatus.OK)
  async getPromotionLogs(@Query('limit') limit?: string): Promise<{
    success: boolean;
    data: { id: string; memberId: string; memberName: string; email: string; promotionType: string; holidayName: string | null; sentAt: string; status: string; errorMessage: string | null }[];
  }> {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    const logs = await this.promotionsService.getPromotionLogs(limitNum);
    return { success: true, data: logs };
  }
}