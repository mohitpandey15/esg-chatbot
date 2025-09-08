#!/usr/bin/env python3
"""
ESG Chatbot Setup Script
Run this script to set up the project for the first time
"""

import os
import subprocess
import sys
import shutil
from pathlib import Path

def print_step(step_num, description):
    """Print formatted step description"""
    print(f"\n{'='*60}")
    print(f"Step {step_num}: {description}")
    print(f"{'='*60}")

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("Python 3.8 or higher is required!")
        print(f"Current version: {sys.version}")
        return False
    print(f"Python version: {sys.version}")
    return True

def check_and_create_env():
    """Check if .env file exists, create from template if not"""
    env_path = Path(".env")
    env_example_path = Path(".env.example")
    
    if not env_path.exists():
        if env_example_path.exists():
            shutil.copy(env_example_path, env_path)
            print("Created .env file from template")
            print("Please edit .env file and add your API keys!")
            return True
        else:
            print(".env.example file not found!")
            return False
    else:
        print(".env file already exists")
        return True

def install_dependencies():
    """Install Python dependencies"""
    try:
        print("Installing dependencies...")
        result = subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
        ], check=True, capture_output=True, text=True)
        
        print("Dependencies installed successfully!")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"Failed to install dependencies: {e}")
        print(f"Error output: {e.stderr}")
        return False
    except FileNotFoundError:
        print("requirements.txt file not found!")
        return False

def create_directories():
    """Create necessary directories"""
    directories = [
        "logs",
        "data",
        "tests"
    ]
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"Created directory: {directory}")

def check_csv_file():
    """Check if CSV file exists"""
    csv_path = Path("Steel_Manufacturing_ESG_data.csv")
    if csv_path.exists():
        print("ESG data CSV file found")
        return True
    else:
        print("ESG data CSV file not found!")
        print("   Please add 'Steel_Manufacturing_ESG_data.csv' to the project root")
        print("   The application will work but database will be empty")
        return False

def initialize_database():
    """Initialize the database"""
    try:
        print("Initializing database...")
        
        # Import and run database initialization
        from app.database.connection import init_database
        import asyncio
        
        asyncio.run(init_database())
        print("Database initialized successfully!")
        return True
        
    except Exception as e:
        print(f"Database initialization failed: {e}")
        print("   You can try running this later with: python -c \"from app.database.connection import init_database; import asyncio; asyncio.run(init_database())\"")
        return False

def main():
    """Main setup function"""
    print("ESG Chatbot Setup")
    print("This script will set up your ESG chatbot project")
    
    success = True
    
    # Step 1: Check Python version
    print_step(1, "Checking Python version")
    if not check_python_version():
        return False
    
    # Step 2: Create directories
    print_step(2, "Creating project directories")
    create_directories()
    
    # Step 3: Check/create environment file
    print_step(3, "Setting up environment configuration")
    if not check_and_create_env():
        success = False
    
    # Step 4: Install dependencies
    print_step(4, "Installing Python dependencies")
    if not install_dependencies():
        success = False
    
    # Step 5: Check CSV file
    print_step(5, "Checking for ESG data file")
    check_csv_file()
    
    # Step 6: Initialize database
    if success:
        print_step(6, "Initializing database")
        initialize_database()
    
    print("\n" + "="*60)
    if success:
        print("Setup completed successfully!")
        print("\nNext steps:")
        print("1. Edit the .env file and add your OpenAI/Anthropic API keys")
        print("2. Add Steel_Manufacturing_ESG_data.csv to the project root (if not already present)")
        print("3. Run the backend: python main.py")
        print("4. Set up the frontend in the frontend/ directory")
    else:
        print("Setup completed with some issues")
        print("Please resolve the issues above and run setup again")
    
    print("="*60)
    
    return success

if __name__ == "__main__":
    main()