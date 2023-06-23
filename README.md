![Snyk logo](https://snyk.io/style/asset/logo/snyk-print.svg)

***

Snyk helps you find, fix and monitor for known vulnerabilities in your dependencies, both on an ad hoc basis and as part of your CI (Build) system.

## Snyk C/C++ CLI Plugin

A library used by the [Snyk CLI](https://github.com/snyk/snyk) to scan C/C++ projects.

## Getting Started

Clone the repository and install dependencies:

```
git clone https://github.com/snyk/snyk-cpp-plugin
cd snyk-cpp-plugin
npm install
```

### Install pre-commit

`pre-commit` is required to run local secrets scanning.

Install pre-commit (if not already installed):

- `brew install pre-commit`

After cloning the repository `cd` into it and run:

- `pre-commit install`

### Run tests

```
npm test
```
