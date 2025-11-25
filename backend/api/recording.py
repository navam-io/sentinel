"""
Recording API endpoints for capturing and replaying agent interactions.

This module provides endpoints for:
- Starting/stopping recording sessions
- Adding events to recordings
- Analyzing recordings for smart detection
- Generating tests from recordings
"""

import json
import re
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..storage.database import get_database
from ..storage.repositories import RecordingRepository, TestRepository

router = APIRouter(prefix="/api/recording", tags=["recording"])


def get_db_session():
    """Dependency to get database session."""
    db = get_database()
    yield from db.get_session()


# =============================================================================
# Request/Response Models
# =============================================================================


class StartRecordingRequest(BaseModel):
    """Request to start a new recording session."""

    name: str
    description: str | None = None


class RecordingSessionResponse(BaseModel):
    """Response containing recording session details."""

    id: int
    name: str
    description: str | None
    status: str
    started_at: str | None
    stopped_at: str | None
    generated_test_id: int | None
    created_at: str | None
    event_count: int


class RecordingEventRequest(BaseModel):
    """Request to add an event to a recording session."""

    event_type: str  # model_call, tool_call, output, execution_complete
    data: dict[str, Any]


class RecordingEventResponse(BaseModel):
    """Response containing recording event details."""

    id: int
    recording_session_id: int
    event_type: str
    sequence_number: int
    timestamp: str | None
    data: dict[str, Any] | None


class SuggestedAssertion(BaseModel):
    """A suggested assertion detected from recording."""

    assertion_type: str
    assertion_value: str | dict[str, Any] | list[str] | None
    confidence: float  # 0.0-1.0
    reason: str


class SmartDetectionResult(BaseModel):
    """Result of smart detection analysis."""

    has_tool_calls: bool
    tool_names: list[str]
    output_format: str | None  # json, text, markdown, code
    suggested_assertions: list[SuggestedAssertion]
    detected_patterns: list[str]


class GenerateTestRequest(BaseModel):
    """Request to generate a test from a recording."""

    session_id: int
    test_name: str | None = None
    test_description: str | None = None
    include_suggestions: bool = True


class GeneratedTestResponse(BaseModel):
    """Response containing the generated test."""

    test_id: int
    test_name: str
    yaml_content: str
    canvas_state: dict[str, Any]
    suggestions_applied: int


class RecordingListResponse(BaseModel):
    """Response containing list of recording sessions."""

    sessions: list[RecordingSessionResponse]
    total: int


# =============================================================================
# Helper Functions
# =============================================================================


def detect_output_format(output: str) -> str | None:
    """Detect the format of model output.

    Args:
        output: Model output text

    Returns:
        Detected format (json, markdown, code, text) or None
    """
    output_stripped = output.strip()

    # Try to parse as JSON
    try:
        json.loads(output_stripped)
        return "json"
    except json.JSONDecodeError:
        pass

    # Check for markdown patterns
    markdown_patterns = [
        r"^#{1,6}\s",  # Headers
        r"```[\s\S]*```",  # Code blocks
        r"\*\*.*\*\*",  # Bold
        r"^\s*[-*+]\s",  # Bullet lists
        r"^\s*\d+\.\s",  # Numbered lists
    ]
    for pattern in markdown_patterns:
        if re.search(pattern, output_stripped, re.MULTILINE):
            return "markdown"

    # Check for code patterns (without markdown code blocks)
    code_patterns = [
        r"^(def|class|function|import|from|const|let|var|if|for|while)\s",
        r"^\s*[{}[\]();]",
        r"^\s*(return|yield|async|await)\s",
    ]
    for pattern in code_patterns:
        if re.search(pattern, output_stripped, re.MULTILINE):
            return "code"

    return "text"


