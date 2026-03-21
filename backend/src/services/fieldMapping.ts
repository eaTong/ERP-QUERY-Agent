import prisma from '../models';
import { dataSourceService } from './datasource';

export class FieldMappingService {
  async syncFieldsFromExternal(tableMappingId: string): Promise<{
    success: boolean;
    total: number;
    created: number;
    errors: string[];
  }> {
    // 获取表映射及其关联的数据源
    const tableMapping = await prisma.tableMapping.findUnique({
      where: { id: tableMappingId },
      include: { dataSource: true },
    });

    if (!tableMapping) {
      return { success: false, total: 0, created: 0, errors: ['表映射不存在'] };
    }

    if (!tableMapping.dataSource) {
      return { success: false, total: 0, created: 0, errors: ['表映射没有关联数据源'] };
    }

    // 获取外部数据库的字段信息
    const fieldsResult = await dataSourceService.getTableFields(
      tableMapping.dataSource.id,
      tableMapping.externalTableName
    );

    if (fieldsResult.error || fieldsResult.fields.length === 0) {
      return { success: false, total: 0, created: 0, errors: [fieldsResult.error || '未能获取到字段信息'] };
    }

    const errors: string[] = [];
    const fields = fieldsResult.fields;

    // 获取已存在的字段映射
    const existingFields = await prisma.fieldMapping.findMany({
      where: { tableMappingId },
    });
    const existingNames = new Set(existingFields.map(f => f.externalFieldName));

    // 过滤出需要创建的字段
    const fieldsToCreate = fields
      .map((field: Record<string, unknown>) => {
        const fieldName = (field.COLUMN_NAME || field.Field || field.name) as string;
        const dataType = (field.DATA_TYPE || field.Type || field.data_type) as string;
        return { fieldName, dataType };
      })
      .filter((f) => !existingNames.has(f.fieldName));

    // 批量创建字段映射记录
    if (fieldsToCreate.length > 0) {
      try {
        await prisma.fieldMapping.createMany({
          data: fieldsToCreate.map((f) => ({
            tableMappingId,
            externalFieldName: f.fieldName,
            localAlias: f.fieldName,
            fieldDescription: `${f.fieldName} (${f.dataType})`,
            enabled: 1,
          })),
        });
      } catch (error: any) {
        errors.push(`批量创建字段失败: ${error.message}`);
      }
    }

    const created = fieldsToCreate.length;
    return {
      success: errors.length === 0,
      total: fields.length,
      created,
      errors,
    };
  }

  async findByTableMappingId(tableMappingId: string) {
    return prisma.fieldMapping.findMany({
      where: { tableMappingId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(id: string) {
    return prisma.fieldMapping.findUnique({
      where: { id },
    });
  }

  async create(data: {
    tableMappingId: string;
    externalFieldName: string;
    localAlias: string;
    fieldDescription?: string;
    displayRules?: string;
    enabled?: number;
  }) {
    return prisma.fieldMapping.create({
      data: {
        tableMappingId: data.tableMappingId,
        externalFieldName: data.externalFieldName,
        localAlias: data.localAlias,
        fieldDescription: data.fieldDescription,
        displayRules: data.displayRules,
        enabled: data.enabled ?? 1,
      },
    });
  }

  async update(
    id: string,
    data: {
      externalFieldName?: string;
      localAlias?: string;
      fieldDescription?: string;
      displayRules?: string;
      enabled?: number;
    }
  ) {
    return prisma.fieldMapping.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.fieldMapping.delete({
      where: { id },
    });
  }
}

export const fieldMappingService = new FieldMappingService();
