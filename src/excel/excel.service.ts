import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Workbook } from 'exceljs';

interface ImportError {
  sheet: string;
  row: number;
  field: string;
  error: string;
}

@Injectable()
export class ExcelService {
  generateTemplate(): ExcelJS.Workbook {
    const workbook = new ExcelJS.Workbook();

    this.createMembersiesSheet(workbook);
    this.createEntrenamientosSheet(workbook);
    this.createProductosSheet(workbook);

    return workbook;
  }

  private createMembersiesSheet(workbook: Workbook): void {
    const sheet = workbook.addWorksheet('Membresías');
    
    const headers = [
      'Nombre',
      'Correo',
      'Teléfono',
      'Fuente',
      'Estado',
      'AsesorAsignado',
      'TipoDeMembresia',
      'DuracionMeses',
      'PrecioPeriodo',
      'Periodicidad',
      'FechaInicio',
      'FechaFin',
      'RenovacionAutomatica',
      'AccesoIncluido',
      'CuotaInscripcion',
      'Notas',
    ];

    sheet.addRow(headers);
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B57F0' } };

    // Example row
    sheet.addRow([
      'Juan Pérez',
      'juan@example.com',
      '+57 300 123 4567',
      'INSTAGRAM',
      'NUEVO',
      'Asesor María',
      'premium',
      '3',
      '99000',
      'monthly',
      '2024-05-01',
      '2024-08-01',
      'true',
      'Gym, Piscina',
      '50000',
      'Ejemplo de membresía',
    ]);

    // Set column widths
    sheet.columns.forEach((col) => (col.width = 20));
  }

  private createEntrenamientosSheet(workbook: Workbook): void {
    const sheet = workbook.addWorksheet('Entrenamientos');
    
    const headers = [
      'Nombre',
      'Correo',
      'Teléfono',
      'Fuente',
      'Estado',
      'AsesorAsignado',
      'TipoServicio',
      'EntrenadorAsignado',
      'NumeroSesiones',
      'DuracionSesion',
      'Modalidad',
      'PrecioPorSesion',
      'PrecioPaquete',
      'FechaPrimeraSesion',
      'ObjetivoCliente',
      'EvaluacionInicial',
      'Notas',
    ];

    sheet.addRow(headers);
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B57F0' } };

    // Example row
    sheet.addRow([
      'María García',
      'maria@example.com',
      '+57 301 234 5678',
      'GOOGLE',
      'PROPUESTA',
      'Asesor Carlos',
      'individual',
      'Entrenador Pedro',
      '12',
      '60',
      'in-person',
      '65000',
      '720000',
      '2024-05-10',
      'Bajar de peso',
      'true',
      'Muy interesada',
    ]);

    // Set column widths
    sheet.columns.forEach((col) => (col.width = 20));
  }

  private createProductosSheet(workbook: Workbook): void {
    const sheet = workbook.addWorksheet('Productos');
    
    const headers = [
      'Nombre',
      'Correo',
      'Teléfono',
      'Fuente',
      'Estado',
      'AsesorAsignado',
      'NombreProducto',
      'SKU',
      'Categoria',
      'Cantidad',
      'PrecioUnitario',
      'Talla',
      'Color',
      'StockDisponible',
      'Marca',
      'Notas',
    ];

    sheet.addRow(headers);
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B57F0' } };

    // Example row
    sheet.addRow([
      'Carlos López',
      'carlos@example.com',
      '+57 302 345 6789',
      'REFERIDO',
      'NEGOCIACION',
      'Asesor María',
      'Mancuernas Ajustables',
      'ADJ-DUMB-001',
      'equipment',
      '2',
      '150000',
      '5-20kg',
      'Negro',
      '10',
      'PowerFlex',
      'Comparando precios',
    ]);

    // Set column widths
    sheet.columns.forEach((col) => (col.width = 20));
  }

  async parseImportFile(buffer: Buffer): Promise<{
    data: any[];
    errors: any[];
  }> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    const data: any[] = [];
    const errors: any[] = [];

