import { Table } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';

interface ResultTableProps<T> {
  data: T[];
  columns: ColumnsType<T>;
  loading?: boolean;
  pagination?: TableProps<T>['pagination'];
}

function ResultTable<T extends object>({ data, columns, loading = false, pagination }: ResultTableProps<T>) {
  return (
    <Table<T>
      dataSource={data}
      columns={columns}
      loading={loading}
      pagination={pagination || { pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} items` }}
      scroll={{ x: 'max-content' }}
    />
  );
}

export default ResultTable;
