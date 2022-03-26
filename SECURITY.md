# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are
currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 5.1.x   | :white_check_mark: |
| 5.0.x   | :x:                |
| 4.0.x   | :white_check_mark: |
| < 4.0   | :x:                |

## Reporting a Vulnerability

Secrets detected in source code SCT-1000



 Description


Leaked secret '-----BEGIN PRIVATE KEY-----' detected in source

Secrets should never be checked into source code. Ideally, they should be injected into the runtime and then the values should be picked from there.

Examples of secrets are SSH keys, API keys and secrets (AWS or Stripe APIs, for example), database credentials etc.
Examples
Bad practice

In the sample Python code below, the secrets have been hardcoded:

key = "12345azan+/ryGUuk"

Recommended

Ideally, this should be picked from the environment, like:

key = os.getenv("SECRET_KEY")




