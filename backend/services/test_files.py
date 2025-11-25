"""
Test file service for managing test YAML files.

This service provides file-based storage for tests, making them git-friendly
and version-controllable. Tests are stored as YAML files in artifacts/tests/.
"""

import re
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import yaml


class TestFileService:
    """Service for managing test YAML files."""

    def __init__(self, tests_path: str | None = None):
        """Initialize service with tests directory path.

        Args:
            tests_path: Path to tests directory. Defaults to artifacts/tests/
        """
        if tests_path:
            self.tests_path = Path(tests_path)
        else:
            # Default to artifacts/tests/ relative to project root
            project_root = Path(__file__).parent.parent.parent
            self.tests_path = project_root / "artifacts" / "tests"

        # Ensure directory exists
        self.tests_path.mkdir(parents=True, exist_ok=True)

    def generate_filename(self, name: str) -> str:
        """Generate unique kebab-case filename from test name.

        Args:
            name: Test name

        Returns:
            Unique filename (without .yaml extension)

        Rules:
            1. Convert to lowercase
            2. Replace spaces and underscores with hyphens
            3. Remove special characters except hyphens
            4. Max 50 characters
            5. Append number if duplicate exists
        """
        # Lowercase and replace spaces/underscores with hyphens
        filename = name.lower().replace(" ", "-").replace("_", "-")

        # Remove special characters except hyphens
        filename = re.sub(r"[^a-z0-9-]", "", filename)

        # Remove consecutive hyphens
        filename = re.sub(r"-+", "-", filename)

        # Remove leading/trailing hyphens
        filename = filename.strip("-")

        # Truncate to 50 characters
        if len(filename) > 50:
            filename = filename[:50].rstrip("-")

        # Default if empty
        if not filename:
            filename = "untitled-test"

        # Check for duplicates and append number
        base_filename = filename
        counter = 1
        while (self.tests_path / f"{filename}.yaml").exists():
            filename = f"{base_filename}-{counter}"
            counter += 1
            # Ensure we don't exceed 50 chars with the number
            if len(filename) > 50:
                filename = f"{base_filename[:45]}-{counter}"

        return filename

    def save_test(
        self,
        yaml_content: str,
        filename: str | None = None,
        name: str | None = None,
    ) -> tuple[str, dict[str, Any]]:
        """Save test YAML to file.

        Args:
            yaml_content: YAML content to save
            filename: Optional filename (without extension). If not provided,
                     generates from name or parses from YAML
            name: Optional test name for filename generation

        Returns:
            Tuple of (filename, parsed_metadata)

        Raises:
            ValueError: If YAML is invalid
        """
        # Parse YAML to extract/validate metadata
        try:
            parsed = yaml.safe_load(yaml_content)
            if not parsed:
                raise ValueError("Empty YAML content")
        except yaml.YAMLError as e:
            raise ValueError(f"Invalid YAML: {e}")

        # Determine filename
        if not filename:
            # Try to get name from parameter, then from YAML
            test_name = name or parsed.get("name", "Untitled Test")
            filename = self.generate_filename(test_name)

        # Ensure .yaml extension is not duplicated
        filename = filename.replace(".yaml", "").replace(".yml", "")

        # Add metadata header comment if not present
        if not yaml_content.strip().startswith("#"):
            header = f"# Sentinel Test Definition\n# Generated: {datetime.now(UTC).isoformat()}\n"
            yaml_content = header + yaml_content

        # Write file
        file_path = self.tests_path / f"{filename}.yaml"
        file_path.write_text(yaml_content, encoding="utf-8")

        # Return filename and parsed metadata
        metadata = {
            "name": parsed.get("name", "Untitled Test"),
            "description": parsed.get("description", ""),
            "category": parsed.get("category"),
            "provider": parsed.get("provider"),
            "model": parsed.get("model"),
        }

        return filename, metadata

    def load_test(self, filename: str) -> tuple[str, dict[str, Any]]:
        """Load test YAML from file.

        Args:
            filename: Filename (with or without .yaml extension)

        Returns:
            Tuple of (yaml_content, parsed_metadata)

        Raises:
            FileNotFoundError: If file doesn't exist
            ValueError: If YAML is invalid
        """
        # Normalize filename
        filename = filename.replace(".yaml", "").replace(".yml", "")
        file_path = self.tests_path / f"{filename}.yaml"

        if not file_path.exists():
            raise FileNotFoundError(f"Test file not found: {filename}.yaml")

        yaml_content = file_path.read_text(encoding="utf-8")

        # Parse YAML to extract metadata
        try:
            parsed = yaml.safe_load(yaml_content)
            if not parsed:
                parsed = {}
        except yaml.YAMLError as e:
            raise ValueError(f"Invalid YAML in {filename}.yaml: {e}")

        metadata = {
            "name": parsed.get("name", filename),
            "description": parsed.get("description", ""),
            "category": parsed.get("category"),
            "provider": parsed.get("provider"),
            "model": parsed.get("model"),
        }

        return yaml_content, metadata

    def list_tests(self) -> list[dict[str, Any]]:
        """List all test files with metadata.

        Returns:
            List of test metadata dictionaries
        """
        tests = []

        for file_path in sorted(self.tests_path.glob("*.yaml")):
            try:
                yaml_content = file_path.read_text(encoding="utf-8")
                parsed = yaml.safe_load(yaml_content) or {}

                # Get file stats
                stat = file_path.stat()

                tests.append(
                    {
                        "filename": file_path.stem,
                        "name": parsed.get("name", file_path.stem),
                        "description": parsed.get("description", ""),
                        "category": parsed.get("category"),
                        "provider": parsed.get("provider"),
                        "model": parsed.get("model"),
                        "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                        "updated_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    }
                )
            except (yaml.YAMLError, OSError) as e:
                # Log error but continue listing
                print(f"Warning: Could not parse {file_path.name}: {e}")
                tests.append(
                    {
                        "filename": file_path.stem,
                        "name": file_path.stem,
                        "description": "Error loading test",
                        "category": None,
                        "provider": None,
                        "model": None,
                        "created_at": None,
                        "updated_at": None,
                        "error": str(e),
                    }
                )

        return tests

    def delete_test(self, filename: str) -> bool:
        """Delete test file.

        Args:
            filename: Filename (with or without .yaml extension)

        Returns:
            True if deleted, False if not found
        """
        # Normalize filename
        filename = filename.replace(".yaml", "").replace(".yml", "")
        file_path = self.tests_path / f"{filename}.yaml"

        if not file_path.exists():
            return False

        file_path.unlink()
        return True

    def rename_test(self, old_filename: str, new_name: str) -> tuple[str, dict[str, Any]]:
        """Rename test file and update its name in YAML content.

        Args:
            old_filename: Current filename (with or without extension)
            new_name: New test name

        Returns:
            Tuple of (new_filename, updated_metadata)

        Raises:
            FileNotFoundError: If file doesn't exist
        """
        # Load current content
        yaml_content, metadata = self.load_test(old_filename)

        # Update name in YAML
        try:
            parsed = yaml.safe_load(yaml_content)
            if parsed:
                parsed["name"] = new_name
                # Preserve comments by doing a simple replacement if possible
                if metadata["name"] and metadata["name"] in yaml_content:
                    yaml_content = yaml_content.replace(
                        f"name: {metadata['name']}", f"name: {new_name}", 1
                    )
                    yaml_content = yaml_content.replace(
                        f'name: "{metadata["name"]}"', f'name: "{new_name}"', 1
                    )
                    yaml_content = yaml_content.replace(
                        f"name: '{metadata['name']}'", f"name: '{new_name}'", 1
                    )
                else:
                    yaml_content = yaml.dump(parsed, default_flow_style=False, sort_keys=False)
        except yaml.YAMLError:
            pass  # Keep original content if parsing fails

        # Generate new filename
        new_filename = self.generate_filename(new_name)

        # Delete old file
        old_filename = old_filename.replace(".yaml", "").replace(".yml", "")
        old_path = self.tests_path / f"{old_filename}.yaml"
        if old_path.exists():
            old_path.unlink()

        # Save with new filename
        return self.save_test(yaml_content, filename=new_filename)

    def test_exists(self, filename: str) -> bool:
        """Check if test file exists.

        Args:
            filename: Filename (with or without .yaml extension)

        Returns:
            True if exists
        """
        filename = filename.replace(".yaml", "").replace(".yml", "")
        return (self.tests_path / f"{filename}.yaml").exists()

    def get_tests_path(self) -> str:
        """Get the absolute path to tests directory.

        Returns:
            Absolute path string
        """
        return str(self.tests_path.absolute())
