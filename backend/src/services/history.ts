import prisma from '../models';

export class HistoryService {
  async create(data: {
    userId: string;
    query: string;
    sql?: string;
    tables?: string[];
    status: number;
  }) {
    return prisma.queryHistory.create({
      data: {
        userId: data.userId,
        query: data.query,
        sql: data.sql,
        tables: data.tables?.join(','),
        status: data.status,
      },
    });
  }

  async findByUserId(userId: string) {
    return prisma.queryHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async delete(id: string, userId: string) {
    return prisma.queryHistory.delete({
      where: {
        id,
        userId, // 确保只能删除自己的记录
      },
    });
  }
}

export const historyService = new HistoryService();
