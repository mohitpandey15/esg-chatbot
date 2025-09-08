import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { downloadCSV, downloadJSON, formatNumber, getDataType, getTypeColor } from '../utils/helpers';

const TableContainer = styled.div`
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const TableHeader = styled.div`
  background: #f8f9fa;
  padding: 15px 20px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TableTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #333;
  font-weight: 600;
`;

const TableActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  background: ${props => props.variant === 'primary' ? '#667eea' : '#6c757d'};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${props => props.variant === 'primary' ? '#5a6fd8' : '#5a6268'};
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  max-height: ${props => props.maxHeight || '400px'};
  overflow-y: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
`;

const TableHead = styled.thead`
  background: #f8f9fa;
  position: sticky;
  top: 0;
  z-index: 1;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background: #f8f9fa;
  }

  &:hover {
    background: #e3f2fd;
  }
`;

const TableHeaderCell = styled.th`
  padding: 12px 15px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
  white-space: nowrap;
  position: relative;
  cursor: pointer;
  user-select: none;

  &:hover {
    background: #e9ecef;
  }
`;

const TableCell = styled.td`
  padding: 10px 15px;
  border-bottom: 1px solid #dee2e6;
  vertical-align: top;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DataType = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.color};
  margin-right: 6px;
`;

const SortIcon = styled.span`
  margin-left: 5px;
  opacity: 0.6;
`;

const CellValue = styled.span`
  ${props => {
    const type = getDataType(props.value);
    if (type === 'number') {
      return 'font-weight: 600; color: #28a745;';
    }
    if (type === 'date') {
      return 'color: #fd7e14;';
    }
    return 'color: #333;';
  }}
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
`;

const PaginationInfo = styled.div`
  font-size: 14px;
  color: #6c757d;
`;

const PaginationControls = styled.div`
  display: flex;
  gap: 5px;
`;

const PageButton = styled.button`
  padding: 6px 10px;
  border: 1px solid #dee2e6;
  background: ${props => props.active ? '#667eea' : 'white'};
  color: ${props => props.active ? 'white' : '#495057'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;

  &:hover:not(:disabled) {
    background: ${props => props.active ? '#5a6fd8' : '#e9ecef'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ExpandableCell = styled.div`
  cursor: pointer;
  
  &:hover {
    color: #667eea;
  }
`;

const ExpandedContent = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 80vw;
  max-height: 80vh;
  overflow: auto;
  z-index: 1000;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const DataTable = ({ 
  data, 
  title = "Data Table", 
  maxRows = null, 
  showExport = false,
  maxHeight = "400px"
}) => {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCell, setExpandedCell] = useState(null);
  
  const rowsPerPage = 10;

  // Memoized sorted and paginated data
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    let sortedData = [...data];

    // Apply sorting
    if (sortColumn) {
      sortedData.sort((a, b) => {
        let aVal = a[sortColumn];
        let bVal = b[sortColumn];

        // Handle null/undefined values
        if (aVal == null) return 1;
        if (bVal == null) return -1;

        // Convert to numbers if possible
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
        }

        // String comparison
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        
        if (sortDirection === 'asc') {
          return aStr.localeCompare(bStr);
        } else {
          return bStr.localeCompare(aStr);
        }
      });
    }

    // Apply row limit if specified
    if (maxRows) {
      sortedData = sortedData.slice(0, maxRows);
    }

    return sortedData;
  }, [data, sortColumn, sortDirection, maxRows]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = processedData.slice(startIndex, endIndex);

  if (!data || data.length === 0) {
    return (
      <TableContainer>
        <TableHeader>
          <TableTitle>{title}</TableTitle>
        </TableHeader>
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          No data available
        </div>
      </TableContainer>
    );
  }

  const columns = Object.keys(data[0]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handleExport = (format) => {
    const exportData = maxRows ? data.slice(0, maxRows) : data;
    const filename = `${title.toLowerCase().replace(/\s+/g, '_')}.${format}`;
    
    if (format === 'csv') {
      downloadCSV(exportData, filename);
    } else {
      downloadJSON(exportData, filename);
    }
  };

  const formatCellValue = (value) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'number') return formatNumber(value);
    if (typeof value === 'string' && value.length > 50) {
      return value.substring(0, 50) + '...';
    }
    return String(value);
  };

  const handleCellClick = (value, column, rowIndex) => {
    if (typeof value === 'string' && value.length > 50) {
      setExpandedCell({ value, column, rowIndex });
    }
  };

  const getSortIcon = (column) => {
    if (sortColumn !== column) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <>
      <TableContainer>
        <TableHeader>
          <TableTitle>{title}</TableTitle>
          <TableActions>
            {showExport && (
              <>
                <ActionButton onClick={() => handleExport('csv')}>
                  Export CSV
                </ActionButton>
                <ActionButton onClick={() => handleExport('json')}>
                  Export JSON
                </ActionButton>
              </>
            )}
          </TableActions>
        </TableHeader>

        <TableWrapper maxHeight={maxHeight}>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableHeaderCell 
                    key={column} 
                    onClick={() => handleSort(column)}
                  >
                    <DataType color={getTypeColor(getDataType(data[0][column]))} />
                    {column}
                    <SortIcon>{getSortIcon(column)}</SortIcon>
                  </TableHeaderCell>
                ))}
              </TableRow>
            </TableHead>
            <tbody>
              {currentData.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column}>
                      <ExpandableCell 
                        onClick={() => handleCellClick(row[column], column, index)}
                      >
                        <CellValue value={row[column]}>
                          {formatCellValue(row[column])}
                        </CellValue>
                      </ExpandableCell>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </tbody>
          </Table>
        </TableWrapper>

        {/* Pagination */}
        {totalPages > 1 && (
          <PaginationContainer>
            <PaginationInfo>
              Showing {startIndex + 1}-{Math.min(endIndex, processedData.length)} of {processedData.length} rows
            </PaginationInfo>
            
            <PaginationControls>
              <PageButton 
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </PageButton>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === totalPages || 
                  Math.abs(page - currentPage) <= 2
                )
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && <span>...</span>}
                    <PageButton
                      active={page === currentPage}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </PageButton>
                  </React.Fragment>
                ))
              }
              
              <PageButton 
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </PageButton>
            </PaginationControls>
          </PaginationContainer>
        )}
      </TableContainer>

      {/* Expanded Cell Modal */}
      {expandedCell && (
        <>
          <Overlay onClick={() => setExpandedCell(null)} />
          <ExpandedContent>
            <h3>Column: {expandedCell.column}</h3>
            <pre style={{ 
              whiteSpace: 'pre-wrap', 
              wordWrap: 'break-word',
              maxHeight: '60vh',
              overflow: 'auto',
              background: '#f8f9fa',
              padding: '15px',
              borderRadius: '4px'
            }}>
              {expandedCell.value}
            </pre>
            <button 
              onClick={() => setExpandedCell(null)}
              style={{
                marginTop: '15px',
                padding: '8px 16px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </ExpandedContent>
        </>
      )}
    </>
  );
};

export default DataTable;