def analyze_recording_for_suggestions(
    events: list[dict[str, Any]],
) -> SmartDetectionResult:
    """Analyze recording events for smart detection.

    Args:
        events: List of recording events

    Returns:
        SmartDetectionResult with detected patterns and suggestions
    """
    tool_calls: list[dict[str, Any]] = []
    output_text: str | None = None
    detected_patterns: list[str] = []
    suggested_assertions: list[SuggestedAssertion] = []

    # Extract data from events
    for event in events:
        event_type = event.get("event_type", "")
        data = event.get("data", {})

        if event_type == "model_call":
            pass  # model_info could be used for future enhancements
        elif event_type == "tool_call":
            tool_calls.append(data)
        elif event_type == "output":
            output_text = data.get("text", "")
        elif event_type == "execution_complete":
            if "tool_calls" in data:
                tool_calls.extend(data.get("tool_calls", []))
            if "output" in data:
                output_text = data.get("output", "")

    # Detect tool calls
    tool_names = list({tc.get("name", "") for tc in tool_calls if tc.get("name")})
    has_tool_calls = len(tool_names) > 0

    if has_tool_calls:
        detected_patterns.append(f"Tool calls detected: {', '.join(tool_names)}")
        suggested_assertions.append(
            SuggestedAssertion(
                assertion_type="must_call_tool",
                assertion_value=tool_names,
                confidence=0.95,
                reason=f"Model called {len(tool_names)} tool(s) during execution",
            )
        )

    # Detect output format
    output_format = detect_output_format(output_text) if output_text else None

    if output_format:
        detected_patterns.append(f"Output format: {output_format}")
        if output_format == "json":
            suggested_assertions.append(
                SuggestedAssertion(
                    assertion_type="output_type",
                    assertion_value="json",
                    confidence=0.9,
                    reason="Output is valid JSON format",
                )
            )

    # Detect common patterns in output
    if output_text:
        # Check for common keywords that might indicate expected content
        output_lower = output_text.lower()

        # Detect structured responses
        if any(phrase in output_lower for phrase in ["here is", "here are", "the answer is"]):
            detected_patterns.append("Structured response detected")

        # Extract potential keywords for must_contain suggestions
        # Look for capitalized words, quoted strings, numbers
        quoted_strings = re.findall(r'"([^"]+)"', output_text)
        for qs in quoted_strings[:3]:  # Limit to 3 suggestions
            if len(qs) > 3 and len(qs) < 50:
                suggested_assertions.append(
                    SuggestedAssertion(
                        assertion_type="must_contain",
                        assertion_value=qs,
                        confidence=0.6,
                        reason=f'Quoted string "{qs}" found in output',
                    )
                )

    return SmartDetectionResult(
        has_tool_calls=has_tool_calls,
        tool_names=tool_names,
        output_format=output_format,
        suggested_assertions=suggested_assertions,
        detected_patterns=detected_patterns,
    )


