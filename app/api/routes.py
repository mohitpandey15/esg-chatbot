"""
API Routes for ESG Chatbot
"""

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime

from app.database.connection import get_db, DatabaseManager
from app.services.ai_service import AIService

logger = logging.getLogger(__name__)

# Create router
router = APIRouter()

# Pydantic models
class ChatMessage(BaseModel):
    message: str
    timestamp: Optional[datetime] = None

class ChatResponse(BaseModel):
    success: bool
    message: str
    response: Optional[str] = None
    sql_query: Optional[str] = None
    results: Optional[List[Dict[str, Any]]] = None
    total_rows: Optional[int] = None
    error: Optional[str] = None
    timestamp: datetime

class DatabaseInfo(BaseModel):
    tables: List[str]
    total_tables: int

# Chat endpoint
@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    chat_message: ChatMessage,
    db: DatabaseManager = Depends(get_db)
):
    """Process natural language query and return AI response with data"""
    try:
        # Initialize AI service
        ai_service = AIService(db)
        
        # Process the message
        result = await ai_service.process_natural_language_query(chat_message.message)
        
        return ChatResponse(
            success=result["success"],
            message=result["message"],
            response=result.get("response"),
            sql_query=result.get("sql_query"),
            results=result.get("results"),
            total_rows=result.get("total_rows"),
            error=result.get("error"),
            timestamp=datetime.now()
        )
        
    except Exception as e:
        logger.error(f"Chat processing failed: {e}")
        return ChatResponse(
            success=False,
            message=chat_message.message,
            error=f"Internal server error: {str(e)}",
            timestamp=datetime.now()
        )

@router.get("/suggestions")
async def get_query_suggestions(db: DatabaseManager = Depends(get_db)):
    """Get suggested queries for users"""
    try:
        ai_service = AIService(db)
        suggestions = ai_service.get_query_suggestions()
        
        return {
            "success": True,
            "suggestions": suggestions,
            "total": len(suggestions)
        }
        
    except Exception as e:
        logger.error(f"Failed to get suggestions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get query suggestions"
        )

@router.get("/database/info", response_model=DatabaseInfo)
async def get_database_info(db: DatabaseManager = Depends(get_db)):
    """Get database structure information"""
    try:
        tables = db.get_all_tables()
        
        return DatabaseInfo(
            tables=tables,
            total_tables=len(tables)
        )
        
    except Exception as e:
        logger.error(f"Failed to get database info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get database information"
        )

@router.get("/database/table/{table_name}")
async def get_table_info(table_name: str, db: DatabaseManager = Depends(get_db)):
    """Get specific table information"""
    try:
        # Get table schema
        table_info = db.get_table_info(table_name)
        
        # Get sample data (first 5 rows)
        sample_query = f"SELECT * FROM {table_name} LIMIT 5"
        sample_data = db.execute_query(sample_query)
        
        # Get row count
        count_query = f"SELECT COUNT(*) as total_rows FROM {table_name}"
        count_result = db.execute_query(count_query)
        total_rows = count_result[0]["total_rows"] if count_result else 0
        
        return {
            "success": True,
            "table_name": table_name,
            "schema": table_info,
            "sample_data": sample_data,
            "total_rows": total_rows
        }
        
    except Exception as e:
        logger.error(f"Failed to get table info for {table_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get information for table {table_name}"
        )

@router.post("/database/query")
async def execute_custom_query(
    query_data: dict,
    db: DatabaseManager = Depends(get_db)
):
    """Execute a custom SQL query (for advanced users)"""
    try:
        query = query_data.get("query", "").strip()
        
        if not query:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Query cannot be empty"
            )
        
        # Security check - only allow SELECT statements
        if not query.upper().strip().startswith("SELECT"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only SELECT queries are allowed"
            )
        
        # Execute the query
        results = db.execute_query(query)
        
        return {
            "success": True,
            "query": query,
            "results": results,
            "total_rows": len(results)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Custom query execution failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Query execution failed: {str(e)}"
        )

@router.get("/export/{format}")
async def export_data(
    format: str,
    table_name: Optional[str] = None,
    query: Optional[str] = None,
    db: DatabaseManager = Depends(get_db)
):
    """Export data in various formats (CSV, JSON)"""
    try:
        if format.lower() not in ["csv", "json"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Supported formats: csv, json"
            )
        
        # Determine what to export
        if query:
            if not query.upper().strip().startswith("SELECT"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Only SELECT queries are allowed"
                )
            results = db.execute_query(query)
        elif table_name:
            results = db.execute_query(f"SELECT * FROM {table_name}")
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either table_name or query parameter is required"
            )
        
        if format.lower() == "json":
            return {
                "success": True,
                "format": "json",
                "data": results,
                "total_rows": len(results)
            }
        
        # For CSV format, we'll return the data and let the frontend handle CSV conversion
        return {
            "success": True,
            "format": "csv",
            "data": results,
            "total_rows": len(results)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Data export failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Export failed: {str(e)}"
        )