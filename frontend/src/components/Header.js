import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import apiService from '../services/apiService';

const HeaderContainer = styled.header`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 15px 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
`;

const LogoText = styled.h1`
  color: #333;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const ConnectionStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  background: ${props => props.connected ? '#e8f5e8' : '#ffe8e8'};
  color: ${props => props.connected ? '#2e7d32' : '#d32f2f'};
  font-size: 14px;
  font-weight: 500;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.connected ? '#4caf50' : '#f44336'};
  animation: ${props => props.connected ? 'pulse 2s infinite' : 'none'};
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const LastUpdated = styled.div`
  font-size: 12px;
  color: #666;
  text-align: right;
`;

const Header = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);

  const checkConnection = async () => {
    try {
      await apiService.healthCheck();
      setIsConnected(true);
      setLastCheck(new Date());
    } catch (error) {
      setIsConnected(false);
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    // Initial check
    checkConnection();
    
    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <HeaderContainer>
      <Logo>
        <LogoIcon>ESG</LogoIcon>
        <LogoText>ESG Data Chatbot</LogoText>
      </Logo>
      
      <StatusIndicator>
        <ConnectionStatus connected={isConnected}>
          <StatusDot connected={isConnected} />
          {isConnected ? 'Backend Connected' : 'Backend Disconnected'}
        </ConnectionStatus>
        
        {lastCheck && (
          <LastUpdated>
            Last checked: {formatTime(lastCheck)}
          </LastUpdated>
        )}
      </StatusIndicator>
    </HeaderContainer>
  );
};

export default Header;