def generate_canvas_from_events(
    events: list[dict[str, Any]],
    suggestions: SmartDetectionResult | None = None,
) -> dict[str, Any]:
    """Generate canvas state (nodes and edges) from recording events.

    Args:
        events: List of recording events
        suggestions: Optional smart detection results

    Returns:
        Canvas state with nodes and edges
    """
    nodes: list[dict[str, Any]] = []
    edges: list[dict[str, Any]] = []

    # Extract data from events
    query = ""
    system_prompt = ""
    model = "gpt-5.1"
    provider = "openai"
    temperature = 0.7
    max_tokens = 1000
    tools: list[dict[str, Any]] = []

    for event in events:
        event_type = event.get("event_type", "")
        data = event.get("data", {})

        if event_type == "model_call":
            query = data.get("query", query)
            system_prompt = data.get("system_prompt", system_prompt)
            model = data.get("model", model)
            provider = data.get("provider", provider)
            temperature = data.get("temperature", temperature)
            max_tokens = data.get("max_tokens", max_tokens)
            if data.get("tools"):
                tools = data.get("tools", [])

        elif event_type == "tool_call":
            tool_name = data.get("name", "")
            tool_desc = data.get("description", "")
            if tool_name and not any(t.get("name") == tool_name for t in tools):
                tools.append({"name": tool_name, "description": tool_desc})

    # Create nodes with positions
    node_id = 1
    y_pos = 100
    y_spacing = 200

    # System node (if system prompt exists)
    if system_prompt:
        nodes.append(
            {
                "id": str(node_id),
                "type": "system",
                "data": {
                    "label": "System Prompt",
                    "systemPrompt": system_prompt,
                },
                "position": {"x": 100, "y": y_pos},
            }
        )
        system_node_id = str(node_id)
        node_id += 1
        y_pos += y_spacing
    else:
        system_node_id = None

    # Input node
    nodes.append(
        {
            "id": str(node_id),
            "type": "input",
            "data": {
                "label": "Input",
                "query": query or "Enter your query here",
            },
            "position": {"x": 100, "y": y_pos},
        }
    )
    input_node_id = str(node_id)
    node_id += 1
    y_pos += y_spacing

    # Model node
    nodes.append(
        {
            "id": str(node_id),
            "type": "model",
            "data": {
                "label": f"Model: {model}",
                "model": model,
                "provider": provider,
                "temperature": temperature,
                "max_tokens": max_tokens,
            },
            "position": {"x": 100, "y": y_pos},
        }
    )
    model_node_id = str(node_id)
    node_id += 1
    y_pos += y_spacing

    # Tool nodes
    tool_node_ids = []
    for tool in tools:
        nodes.append(
            {
                "id": str(node_id),
                "type": "tool",
                "data": {
                    "label": f"Tool: {tool.get('name', 'Tool')}",
                    "toolName": tool.get("name", ""),
                    "toolDescription": tool.get("description", ""),
                },
                "position": {"x": 300, "y": y_pos - y_spacing + (len(tool_node_ids) * 150)},
            }
        )
        tool_node_ids.append(str(node_id))
        node_id += 1

    # Assertion nodes from suggestions
    assertion_node_ids = []
    if suggestions:
        for suggestion in suggestions.suggested_assertions:
            if suggestion.confidence >= 0.7:  # Only include high-confidence suggestions
                nodes.append(
                    {
                        "id": str(node_id),
                        "type": "assertion",
                        "data": {
                            "label": f"Assert: {suggestion.assertion_type}",
                            "assertionType": suggestion.assertion_type,
                            "assertionValue": suggestion.assertion_value,
                        },
                        "position": {"x": 100, "y": y_pos},
                    }
                )
                assertion_node_ids.append(str(node_id))
                node_id += 1
                y_pos += 150

    # Create edges
    edge_id = 1

    # System → Model (if system exists)
    if system_node_id:
        edges.append(
            {
                "id": f"e{edge_id}",
                "source": system_node_id,
                "target": model_node_id,
                "animated": True,
            }
        )
        edge_id += 1

    # Input → Model
    edges.append(
        {
            "id": f"e{edge_id}",
            "source": input_node_id,
            "target": model_node_id,
            "animated": True,
        }
    )
    edge_id += 1

    # Model → Tools
    for tool_node_id in tool_node_ids:
        edges.append(
            {
                "id": f"e{edge_id}",
                "source": model_node_id,
                "target": tool_node_id,
                "animated": True,
            }
        )
        edge_id += 1

    # Model → Assertions
    for assertion_node_id in assertion_node_ids:
        edges.append(
            {
                "id": f"e{edge_id}",
                "source": model_node_id,
                "target": assertion_node_id,
                "animated": True,
            }
        )
        edge_id += 1

    return {"nodes": nodes, "edges": edges}


def generate_yaml_from_events(
    events: list[dict[str, Any]],
    test_name: str,
    suggestions: SmartDetectionResult | None = None,
) -> str:
    """Generate YAML test specification from recording events.

    Args:
        events: List of recording events
        test_name: Name for the generated test
        suggestions: Optional smart detection results

    Returns:
        YAML string
    """
    import yaml

    # Extract data from events
    query = ""
    system_prompt = ""
    model = "gpt-5.1"
    provider = "openai"
    temperature = 0.7
    max_tokens = 1000
    tools: list[dict[str, Any]] = []

    for event in events:
        event_type = event.get("event_type", "")
        data = event.get("data", {})

        if event_type == "model_call":
            query = data.get("query", query)
            system_prompt = data.get("system_prompt", system_prompt)
            model = data.get("model", model)
            provider = data.get("provider", provider)
            temperature = data.get("temperature", temperature)
            max_tokens = data.get("max_tokens", max_tokens)
            if data.get("tools"):
                tools = data.get("tools", [])

    # Build test spec
    spec: dict[str, Any] = {
        "name": test_name,
        "model": model,
        "provider": provider,
        "inputs": {},
        "model_config": {
            "temperature": temperature,
            "max_tokens": max_tokens,
        },
    }

    if query:
        spec["inputs"]["query"] = query
    if system_prompt:
        spec["inputs"]["system_prompt"] = system_prompt

    # Add tools
    if tools:
        spec["tools"] = [
            {"name": t.get("name"), "description": t.get("description", "")} for t in tools
        ]

    # Add assertions from suggestions
    if suggestions:
        assertions = []
        for suggestion in suggestions.suggested_assertions:
            if suggestion.confidence >= 0.7:
                assertions.append({suggestion.assertion_type: suggestion.assertion_value})
        if assertions:
            spec["assertions"] = assertions

    return yaml.dump(spec, default_flow_style=False, sort_keys=False)


