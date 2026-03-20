import { logger } from '../utils/logger';

interface Report {
  id: string;
  name: string;
  type: string;
  date: string;
  status: 'ready' | 'generating';
}

// In-memory store for demo purposes
let reports: Report[] = [
  { id: '1', name: 'Monthly Sales Report', type: 'Sales', date: '2024-01-15', status: 'ready' },
  { id: '2', name: 'Inventory Summary', type: 'Inventory', date: '2024-01-14', status: 'ready' },
  { id: '3', name: 'Customer Analysis', type: 'Analytics', date: '2024-01-13', status: 'ready' },
  { id: '4', name: 'Revenue by Region', type: 'Finance', date: '2024-01-12', status: 'ready' },
];

export class ReportsService {
  async listReports(): Promise<Report[]> {
    logger.info('Listing all reports');
    return reports;
  }

  async generateReport(name: string, type: string, dateRange?: { start: string; end: string }): Promise<Report> {
    logger.info(`Generating report: ${name} of type ${type}`);

    const newReport: Report = {
      id: Date.now().toString(),
      name,
      type,
      date: new Date().toISOString().split('T')[0],
      status: 'generating',
    };

    reports.unshift(newReport);

    // Simulate report generation
    setTimeout(() => {
      const report = reports.find((r) => r.id === newReport.id);
      if (report) {
        report.status = 'ready';
      }
    }, 2000);

    return newReport;
  }
}
