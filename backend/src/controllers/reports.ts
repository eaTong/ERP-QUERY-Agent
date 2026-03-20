import { Request, Response } from 'express';
import { ReportsService } from '../services/reports';

export class ReportsController {
  private reportsService: ReportsService;

  constructor() {
    this.reportsService = new ReportsService();
  }

  async listReports(_req: Request, res: Response) {
    try {
      const reports = await this.reportsService.listReports();

      res.json({
        success: true,
        data: reports,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  async generateReport(req: Request, res: Response) {
    try {
      const { name, type, dateRange } = req.body;

      if (!name || !type) {
        return res.status(400).json({
          success: false,
          error: 'Name and type are required',
        });
      }

      const report = await this.reportsService.generateReport(name, type, dateRange);

      res.json({
        success: true,
        data: report,
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
