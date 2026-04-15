"""Setup configuration for Skull King game package."""

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="skull-king-game",
    version="0.1.0",
    author="Game Development Team",
    description="A card game implementation of Skull King",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/corynaegle-ai/swarm-managed-skull-king-125",
    packages=find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.8",
)
