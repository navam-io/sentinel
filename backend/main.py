"""
Sentinel Backend API Server.

FastAPI application for test execution and provider management.
"""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.execution import router as execution_router
from .api.providers import router as providers_router
from .api.tests import router as tests_router
from .executor import ExecutorConfig, TestExecutor
from .storage import get_database

# Initialize FastAPI app
app = FastAPI(
    title="Sentinel API",
    description="AI Agent Testing and Evaluation Platform",
    version="0.10.0",
)

# Configure CORS for Tauri frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:1420", "tauri://localhost", "http://tauri.localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize test executor with environment variables
executor_config = ExecutorConfig(
    anthropic_api_key=os.getenv("ANTHROPIC_API_KEY"),
    openai_api_key=os.getenv("OPENAI_API_KEY"),
)
executor = TestExecutor(executor_config)

# Store executor in app state
app.state.executor = executor

# Initialize database
database = get_database()

# Include routers
app.include_router(execution_router, prefix="/api/execution", tags=["execution"])
app.include_router(providers_router, prefix="/api/providers", tags=["providers"])
app.include_router(tests_router, prefix="/api/tests", tags=["tests"])


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "name": "Sentinel API",
        "version": "0.10.0",
        "status": "running",
    }


@app.get("/health")
async def health():
    """Health check for monitoring."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