    // Parse Membresías
    const membresiaSheet = workbook.getWorksheet('Membresías');
    if (membresiaSheet) {
      this.parseSheet(membresiaSheet, 'MEMBERSHIP', data, errors);
    }

    // Parse Entrenamientos
    const entrenamientoSheet = workbook.getWorksheet('Entrenamientos');
    if (entrenamientoSheet) {
      this.parseSheet(entrenamientoSheet, 'PERSONAL_TRAINING', data, errors);
    }

    // Parse Productos
    const productosSheet = workbook.getWorksheet('Productos');
    if (productosSheet) {
      this.parseSheet(productosSheet, 'FITNESS_PRODUCT', data, errors);
    }

    return { data, errors };
  }

  detectDuplicatesInFile(data: any[]): {
    unique: any[];
    duplicates: Array<{ record: any; duplicateIndices: number[] }>;
  } {
    const seen = new Map<string, number>();
    const unique: any[] = [];
    const duplicates: Array<{ record: any; duplicateIndices: number[] }> = [];

    data.forEach((record, index) => {
      const key = `${String(record.email).toLowerCase()}|${record.productType}`;
      
      if (seen.has(key)) {
        const firstIndex = seen.get(key)!;
        let duplicateEntry = duplicates.find(d => d.record === unique[firstIndex]);
        
        if (!duplicateEntry) {
          duplicateEntry = {
            record: unique[firstIndex],
            duplicateIndices: [firstIndex],
          };
          duplicates.push(duplicateEntry);
        }
        
        duplicateEntry.duplicateIndices.push(index);
      } else {
        seen.set(key, unique.length);
        unique.push(record);
      }
    });

    return { unique, duplicates };
  }

  compareRecords(newRecord: any, existingRecord: any): {
    isIdentical: boolean;
    changedFields: Array<{ field: string; oldValue: any; newValue: any }>;
  } {
    const changedFields: Array<{ field: string; oldValue: any; newValue: any }> = [];

    const compareField = (field: string, newVal: any, existVal: any) => {
      if (newVal === null || newVal === undefined || newVal === '') {
        return;
      }

      const newStr = String(newVal).trim();
      const existStr = String(existVal).trim();

      if (newStr.toLowerCase() !== existStr.toLowerCase()) {
        changedFields.push({
          field,
          oldValue: existVal,
          newValue: newVal,
        });
      }
    };

    compareField('name', newRecord.name, existingRecord.name);
    compareField('phone', newRecord.phone, existingRecord.phone);
    compareField('source', newRecord.source, existingRecord.source);
    compareField('status', newRecord.status, existingRecord.status);
    compareField('assignedAdvisor', newRecord.assignedAdvisor, existingRecord.assignedAdvisor);
    compareField('notes', newRecord.notes, existingRecord.notes);

    if (newRecord.productDetails && existingRecord.productDetails) {
      Object.keys(newRecord.productDetails).forEach(key => {
        compareField(`productDetails.${key}`, newRecord.productDetails[key], existingRecord.productDetails[key]);
      });
    }

    return {
      isIdentical: changedFields.length === 0,
      changedFields,
    };
  }

  private parseSheet(
    sheet: ExcelJS.Worksheet,
    productType: string,
    data: any[],
    errors: ImportError[],
  ): void {
    const headers = this.extractHeaders(sheet);
    if (!headers) return;

    let rowIndex = 2;
    sheet.eachRow((row, index) => {
      if (index === 1) return; // Skip header

      const rowData = this.parseRow(row, headers, sheet.name, rowIndex, productType, errors);
      if (rowData) {
        data.push(rowData);
      }
      rowIndex++;
    });
  }

  private extractHeaders(sheet: ExcelJS.Worksheet): Map<string, number> | null {
    const headerRow = sheet.getRow(1);
    if (!headerRow) return null;

    const headers = new Map<string, number>();
    headerRow.eachCell((cell, colIndex) => {
      headers.set(cell.value as string, colIndex);
    });

    return headers;
  }

  private parseRow(
    row: ExcelJS.Row,
    headers: Map<string, number>,
    sheetName: string,
    rowIndex: number,
    productType: string,
    errors: ImportError[],
  ): any | null {
    try {
      const getName = (header: string) => {
        const colIndex = headers.get(header);
        return colIndex ? (row.getCell(colIndex).value as string)?.toString().trim() : undefined;
      };

      const getNumber = (header: string) => {
        const colIndex = headers.get(header);
        const value = colIndex ? row.getCell(colIndex).value : undefined;
        return value ? Number(value) : undefined;
      };

      const getDate = (header: string) => {
        const colIndex = headers.get(header);
        const value = colIndex ? row.getCell(colIndex).value : undefined;
        if (!value) return undefined;
        
        if (value instanceof Date) {
          return value.toISOString().split('T')[0];
        }
        
        const dateStr = String(value).trim();
        if (!dateStr) return undefined;
        
        // Try parsing as ISO
        const isoDate = new Date(dateStr);
        if (!isNaN(isoDate.getTime())) {
          return isoDate.toISOString().split('T')[0];
        }
        
        return dateStr;
      };

      const getBoolean = (header: string) => {
        const colIndex = headers.get(header);
        const value = colIndex ? row.getCell(colIndex).value : undefined;
        if (!value) return false;
        return String(value).toLowerCase() === 'true';
      };

      const getArray = (header: string) => {
        const colIndex = headers.get(header);
        const value = colIndex ? row.getCell(colIndex).value : undefined;
        if (!value) return [];
        return String(value).split(',').map(s => s.trim()).filter(s => s);
      };

      const baseData = {
        name: getName('Nombre'),
        email: getName('Correo')?.toLowerCase(),
        phone: getName('Teléfono'),
        source: getName('Fuente'),
        status: getName('Estado'),
        assignedAdvisor: getName('AsesorAsignado'),
        productType,
        notes: getName('Notas'),
      };

      // Validate base data
      if (!baseData.name) {
        errors.push({
          sheet: sheetName,
          row: rowIndex,
          field: 'Nombre',
          error: 'El nombre es requerido',
        });
        return null;
      }

      if (!baseData.email) {
        errors.push({
          sheet: sheetName,
          row: rowIndex,
          field: 'Correo',
          error: 'El correo es requerido',
        });
        return null;
      }

      // Parse product details based on type
      let productDetails: any = {};

      if (productType === 'MEMBERSHIP') {
        productDetails = {
          membershipType: getName('TipoDeMembresia'),
          durationMonths: getNumber('DuracionMeses'),
          pricePerPeriod: getNumber('PrecioPeriodo'),
          periodicity: getName('Periodicidad'),
          startDate: getDate('FechaInicio'),
          endDate: getDate('FechaFin'),
          autoRenewal: getBoolean('RenovacionAutomatica'),
          includedAccess: getArray('AccesoIncluido'),
          enrollmentFee: getNumber('CuotaInscripcion'),
        };
      } else if (productType === 'PERSONAL_TRAINING') {
        productDetails = {
          serviceType: getName('TipoServicio'),
          assignedTrainer: getName('EntrenadorAsignado'),
          numberOfSessions: getNumber('NumeroSesiones'),
          sessionDurationMinutes: getNumber('DuracionSesion'),
          modality: getName('Modalidad'),
          pricePerSession: getNumber('PrecioPorSesion'),
          packagePrice: getNumber('PrecioPaquete'),
          firstSessionDate: getDate('FechaPrimeraSesion'),
          clientObjective: getName('ObjetivoCliente'),
          initialEvaluationRequired: getBoolean('EvaluacionInicial'),
        };
      } else if (productType === 'FITNESS_PRODUCT') {
        productDetails = {
          productName: getName('NombreProducto'),
          sku: getName('SKU'),
          category: getName('Categoria'),
          quantity: getNumber('Cantidad'),
          unitPrice: getNumber('PrecioUnitario'),
          size: getName('Talla'),
          color: getName('Color'),
          availableStock: getNumber('StockDisponible'),
          brand: getName('Marca'),
        };
      }

      return {
        ...baseData,
        productDetails,
      };
    } catch (error) {
      errors.push({
        sheet: sheetName,
        row: rowIndex,
        field: 'General',
        error: `Error al procesar la fila: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      });
      return null;
    }
  }
}
