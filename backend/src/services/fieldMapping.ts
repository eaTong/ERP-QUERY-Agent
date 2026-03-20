import prisma from '../models';
import { dataSourceService } from './datasource';

interface TableField {
  COLUMN_NAME: string;
  DATA_TYPE: string;
  IS_NULLABLE: string;
  COLUMN_KEY?: string;
}

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
    const fields = await dataSourceService.getTableFields(
      tableMapping.dataSource.id,
      tableMapping.externalTableName
    );

    if (fields.length === 0) {
      return { success: false, total: 0, created: 0, errors: ['未能获取到字段信息'] };
    }

    const errors: string[] = [];
    let created = 0;

    // 获取已存在的字段映射
    const existingFields = await prisma.fieldMapping.findMany({
      where: { tableMappingId },
    });
    const existingNames = new Set(existingFields.map(f => f.externalFieldName));

    // 为每个字段创建映射记录
    for (const field of fields) {
      try {
        const fieldName = (field as TableField).COLUMN_NAME || field.Field || field.name;

        // 如果字段已存在，跳过
        if (existingNames.has(fieldName)) {
          continue;
        }

        // 生成描述
        const dataType = (field as TableField).DATA_TYPE || field.Type || field.data_type || '';

        await prisma.fieldMapping.create({
          data: {
            tableMappingId,
            externalFieldName: fieldName,
            localAlias: fieldName, // 默认使用原始字段名
            fieldDescription: `${fieldName} (${dataType})`,
            enabled: 1,
          },
        });
        created++;
      } catch (error: any) {
        errors.push(`字段 ${field} 创建失败: ${error.message}`);
      }
    }

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