# =============================================================================
# API Endpoints
# =============================================================================


@router.post("/start", response_model=RecordingSessionResponse)
async def start_recording(
    request: StartRecordingRequest,
    db: Session = Depends(get_db_session),
) -> RecordingSessionResponse:
    """Start a new recording session.

    Args:
        request: Recording session details
        db: Database session

    Returns:
        Created recording session
    """
    repo = RecordingRepository(db)

    # Check if there's already an active recording
    active = repo.get_active_session()
    if active:
        raise HTTPException(
            status_code=400,
            detail=f"Recording session '{active.name}' is already active. Stop it first.",
        )

    recording = repo.create_session(
        name=request.name,
        description=request.description,
    )

    return RecordingSessionResponse(**recording.to_dict())


@router.post("/{session_id}/stop", response_model=RecordingSessionResponse)
async def stop_recording(
    session_id: int,
    db: Session = Depends(get_db_session),
) -> RecordingSessionResponse:
    """Stop a recording session.

    Args:
        session_id: Recording session ID
        db: Database session

    Returns:
        Updated recording session
    """
    repo = RecordingRepository(db)

    recording = repo.update_session_status(session_id, "stopped")
    if not recording:
        raise HTTPException(status_code=404, detail="Recording session not found")

    return RecordingSessionResponse(**recording.to_dict())


@router.post("/{session_id}/pause", response_model=RecordingSessionResponse)
async def pause_recording(
    session_id: int,
    db: Session = Depends(get_db_session),
) -> RecordingSessionResponse:
    """Pause a recording session.

    Args:
        session_id: Recording session ID
        db: Database session

    Returns:
        Updated recording session
    """
    repo = RecordingRepository(db)

    recording = repo.update_session_status(session_id, "paused")
    if not recording:
        raise HTTPException(status_code=404, detail="Recording session not found")

    return RecordingSessionResponse(**recording.to_dict())


@router.post("/{session_id}/resume", response_model=RecordingSessionResponse)
async def resume_recording(
    session_id: int,
    db: Session = Depends(get_db_session),
) -> RecordingSessionResponse:
    """Resume a paused recording session.

    Args:
        session_id: Recording session ID
        db: Database session

    Returns:
        Updated recording session
    """
    repo = RecordingRepository(db)

    recording = repo.update_session_status(session_id, "recording")
    if not recording:
        raise HTTPException(status_code=404, detail="Recording session not found")

    return RecordingSessionResponse(**recording.to_dict())


@router.get("/active", response_model=RecordingSessionResponse | None)
async def get_active_recording(
    db: Session = Depends(get_db_session),
) -> RecordingSessionResponse | None:
    """Get the currently active recording session.

    Args:
        db: Database session

    Returns:
        Active recording session or None
    """
    repo = RecordingRepository(db)
    recording = repo.get_active_session()

    if not recording:
        return None

    return RecordingSessionResponse(**recording.to_dict())


@router.get("/{session_id}", response_model=RecordingSessionResponse)
async def get_recording(
    session_id: int,
    db: Session = Depends(get_db_session),
) -> RecordingSessionResponse:
    """Get a recording session by ID.

    Args:
        session_id: Recording session ID
        db: Database session

    Returns:
        Recording session details
    """
    repo = RecordingRepository(db)
    recording = repo.get_session_by_id(session_id)

    if not recording:
        raise HTTPException(status_code=404, detail="Recording session not found")

    return RecordingSessionResponse(**recording.to_dict())


@router.post("/{session_id}/event", response_model=RecordingEventResponse)
async def add_recording_event(
    session_id: int,
    request: RecordingEventRequest,
    db: Session = Depends(get_db_session),
) -> RecordingEventResponse:
    """Add an event to a recording session.

    Args:
        session_id: Recording session ID
        request: Event details
        db: Database session

    Returns:
        Created recording event
    """
    repo = RecordingRepository(db)

    # Verify session exists and is active
    recording = repo.get_session_by_id(session_id)
    if not recording:
        raise HTTPException(status_code=404, detail="Recording session not found")

    if recording.status not in ("recording", "paused"):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot add events to a {recording.status} recording",
        )

    event = repo.add_event(
        session_id=session_id,
        event_type=request.event_type,
        data=request.data,
    )

    return RecordingEventResponse(**event.to_dict())


