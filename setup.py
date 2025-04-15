from setuptools import setup, find_packages

setup(
    name="airflow_plugin",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "apache-airflow>=2.0.0",
        "pyyaml>=5.0.0",
    ],
    python_requires=">=3.7",
    package_data={
        "plugin_core": ["*.yaml", "*.json"],
        "plugins": ["*.yaml", "*.json"],
    },
) 