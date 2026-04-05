import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AppConfigService } from '@/config/app.config';
import {
  ClientStatusDto,
  RetentionStatusResponseDto,
  RecalculateRetentionResponseDto,
} from './dtos/retention.dto';
import { ClientStatus } from '@prisma/client';

@Injectable()
export class RetentionService {
  private readonly logger = new Logger(RetentionService.name);

  constructor(
    private prisma: PrismaService,
    private appConfig: AppConfigService,
  ) {}

  /**
   * Get current retention status for all clients
   * Calculates status based on last attendance date
   */
  async getStatus(): Promise<RetentionStatusResponseDto> {
    const clients = await this.prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();

    const active: ClientStatusDto[] = [];
    const atRisk: ClientStatusDto[] = [];
    const inactive: ClientStatusDto[] = [];

    for (const client of clients) {
      const clientStatus = this.calculateClientStatus(client.status);

      const mappedClient: ClientStatusDto = {
        id: client.id,
        name: client.name,
        email: client.email,
        status: clientStatus,
        lastAttendance: client.lastAttendance,
        daysSinceAttendance: client.lastAttendance
          ? Math.floor(
              (now.getTime() - client.lastAttendance.getTime()) /
                (1000 * 60 * 60 * 24),
            )
          : null,
      };

      if (clientStatus === 'ACTIVE') {
        active.push(mappedClient);
      } else if (clientStatus === 'AT_RISK') {
        atRisk.push(mappedClient);
      } else {
        inactive.push(mappedClient);
      }
    }

    return {
      active,
      atRisk,
      inactive,
      summary: {
        totalClients: clients.length,
        activeCount: active.length,
        atRiskCount: atRisk.length,
        inactiveCount: inactive.length,
      },
    };
  }

  /**
   * Recalculate and update client statuses based on attendance
   * This is the core business logic for retention tracking
   */
  async recalculateStatus(): Promise<RecalculateRetentionResponseDto> {
    const atRiskDays = this.appConfig.retentionAtRiskDays;
    const inactiveDays = this.appConfig.retentionInactiveDays;
    const now = new Date();

    const clients = await this.prisma.client.findMany();

    let updatedCount = 0;

    for (const client of clients) {
      let newStatus: ClientStatus = 'ACTIVE';

      if (!client.lastAttendance) {
        // No attendance recorded - mark as inactive
        newStatus = 'INACTIVE';
      } else {
        const daysSinceAttendance = Math.floor(
          (now.getTime() - client.lastAttendance.getTime()) /
            (1000 * 60 * 60 * 24),
        );

        if (daysSinceAttendance >= inactiveDays) {
          newStatus = 'INACTIVE';
        } else if (daysSinceAttendance >= atRiskDays) {
          newStatus = 'AT_RISK';
        } else {
          newStatus = 'ACTIVE';
        }
      }

      // Only update if status changed
      if (client.status !== newStatus) {
        await this.prisma.client.update({
          where: { id: client.id },
          data: { status: newStatus },
        });

        updatedCount++;
        this.logger.log(
          `Client ${client.id} (${client.name}) status updated from ${client.status} to ${newStatus}`,
        );
      }
    }

    this.logger.log(
      `Retention status recalculation completed. ${updatedCount} clients updated.`,
    );

    return {
      message: 'Retention status recalculation completed successfully',
      updatedCount,
      timestamp: new Date(),
    };
  }

  /**
   * Helper method to calculate client status based on business rules
   */
  private calculateClientStatus(currentStatus: ClientStatus): ClientStatus {
    if (currentStatus === 'ACTIVE') {
      // Could be at risk or inactive, but we display current stored status
      // The recalculateStatus method handles the actual updates
      return currentStatus;
    }

    return currentStatus;
  }

  /**
   * Get clients at risk (for proactive retention campaigns)
   */
  async getAtRiskClients(): Promise<ClientStatusDto[]> {
    const clients = await this.prisma.client.findMany({
      where: { status: 'AT_RISK' },
      orderBy: { lastAttendance: 'asc' },
    });

    const now = new Date();

    return clients.map((client) => ({
      id: client.id,
      name: client.name,
      email: client.email,
      status: client.status,
      lastAttendance: client.lastAttendance,
      daysSinceAttendance: client.lastAttendance
        ? Math.floor(
            (now.getTime() - client.lastAttendance.getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : null,
    }));
  }
}
