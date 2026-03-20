import prisma from '../models';

export class TableMappingService {
  async findAll() {
    return prisma.tableMapping.findMany({
      include: {
        dataSource: true,
        fields: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.tableMapping.findUnique({
      where: { id },
      include: {
        dataSource: true,
        fields: true,
      },
    });
  }

  async findByDataSourceId(dataSourceId: string) {
    return prisma.tableMapping.findMany({
      where: { dataSourceId },
      include: {
        dataSource: true,
        fields: true,
      },
    });
  }

  async create(data: {
    dataSourceId: string;
    externalTableName: string;
    localAlias: string;
    useCase?: string;
    queryRules?: string;
    enabled?: number;
  }) {
    return prisma.tableMapping.create({
      data: {
        dataSourceId: data.dataSourceId,
        externalTableName: data.externalTableName,
        localAlias: data.localAlias,
        useCase: data.useCase,
        queryRules: data.queryRules,
        enabled: data.enabled ?? 1,
      },
      include: {
        dataSource: true,
        fields: true,
      },
    });
  }

  async update(
    id: string,
    data: {
      externalTableName?: string;
      localAlias?: string;
      useCase?: string;
      queryRules?: string;
      enabled?: number;
    }
  ) {
    return prisma.tableMapping.update({
      where: { id },
      data,
      include: {
        dataSource: true,
        fields: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.tableMapping.delete({
      where: { id },
    });
  }
}

export const tableMappingService = new TableMappingService();
