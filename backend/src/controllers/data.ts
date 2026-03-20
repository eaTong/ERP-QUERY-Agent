import { Request, Response } from 'express';
import { DataService } from '../services/data';

export class DataController {
  private dataService: DataService;

  constructor() {
    this.dataService = new DataService();
  }

  async getData(req: Request, res: Response) {
    try {
      const { entity } = req.params;
      const { page = '1', pageSize = '10', ...filters } = req.query;

      const result = await this.dataService.getData(
        entity,
        {
          page: parseInt(page as string, 10),
          pageSize: parseInt(pageSize as string, 10),
        },
        filters as Record<string, string>
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }
}