@router.get("/{session_id}/events", response_model=list[RecordingEventResponse])
async def get_recording_events(
    session_id: int,
    db: Session = Depends(get_db_session),
) -> list[RecordingEventResponse]:
    """Get all events for a recording session.

    Args:
        session_id: Recording session ID
        db: Database session

    Returns:
        List of recording events
    """
    repo = RecordingRepository(db)

    # Verify session exists
    recording = repo.get_session_by_id(session_id)
    if not recording:
        raise HTTPException(status_code=404, detail="Recording session not found")

    events = repo.get_events(session_id)
    return [RecordingEventResponse(**e.to_dict()) for e in events]


@router.get("/{session_id}/analyze", response_model=SmartDetectionResult)
async def analyze_recording(
    session_id: int,
    db: Session = Depends(get_db_session),
) -> SmartDetectionResult:
    """Analyze a recording session for smart detection.

    Args:
        session_id: Recording session ID
        db: Database session

    Returns:
        Smart detection results with suggested assertions
    """
    repo = RecordingRepository(db)

    # Verify session exists
    recording = repo.get_session_by_id(session_id)
    if not recording:
        raise HTTPException(status_code=404, detail="Recording session not found")

    events = repo.get_events(session_id)
    event_dicts = [e.to_dict() for e in events]

    return analyze_recording_for_suggestions(event_dicts)


@router.post("/generate-test", response_model=GeneratedTestResponse)
async def generate_test_from_recording(
    request: GenerateTestRequest,
    db: Session = Depends(get_db_session),
) -> GeneratedTestResponse:
    """Generate a test from a recording session.

    Args:
        request: Generation request with session ID and options
        db: Database session

    Returns:
        Generated test details
    """
    recording_repo = RecordingRepository(db)
    test_repo = TestRepository(db)

    # Verify session exists
    recording = recording_repo.get_session_by_id(request.session_id)
    if not recording:
        raise HTTPException(status_code=404, detail="Recording session not found")

    events = recording_repo.get_events(request.session_id)
    event_dicts = [e.to_dict() for e in events]

    if not event_dicts:
        raise HTTPException(status_code=400, detail="Recording has no events")

    # Analyze for suggestions
    suggestions = None
    suggestions_applied = 0
    if request.include_suggestions:
        suggestions = analyze_recording_for_suggestions(event_dicts)
        suggestions_applied = len(
            [s for s in suggestions.suggested_assertions if s.confidence >= 0.7]
        )

    # Generate test name
    test_name = request.test_name or f"Test from Recording: {recording.name}"

    # Generate YAML and canvas state
    yaml_content = generate_yaml_from_events(event_dicts, test_name, suggestions)
    canvas_state = generate_canvas_from_events(event_dicts, suggestions)

    # Parse YAML to get spec
    import yaml

    spec = yaml.safe_load(yaml_content)

    # Create test in database
    test = test_repo.create(
        name=test_name,
        spec=spec,
        spec_yaml=yaml_content,
        canvas_state=canvas_state,
        description=request.test_description or f"Generated from recording: {recording.name}",
        category="regression",  # Default category for recorded tests
    )

    # Link recording to generated test
    recording_repo.set_generated_test(request.session_id, test.id)

    return GeneratedTestResponse(
        test_id=test.id,
        test_name=test_name,
        yaml_content=yaml_content,
        canvas_state=canvas_state,
        suggestions_applied=suggestions_applied,
    )


@router.get("/list", response_model=RecordingListResponse)
async def list_recordings(
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db_session),
) -> RecordingListResponse:
    """List all recording sessions.

    Args:
        limit: Maximum number of sessions to return
        offset: Number of sessions to skip
        db: Database session

    Returns:
        List of recording sessions
    """
    repo = RecordingRepository(db)
    sessions = repo.get_all_sessions(limit=limit, offset=offset)

    return RecordingListResponse(
        sessions=[RecordingSessionResponse(**s.to_dict()) for s in sessions],
        total=len(sessions),
    )


@router.delete("/{session_id}")
async def delete_recording(
    session_id: int,
    db: Session = Depends(get_db_session),
) -> dict[str, str]:
    """Delete a recording session.

    Args:
        session_id: Recording session ID
        db: Database session

    Returns:
        Success message
    """
    repo = RecordingRepository(db)

    if not repo.delete_session(session_id):
        raise HTTPException(status_code=404, detail="Recording session not found")

    return {"message": f"Recording session {session_id} deleted"}
