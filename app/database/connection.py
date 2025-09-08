"""
Database Connection and Session Management
"""

import sqlite3
import pandas as pd
import logging
from typing import Optional, Dict, Any, List
from contextlib import asynccontextmanager
import os
import asyncio
from app.core.config import get_settings

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Database connection and management class"""
    
    def __init__(self):
        self.settings = get_settings()
        self.db_path = self.settings.database_url.replace("sqlite:///", "")
        self._connection: Optional[sqlite3.Connection] = None
    
    def get_connection(self) -> sqlite3.Connection:
        """Get database connection"""
        if self._connection is None:
            self._connection = sqlite3.connect(self.db_path, check_same_thread=False)
            self._connection.row_factory = sqlite3.Row  # Enable dict-like access
        return self._connection
    
    def execute_query(self, query: str, params: tuple = ()) -> List[Dict[str, Any]]:
        """Execute a SELECT query and return results"""
        try:
            conn = self.get_connection()
            cursor = conn.execute(query, params)
            columns = [description[0] for description in cursor.description]
            rows = cursor.fetchall()
            
            # Convert to list of dictionaries
            result = []
            for row in rows:
                result.append({columns[i]: row[i] for i in range(len(columns))})
            
            return result
        except Exception as e:
            logger.error(f"Query execution failed: {e}")
            raise
    
    def execute_non_query(self, query: str, params: tuple = ()) -> int:
        """Execute INSERT, UPDATE, DELETE queries"""
        try:
            conn = self.get_connection()
            cursor = conn.execute(query, params)
            conn.commit()
            return cursor.rowcount
        except Exception as e:
            logger.error(f"Non-query execution failed: {e}")
            raise
    
    def get_table_info(self, table_name: str) -> List[Dict[str, Any]]:
        """Get table schema information"""
        query = f"PRAGMA table_info({table_name})"
        return self.execute_query(query)
    
    def get_all_tables(self) -> List[str]:
        """Get all table names"""
        query = "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
        results = self.execute_query(query)
        return [row['name'] for row in results]
    
    def close(self):
        """Close database connection"""
        if self._connection:
            self._connection.close()
            self._connection = None

# Global database manager instance
db_manager = DatabaseManager()

def get_db() -> DatabaseManager:
    """Dependency to get database manager"""
    return db_manager

async def init_database():
    """Initialize database with ESG data"""
    try:
        logger.info("Initializing database...")
        
        # Check if CSV file exists
        csv_path = "Steel_Manufacturing_ESG_data.csv"
        if not os.path.exists(csv_path):
            logger.warning(f"CSV file not found at {csv_path}")
            logger.info("Database initialized without data. Please add the CSV file and run initialization again.")
            return
        
        # Read CSV data
        logger.info("Reading CSV data...")
        df = pd.read_csv(csv_path)
        
        # Get database connection
        conn = db_manager.get_connection()
        
        # Create tables from CSV sections
        create_tables_from_csv(df, conn)
        
        logger.info("Database initialization completed successfully")
        
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise

def create_tables_from_csv(df: pd.DataFrame, conn: sqlite3.Connection):
    """Create tables from CSV data sections"""
    
    # Find section breaks in the CSV (rows with data in first column but empty in others)
    sections = identify_csv_sections(df)
    
    for section_name, section_data in sections.items():
        if len(section_data) > 0:
            table_name = section_name.lower().replace(' ', '_').replace('&', 'and')
            logger.info(f"Creating table: {table_name}")
            
            try:
                # Clean the data and create table
                clean_data = clean_section_data(section_data)
                if not clean_data.empty:
                    clean_data.to_sql(table_name, conn, if_exists='replace', index=False)
                    logger.info(f"Created table {table_name} with {len(clean_data)} rows")
            except Exception as e:
                logger.error(f"Failed to create table {table_name}: {e}")

def identify_csv_sections(df: pd.DataFrame) -> Dict[str, pd.DataFrame]:
    """Identify different sections in the CSV file"""
    sections = {}
    current_section = "PRODUCTION"
    current_data = []
    
    for idx, row in df.iterrows():
        # Check if this is a section header
        if pd.notna(row.iloc[0]) and pd.isna(row.iloc[1]) and pd.isna(row.iloc[2]):
            if row.iloc[0].strip().isupper() and len(row.iloc[0].strip().split()) <= 3:
                # Save previous section
                if current_data:
                    sections[current_section] = pd.DataFrame(current_data)
                
                # Start new section
                current_section = row.iloc[0].strip()
                current_data = []
                continue
        
        # Add data to current section
        if pd.notna(row.iloc[0]):
            current_data.append(row)
    
    # Add the last section
    if current_data:
        sections[current_section] = pd.DataFrame(current_data)
    
    return sections

def clean_section_data(data: pd.DataFrame) -> pd.DataFrame:
    """Clean section data for database insertion"""
    if data.empty:
        return data
    
    # Remove empty rows
    data = data.dropna(how='all')
    
    # Clean column names
    data.columns = [f"col_{i}" if pd.isna(col) or col == '' else str(col).strip() 
                   for i, col in enumerate(data.columns)]
    
    # Convert data types appropriately
    for col in data.columns:
        if col in ['April', 'May', 'June', 'July', 'August', 'September', 
                  'October', 'November', 'December', 'January', 'February', 'March', 'YOD']:
            data[col] = pd.to_numeric(data[col], errors='coerce')
    
    return data