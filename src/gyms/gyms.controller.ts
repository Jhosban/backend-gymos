import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { GymsService } from './gyms.service';
import { CreateGymDto, UpdateGymDto, GymResponseDto } from './dtos/gym.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('gyms')
@UseGuards(JwtAuthGuard)
export class GymsController {
  constructor(private gymsService: GymsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateGymDto): Promise<GymResponseDto> {
    return this.gymsService.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<GymResponseDto> {
    return this.gymsService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<GymResponseDto> {
    return this.gymsService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateGymDto,
  ): Promise<GymResponseDto> {
    return this.gymsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string): Promise<{ success: boolean; data?: { message: string } }> {
    return this.gymsService.delete(id);
  }
}
