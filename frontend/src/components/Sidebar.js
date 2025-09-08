import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const SidebarContainer = styled.aside`
  width: 250px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  padding: 20px 0;
  display: flex;
  flex-direction: column;
`;

const NavSection = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 20px 15px;
  font-weight: 600;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  &.active {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    border-left-color: #fff;
  }
`;

const Icon = styled.span`
  font-size: 18px;
  width: 20px;
  text-align: center;
`;

const QuickActions = styled.div`
  margin-top: auto;
  padding: 20px;
`;

const QuickButton = styled.button`
  width: 100%;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 10px;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const Version = styled.div`
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 11px;
  margin-top: 15px;
`;

const Sidebar = () => {
  const handleClearStorage = () => {
    if (window.confirm('Are you sure you want to clear all stored data?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleRefreshData = () => {
    window.location.reload();
  };

  return (
    <SidebarContainer>
      <NavSection>
        <SectionTitle>Main</SectionTitle>
        <NavItem to="/chat">
          <Icon>💬</Icon>
          Chat Interface
        </NavItem>
        <NavItem to="/database">
          <Icon>🗄️</Icon>
          Database Explorer
        </NavItem>
      </NavSection>

      <NavSection>
        <SectionTitle>Tools</SectionTitle>
        <NavItem to="/export" onClick={(e) => {
          e.preventDefault();
          alert('Export functionality available in chat and database views');
        }}>
          <Icon>📥</Icon>
          Export Data
        </NavItem>
      </NavSection>

      <QuickActions>
        <SectionTitle>Quick Actions</SectionTitle>
        <QuickButton onClick={handleRefreshData}>
          🔄 Refresh Data
        </QuickButton>
        <QuickButton onClick={handleClearStorage}>
          🗑️ Clear Storage
        </QuickButton>
        
        <Version>
          v1.0.0
        </Version>
      </QuickActions>
    </SidebarContainer>
  );
};

export default Sidebar;