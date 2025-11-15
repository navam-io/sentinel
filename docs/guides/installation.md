# Installation Guide

This guide will help you install and set up Navam Sentinel on your system.

## Prerequisites

- **Python**: 3.10 or higher
- **pip**: Latest version recommended
- **Operating System**: macOS, Linux, or Windows

### Check Your Python Version

```bash
python --version
# or
python3 --version
```

If you need to install or upgrade Python, visit [python.org](https://www.python.org/downloads/).

## Installation Methods

### Method 1: Install from PyPI (Recommended)

Once released, you'll be able to install Sentinel from PyPI:

```bash
pip install navam-sentinel
```

**Note**: v0.1.0 is not yet published to PyPI. Use Method 2 or 3 for now.

### Method 2: Install from Source (Development)

For the latest features or to contribute:

```bash
# Clone the repository
git clone https://github.com/navam-io/sentinel.git
cd sentinel

# Create a virtual environment (recommended)
python -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install in editable mode with dev dependencies
pip install -e ".[dev]"
```

### Method 3: Install from GitHub

Install directly from the GitHub repository:

```bash
pip install git+https://github.com/navam-io/sentinel.git
```

## Verify Installation

After installation, verify that Sentinel is installed correctly:

```bash
python -c "import sentinel; print(sentinel.__version__)"
```

You should see: `0.1.0`

## Set Up Your First Project

Create a directory for your Sentinel tests:

```bash
mkdir my-sentinel-tests
cd my-sentinel-tests
```

Create a simple test specification file `hello.yaml`:

```yaml
name: "Hello Sentinel"
model: "gpt-4"
provider: "openai"

inputs:
  query: "Say hello to Sentinel!"

assertions:
  - must_contain: "hello"
  - output_type: "text"
```

Parse and validate your test:

```python
from sentinel.core.parser import TestSpecParser

spec = TestSpecParser.parse_file("hello.yaml")
print(f"✓ Test '{spec.name}' is valid!")
print(f"  Model: {spec.model}")
print(f"  Assertions: {len(spec.assertions)}")
```

## Development Setup

If you're contributing to Sentinel or want to run tests:

### Install Development Dependencies

```bash
pip install -e ".[dev]"
```

This installs additional tools:
- `pytest` - Testing framework
- `black` - Code formatter
- `ruff` - Linter
- `mypy` - Type checker
- `pytest-cov` - Coverage reporting

### Run the Test Suite

```bash
pytest
```

You should see all 81 tests passing:

```
======================== 81 passed in 0.28s ========================
```

### Run with Coverage

```bash
pytest --cov=sentinel --cov-report=html
```

View coverage report:
```bash
open htmlcov/index.html  # macOS
xdg-open htmlcov/index.html  # Linux
```

## Virtual Environments (Recommended)

Using a virtual environment keeps your Sentinel installation isolated from other Python projects.

### Create a Virtual Environment

```bash
# Using venv (built-in)
python -m venv sentinel-env

# Using conda
conda create -n sentinel python=3.10
```

### Activate the Environment

```bash
# venv on macOS/Linux
source sentinel-env/bin/activate

# venv on Windows
sentinel-env\Scripts\activate

# conda
conda activate sentinel
```

### Deactivate When Done

```bash
# venv
deactivate

# conda
conda deactivate
```

## Troubleshooting

### Issue: `pip: command not found`

Install pip:
```bash
python -m ensurepip --upgrade
```

### Issue: Permission Denied

Use `--user` flag:
```bash
pip install --user navam-sentinel
```

Or use a virtual environment (recommended).

### Issue: `ModuleNotFoundError: No module named 'sentinel'`

Make sure you're in the correct virtual environment and Sentinel is installed:
```bash
pip list | grep sentinel
```

### Issue: Python Version Too Old

Sentinel requires Python 3.10+. Upgrade your Python:
- macOS: `brew install python@3.12`
- Ubuntu: `sudo apt install python3.12`
- Windows: Download from [python.org](https://www.python.org/downloads/)

## Next Steps

Now that Sentinel is installed, you're ready to:

1. **[Follow the Quick Start Guide](quickstart.md)** - Create your first test
2. **[Learn Core Concepts](concepts.md)** - Understand how Sentinel works
3. **[Browse Examples](../examples/gallery.md)** - See real-world test specs

## Updating Sentinel

To update to the latest version:

```bash
# From PyPI (when available)
pip install --upgrade navam-sentinel

# From source
cd sentinel
git pull
pip install -e ".[dev]"
```

## Uninstalling

To remove Sentinel:

```bash
pip uninstall navam-sentinel
```
