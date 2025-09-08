import React, { useState } from 'react';
import styled from 'styled-components';
import DataTable from './DataTable';
import { formatDate, copyToClipboard } from '../utils/helpers';

const MessageContainer = styled.div`
  display: flex;
  flex-direction: ${props => props.type === 'user' ? 'row-reverse' : 'row'};
  gap: 12px;
  margin-bottom: 20px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  flex-shrink: 0;
  
  ${props => props.type === 'user' 
    ? `
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
      color: white;
    `
    : props.type === 'error'
    ? `
      background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
      color: white;
    `
    : `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    `
  }
`;

const MessageContent = styled.div`
  flex: 1;
  max-width: 70%;
`;

const MessageBubble = styled.div`
  padding: 15px 20px;
  border-radius: 18px;
  font-size: 16px;
  line-height: 1.5;
  position: relative;
  
  ${props => props.type === 'user' 
    ? `
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
      color: white;
      border-bottom-right-radius: 6px;
    `
    : props.type === 'error'
    ? `
      background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
      color: #c62828;
      border: 1px solid #ef5350;
      border-bottom-left-radius: 6px;
    `
    : `
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      color: #333;
      border: 1px solid #dee2e6;
      border-bottom-left-radius: 6px;
    `
  }
`;

const MessageMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  font-size: 12px;
  color: #666;
  ${props => props.type === 'user' ? 'justify-content: flex-end;' : ''}
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
  }
`;

const SQLSection = styled.div`
  margin-top: 15px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
`;

const SQLHeader = styled.div`
  background: #343a40;
  color: white;
  padding: 10px 15px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  justify-content: between;
  align-items: center;
`;

const SQLCode = styled.pre`
  margin: 0;
  padding: 15px;
  background: #f8f9fa;
  color: #495057;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const ResultsSection = styled.div`
  margin-top: 15px;
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const ResultsTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  color: #333;
`;

const ResultsCount = styled.span`
  background: #667eea;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

const CopyButton = styled.button`
  background: #667eea;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #5a6fd8;
  }
`;

const ChatMessage = ({ message }) => {
  const [showSQL, setShowSQL] = useState(false);
  const [copiedSQL, setCopiedSQL] = useState(false);

  const getAvatarText = () => {
    switch (message.type) {
      case 'user': return '👤';
      case 'error': return '❌';
      default: return '🤖';
    }
  };

  const handleCopySQL = async () => {
    if (message.sqlQuery) {
      const success = await copyToClipboard(message.sqlQuery);
      if (success) {
        setCopiedSQL(true);
        setTimeout(() => setCopiedSQL(false), 2000);
      }
    }
  };

  const toggleSQL = () => {
    setShowSQL(!showSQL);
  };

  return (
    <MessageContainer type={message.type}>
      <Avatar type={message.type}>
        {getAvatarText()}
      </Avatar>
      
      <MessageContent>
        <MessageBubble type={message.type}>
          {message.content}
        </MessageBubble>
        
        <MessageMeta type={message.type}>
          <span>{formatDate(message.timestamp)}</span>
          
          {message.sqlQuery && (
            <ActionButton onClick={toggleSQL}>
              {showSQL ? 'Hide SQL' : 'Show SQL'}
            </ActionButton>
          )}
          
          {message.totalRows && (
            <span>{message.totalRows} rows returned</span>
          )}
        </MessageMeta>

        {/* SQL Query Section */}
        {showSQL && message.sqlQuery && (
          <SQLSection>
            <SQLHeader>
              Generated SQL Query
              <CopyButton onClick={handleCopySQL}>
                {copiedSQL ? 'Copied!' : 'Copy'}
              </CopyButton>
            </SQLHeader>
            <SQLCode>{message.sqlQuery}</SQLCode>
          </SQLSection>
        )}

        {/* Results Section */}
        {message.results && message.results.length > 0 && (
          <ResultsSection>
            <ResultsHeader>
              <ResultsTitle>Query Results</ResultsTitle>
              <ResultsCount>{message.results.length} rows</ResultsCount>
            </ResultsHeader>
            
            <DataTable 
              data={message.results}
              maxRows={10}
              showExport={true}
            />
          </ResultsSection>
        )}
      </MessageContent>
    </MessageContainer>
  );
};

export default ChatMessage;