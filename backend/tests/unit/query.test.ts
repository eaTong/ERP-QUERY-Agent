import { QueryService } from '../../src/services/query';

describe('QueryService', () => {
  let queryService: QueryService;

  beforeEach(() => {
    queryService = new QueryService();
  });

  describe('executeQuery', () => {
    it('should return a result with query id', async () => {
      const result = await queryService.executeQuery('test query');

      expect(result).toHaveProperty('id');
      expect(result.id).toBeDefined();
    });

    it('should return result with the original query', async () => {
      const testQuery = 'Show me all orders from January';
      const result = await queryService.executeQuery(testQuery);

      expect(result.query).toBe(testQuery);
    });

    it('should return result with format specified in options', async () => {
      const result = await queryService.executeQuery('test', {}, { format: 'chart' });

      expect(result.format).toBe('chart');
    });

    it('should default to table format when not specified', async () => {
      const result = await queryService.executeQuery('test');

      expect(result.format).toBe('table');
    });

    it('should include timestamp in result', async () => {
      const result = await queryService.executeQuery('test');

      expect(result).toHaveProperty('timestamp');
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });
  });
});
