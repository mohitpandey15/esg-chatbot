import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useChat } from '../hooks/useChat';
import apiService from '../services/apiService';
import ChatMessage from '../components/ChatMessage';
import SuggestedQueries from '../components/SuggestedQueries';
import { formatDate } from '../utils/helpers';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: calc(100vh - 140px);
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const ChatHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  text-align: center;
`;

const ChatTitle = styled.h2`
  margin: 0 0 5px;
  font-size: 24px;
  font-weight: 600;
`;

const ChatSubtitle = styled.p`
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const InputContainer = styled.div`
  padding: 20px;
  border-top: 1px solid #eee;
  background: #fafafa;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-end;
`;

const TextArea = styled.textarea`
  flex: 1;
  min-height: 50px;
  max-height: 120px;
  padding: 15px;
  border: 2px solid #ddd;
  border-radius: 12px;
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }

  &::placeholder {
    color: #999;
  }
`;

const SendButton = styled.button`
  padding: 15px 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 50px;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #666;
  padding: 40px 20px;
`;

const EmptyStateIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
`;

const EmptyStateTitle = styled.h3`
  margin: 0 0 10px;
  color: #333;
  font-size: 24px;
`;

const EmptyStateText = styled.p`
  margin: 0;
  font-size: 16px;
  line-height: 1.5;
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: #f0f8ff;
  border-radius: 10px;
  margin: 10px 0;
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 4px;
  
  div {
    width: 8px;
    height: 8px;
    background: #667eea;
    border-radius: 50%;
    animation: bounce 1.4s ease-in-out infinite both;
    
    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
    &:nth-child(3) { animation-delay: 0s; }
  }
  
  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
`;

const ChatPage = () => {
  const { messages, isLoading, error, sendMessage, clearChat } = useChat();
  const [inputText, setInputText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Load suggestions on component mount
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const data = await apiService.getQuerySuggestions();
        setSuggestions(data.suggestions || []);
      } catch (error) {
        console.error('Failed to load suggestions:', error);
      }
    };
    
    loadSuggestions();
  }, []);

  const handleSend = () => {
    if (inputText.trim() && !isLoading) {
      sendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputText(suggestion);
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      clearChat();
    }
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <ChatTitle>ESG Data Assistant</ChatTitle>
        <ChatSubtitle>
          Ask questions about steel manufacturing ESG data in natural language
        </ChatSubtitle>
        {messages.length > 0 && (
          <button
            onClick={handleClearChat}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '5px',
              fontSize: '12px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Clear Chat
          </button>
        )}
      </ChatHeader>

      <MessagesContainer>
        {messages.length === 0 ? (
          <EmptyState>
            <EmptyStateIcon>🤖</EmptyStateIcon>
            <EmptyStateTitle>Welcome to ESG Data Assistant!</EmptyStateTitle>
            <EmptyStateText>
              I can help you explore steel manufacturing ESG data using natural language queries.
              Try asking about production numbers, emissions, energy usage, or any other ESG metrics.
            </EmptyStateText>
            
            {suggestions.length > 0 && (
              <SuggestedQueries 
                suggestions={suggestions}
                onSuggestionClick={handleSuggestionClick}
              />
            )}
          </EmptyState>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {isLoading && (
              <LoadingIndicator>
                <LoadingDots>
                  <div></div>
                  <div></div>
                  <div></div>
                </LoadingDots>
                <span>AI is analyzing your query and generating response...</span>
              </LoadingIndicator>
            )}
          </>
        )}
        
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputContainer>
        <InputWrapper>
          <TextArea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about ESG data... (e.g., 'Show me steel production data', 'What are the CO2 emissions?')"
            disabled={isLoading}
          />
          <SendButton 
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            {isLoading ? '...' : 'Send'}
          </SendButton>
        </InputWrapper>
        
        {error && (
          <div style={{
            color: '#d32f2f',
            fontSize: '14px',
            marginTop: '10px',
            padding: '10px',
            background: '#ffebee',
            borderRadius: '5px'
          }}>
            Error: {error}
          </div>
        )}
      </InputContainer>
    </ChatContainer>
  );
};

export default ChatPage;