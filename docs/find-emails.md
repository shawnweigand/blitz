> ## Documentation Index
> Fetch the complete documentation index at: https://docs.blitz-api.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Find Work Email

> Retrieve a verified work email address from a LinkedIn profile URL.

<div style={{position:'absolute',width:'1px',height:'1px',padding:0,margin:'-1px',overflow:'hidden',clipPath:'inset(50%)',whiteSpace:'nowrap',border:0}}>
  > **Agents & LLMs**: a Markdown version of this page is available by appending `.md` to the URL, and the full documentation index is at [llms.txt](https://docs.blitz-api.ai/llms.txt).
</div>

<Callout icon="coin" color="blue">
  **Cost:** 1 credit per email found on Trial Plan
</Callout>

<Callout icon="coin" color="orange">
  **Free** on the **Unlimited Email** plan (\$499/mo) or above
</Callout>

Retrieve a verified work email address from a LinkedIn profile URL.

<Note>
  Response always carries `found`. On `found: true`, the verified `email` and a `all_emails[]` array are populated. On `found: false`, no verified email exists in our database — `email` will be `null`.
</Note>

<Card title="Enrichment workflow recipe" icon="layer-group" href="/guide/recipes/enrichment-workflow">
  End-to-end pattern for processing a list of LinkedIn URLs into verified contact data.
</Card>


## OpenAPI

````yaml api-reference/v2.openapi.json POST /v2/enrichment/email
openapi: 3.1.0
info:
  title: Blitz API Reference
  version: 2.0.0
  description: >-
    Welcome to the Blitz API Reference.


    Use this interactive documentation to explore and test every v2 endpoint.
    Authentication is required via the `x-api-key` header.


    **Base URL**: `https://api.blitz-api.ai`


    **Rate limit**: 5 requests per second (all plans).


    **Pricing**: All endpoints are unlimited on paid plans ($399+/mo). Free
    trial accounts receive 1,000 credits.
servers:
  - url: https://api.blitz-api.ai
    description: Production server
security: []
tags:
  - name: Account
    description: API key info and health check.
  - name: Waterfall ICP Search
    description: Priority-based cascade search — find the best-match contact at a company.
  - name: Employee Finder
    description: Browse all employees at a single company with filters.
  - name: Company Search
    description: Search companies by industry, size, location, and keywords.
  - name: People Enrichment
    description: Enrich contacts with verified emails, phones, and reverse lookups.
  - name: Company Enrichment
    description: Enrich companies and resolve domain ↔ LinkedIn URL.
  - name: Utilities
    description: Helper endpoints (current date/time).
paths:
  /v2/enrichment/email:
    post:
      tags:
        - People Enrichment
      summary: Find Work Email
      description: Retrieve a verified work email address from a LinkedIn profile URL.
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                person_linkedin_url:
                  type: string
                  example: https://www.linkedin.com/in/antoine-blitz-5581b7373
              required:
                - person_linkedin_url
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                example:
                  found: true
                  email: antoine@blitz-agency.com
                  all_emails:
                    - email: antoine@blitz-agency.com
                      job_order_in_profile: 1
                      company_linkedin_url: https://www.linkedin.com/company/blitz-api
                      email_domain: blitz-agency.com
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                type: object
                example:
                  message: >-
                    Missing API key, please provide a valid API key in the
                    'x-api-key' header
        '402':
          description: Payment Required
          content:
            application/json:
              schema:
                type: object
                example:
                  message: Insufficient credits balance
        '500':
          description: Internal Server Error
          content:
            application/json:
              schema:
                type: object
                example:
                  success: false
                  message: >-
                    this is a controlled error. created at
                    2025-07-11T10:20:00.000Z
      security:
        - APIKey: []
components:
  securitySchemes:
    APIKey:
      type: apiKey
      in: header
      name: x-api-key
      description: Your Blitz API Key. Get one from https://app.blitz-api.ai

````