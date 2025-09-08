"""
AI Service for Natural Language to SQL Conversion - Updated for OpenAI v1.0+
"""

import openai
import anthropic
import json
import logging
from typing import Dict, Any, List, Optional, Union
from app.core.config import get_settings
from app.database.connection import DatabaseManager

logger = logging.getLogger(__name__)

class AIService:
    """AI service for natural language processing and SQL generation"""
    
    def __init__(self, db_manager: DatabaseManager):
        self.settings = get_settings()
        self.db_manager = db_manager
        
        # Initialize AI clients with new API format
        if self.settings.openai_api_key:
            self.openai_client = openai.OpenAI(api_key=self.settings.openai_api_key)
        
        if self.settings.anthropic_api_key:
            self.anthropic_client = anthropic.Anthropic(api_key=self.settings.anthropic_api_key)
    
    async def process_natural_language_query(self, message: str) -> Dict[str, Any]:
        """Process natural language query and return SQL + results"""
        try:
            logger.info(f"Processing query: {message}")
            
            # Get database schema context
            schema_context = self._get_schema_context()
            logger.info("Retrieved database schema context")
            
            # Generate SQL query using AI
            sql_query = await self._generate_sql_query(message, schema_context)
            logger.info(f"Generated SQL query: {sql_query}")
            
            if not sql_query:
                return {
                    "success": False,
                    "error": "Could not generate SQL query from your message",
                    "message": message
                }
            
            # Execute the query
            try:
                results = self.db_manager.execute_query(sql_query)
                logger.info(f"Query executed successfully, returned {len(results)} rows")
                
                # Generate human-readable response
                response_text = await self._generate_response_text(message, sql_query, results)
                
                return {
                    "success": True,
                    "message": message,
                    "sql_query": sql_query,
                    "results": results,
                    "response": response_text,
                    "total_rows": len(results)
                }
                
            except Exception as e:
                logger.error(f"SQL execution failed: {e}")
                return {
                    "success": False,
                    "error": f"Database query failed: {str(e)}",
                    "message": message,
                    "sql_query": sql_query
                }
                
        except Exception as e:
            logger.error(f"AI processing failed: {e}")
            return {
                "success": False,
                "error": f"AI processing failed: {str(e)}",
                "message": message
            }
    
    async def _generate_sql_query(self, message: str, schema_context: str) -> Optional[str]:
        """Generate SQL query from natural language"""
        
        system_prompt = f"""You are an expert SQL query generator for ESG (Environmental, Social, Governance) data from steel manufacturing operations.

Database Schema:
{schema_context}

Your task is to convert natural language questions into valid SQLite queries. 

Rules:
1. Only generate SELECT statements
2. Use proper SQLite syntax
3. Handle case-insensitive column matching
4. Use appropriate JOINs when needed
5. Add sensible LIMIT clauses for large datasets (default 100)
6. Return only the SQL query, no explanations
7. If the question is unclear, make reasonable assumptions
8. Use column aliases for better readability

Examples:
- "Show me steel production data" → "SELECT * FROM production LIMIT 100"
- "What was the total CO2 emission?" → "SELECT SUM(total_co2) as total_co2_emissions FROM emission"
- "Show monthly steel production" → "SELECT April, May, June, July, August, September, October, November, December, January, February, March FROM production WHERE Parameter LIKE '%steel%production%'"

Question: {message}

SQL Query:"""

        try:
            if self.settings.default_ai_provider == "anthropic" and self.settings.anthropic_api_key:
                return await self._call_anthropic(system_prompt, message)
            elif self.settings.openai_api_key:
                return await self._call_openai(system_prompt, message)
            else:
                raise Exception("No AI provider configured")
                
        except Exception as e:
            logger.error(f"AI query generation failed: {e}")
            return None
    
    async def _call_openai(self, system_prompt: str, user_message: str) -> Optional[str]:
        """Call OpenAI API using new v1.0+ format"""
        try:
            logger.info("Calling OpenAI API...")
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                max_tokens=self.settings.max_tokens,
                temperature=self.settings.temperature
            )
            
            sql_query = response.choices[0].message.content.strip()
            
            # Clean up the response
            if sql_query.startswith("```sql"):
                sql_query = sql_query[6:]
            if sql_query.endswith("```"):
                sql_query = sql_query[:-3]
            
            logger.info(f"OpenAI API responded successfully")
            return sql_query.strip()
            
        except Exception as e:
            logger.error(f"OpenAI API call failed: {e}")
            return None
    
    async def _call_anthropic(self, system_prompt: str, user_message: str) -> Optional[str]:
        """Call Anthropic Claude API"""
        try:
            response = self.anthropic_client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=self.settings.max_tokens,
                temperature=self.settings.temperature,
                system=system_prompt,
                messages=[{"role": "user", "content": user_message}]
            )
            
            sql_query = response.content[0].text.strip()
            
            # Clean up the response
            if sql_query.startswith("```sql"):
                sql_query = sql_query[6:]
            if sql_query.endswith("```"):
                sql_query = sql_query[:-3]
            
            return sql_query.strip()
            
        except Exception as e:
            logger.error(f"Anthropic API call failed: {e}")
            return None
    
    async def _generate_response_text(self, original_message: str, sql_query: str, results: List[Dict[str, Any]]) -> str:
        """Generate human-readable response from query results"""
        
        if not results:
            return f"No data found for your query: '{original_message}'"
        
        # Create a summary of the results
        result_summary = f"Found {len(results)} records"
        
        if len(results) <= 5:
            # Show all results for small datasets
            response = f"Here are the results for '{original_message}':\n\n"
            for i, row in enumerate(results, 1):
                response += f"Record {i}:\n"
                for key, value in row.items():
                    if value is not None:
                        response += f"  {key}: {value}\n"
                response += "\n"
        else:
            # Show summary for larger datasets
            response = f"Here's a summary for '{original_message}':\n\n"
            response += f"Total records found: {len(results)}\n\n"
            response += "Sample of first 3 records:\n"
            for i in range(min(3, len(results))):
                response += f"\nRecord {i+1}:\n"
                for key, value in list(results[i].items())[:5]:  # Show first 5 columns
                    if value is not None:
                        response += f"  {key}: {value}\n"
            
            if len(results) > 3:
                response += f"\n... and {len(results) - 3} more records"
        
        return response
    
    def _get_schema_context(self) -> str:
        """Get database schema context for AI"""
        try:
            tables = self.db_manager.get_all_tables()
            schema_info = []
            
            logger.info(f"Found {len(tables)} tables in database")
            
            for table in tables[:10]:  # Limit to first 10 tables to avoid token limits
                try:
                    table_info = self.db_manager.get_table_info(table)
                    columns = [f"{col['name']} ({col['type']})" for col in table_info]
                    schema_info.append(f"Table: {table}\nColumns: {', '.join(columns)}\n")
                except Exception as e:
                    logger.warning(f"Could not get info for table {table}: {e}")
            
            schema_context = "\n".join(schema_info)
            logger.info("Schema context generated successfully")
            return schema_context
            
        except Exception as e:
            logger.error(f"Failed to get schema context: {e}")
            return "Schema information not available"
    
    def get_query_suggestions(self) -> List[str]:
        """Get suggested queries for users"""
        return [
            "Show me steel production data for the last 6 months",
            "What are the total CO2 emissions?",
            "Show water consumption trends",
            "What was the highest monthly steel output?",
            "Show me renewable energy usage",
            "What types of waste were generated?",
            "Show power consumption data",
            "What are the emission trends by month?",
            "Show me fuel consumption by type",
            "What is the equipment efficiency data?"
        ]