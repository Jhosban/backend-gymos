import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, NotFoundException, UseGuards, UseInterceptors, UploadedFile, Response } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GymDataService } from '@/shared/gym-data.service';
import { ExcelService } from '@/excel/excel.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { Response as ExpressResponse } from 'express';

@Controller('leads')
export class LeadsController {
  constructor(
    private readonly gymData: GymDataService,
    private readonly excelService: ExcelService,
  ) {}

  @Get()
  async findAll(@Query() query: { page?: number; limit?: number; search?: string; status?: string }) {
    return { success: true, data: await this.gymData.listLeads(query) };
  }

  @Get('export/template')
  async exportTemplate(@Response() res: ExpressResponse) {
    try {
      const workbook = this.excelService.generateTemplate();
      const buffer = await workbook.xlsx.writeBuffer() as any;
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=plantilla_leads.xlsx');
      res.send(buffer);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Error generando plantilla: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      });
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    const lead = await this.gymData.getLead(id);
    if (!lead) throw new NotFoundException(`Lead with ID ${id} not found`);
    return { success: true, data: lead };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: any) {
    return { success: true, data: await this.gymData.createLead(body) };
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importLeads(@UploadedFile() file: any) {
    if (!file) {
      return { success: false, error: 'No se cargó archivo' };
    }

    if (!file.originalname.endsWith('.xlsx')) {
      return { success: false, error: 'El archivo debe ser Excel (.xlsx)' };
    }

    try {
      const { data, errors } = await this.excelService.parseImportFile(file.buffer);

      if (errors.length > 0) {
        return {
          success: false,
          message: 'Se encontraron errores en el archivo',
          totalRows: data.length + errors.length,
          importedRows: 0,
          errors,
        };
      }

      // Check for duplicates within the file
      const { unique: uniqueData, duplicates: duplicatesInFile } = this.excelService.detectDuplicatesInFile(data);

      // Add duplicate errors from file
      const importErrors: any[] = [];
      duplicatesInFile.forEach((dup) => {
        dup.duplicateIndices.forEach((idx) => {
          if (idx > 0) {
            importErrors.push({
              sheet: 'Múltiples',
              row: idx + 2,
              field: 'Email',
              error: `Duplicado en archivo: ${dup.record.email} (${dup.record.productType}) aparece en filas ${dup.duplicateIndices.map(i => i + 2).join(', ')}`,
            });
          }
        });
      });

      // If there are duplicates in file, reject the import
      if (importErrors.length > 0) {
        return {
          success: false,
          message: 'El archivo contiene registros duplicados',
          totalRows: data.length,
          importedRows: 0,
          errors: importErrors,
        };
      }

      // Process unique records - FIRST PASS: Validate all (individual DB queries)
      const leadsToCreate: any[] = [];
      const updates: any[] = [];
      const duplicatesInDB: any[] = [];

      for (let i = 0; i < uniqueData.length; i++) {
        const leadData = uniqueData[i];
        
        // Check for existing lead with same email (case-insensitive) and productType
        const existingLead = await this.gymData.findLeadByEmailAndProductType(
          leadData.email,
          leadData.productType,
        );

        if (existingLead) {
          // Compare for changes
          const comparison = this.excelService.compareRecords(leadData, existingLead);

          if (!comparison.isIdentical) {
            // There are changes - report them
            updates.push({
              existingId: existingLead.id,
              email: existingLead.email,
              productType: existingLead.productType,
              changedFields: comparison.changedFields,
              action: 'update_available',
            });

            importErrors.push({
              sheet: 'Múltiples',
              row: data.indexOf(leadData) + 2,
              field: 'General',
              error: `Lead existente con cambios: ${comparison.changedFields.map(f => f.field).join(', ')} han sido modificados`,
              updateDetails: comparison.changedFields,
            });
          } else {
            // Identical record - this is a duplicate
            duplicatesInDB.push({
              sheet: 'Múltiples',
              row: data.indexOf(leadData) + 2,
              field: 'General',
              error: `Este lead ya existe sin cambios (mismo email y tipo de producto)`,
            });

            importErrors.push({
              sheet: 'Múltiples',
              row: data.indexOf(leadData) + 2,
              field: 'General',
              error: `Este lead ya existe sin cambios (mismo email y tipo de producto)`,
            });
          }
        } else {
          // New record - mark for creation (but don't create yet)
          leadsToCreate.push(leadData);
        }
      }

      // If all records are duplicates or have errors, reject the import WITHOUT creating anything
      if (leadsToCreate.length === 0 && (updates.length > 0 || duplicatesInDB.length > 0)) {
        return {
          success: false,
          message: 'Todos los registros ya existen en el sistema',
          totalRows: data.length,
          importedRows: 0,
          updateAvailable: updates.length,
          updates: updates.length > 0 ? updates : undefined,
          duplicatesFound: duplicatesInDB.length,
          errors: importErrors,
        };
      }

      // SECOND PASS: Only create leads if validation passed
      const imported: any[] = [];
      for (const leadData of leadsToCreate) {
        try {
          const created = await this.gymData.createLead(leadData);
          imported.push(created);
        } catch (error) {
          importErrors.push({
            sheet: 'Múltiples',
            row: data.indexOf(leadData) + 2,
            field: 'General',
            error: `Error al guardar: ${error instanceof Error ? error.message : 'Error desconocido'}`,
          });
        }
      }

      return {
        success: importErrors.length === 0 && imported.length > 0,
        message: imported.length > 0 
          ? `Se importaron ${imported.length} leads correctamente${updates.length > 0 ? `, ${updates.length} con cambios detectados` : ''}`
          : 'No se importaron registros (todos son duplicados o existentes)',
        totalRows: data.length,
        importedRows: imported.length,
        updateAvailable: updates.length,
        updates: updates.length > 0 ? updates : undefined,
        errors: importErrors.length > 0 ? importErrors : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: `Error al procesar el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      };
    }
  }

  @Post('import/apply-updates')
  @UseGuards(JwtAuthGuard)
  async applyImportUpdates(@Body() body: { updates: Array<{ existingId: string; leadData: any }> }) {
    try {
      if (!body.updates || !Array.isArray(body.updates)) {
        return {
          success: false,
          error: 'Se requiere un array de actualizaciones con formato {existingId, leadData}',
        };
      }

      const appliedUpdates: any[] = [];
      const failedUpdates: any[] = [];

      for (const updateItem of body.updates) {
        try {
          const updated = await this.gymData.updateLead(updateItem.existingId, updateItem.leadData);
          if (updated) {
            appliedUpdates.push(updated);
          } else {
            failedUpdates.push({
              id: updateItem.existingId,
              error: 'Lead no encontrado',
            });
          }
        } catch (error) {
          failedUpdates.push({
            id: updateItem.existingId,
            error: error instanceof Error ? error.message : 'Error desconocido',
          });
        }
      }

      return {
        success: failedUpdates.length === 0,
        message: `Se actualizaron ${appliedUpdates.length} leads correctamente${failedUpdates.length > 0 ? `, ${failedUpdates.length} fallaron` : ''}`,
        appliedUpdates,
        failedUpdates: failedUpdates.length > 0 ? failedUpdates : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: `Error al aplicar actualizaciones: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      };
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() body: any) {
    const lead = await this.gymData.updateLead(id, body);
    if (!lead) throw new NotFoundException(`Lead with ID ${id} not found`);
    return { success: true, data: lead };
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async move(@Param('id') id: string, @Body() body: { status: string }) {
    const lead = await this.gymData.moveLead(id, body.status as any);
    if (!lead) throw new NotFoundException(`Lead with ID ${id} not found`);
    return { success: true, data: lead };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    const deleted = await this.gymData.deleteLead(id);
    if (!deleted) throw new NotFoundException(`Lead with ID ${id} not found`);
    return { success: true, message: 'Lead eliminado correctamente' };
  }
}

