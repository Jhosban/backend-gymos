import { Injectable } from '@nestjs/common';
import Holidays from 'date-holidays';
import { PrismaService } from '@/prisma/prisma.service';
import { GymDataService } from '@/shared/gym-data.service';

export type PromotionType = 'birthday' | 'holiday';

export interface PromotionRecipient {
  id: string;
  name: string;
  email: string;
  phone: string;
  promotionType: PromotionType;
  promotionTitle: string;
}

export interface HolidayInfo {
  date: string;
  name: string;
}

@Injectable()
export class PromotionsService {
  private holidays: Holidays;

  constructor(
    private prisma: PrismaService,
    private gymData: GymDataService,
  ) {
    this.holidays = new Holidays('CR');
  }

  async wasAlreadySent(memberId: string, promotionType: string, holidayDate: Date | null): Promise<boolean> {
    const existingLog = await this.prisma.promotionLog.findFirst({
      where: {
        memberId,
        promotionType,
        holidayDate: holidayDate ?? undefined,
        status: 'SENT',
      },
    });
    return !!existingLog;
  }

  async markAsSent(recipient: PromotionRecipient, holidayDate: Date | null, holidayName: string | null): Promise<void> {
    await this.prisma.promotionLog.create({
      data: {
        memberId: recipient.id,
        memberName: recipient.name,
        email: recipient.email,
        promotionType: recipient.promotionType,
        holidayName,
        holidayDate,
        status: 'SENT',
      },
    });
  }

  async markAsFailed(recipient: PromotionRecipient, holidayDate: Date | null, holidayName: string | null, error: string): Promise<void> {
    await this.prisma.promotionLog.create({
      data: {
        memberId: recipient.id,
        memberName: recipient.name,
        email: recipient.email,
        promotionType: recipient.promotionType,
        holidayName,
        holidayDate,
        status: 'FAILED',
        errorMessage: error,
      },
    });
  }

  async getHolidaysForMonth(year: number, month: number): Promise<HolidayInfo[]> {
    const monthHolidays = this.holidays.getHolidays(year);
    const filtered = monthHolidays.filter((h) => {
      const d = new Date(h.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });

    return filtered.map((h) => ({
      date: h.date,
      name: h.name,
    }));
  }

  async getBirthdayPromotions(): Promise<PromotionRecipient[]> {
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();

    const { members } = await this.gymData.listMembers({ limit: 1000 });

    const recipients: PromotionRecipient[] = [];

    for (const member of members) {
      if (!member.birthDate) continue;

      const birthDate = new Date(member.birthDate);
      if (birthDate.getMonth() === todayMonth && birthDate.getDate() === todayDay) {
        const alreadySent = await this.wasAlreadySent(member.id, 'birthday', today);
        if (alreadySent) continue;

        recipients.push({
          id: member.id,
          name: member.name,
          email: member.email,
          phone: member.phone,
          promotionType: 'birthday',
          promotionTitle: '¡Feliz Cumpleaños! 🎂',
        });
      }
    }

    return recipients;
  }

  async getHolidayPromotions(month?: number, year?: number): Promise<PromotionRecipient[]> {
    const targetYear = year ?? new Date().getFullYear();
    const targetMonth = month ?? new Date().getMonth();

    const holidays = await this.getHolidaysForMonth(targetYear, targetMonth);
    if (holidays.length === 0) return [];

    const { members } = await this.gymData.listMembers({ limit: 1000 });
    const recipients: PromotionRecipient[] = [];

    for (const holiday of holidays) {
      const holidayDate = new Date(holiday.date);

      for (const member of members) {
        const alreadySent = await this.wasAlreadySent(member.id, 'holiday', holidayDate);
        if (alreadySent) continue;

        recipients.push({
          id: member.id,
          name: member.name,
          email: member.email,
          phone: member.phone,
          promotionType: 'holiday',
          promotionTitle: `¡Feliz ${holiday.name}! 🎉`,
        });
      }
    }

    return recipients;
  }

  async getUpcomingHolidays(month?: number, year?: number): Promise<HolidayInfo[]> {
    const targetYear = year ?? new Date().getFullYear();
    const targetMonth = month ?? new Date().getMonth();
    return this.getHolidaysForMonth(targetYear, targetMonth);
  }

  async getAllPromotionRecipients(): Promise<{
    birthday: PromotionRecipient[];
    holiday: PromotionRecipient[];
  }> {
    const [birthday, holiday] = await Promise.all([
      this.getBirthdayPromotions(),
      this.getHolidayPromotions(),
    ]);

    return { birthday, holiday };
  }

  async getPromotionLogs(limit = 100): Promise<{
    id: string;
    memberId: string;
    memberName: string;
    email: string;
    promotionType: string;
    holidayName: string | null;
    sentAt: string;
    status: string;
    errorMessage: string | null;
  }[]> {
    const logs = await this.prisma.promotionLog.findMany({
      take: limit,
      orderBy: { sentAt: 'desc' },
    });

    return logs.map((log) => ({
      id: log.id,
      memberId: log.memberId,
      memberName: log.memberName,
      email: log.email,
      promotionType: log.promotionType,
      holidayName: log.holidayName,
      sentAt: log.sentAt.toISOString(),
      status: log.status,
      errorMessage: log.errorMessage,
    }));
  }
}