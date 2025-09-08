"""
Debug script to test OpenAI API connection and database - Fully Updated for OpenAI v1.0+
"""

import os
import asyncio
from dotenv import load_dotenv
from openai import OpenAI  # Import the new client class
from app.core.config import get_settings
from app.database.connection import DatabaseManager
from app.services.ai_service import AIService

async def debug_setup():
    """Debug the ESG chatbot setup"""
    
    print(" ESG Chatbot Debug Report (v1.0+ Compatible)")
    print("=" * 60)
    
    # Load environment variables
    load_dotenv()
    
    # Check 1: Environment Variables
    print("\n Environment Variables:")
    settings = get_settings()
    
    openai_key = settings.openai_api_key
    if openai_key:
        print(f" OpenAI API Key: Found (starts with '{openai_key[:10]}...')")
    else:
        print(" OpenAI API Key: Missing!")
        print(" Please add OPENAI_API_KEY to your .env file")
        return False
    
    print(f" Database URL: {settings.database_url}")
    print(f" AI Provider: {settings.default_ai_provider}")
    
    # Check 2: OpenAI API Connection (using new v1.0+ API format)
    print("\n Testing OpenAI API Connection (New v1.0+ Format):")
    try:
        # Create OpenAI client using new format
        client = OpenAI(api_key=openai_key)
        
        # Test with a simple completion using new API format
        print("   Making test API call...")
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",  # Using cheaper model for testing
            messages=[{
                "role": "user", 
                "content": "Hello, can you respond with just 'API Working'?"
            }],
            max_tokens=10,
            temperature=0.1
        )
        
        result = response.choices[0].message.content.strip()
        print(f" OpenAI API Response: '{result}'")
        print(" OpenAI API is working correctly with new v1.0+ format!")
        
    except Exception as e:
        print(f" OpenAI API Error: {e}")
        print("\n Troubleshooting:")
        print(" 1. Check your API key is valid")
        print(" 2. Check you have credits remaining")
        print(" 3. Check your internet connection")
        print(" 4. Visit: https://platform.openai.com/account/usage")
        return False
    
    # Check 3: Database Connection
    print("\n Testing Database:")
    try:
        db_manager = DatabaseManager()
        tables = db_manager.get_all_tables()
        print(f" Database connected. Found {len(tables)} tables:")
        
        if len(tables) == 0:
            print(" No tables found. Database might be empty.")
            print(" CSV file location: Steel_Manufacturing_ESG_data.csv")
            print(" Try running database initialization...")
            return False
        
        for table in tables[:5]:  # Show first 5 tables
            try:
                sample = db_manager.execute_query(f"SELECT COUNT(*) as count FROM {table}")
                count = sample[0]['count'] if sample else 0
                print(f" {table}: {count} rows")
            except Exception as e:
                print(f" {table}: Error - {e}")
            
    except Exception as e:
        print(f" Database Error: {e}")
        return False
    
    # Check 4: AI Service Integration
    print("\n Testing AI Service:")
    try:
        db_manager = DatabaseManager()
        ai_service = AIService(db_manager)
        
        # Test a simple query
        test_query = "Show me production data"
        print(f" Testing with query: '{test_query}'")
        
        result = await ai_service.process_natural_language_query(test_query)
        
        if result["success"]:
            print(f" AI Service Working!")
            print(f" Generated SQL: {result.get('sql_query', 'N/A')[:80]}...")
            print(f" Returned: {result.get('total_rows', 0)} rows")
            print(f" Response preview: {result.get('response', '')[:100]}...")
        else:
            print(f" AI Service Error: {result.get('error', 'Unknown error')}")
            print(f" This might be due to:")
            print(f" - Empty database tables")
            print(f" - SQL generation issues")
            return False
            
    except Exception as e:
        print(f" AI Service Error: {e}")
        print(f" Full error details: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    
    print("\n" + "=" * 60)
    print(" ALL SYSTEMS WORKING! Your chatbot is ready!")
    print("=" * 60)
    
    print("\n Now try these test queries in your chatbot:")
    print(" 'Show me steel production data'")
    print(" 'What are the CO2 emissions?'")
    print(" 'What is the equipment efficiency data?'")
    print(" 'Show me all available tables'")
    print(" 'What was the highest production month?'")
    
    print("\n Access your chatbot at:")
    print(" Frontend: http://localhost:3000")
    print(" Backend API: http://localhost:8000/docs")
    
    return True

if __name__ == "__main__":
    asyncio.run(debug_setup())
