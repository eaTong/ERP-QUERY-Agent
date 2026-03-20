import prisma from '../models';

export class PromptRuleService {
  async findAll() {
    return prisma.promptRule.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findEnabled() {
    return prisma.promptRule.findMany({
      where: { enabled: 1 },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.promptRule.findUnique({
      where: { id },
    });
  }

  async create(data: { name: string; description?: string; content: string; enabled?: number }) {
    return prisma.promptRule.create({
      data: {
        name: data.name,
        description: data.description,
        content: data.content,
        enabled: data.enabled ?? 1,
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      content?: string;
      enabled?: number;
    }
  ) {
    return prisma.promptRule.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.promptRule.delete({
      where: { id },
    });
  }
}

export const promptRuleService = new PromptRuleService();
