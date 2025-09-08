import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import apiService from '../services/apiService';
import DataTable from '../components/DataTable';
import { downloadCSV, downloadJSON } from '../utils/helpers';

const ExplorerContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
`;

const Title = styled.h2`
  margin: 0 0 10px;
  font-size: 24px;
  font-weight: 600;
`;

const Description = styled.p`
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const Sidebar = styled.div`
  width: 300px;
  border-right: 1px solid #eee;
  background: #fafafa;
  overflow-y: auto;
`;

const TableList = styled.div`
  padding: 20px;
`;

const TableItem = styled.div`
  padding: 12px 15px;
  margin-bottom: 8px;
  background: ${props => props.active ? '#667eea' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${props => props.active ? '#667eea' : '#ddd'};

  &:hover {
    background: ${props => props.active ? '#667eea' : '#f0f8ff'};
    border-color: #667eea;
  }
`;

const TableName = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
`;

const TableMeta = styled.div`
  font-size: 12px;
  opacity: 0.8;
`;

const MainArea = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  font-size: 16px;
`;

const ErrorState = styled.div`
  background: #ffebee;
  color: #c62828;
  padding: 20px;
  border-radius: 8px;
  margin: 20px;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #666;
  padding: 60px 20px;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
`;

const EmptyTitle = styled.h3`
  margin: 0 0 10px;
  color: #333;
  font-size: 20px;
`;

const EmptyText = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
`;

const TableInfo = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const TableInfoTitle = styled.h3`
  margin: 0 0 10px;
  color: #333;
  font-size: 18px;
`;

const TableStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 10px;
  background: white;
  border-radius: 6px;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #5a6fd8;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const DatabaseExplorer = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load database tables on component mount
  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getDatabaseInfo();
      setTables(data.tables || []);
    } catch (err) {
      setError('Failed to load database information: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTableData = async (tableName) => {
    try {
      setTableLoading(true);
      setError(null);
      const data = await apiService.getTableInfo(tableName);
      setTableData(data);
      setSelectedTable(tableName);
    } catch (err) {
      setError('Failed to load table data: ' + err.message);
      setTableData(null);
    } finally {
      setTableLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (tableData && tableData.sample_data) {
      downloadCSV(tableData.sample_data, `${selectedTable}_sample.csv`);
    }
  };

  const handleExportJSON = () => {
    if (tableData && tableData.sample_data) {
      downloadJSON(tableData.sample_data, `${selectedTable}_sample.json`);
    }
  };

  const handleExportFullTable = async (format) => {
    try {
      const data = await apiService.exportData(format, selectedTable);
      if (format === 'csv') {
        downloadCSV(data.data, `${selectedTable}_full.csv`);
      } else {
        downloadJSON(data.data, `${selectedTable}_full.json`);
      }
    } catch (err) {
      alert('Failed to export full table: ' + err.message);
    }
  };

  if (loading) {
    return (
      <ExplorerContainer>
        <Header>
          <Title>Database Explorer</Title>
          <Description>Browse and explore ESG database tables and data</Description>
        </Header>
        <LoadingState>Loading database information...</LoadingState>
      </ExplorerContainer>
    );
  }

  if (error) {
    return (
      <ExplorerContainer>
        <Header>
          <Title>Database Explorer</Title>
          <Description>Browse and explore ESG database tables and data</Description>
        </Header>
        <ErrorState>{error}</ErrorState>
      </ExplorerContainer>
    );
  }

  return (
    <ExplorerContainer>
      <Header>
        <Title>Database Explorer</Title>
        <Description>Browse and explore ESG database tables and data</Description>
      </Header>

      <Content>
        <Sidebar>
          <TableList>
            <h3 style={{ margin: '0 0 15px', color: '#333', fontSize: '16px' }}>
              Database Tables ({tables.length})
            </h3>
            
            {tables.length === 0 ? (
              <EmptyState>
                <EmptyIcon>📊</EmptyIcon>
                <EmptyTitle>No Tables Found</EmptyTitle>
                <EmptyText>
                  The database appears to be empty. Make sure your CSV file is loaded.
                </EmptyText>
              </EmptyState>
            ) : (
              tables.map((table) => (
                <TableItem
                  key={table}
                  active={selectedTable === table}
                  onClick={() => loadTableData(table)}
                >
                  <TableName>{table}</TableName>
                  <TableMeta>Click to explore</TableMeta>
                </TableItem>
              ))
            )}
          </TableList>
        </Sidebar>

        <MainArea>
          {!selectedTable ? (
            <EmptyState>
              <EmptyIcon>👈</EmptyIcon>
              <EmptyTitle>Select a Table</EmptyTitle>
              <EmptyText>
                Choose a table from the sidebar to view its structure and sample data.
              </EmptyText>
            </EmptyState>
          ) : tableLoading ? (
            <LoadingState>Loading table data...</LoadingState>
          ) : tableData ? (
            <>
              <TableInfo>
                <TableInfoTitle>{selectedTable}</TableInfoTitle>
                
                <TableStats>
                  <StatItem>
                    <StatValue>{tableData.total_rows}</StatValue>
                    <StatLabel>Total Rows</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{tableData.schema?.length || 0}</StatValue>
                    <StatLabel>Columns</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{tableData.sample_data?.length || 0}</StatValue>
                    <StatLabel>Sample Rows</StatLabel>
                  </StatItem>
                </TableStats>

                <ActionButtons>
                  <ActionButton onClick={handleExportCSV}>
                    Export Sample (CSV)
                  </ActionButton>
                  <ActionButton onClick={handleExportJSON}>
                    Export Sample (JSON)
                  </ActionButton>
                  <ActionButton onClick={() => handleExportFullTable('csv')}>
                    Export Full Table (CSV)
                  </ActionButton>
                  <ActionButton onClick={() => handleExportFullTable('json')}>
                    Export Full Table (JSON)
                  </ActionButton>
                </ActionButtons>
              </TableInfo>

              {tableData.sample_data && tableData.sample_data.length > 0 ? (
                <DataTable 
                  data={tableData.sample_data}
                  title={`Sample Data (showing first ${tableData.sample_data.length} rows)`}
                />
              ) : (
                <EmptyState>
                  <EmptyIcon>📊</EmptyIcon>
                  <EmptyTitle>No Data</EmptyTitle>
                  <EmptyText>This table appears to be empty.</EmptyText>
                </EmptyState>
              )}
            </>
          ) : (
            <ErrorState>Failed to load table data</ErrorState>
          )}
        </MainArea>
      </Content>
    </ExplorerContainer>
  );
};

export default DatabaseExplorer;