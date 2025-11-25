"""
Tests for TestFileService.

Tests file-based storage functionality for saving tests as YAML files.
"""

import tempfile
from pathlib import Path

import pytest

from backend.services.test_files import TestFileService


@pytest.fixture
def temp_tests_dir():
    """Create a temporary directory for tests."""
    with tempfile.TemporaryDirectory() as tmpdir:
        yield tmpdir


@pytest.fixture
def service(temp_tests_dir):
    """Create a TestFileService with temporary directory."""
    return TestFileService(tests_path=temp_tests_dir)


class TestFilenameGeneration:
    """Tests for filename generation."""

    def test_generate_filename_basic(self, service):
        """Test basic filename generation."""
        filename = service.generate_filename("My Test Name")
        assert filename == "my-test-name"

    def test_generate_filename_with_special_chars(self, service):
        """Test filename generation removes special characters."""
        filename = service.generate_filename("Test: With Special! @#$% Chars")
        assert filename == "test-with-special-chars"

    def test_generate_filename_with_underscores(self, service):
        """Test filename generation converts underscores to hyphens."""
        filename = service.generate_filename("test_with_underscores")
        assert filename == "test-with-underscores"

    def test_generate_filename_truncates_long_names(self, service):
        """Test filename generation truncates long names to 50 chars."""
        long_name = "a" * 100
        filename = service.generate_filename(long_name)
        assert len(filename) <= 50

    def test_generate_filename_handles_empty(self, service):
        """Test filename generation handles empty string."""
        filename = service.generate_filename("")
        assert filename == "untitled-test"

    def test_generate_filename_handles_only_special_chars(self, service):
        """Test filename generation handles only special characters."""
        filename = service.generate_filename("!@#$%^&*()")
        assert filename == "untitled-test"

    def test_generate_filename_deduplicates(self, service, temp_tests_dir):
        """Test filename generation creates unique names."""
        # Create first file
        Path(temp_tests_dir, "my-test.yaml").touch()

        # Generate filename should add number
        filename = service.generate_filename("My Test")
        assert filename == "my-test-1"


class TestSaveTest:
    """Tests for saving test files."""

    def test_save_test_creates_file(self, service, temp_tests_dir):
        """Test saving creates a YAML file."""
        yaml_content = """name: Test Name
model: gpt-5.1
provider: openai
"""
        filename, metadata = service.save_test(yaml_content)

        file_path = Path(temp_tests_dir, f"{filename}.yaml")
        assert file_path.exists()
        assert metadata["name"] == "Test Name"

    def test_save_test_with_explicit_filename(self, service, temp_tests_dir):
        """Test saving with explicit filename."""
        yaml_content = """name: Test Name
model: gpt-5.1
"""
        filename, _ = service.save_test(yaml_content, filename="custom-name")

        assert filename == "custom-name"
        assert Path(temp_tests_dir, "custom-name.yaml").exists()

    def test_save_test_extracts_metadata(self, service):
        """Test metadata extraction from YAML."""
        yaml_content = """name: My Test
description: A test description
category: qa
provider: anthropic
model: claude-sonnet-4-5-20250929
"""
        _, metadata = service.save_test(yaml_content)

        assert metadata["name"] == "My Test"
        assert metadata["description"] == "A test description"
        assert metadata["category"] == "qa"
        assert metadata["provider"] == "anthropic"
        assert metadata["model"] == "claude-sonnet-4-5-20250929"

    def test_save_test_invalid_yaml(self, service):
        """Test saving invalid YAML raises error."""
        invalid_yaml = "invalid: yaml: content:"

        with pytest.raises(ValueError, match="Invalid YAML"):
            service.save_test(invalid_yaml)

    def test_save_test_empty_yaml(self, service):
        """Test saving empty YAML raises error."""
        with pytest.raises(ValueError, match="Empty YAML"):
            service.save_test("")


class TestLoadTest:
    """Tests for loading test files."""

    def test_load_test_returns_content(self, service, temp_tests_dir):
        """Test loading returns YAML content."""
        yaml_content = """name: Test Name
model: gpt-5.1
"""
        # Create file
        Path(temp_tests_dir, "test-file.yaml").write_text(yaml_content)

        loaded_content, metadata = service.load_test("test-file")

        assert "name: Test Name" in loaded_content
        assert metadata["name"] == "Test Name"

    def test_load_test_with_extension(self, service, temp_tests_dir):
        """Test loading works with .yaml extension."""
        yaml_content = """name: Test
"""
        Path(temp_tests_dir, "test.yaml").write_text(yaml_content)

        _, metadata = service.load_test("test.yaml")
        assert metadata["name"] == "Test"

    def test_load_test_not_found(self, service):
        """Test loading non-existent file raises error."""
        with pytest.raises(FileNotFoundError):
            service.load_test("nonexistent")


class TestListTests:
    """Tests for listing test files."""

    def test_list_tests_empty(self, service):
        """Test listing empty directory."""
        tests = service.list_tests()
        assert tests == []

    def test_list_tests_returns_all(self, service, temp_tests_dir):
        """Test listing returns all test files."""
        # Create multiple files
        for i in range(3):
            Path(temp_tests_dir, f"test-{i}.yaml").write_text(f"name: Test {i}\n")

        tests = service.list_tests()
        assert len(tests) == 3

    def test_list_tests_includes_metadata(self, service, temp_tests_dir):
        """Test listing includes metadata."""
        yaml_content = """name: My Test
description: Description
category: qa
"""
        Path(temp_tests_dir, "my-test.yaml").write_text(yaml_content)

        tests = service.list_tests()
        assert len(tests) == 1
        assert tests[0]["name"] == "My Test"
        assert tests[0]["description"] == "Description"
        assert tests[0]["category"] == "qa"


class TestDeleteTest:
    """Tests for deleting test files."""

    def test_delete_test_removes_file(self, service, temp_tests_dir):
        """Test deleting removes the file."""
        file_path = Path(temp_tests_dir, "to-delete.yaml")
        file_path.write_text("name: To Delete\n")

        result = service.delete_test("to-delete")

        assert result is True
        assert not file_path.exists()

    def test_delete_test_not_found(self, service):
        """Test deleting non-existent file returns False."""
        result = service.delete_test("nonexistent")
        assert result is False


class TestRenameTest:
    """Tests for renaming test files."""

    def test_rename_test_changes_filename(self, service, temp_tests_dir):
        """Test renaming creates new file with new name."""
        # Create original file
        Path(temp_tests_dir, "original.yaml").write_text("name: Original\n")

        new_filename, metadata = service.rename_test("original", "New Name")

        assert new_filename == "new-name"
        assert metadata["name"] == "New Name"
        assert not Path(temp_tests_dir, "original.yaml").exists()
        assert Path(temp_tests_dir, "new-name.yaml").exists()

    def test_rename_test_not_found(self, service):
        """Test renaming non-existent file raises error."""
        with pytest.raises(FileNotFoundError):
            service.rename_test("nonexistent", "New Name")


class TestTestExists:
    """Tests for checking file existence."""

    def test_test_exists_returns_true(self, service, temp_tests_dir):
        """Test exists returns True for existing file."""
        Path(temp_tests_dir, "exists.yaml").write_text("name: Exists\n")

        assert service.test_exists("exists") is True

    def test_test_exists_returns_false(self, service):
        """Test exists returns False for non-existing file."""
        assert service.test_exists("nonexistent") is False

    def test_test_exists_with_extension(self, service, temp_tests_dir):
        """Test exists works with .yaml extension."""
        Path(temp_tests_dir, "test.yaml").write_text("name: Test\n")

        assert service.test_exists("test.yaml") is True
