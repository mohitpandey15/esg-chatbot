import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  margin-top: 30px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const Title = styled.h3`
  text-align: center;
  color: #333;
  font-size: 18px;
  margin-bottom: 20px;
  font-weight: 600;
`;

const SuggestionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
`;

const SuggestionItem = styled.button`
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  padding: 15px;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  color: #333;
  line-height: 1.4;
  font-family: inherit;

  &:hover {
    border-color: #667eea;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SuggestionIcon = styled.span`
  display: inline-block;
  margin-right: 8px;
  font-size: 16px;
`;

const SuggestedQueries = ({ suggestions, onSuggestionClick }) => {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  // Icons for different types of queries
  const getIcon = (suggestion) => {
    const lower = suggestion.toLowerCase();
    if (lower.includes('production') || lower.includes('output') || lower.includes('steel')) return '🏭';
    if (lower.includes('emission') || lower.includes('co2') || lower.includes('carbon')) return '🌱';
    if (lower.includes('water') || lower.includes('consumption')) return '💧';
    if (lower.includes('energy') || lower.includes('power') || lower.includes('renewable')) return '⚡';
    if (lower.includes('waste') || lower.includes('recycling')) return '♻️';
    if (lower.includes('fuel') || lower.includes('gas')) return '⛽';
    if (lower.includes('efficiency') || lower.includes('equipment')) return '🔧';
    if (lower.includes('trend') || lower.includes('monthly') || lower.includes('time')) return '📈';
    return '💬';
  };

  return (
    <Container>
      <Title>💡 Try these sample queries:</Title>
      <SuggestionsGrid>
        {suggestions.map((suggestion, index) => (
          <SuggestionItem
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
          >
            <SuggestionIcon>{getIcon(suggestion)}</SuggestionIcon>
            {suggestion}
          </SuggestionItem>
        ))}
      </SuggestionsGrid>
    </Container>
  );
};

export default SuggestedQueries;