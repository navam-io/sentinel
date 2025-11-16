"""
Integration tests for template YAML files.

These tests ensure that all example templates:
1. Are valid YAML files
2. Pass schema validation
3. Can be parsed correctly
4. Can be round-tripped (parse → serialize → parse)
"""

import pytest
from pathlib import Path

from backend.core.parser import TestSpecParser
from backend.core.schema import TestSpec, TestSuite


class TestTemplateFiles:
    """Tests for template YAML files."""

    @pytest.fixture
    def templates_dir(self):
        """Get the templates directory."""
        return Path(__file__).parent.parent.parent / "templates"

    def test_templates_directory_exists(self, templates_dir):
        """Test that templates directory exists."""
        assert templates_dir.exists()
        assert templates_dir.is_dir()

    def test_simple_qa_template(self, templates_dir):
        """Test simple Q&A template."""
        template_path = templates_dir / "simple_qa.yaml"
        assert template_path.exists()

        spec = TestSpecParser.parse_file(template_path)
        assert isinstance(spec, TestSpec)
        assert spec.name == "Simple Q&A - Capital Cities"
        assert spec.model == "gpt-4"
        assert spec.seed == 123
        assert len(spec.assertions) == 6

    def test_code_generation_template(self, templates_dir):
        """Test code generation template."""
        template_path = templates_dir / "code_generation.yaml"
        assert template_path.exists()

        spec = TestSpecParser.parse_file(template_path)
        assert isinstance(spec, TestSpec)
        assert spec.name == "Code Generation - Python Function"
        assert spec.model == "claude-3-5-sonnet-20241022"
        assert "code-generation" in spec.tags

    def test_browser_agent_template(self, templates_dir):
        """Test browser agent template."""
        template_path = templates_dir / "browser_agent.yaml"
        assert template_path.exists()

        spec = TestSpecParser.parse_file(template_path)
        assert isinstance(spec, TestSpec)
        assert spec.name == "Browser Agent - Product Research"
        assert len(spec.tools) == 3
        assert "browser" in spec.tools

    def test_multi_turn_template(self, templates_dir):
        """Test multi-turn conversation template."""
        template_path = templates_dir / "multi_turn.yaml"
        assert template_path.exists()

        spec = TestSpecParser.parse_file(template_path)
        assert isinstance(spec, TestSpec)
        assert spec.name == "Multi-Turn Conversation - Customer Support"
        assert len(spec.inputs.messages) == 3
        assert spec.inputs.messages[0].role == "user"

    def test_langgraph_agent_template(self, templates_dir):
        """Test LangGraph agent template."""
        template_path = templates_dir / "langgraph_agent.yaml"
        assert template_path.exists()

        spec = TestSpecParser.parse_file(template_path)
        assert isinstance(spec, TestSpec)
        assert spec.name == "LangGraph Research Agent - Tech News"
        assert spec.framework == "langgraph"
        assert len(spec.tools) == 2

    def test_test_suite_template(self, templates_dir):
        """Test test suite template."""
        template_path = templates_dir / "test_suite.yaml"
        assert template_path.exists()

        suite = TestSpecParser.parse_file(template_path)
        assert isinstance(suite, TestSuite)
        assert suite.name == "E-commerce Agent Test Suite"
        assert suite.version == "1.0.0"
        assert len(suite.tests) == 3

    def test_all_templates_parse_successfully(self, templates_dir):
        """Test that all template files can be parsed."""
        template_files = list(templates_dir.glob("*.yaml"))
        assert len(template_files) > 0, "No template files found"

        for template_file in template_files:
            # Should not raise any exceptions
            spec = TestSpecParser.parse_file(template_file)
            assert spec is not None
            assert hasattr(spec, "name")

    def test_template_round_trip(self, templates_dir):
        """Test that templates can be round-tripped (parse → serialize → parse)."""
        template_path = templates_dir / "simple_qa.yaml"

        # Parse → Serialize → Parse
        spec1 = TestSpecParser.parse_file(template_path)
        yaml_str = TestSpecParser.to_yaml(spec1)
        spec2 = TestSpecParser.parse_yaml(yaml_str)

        # Compare key fields
        assert spec1.name == spec2.name
        assert spec1.model == spec2.model
        assert spec1.seed == spec2.seed
