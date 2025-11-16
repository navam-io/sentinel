"""
Provider management API endpoints.
"""

from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import List, Dict

router = APIRouter()


class ProviderInfo(BaseModel):
    """Information about a provider."""

    name: str
    configured: bool
    models: List[str]


class ProvidersResponse(BaseModel):
    """Response with list of available providers."""

    providers: List[ProviderInfo]


@router.get("/list", response_model=ProvidersResponse)
async def list_providers(app_request: Request):
    """List all available providers and their status.

    Args:
        app_request: FastAPI request object to access app state

    Returns:
        ProvidersResponse with provider information
    """
    executor = app_request.app.state.executor

    providers_info = []

    # Anthropic provider
    anthropic_provider = executor.providers.get("anthropic")
    if anthropic_provider:
        providers_info.append(
            ProviderInfo(
                name="anthropic",
                configured=True,
                models=anthropic_provider.list_models(),
            )
        )
    else:
        providers_info.append(
            ProviderInfo(
                name="anthropic",
                configured=False,
                models=[],
            )
        )

    # OpenAI provider (future)
    openai_provider = executor.providers.get("openai")
    if openai_provider:
        providers_info.append(
            ProviderInfo(
                name="openai",
                configured=True,
                models=openai_provider.list_models(),
            )
        )
    else:
        providers_info.append(
            ProviderInfo(
                name="openai",
                configured=False,
                models=[],
            )
        )

    return ProvidersResponse(providers=providers_info)


@router.get("/models/{provider}")
async def list_provider_models(provider: str, app_request: Request):
    """List models for a specific provider.

    Args:
        provider: Provider name (e.g., "anthropic", "openai")
        app_request: FastAPI request object

    Returns:
        Dict with models list
    """
    executor = app_request.app.state.executor

    provider_instance = executor.providers.get(provider)
    if not provider_instance:
        return {"provider": provider, "configured": False, "models": []}

    return {
        "provider": provider,
        "configured": True,
        "models": provider_instance.list_models(),
    }
