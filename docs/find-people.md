> ## Documentation Index
> Fetch the complete documentation index at: https://docs.blitz-api.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Find People

> Search decision-makers across many companies in a single call.

<div style={{position:'absolute',width:'1px',height:'1px',padding:0,margin:'-1px',overflow:'hidden',clipPath:'inset(50%)',whiteSpace:'nowrap',border:0}}>
  > **Agents & LLMs**: a Markdown version of this page is available by appending `.md` to the URL, and the full documentation index is at [llms.txt](https://docs.blitz-api.ai/llms.txt).
</div>

<Callout icon="coin" color="blue">
  **Cost:** 1 credit per person returned on Trial Plan
</Callout>

<Callout icon="coin" color="orange">
  **Free** on the Unlimited plan
</Callout>

<Tip>
  **Job title - exact match:** wrap a value in square brackets to switch from keyword matching to exact matching. `"[CEO]"` matches only `CEO`/`ceo`/`Céo`; `"CEO"` (no brackets) is FTS (full text search) and also matches `Co-CEO`, `CEO Office`. Mixed arrays are allowed: `["[CEO]", "Founder"]`. [Full rules](/guide/reference/normalization/filters).
</Tip>

Search decision-makers across many companies in a single call. Combine company-level filters (industry, size, HQ) with person-level filters (job title, level, location).

<Note>
  **Pagination is cursor-based.** Pass the `cursor` returned by each response back into the next request. Stop when `cursor` is `null`. Pagination is limited to maximum to 50k results.
</Note>

<Tip>
  **Filter logic:** All filters combine with **AND**. Multiple values within a single filter combine with **OR** — e.g. two industries in `company.industry.include` returns people at companies in *either* industry.
</Tip>

<Card title="Find People guide" icon="users-viewfinder" href="/guide/concepts/find-people">
  Walk-through of combining company and person filters to build an ICP list end-to-end.
</Card>


## OpenAPI

````yaml api-reference/v2.openapi.json POST /v2/search/people
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
  /v2/search/people:
    post:
      tags:
        - People Search
      summary: Find People
      description: Search decision-makers across many companies in a single call.
      operationId: postV2SearchPeople
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                company:
                  description: Company search criteria
                  type: object
                  properties:
                    linkedin_url:
                      description: >-
                        Exact matches for the LinkedIn URL of the company, to
                        look for people in the company
                      type: array
                      items:
                        type: string
                        examples:
                          - https://www.linkedin.com/company/blitz-api
                    name:
                      description: Keywords searched in the company name
                      type: object
                      properties:
                        include:
                          default: []
                          examples:
                            - []
                          type: array
                          items:
                            type: string
                        exclude:
                          default: []
                          examples:
                            - []
                          type: array
                          items:
                            type: string
                    industry:
                      description: Exact matches for the industry search
                      type: object
                      properties:
                        include:
                          default: []
                          examples:
                            - - IT Services and IT Consulting
                          type: array
                          items:
                            type: string
                            enum:
                              - Abrasives and Nonmetallic Minerals Manufacturing
                              - Accessible Architecture and Design
                              - Accessible Hardware Manufacturing
                              - Accommodation and Food Services
                              - Accounting
                              - Administration of Justice
                              - Administrative and Support Services
                              - Advertising Services
                              - Agricultural Chemical Manufacturing
                              - >-
                                Agriculture; Construction; Mining Machinery
                                Manufacturing
                              - Airlines and Aviation
                              - Airlines/Aviation
                              - Air; Water; and Waste Program Management
                              - Alternative Dispute Resolution
                              - Alternative Fuel Vehicle Manufacturing
                              - Alternative Medicine
                              - Ambulance Services
                              - Amusement Parks and Arcades
                              - Animal Feed Manufacturing
                              - Animation
                              - Animation and Post-production
                              - Apparel and Fashion
                              - Apparel Manufacturing
                              - >-
                                Appliances; Electrical; and Electronics
                                Manufacturing
                              - Architectural and Structural Metal Manufacturing
                              - Architecture and Planning
                              - Armed Forces
                              - >-
                                Artificial Rubber and Synthetic Fiber
                                Manufacturing
                              - Artists and Writers
                              - Arts and Crafts
                              - Audio and Video Equipment Manufacturing
                              - Automation Machinery Manufacturing
                              - Automotive
                              - Aviation and Aerospace
                              - Aviation and Aerospace Component Manufacturing
                              - Baked Goods Manufacturing
                              - Banking
                              - Bars; Taverns; and Nightclubs
                              - Bed-and-Breakfasts; Hostels; Homestays
                              - Beverage Manufacturing
                              - Biomass Electric Power Generation
                              - Biotechnology
                              - Biotechnology Research
                              - Blockchain Services
                              - Blogs
                              - >-
                                Boilers; Tanks; and Shipping Container
                                Manufacturing
                              - Book and Periodical Publishing
                              - Book Publishing
                              - Breweries
                              - Broadcast Media
                              - Broadcast Media Production and Distribution
                              - Building Construction
                              - Building Equipment Contractors
                              - Building Finishing Contractors
                              - Building Materials
                              - Building Structure and Exterior Contractors
                              - Business Consulting and Services
                              - Business Content
                              - Business Intelligence Platforms
                              - Business Supplies and Equipment
                              - Cable and Satellite Programming
                              - Capital Markets
                              - Caterers
                              - Chemical Manufacturing
                              - Chemical Raw Materials Manufacturing
                              - Chemicals
                              - Child Day Care Services
                              - Chiropractors
                              - Circuses and Magic Shows
                              - Civic and Social Organization
                              - Civic and Social Organizations
                              - Civil Engineering
                              - Claims Adjusting; Actuarial Services
                              - Clay and Refractory Products Manufacturing
                              - Climate Data and Analytics
                              - Climate Technology Product Manufacturing
                              - Coal Mining
                              - Collection Agencies
                              - Commercial and Industrial Equipment Rental
                              - Commercial and Industrial Machinery Maintenance
                              - >-
                                Commercial and Service Industry Machinery
                                Manufacturing
                              - Commercial Real Estate
                              - Communications Equipment Manufacturing
                              - Community Development and Urban Planning
                              - Community Services
                              - Computer and Network Security
                              - Computer Games
                              - Computer Hardware
                              - Computer Hardware Manufacturing
                              - Computer Networking
                              - Computer Networking Products
                              - Computers and Electronics Manufacturing
                              - Computer Software
                              - Conservation Programs
                              - Construction
                              - Construction Hardware Manufacturing
                              - Consumer Electronics
                              - Consumer Goods
                              - Consumer Goods Rental
                              - Consumer Services
                              - Correctional Institutions
                              - Cosmetics
                              - Cosmetology and Barber Schools
                              - Courts of Law
                              - Credit Intermediation
                              - Cutlery and Handtool Manufacturing
                              - Dairy
                              - Dairy Product Manufacturing
                              - Dance Companies
                              - Data Infrastructure and Analytics
                              - Data Security Software Products
                              - Death Care Services
                              - Defense and Space
                              - Defense and Space Manufacturing
                              - Dentists
                              - Design
                              - Design Services
                              - Desktop Computing Software Products
                              - Digital Accessibility Services
                              - Distilleries
                              - Economic Programs
                              - Education
                              - Education Administration Programs
                              - Education Management
                              - E-learning
                              - E-Learning Providers
                              - Electrical and Electronic Manufacturing
                              - Electrical Equipment Manufacturing
                              - Electric Lighting Equipment Manufacturing
                              - Electric Power Generation
                              - >-
                                Electric Power Transmission; Control; and
                                Distribution
                              - Electronic and Precision Equipment Maintenance
                              - Embedded Software Products
                              - Emergency and Relief Services
                              - Energy Technology
                              - Engineering Services
                              - >-
                                Engines and Power Transmission Equipment
                                Manufacturing
                              - Entertainment
                              - Entertainment Providers
                              - Environmental Quality Programs
                              - Environmental Services
                              - Equipment Rental Services
                              - Events Services
                              - Executive Office
                              - Executive Offices
                              - Executive Search Services
                              - Fabricated Metal Products
                              - Facilities Services
                              - Family Planning Centers
                              - Farming
                              - Farming; Ranching; Forestry
                              - Fashion Accessories Manufacturing
                              - Financial Services
                              - Fine Art
                              - Fine Arts Schools
                              - Fire Protection
                              - Fisheries
                              - Fishery
                              - Flight Training
                              - Food and Beverage Manufacturing
                              - Food and Beverage Retail
                              - Food and Beverages
                              - Food and Beverage Services
                              - Food Production
                              - Footwear and Leather Goods Repair
                              - Footwear Manufacturing
                              - Forestry and Logging
                              - Fossil Fuel Electric Power Generation
                              - Freight and Package Transportation
                              - Fruit and Vegetable Preserves Manufacturing
                              - Fuel Cell Manufacturing
                              - Fundraising
                              - Funds and Trusts
                              - Funeral Services
                              - Furniture
                              - Furniture and Home Furnishings Manufacturing
                              - Gambling and Casinos
                              - Gambling Facilities and Casinos
                              - Geothermal Electric Power Generation
                              - Glass; Ceramics and Concrete
                              - Glass; Ceramics and Concrete Manufacturing
                              - Glass Product Manufacturing
                              - Golf Courses and Country Clubs
                              - Government Administration
                              - Government Relations
                              - Government Relations Services
                              - Graphic Design
                              - Ground Passenger Transportation
                              - Health and Human Services
                              - Health; Wellness and Fitness
                              - Higher Education
                              - Highway; Street; and Bridge Construction
                              - Historical Sites
                              - Holding Companies
                              - Home Health Care Services
                              - Horticulture
                              - Hospital and Health Care
                              - Hospitality
                              - Hospitals
                              - Hospitals and Health Care
                              - Hotels and Motels
                              - >-
                                Household and Institutional Furniture
                                Manufacturing
                              - Household Appliance Manufacturing
                              - Household Services
                              - Housing and Community Development
                              - Housing Programs
                              - Human Resources
                              - Human Resources Services
                              - HVAC and Refrigeration Equipment Manufacturing
                              - Hydroelectric Power Generation
                              - Import and Export
                              - Individual and Family Services
                              - Industrial Automation
                              - Industrial Machinery Manufacturing
                              - Industry Associations
                              - Information Services
                              - Information Technology and Services
                              - Insurance
                              - Insurance Agencies and Brokerages
                              - Insurance and Employee Benefit Funds
                              - Insurance Carriers
                              - Interior Design
                              - International Affairs
                              - International Trade and Development
                              - Internet
                              - Internet Marketplace Platforms
                              - Internet News
                              - Internet Publishing
                              - Interurban and Rural Bus Services
                              - Investment Advice
                              - Investment Banking
                              - Investment Management
                              - IT Services and IT Consulting
                              - IT System Custom Software Development
                              - IT System Data Services
                              - IT System Design Services
                              - IT System Installation and Disposal
                              - IT System Operations and Maintenance
                              - IT System Testing and Evaluation
                              - IT System Training and Support
                              - Janitorial Services
                              - Judiciary
                              - Landscaping Services
                              - Language Schools
                              - Laundry and Drycleaning Services
                              - Law Enforcement
                              - Law Practice
                              - Leasing Non-residential Real Estate
                              - Leasing Residential Real Estate
                              - Leather Product Manufacturing
                              - Legal Services
                              - Legislative Offices
                              - Leisure; Travel and Tourism
                              - Libraries
                              - Lime and Gypsum Products Manufacturing
                              - Loan Brokers
                              - Logistics and Supply Chain
                              - Luxury Goods and Jewelry
                              - Machinery
                              - Machinery Manufacturing
                              - Magnetic and Optical Media Manufacturing
                              - Management Consulting
                              - Manufacturing
                              - Maritime
                              - Maritime Transportation
                              - Marketing and Advertising
                              - Marketing Services
                              - Market Research
                              - Mattress and Blinds Manufacturing
                              - Measuring and Control Instrument Manufacturing
                              - Meat Products Manufacturing
                              - Mechanical Or Industrial Engineering
                              - Media and Telecommunications
                              - Media Production
                              - Medical and Diagnostic Laboratories
                              - Medical Device
                              - Medical Equipment Manufacturing
                              - Medical Practice
                              - Medical Practices
                              - Mental Health Care
                              - Metal Ore Mining
                              - Metal Treatments
                              - Metal Valve; Ball; and Roller Manufacturing
                              - Metalworking Machinery Manufacturing
                              - Military
                              - Military and International Affairs
                              - Mining
                              - Mining and Metals
                              - Mobile Computing Software Products
                              - Mobile Food Services
                              - Mobile Games
                              - Mobile Gaming Apps
                              - Motion Pictures and Film
                              - Motor Vehicle Manufacturing
                              - Motor Vehicle Parts Manufacturing
                              - Movies and Sound Recording
                              - Movies; Videos; and Sound
                              - Museums
                              - Museums and Institutions
                              - Museums; Historical Sites; and Zoos
                              - Music
                              - Musicians
                              - Nanotechnology
                              - Nanotechnology Research
                              - Natural Gas Distribution
                              - Natural Gas Extraction
                              - Newspaper Publishing
                              - Newspapers
                              - Nonmetallic Mineral Mining
                              - Non-profit Organization Management
                              - Non-profit Organizations
                              - Nonresidential Building Construction
                              - Nuclear Electric Power Generation
                              - Nursing Homes and Residential Care Facilities
                              - Office Administration
                              - Office Furniture and Fixtures Manufacturing
                              - Oil and Coal Product Manufacturing
                              - Oil and Energy
                              - Oil and Gas
                              - Oil Extraction
                              - Oil; Gas; and Mining
                              - Online and Mail Order Retail
                              - Online Audio and Video Media
                              - Online Media
                              - Operations Consulting
                              - Optometrists
                              - Other
                              - Outpatient Care Centers
                              - Outsourcing and Offshoring Consulting
                              - Outsourcing/Offshoring
                              - Package/Freight Delivery
                              - Packaging and Containers
                              - Packaging and Containers Manufacturing
                              - Paint; Coating; and Adhesive Manufacturing
                              - Paper and Forest Product Manufacturing
                              - Paper and Forest Products
                              - Parts Distribution
                              - Pension Funds
                              - Performing Arts
                              - Performing Arts and Spectator Sports
                              - Periodical Publishing
                              - Personal and Laundry Services
                              - Personal Care Product Manufacturing
                              - Personal Care Services
                              - Pet Services
                              - Pharmaceutical Manufacturing
                              - Pharmaceuticals
                              - Philanthropic Fundraising Services
                              - Philanthropy
                              - Photography
                              - Physical; Occupational and Speech Therapists
                              - Physicians
                              - Pipeline Transportation
                              - Plastics
                              - Plastics and Rubber Product Manufacturing
                              - Plastics Manufacturing
                              - Political Organization
                              - Political Organizations
                              - Postal Services
                              - Primary and Secondary Education
                              - Primary Metal Manufacturing
                              - Primary/Secondary Education
                              - Printing
                              - Printing Services
                              - Professional Organizations
                              - Professional Services
                              - Professional Training and Coaching
                              - Program Development
                              - Public Assistance Programs
                              - Public Health
                              - Public Policy
                              - Public Policy Offices
                              - Public Relations and Communications
                              - Public Relations and Communications Services
                              - Public Safety
                              - Public Works
                              - Publishing
                              - Racetracks
                              - Radio and Television Broadcasting
                              - Railroad Equipment Manufacturing
                              - Railroad Manufacture
                              - Rail Transportation
                              - Ranching
                              - Ranching and Fisheries
                              - Real Estate
                              - Real Estate Agents and Brokers
                              - Real Estate and Equipment Rental Services
                              - Recreational Facilities
                              - Recreational Facilities and Services
                              - Regenerative Design
                              - Religious Institutions
                              - Renewable Energy Equipment Manufacturing
                              - Renewable Energy Power Generation
                              - Renewable Energy Semiconductor Manufacturing
                              - Renewables and Environment
                              - Repair and Maintenance
                              - Research
                              - Research Services
                              - Residential Building Construction
                              - Restaurants
                              - Retail
                              - Retail Apparel and Fashion
                              - >-
                                Retail Appliances; Electrical; and Electronic
                                Equipment
                              - Retail Art Dealers
                              - Retail Art Supplies
                              - Retail Books and Printed News
                              - Retail Building Materials and Garden Equipment
                              - Retail Florists
                              - Retail Furniture and Home Furnishings
                              - Retail Gasoline
                              - Retail Groceries
                              - Retail Health and Personal Care Products
                              - Retail Luxury Goods and Jewelry
                              - Retail Motor Vehicles
                              - Retail Musical Instruments
                              - Retail Office Equipment
                              - Retail Office Supplies and Gifts
                              - Retail Pharmacies
                              - Retail Recyclable Materials and Used Merchandise
                              - Reupholstery and Furniture Repair
                              - Robotics Engineering
                              - Robot Manufacturing
                              - Rubber Products Manufacturing
                              - Satellite Telecommunications
                              - Savings Institutions
                              - School and Employee Bus Services
                              - Seafood Product Manufacturing
                              - Secretarial Schools
                              - Securities and Commodity Exchanges
                              - Security and Investigations
                              - Security Guards and Patrol Services
                              - Security Systems Services
                              - Semiconductor Manufacturing
                              - Semiconductors
                              - Services for Renewable Energy
                              - Services for the Elderly and Disabled
                              - Sheet Music Publishing
                              - Shipbuilding
                              - >-
                                Shuttles and Special Needs Transportation
                                Services
                              - Sightseeing Transportation
                              - Skiing Facilities
                              - Smart Meter Manufacturing
                              - Soap and Cleaning Product Manufacturing
                              - Social Networking Platforms
                              - Software Development
                              - Solar Electric Power Generation
                              - Sound Recording
                              - Space Research and Technology
                              - Specialty Trade Contractors
                              - Spectator Sports
                              - Sporting Goods
                              - Sporting Goods Manufacturing
                              - Sports
                              - Sports and Recreation Instruction
                              - Sports Teams and Clubs
                              - Spring and Wire Product Manufacturing
                              - Staffing and Recruiting
                              - Steam and Air-Conditioning Supply
                              - Strategic Management Services
                              - Subdivision of Land
                              - Sugar and Confectionery Product Manufacturing
                              - Supermarkets
                              - Surveying and Mapping Services
                              - Taxi and Limousine Services
                              - Technical and Vocational Training
                              - Technology; Information and Internet
                              - Technology; Information and Media
                              - Telecommunications
                              - Telecommunications Carriers
                              - Telephone Call Centers
                              - Temporary Help Services
                              - Textile Manufacturing
                              - Textiles
                              - Theater Companies
                              - Think Tanks
                              - Tobacco
                              - Tobacco Manufacturing
                              - Translation and Localization
                              - Transportation Equipment Manufacturing
                              - >-
                                Transportation; Logistics; Supply Chain and
                                Storage
                              - Transportation Programs
                              - Transportation/Trucking/Railroad
                              - Travel Arrangements
                              - Truck Transportation
                              - Trusts and Estates
                              - Turned Products and Fastener Manufacturing
                              - Urban Transit Services
                              - Utilities
                              - Utilities Administration
                              - Utility System Construction
                              - Vehicle Repair and Maintenance
                              - Venture Capital and Private Equity
                              - Venture Capital and Private Equity Principals
                              - Veterinary
                              - Veterinary Services
                              - Vocational Rehabilitation Services
                              - Warehousing
                              - Warehousing and Storage
                              - Waste Collection
                              - Waste Treatment and Disposal
                              - Water Supply and Irrigation Systems
                              - >-
                                Water; Waste; Steam; and Air Conditioning
                                Services
                              - Wellness and Fitness Services
                              - Wholesale
                              - Wholesale Alcoholic Beverages
                              - Wholesale Apparel and Sewing Supplies
                              - >-
                                Wholesale Appliances; Electrical; and
                                Electronics
                              - Wholesale Building Materials
                              - Wholesale Chemical and Allied Products
                              - Wholesale Computer Equipment
                              - Wholesale Drugs and Sundries
                              - Wholesale Food and Beverage
                              - Wholesale Footwear
                              - Wholesale Furniture and Home Furnishings
                              - Wholesale Hardware; Plumbing; Heating Equipment
                              - Wholesale Import and Export
                              - Wholesale Luxury Goods and Jewelry
                              - Wholesale Machinery
                              - Wholesale Metals and Minerals
                              - Wholesale Motor Vehicles and Parts
                              - Wholesale Paper Products
                              - Wholesale Petroleum and Petroleum Products
                              - Wholesale Photography Equipment and Supplies
                              - Wholesale Raw Farm Products
                              - Wholesale Recyclable Materials
                              - Wind Electric Power Generation
                              - Wine and Spirits
                              - Wineries
                              - Wireless
                              - Wireless Services
                              - Women\\'s Handbag Manufacturing
                              - Wood Product Manufacturing
                              - Writing and Editing
                              - Zoos and Botanical Gardens
                        exclude:
                          default: []
                          examples:
                            - []
                          type: array
                          items:
                            type: string
                            enum:
                              - Abrasives and Nonmetallic Minerals Manufacturing
                              - Accessible Architecture and Design
                              - Accessible Hardware Manufacturing
                              - Accommodation and Food Services
                              - Accounting
                              - Administration of Justice
                              - Administrative and Support Services
                              - Advertising Services
                              - Agricultural Chemical Manufacturing
                              - >-
                                Agriculture; Construction; Mining Machinery
                                Manufacturing
                              - Airlines and Aviation
                              - Airlines/Aviation
                              - Air; Water; and Waste Program Management
                              - Alternative Dispute Resolution
                              - Alternative Fuel Vehicle Manufacturing
                              - Alternative Medicine
                              - Ambulance Services
                              - Amusement Parks and Arcades
                              - Animal Feed Manufacturing
                              - Animation
                              - Animation and Post-production
                              - Apparel and Fashion
                              - Apparel Manufacturing
                              - >-
                                Appliances; Electrical; and Electronics
                                Manufacturing
                              - Architectural and Structural Metal Manufacturing
                              - Architecture and Planning
                              - Armed Forces
                              - >-
                                Artificial Rubber and Synthetic Fiber
                                Manufacturing
                              - Artists and Writers
                              - Arts and Crafts
                              - Audio and Video Equipment Manufacturing
                              - Automation Machinery Manufacturing
                              - Automotive
                              - Aviation and Aerospace
                              - Aviation and Aerospace Component Manufacturing
                              - Baked Goods Manufacturing
                              - Banking
                              - Bars; Taverns; and Nightclubs
                              - Bed-and-Breakfasts; Hostels; Homestays
                              - Beverage Manufacturing
                              - Biomass Electric Power Generation
                              - Biotechnology
                              - Biotechnology Research
                              - Blockchain Services
                              - Blogs
                              - >-
                                Boilers; Tanks; and Shipping Container
                                Manufacturing
                              - Book and Periodical Publishing
                              - Book Publishing
                              - Breweries
                              - Broadcast Media
                              - Broadcast Media Production and Distribution
                              - Building Construction
                              - Building Equipment Contractors
                              - Building Finishing Contractors
                              - Building Materials
                              - Building Structure and Exterior Contractors
                              - Business Consulting and Services
                              - Business Content
                              - Business Intelligence Platforms
                              - Business Supplies and Equipment
                              - Cable and Satellite Programming
                              - Capital Markets
                              - Caterers
                              - Chemical Manufacturing
                              - Chemical Raw Materials Manufacturing
                              - Chemicals
                              - Child Day Care Services
                              - Chiropractors
                              - Circuses and Magic Shows
                              - Civic and Social Organization
                              - Civic and Social Organizations
                              - Civil Engineering
                              - Claims Adjusting; Actuarial Services
                              - Clay and Refractory Products Manufacturing
                              - Climate Data and Analytics
                              - Climate Technology Product Manufacturing
                              - Coal Mining
                              - Collection Agencies
                              - Commercial and Industrial Equipment Rental
                              - Commercial and Industrial Machinery Maintenance
                              - >-
                                Commercial and Service Industry Machinery
                                Manufacturing
                              - Commercial Real Estate
                              - Communications Equipment Manufacturing
                              - Community Development and Urban Planning
                              - Community Services
                              - Computer and Network Security
                              - Computer Games
                              - Computer Hardware
                              - Computer Hardware Manufacturing
                              - Computer Networking
                              - Computer Networking Products
                              - Computers and Electronics Manufacturing
                              - Computer Software
                              - Conservation Programs
                              - Construction
                              - Construction Hardware Manufacturing
                              - Consumer Electronics
                              - Consumer Goods
                              - Consumer Goods Rental
                              - Consumer Services
                              - Correctional Institutions
                              - Cosmetics
                              - Cosmetology and Barber Schools
                              - Courts of Law
                              - Credit Intermediation
                              - Cutlery and Handtool Manufacturing
                              - Dairy
                              - Dairy Product Manufacturing
                              - Dance Companies
                              - Data Infrastructure and Analytics
                              - Data Security Software Products
                              - Death Care Services
                              - Defense and Space
                              - Defense and Space Manufacturing
                              - Dentists
                              - Design
                              - Design Services
                              - Desktop Computing Software Products
                              - Digital Accessibility Services
                              - Distilleries
                              - Economic Programs
                              - Education
                              - Education Administration Programs
                              - Education Management
                              - E-learning
                              - E-Learning Providers
                              - Electrical and Electronic Manufacturing
                              - Electrical Equipment Manufacturing
                              - Electric Lighting Equipment Manufacturing
                              - Electric Power Generation
                              - >-
                                Electric Power Transmission; Control; and
                                Distribution
                              - Electronic and Precision Equipment Maintenance
                              - Embedded Software Products
                              - Emergency and Relief Services
                              - Energy Technology
                              - Engineering Services
                              - >-
                                Engines and Power Transmission Equipment
                                Manufacturing
                              - Entertainment
                              - Entertainment Providers
                              - Environmental Quality Programs
                              - Environmental Services
                              - Equipment Rental Services
                              - Events Services
                              - Executive Office
                              - Executive Offices
                              - Executive Search Services
                              - Fabricated Metal Products
                              - Facilities Services
                              - Family Planning Centers
                              - Farming
                              - Farming; Ranching; Forestry
                              - Fashion Accessories Manufacturing
                              - Financial Services
                              - Fine Art
                              - Fine Arts Schools
                              - Fire Protection
                              - Fisheries
                              - Fishery
                              - Flight Training
                              - Food and Beverage Manufacturing
                              - Food and Beverage Retail
                              - Food and Beverages
                              - Food and Beverage Services
                              - Food Production
                              - Footwear and Leather Goods Repair
                              - Footwear Manufacturing
                              - Forestry and Logging
                              - Fossil Fuel Electric Power Generation
                              - Freight and Package Transportation
                              - Fruit and Vegetable Preserves Manufacturing
                              - Fuel Cell Manufacturing
                              - Fundraising
                              - Funds and Trusts
                              - Funeral Services
                              - Furniture
                              - Furniture and Home Furnishings Manufacturing
                              - Gambling and Casinos
                              - Gambling Facilities and Casinos
                              - Geothermal Electric Power Generation
                              - Glass; Ceramics and Concrete
                              - Glass; Ceramics and Concrete Manufacturing
                              - Glass Product Manufacturing
                              - Golf Courses and Country Clubs
                              - Government Administration
                              - Government Relations
                              - Government Relations Services
                              - Graphic Design
                              - Ground Passenger Transportation
                              - Health and Human Services
                              - Health; Wellness and Fitness
                              - Higher Education
                              - Highway; Street; and Bridge Construction
                              - Historical Sites
                              - Holding Companies
                              - Home Health Care Services
                              - Horticulture
                              - Hospital and Health Care
                              - Hospitality
                              - Hospitals
                              - Hospitals and Health Care
                              - Hotels and Motels
                              - >-
                                Household and Institutional Furniture
                                Manufacturing
                              - Household Appliance Manufacturing
                              - Household Services
                              - Housing and Community Development
                              - Housing Programs
                              - Human Resources
                              - Human Resources Services
                              - HVAC and Refrigeration Equipment Manufacturing
                              - Hydroelectric Power Generation
                              - Import and Export
                              - Individual and Family Services
                              - Industrial Automation
                              - Industrial Machinery Manufacturing
                              - Industry Associations
                              - Information Services
                              - Information Technology and Services
                              - Insurance
                              - Insurance Agencies and Brokerages
                              - Insurance and Employee Benefit Funds
                              - Insurance Carriers
                              - Interior Design
                              - International Affairs
                              - International Trade and Development
                              - Internet
                              - Internet Marketplace Platforms
                              - Internet News
                              - Internet Publishing
                              - Interurban and Rural Bus Services
                              - Investment Advice
                              - Investment Banking
                              - Investment Management
                              - IT Services and IT Consulting
                              - IT System Custom Software Development
                              - IT System Data Services
                              - IT System Design Services
                              - IT System Installation and Disposal
                              - IT System Operations and Maintenance
                              - IT System Testing and Evaluation
                              - IT System Training and Support
                              - Janitorial Services
                              - Judiciary
                              - Landscaping Services
                              - Language Schools
                              - Laundry and Drycleaning Services
                              - Law Enforcement
                              - Law Practice
                              - Leasing Non-residential Real Estate
                              - Leasing Residential Real Estate
                              - Leather Product Manufacturing
                              - Legal Services
                              - Legislative Offices
                              - Leisure; Travel and Tourism
                              - Libraries
                              - Lime and Gypsum Products Manufacturing
                              - Loan Brokers
                              - Logistics and Supply Chain
                              - Luxury Goods and Jewelry
                              - Machinery
                              - Machinery Manufacturing
                              - Magnetic and Optical Media Manufacturing
                              - Management Consulting
                              - Manufacturing
                              - Maritime
                              - Maritime Transportation
                              - Marketing and Advertising
                              - Marketing Services
                              - Market Research
                              - Mattress and Blinds Manufacturing
                              - Measuring and Control Instrument Manufacturing
                              - Meat Products Manufacturing
                              - Mechanical Or Industrial Engineering
                              - Media and Telecommunications
                              - Media Production
                              - Medical and Diagnostic Laboratories
                              - Medical Device
                              - Medical Equipment Manufacturing
                              - Medical Practice
                              - Medical Practices
                              - Mental Health Care
                              - Metal Ore Mining
                              - Metal Treatments
                              - Metal Valve; Ball; and Roller Manufacturing
                              - Metalworking Machinery Manufacturing
                              - Military
                              - Military and International Affairs
                              - Mining
                              - Mining and Metals
                              - Mobile Computing Software Products
                              - Mobile Food Services
                              - Mobile Games
                              - Mobile Gaming Apps
                              - Motion Pictures and Film
                              - Motor Vehicle Manufacturing
                              - Motor Vehicle Parts Manufacturing
                              - Movies and Sound Recording
                              - Movies; Videos; and Sound
                              - Museums
                              - Museums and Institutions
                              - Museums; Historical Sites; and Zoos
                              - Music
                              - Musicians
                              - Nanotechnology
                              - Nanotechnology Research
                              - Natural Gas Distribution
                              - Natural Gas Extraction
                              - Newspaper Publishing
                              - Newspapers
                              - Nonmetallic Mineral Mining
                              - Non-profit Organization Management
                              - Non-profit Organizations
                              - Nonresidential Building Construction
                              - Nuclear Electric Power Generation
                              - Nursing Homes and Residential Care Facilities
                              - Office Administration
                              - Office Furniture and Fixtures Manufacturing
                              - Oil and Coal Product Manufacturing
                              - Oil and Energy
                              - Oil and Gas
                              - Oil Extraction
                              - Oil; Gas; and Mining
                              - Online and Mail Order Retail
                              - Online Audio and Video Media
                              - Online Media
                              - Operations Consulting
                              - Optometrists
                              - Other
                              - Outpatient Care Centers
                              - Outsourcing and Offshoring Consulting
                              - Outsourcing/Offshoring
                              - Package/Freight Delivery
                              - Packaging and Containers
                              - Packaging and Containers Manufacturing
                              - Paint; Coating; and Adhesive Manufacturing
                              - Paper and Forest Product Manufacturing
                              - Paper and Forest Products
                              - Parts Distribution
                              - Pension Funds
                              - Performing Arts
                              - Performing Arts and Spectator Sports
                              - Periodical Publishing
                              - Personal and Laundry Services
                              - Personal Care Product Manufacturing
                              - Personal Care Services
                              - Pet Services
                              - Pharmaceutical Manufacturing
                              - Pharmaceuticals
                              - Philanthropic Fundraising Services
                              - Philanthropy
                              - Photography
                              - Physical; Occupational and Speech Therapists
                              - Physicians
                              - Pipeline Transportation
                              - Plastics
                              - Plastics and Rubber Product Manufacturing
                              - Plastics Manufacturing
                              - Political Organization
                              - Political Organizations
                              - Postal Services
                              - Primary and Secondary Education
                              - Primary Metal Manufacturing
                              - Primary/Secondary Education
                              - Printing
                              - Printing Services
                              - Professional Organizations
                              - Professional Services
                              - Professional Training and Coaching
                              - Program Development
                              - Public Assistance Programs
                              - Public Health
                              - Public Policy
                              - Public Policy Offices
                              - Public Relations and Communications
                              - Public Relations and Communications Services
                              - Public Safety
                              - Public Works
                              - Publishing
                              - Racetracks
                              - Radio and Television Broadcasting
                              - Railroad Equipment Manufacturing
                              - Railroad Manufacture
                              - Rail Transportation
                              - Ranching
                              - Ranching and Fisheries
                              - Real Estate
                              - Real Estate Agents and Brokers
                              - Real Estate and Equipment Rental Services
                              - Recreational Facilities
                              - Recreational Facilities and Services
                              - Regenerative Design
                              - Religious Institutions
                              - Renewable Energy Equipment Manufacturing
                              - Renewable Energy Power Generation
                              - Renewable Energy Semiconductor Manufacturing
                              - Renewables and Environment
                              - Repair and Maintenance
                              - Research
                              - Research Services
                              - Residential Building Construction
                              - Restaurants
                              - Retail
                              - Retail Apparel and Fashion
                              - >-
                                Retail Appliances; Electrical; and Electronic
                                Equipment
                              - Retail Art Dealers
                              - Retail Art Supplies
                              - Retail Books and Printed News
                              - Retail Building Materials and Garden Equipment
                              - Retail Florists
                              - Retail Furniture and Home Furnishings
                              - Retail Gasoline
                              - Retail Groceries
                              - Retail Health and Personal Care Products
                              - Retail Luxury Goods and Jewelry
                              - Retail Motor Vehicles
                              - Retail Musical Instruments
                              - Retail Office Equipment
                              - Retail Office Supplies and Gifts
                              - Retail Pharmacies
                              - Retail Recyclable Materials and Used Merchandise
                              - Reupholstery and Furniture Repair
                              - Robotics Engineering
                              - Robot Manufacturing
                              - Rubber Products Manufacturing
                              - Satellite Telecommunications
                              - Savings Institutions
                              - School and Employee Bus Services
                              - Seafood Product Manufacturing
                              - Secretarial Schools
                              - Securities and Commodity Exchanges
                              - Security and Investigations
                              - Security Guards and Patrol Services
                              - Security Systems Services
                              - Semiconductor Manufacturing
                              - Semiconductors
                              - Services for Renewable Energy
                              - Services for the Elderly and Disabled
                              - Sheet Music Publishing
                              - Shipbuilding
                              - >-
                                Shuttles and Special Needs Transportation
                                Services
                              - Sightseeing Transportation
                              - Skiing Facilities
                              - Smart Meter Manufacturing
                              - Soap and Cleaning Product Manufacturing
                              - Social Networking Platforms
                              - Software Development
                              - Solar Electric Power Generation
                              - Sound Recording
                              - Space Research and Technology
                              - Specialty Trade Contractors
                              - Spectator Sports
                              - Sporting Goods
                              - Sporting Goods Manufacturing
                              - Sports
                              - Sports and Recreation Instruction
                              - Sports Teams and Clubs
                              - Spring and Wire Product Manufacturing
                              - Staffing and Recruiting
                              - Steam and Air-Conditioning Supply
                              - Strategic Management Services
                              - Subdivision of Land
                              - Sugar and Confectionery Product Manufacturing
                              - Supermarkets
                              - Surveying and Mapping Services
                              - Taxi and Limousine Services
                              - Technical and Vocational Training
                              - Technology; Information and Internet
                              - Technology; Information and Media
                              - Telecommunications
                              - Telecommunications Carriers
                              - Telephone Call Centers
                              - Temporary Help Services
                              - Textile Manufacturing
                              - Textiles
                              - Theater Companies
                              - Think Tanks
                              - Tobacco
                              - Tobacco Manufacturing
                              - Translation and Localization
                              - Transportation Equipment Manufacturing
                              - >-
                                Transportation; Logistics; Supply Chain and
                                Storage
                              - Transportation Programs
                              - Transportation/Trucking/Railroad
                              - Travel Arrangements
                              - Truck Transportation
                              - Trusts and Estates
                              - Turned Products and Fastener Manufacturing
                              - Urban Transit Services
                              - Utilities
                              - Utilities Administration
                              - Utility System Construction
                              - Vehicle Repair and Maintenance
                              - Venture Capital and Private Equity
                              - Venture Capital and Private Equity Principals
                              - Veterinary
                              - Veterinary Services
                              - Vocational Rehabilitation Services
                              - Warehousing
                              - Warehousing and Storage
                              - Waste Collection
                              - Waste Treatment and Disposal
                              - Water Supply and Irrigation Systems
                              - >-
                                Water; Waste; Steam; and Air Conditioning
                                Services
                              - Wellness and Fitness Services
                              - Wholesale
                              - Wholesale Alcoholic Beverages
                              - Wholesale Apparel and Sewing Supplies
                              - >-
                                Wholesale Appliances; Electrical; and
                                Electronics
                              - Wholesale Building Materials
                              - Wholesale Chemical and Allied Products
                              - Wholesale Computer Equipment
                              - Wholesale Drugs and Sundries
                              - Wholesale Food and Beverage
                              - Wholesale Footwear
                              - Wholesale Furniture and Home Furnishings
                              - Wholesale Hardware; Plumbing; Heating Equipment
                              - Wholesale Import and Export
                              - Wholesale Luxury Goods and Jewelry
                              - Wholesale Machinery
                              - Wholesale Metals and Minerals
                              - Wholesale Motor Vehicles and Parts
                              - Wholesale Paper Products
                              - Wholesale Petroleum and Petroleum Products
                              - Wholesale Photography Equipment and Supplies
                              - Wholesale Raw Farm Products
                              - Wholesale Recyclable Materials
                              - Wind Electric Power Generation
                              - Wine and Spirits
                              - Wineries
                              - Wireless
                              - Wireless Services
                              - Women\\'s Handbag Manufacturing
                              - Wood Product Manufacturing
                              - Writing and Editing
                              - Zoos and Botanical Gardens
                    type:
                      description: Exact matches for the company type search
                      type: object
                      properties:
                        include:
                          default: []
                          examples:
                            - []
                          type: array
                          items:
                            type: string
                            enum:
                              - Educational
                              - Educational Institution
                              - Government Agency
                              - Nonprofit
                              - Partnership
                              - Privately Held
                              - Public Company
                              - Self-Employed
                              - Self-Owned
                              - Sole Proprietorship
                        exclude:
                          default: []
                          examples:
                            - - Nonprofit
                              - Partnership
                          type: array
                          items:
                            type: string
                            enum:
                              - Educational
                              - Educational Institution
                              - Government Agency
                              - Nonprofit
                              - Partnership
                              - Privately Held
                              - Public Company
                              - Self-Employed
                              - Self-Owned
                              - Sole Proprietorship
                    employee_range:
                      default: []
                      examples:
                        - - 1-10
                          - 11-50
                          - 51-200
                          - 201-500
                          - 501-1000
                          - 1001-5000
                          - 5001-10000
                          - 10001+
                      description: Exact matches for the employee range search
                      type: array
                      items:
                        type: string
                        enum:
                          - 1-10
                          - 11-50
                          - 51-200
                          - 201-500
                          - 501-1000
                          - 1001-5000
                          - 5001-10000
                          - 10001+
                    employee_count:
                      description: Range search for the number of employees on LinkedIn
                      type: object
                      properties:
                        min:
                          default: 0
                          examples:
                            - 0
                          type: number
                          minimum: 0
                          maximum: 980000
                        max:
                          default: 0
                          examples:
                            - 0
                          type: number
                          minimum: 0
                          maximum: 1000000
                    min_linkedin_followers:
                      default: 0
                      examples:
                        - 0
                      description: Minimum number of LinkedIn followers
                      type: number
                      minimum: 0
                      maximum: 10000000
                    keywords:
                      description: Keywords searched in the company description
                      type: object
                      properties:
                        include:
                          default: []
                          examples:
                            - - Tech
                          type: array
                          items:
                            type: string
                        exclude:
                          default: []
                          examples:
                            - - Finance
                              - Marketing
                          type: array
                          items:
                            type: string
                    founded_year:
                      description: Range search for the year the company was founded
                      type: object
                      properties:
                        min:
                          default: 0
                          examples:
                            - 0
                          type: number
                          minimum: 0
                          maximum: 1000000000
                        max:
                          default: 0
                          examples:
                            - 0
                          type: number
                          minimum: 0
                          maximum: 1000000000
                    hq:
                      description: Location of the headquarters of the company
                      type: object
                      properties:
                        city:
                          description: >-
                            Keywords searched to find the headquarters city of
                            the company
                          type: object
                          properties:
                            include:
                              default: []
                              examples:
                                - - City
                              type: array
                              items:
                                type: string
                                minLength: 1
                            exclude:
                              default: []
                              examples:
                                - - New
                              type: array
                              items:
                                type: string
                                minLength: 1
                        country_code:
                          default: []
                          examples:
                            - []
                          description: >-
                            Exact matches for the country code of the
                            headquarters
                          type: array
                          items:
                            type: string
                            minLength: 1
                        continent:
                          default: []
                          examples:
                            - []
                          description: Exact matches for the continent of the headquarters
                          type: array
                          items:
                            type: string
                            enum:
                              - Africa
                              - Antarctica
                              - Asia
                              - Europe
                              - North America
                              - Oceania
                              - South America
                        sales_region:
                          default: []
                          examples:
                            - []
                          description: >-
                            Exact matches for the sales region of the
                            headquarters
                          type: array
                          items:
                            type: string
                            enum:
                              - NORAM
                              - LATAM
                              - EMEA
                              - APAC
                people:
                  description: People search criteria for company matching
                  type: object
                  properties:
                    job_title:
                      description: >-
                        Find at least one person with the given job title in the
                        company. Values match as a keyword search by default;
                        wrap a value in square brackets (`"[CEO]"`) to require
                        an exact, case- and accent-insensitive match. See [Field
                        normalization](/guide/reference/normalization/filters#exact-match-syntax).
                      type: object
                      properties:
                        include_linkedin_headline:
                          default: false
                          examples:
                            - false
                          description: >-
                            Whether to include the LinkedIn headline in the
                            job_title search
                          type: boolean
                        include:
                          default: []
                          examples:
                            - - Software Engineer
                          type: array
                          items:
                            type: string
                        exclude:
                          default: []
                          examples:
                            - - CTO
                          type: array
                          items:
                            type: string
                    job_function:
                      default: []
                      examples:
                        - - Advertising & Marketing
                      description: Exact matches for the job function search
                      type: array
                      items:
                        type: string
                        enum:
                          - Advertising & Marketing
                          - Art, Culture and Creative Professionals
                          - Construction
                          - Customer/Client Service
                          - Education
                          - Engineering
                          - Finance & Accounting
                          - General Business & Management
                          - Healthcare & Human Services
                          - Human Resources
                          - Information Technology
                          - Legal
                          - Manufacturing & Production
                          - Operations
                          - Other
                          - Public Administration & Safety
                          - Purchasing
                          - Research & Development
                          - Sales & Business Development
                          - Science
                          - Supply Chain & Logistics
                          - Writing/Editing
                    job_level:
                      examples:
                        - - VP
                          - Director
                      description: Exact matches for the job level search
                      type: array
                      items:
                        type: string
                        enum:
                          - C-Team
                          - Director
                          - Manager
                          - Other
                          - Staff
                          - VP
                    min_connections:
                      default: 0
                      examples:
                        - 500
                      description: Minimum number of LinkedIn connections to find
                      type: number
                      minimum: 0
                      maximum: 500
                    location:
                      description: Location of the people to find
                      type: object
                      properties:
                        city:
                          default: []
                          examples:
                            - - Paris
                              - London
                          type: array
                          items:
                            type: string
                        country_code:
                          default: []
                          examples:
                            - - FR
                              - GB
                          type: array
                          items:
                            type: string
                            minLength: 2
                            maxLength: 3
                        continent:
                          default: []
                          examples:
                            - - Europe
                          type: array
                          items:
                            type: string
                            enum:
                              - Africa
                              - Antarctica
                              - Asia
                              - Europe
                              - North America
                              - Oceania
                              - South America
                        sales_region:
                          default: []
                          examples:
                            - - EMEA
                          type: array
                          items:
                            type: string
                            enum:
                              - NORAM
                              - LATAM
                              - EMEA
                              - APAC
                max_results:
                  default: 10
                  examples:
                    - 10
                  description: Maximum number of results to return
                  type: number
                  minimum: 1
                  maximum: 50
                cursor:
                  default: null
                  examples:
                    - null
                  description: Cursor to paginate through the results
                  anyOf:
                    - type: string
                      minLength: 3
                    - type: 'null'
              example:
                company:
                  linkedin_url: []
                  name:
                    include: []
                    exclude: []
                  industry:
                    include: []
                    exclude: []
                  type:
                    include: []
                    exclude: []
                  employee_range:
                    - 1-10
                    - 11-50
                    - 51-200
                    - 201-500
                    - 501-1000
                    - 1001-5000
                    - 5001-10000
                    - 10001+
                  employee_count:
                    min: 1
                    max: 0
                  min_linkedin_followers: 1
                  keywords:
                    include: []
                    exclude: []
                  founded_year:
                    min: 0
                    max: 0
                  hq:
                    city:
                      include: []
                      exclude: []
                    country_code: []
                    continent: []
                    sales_region: []
                people:
                  job_title:
                    include_linkedin_headline: false
                    include: []
                    exclude: []
                  job_function: []
                  job_level: []
                  min_connections: 500
                  location:
                    city: []
                    country_code:
                      - US
                    continent: []
                    sales_region: []
                max_results: 3
                cursor: null
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                example:
                  total_results: 14337505
                  results:
                    - first_name: Roman
                      last_name: Orunbayev
                      full_name: Roman Orunbayev
                      nickname: null
                      civility_title: null
                      headline: Happily employed by Google🚀
                      about_me: >-
                        Linux Administrator with over 5 years of experience in
                        varied industries…
                      location:
                        city: Owasso
                        state_code: OK
                        country_code: US
                        continent: North America
                      linkedin_url: https://www.linkedin.com/in/orro
                      connections_count: 500
                      profile_picture_url: >-
                        https://media.licdn.com/dms/image/v2/D4E03AQEMu2e6LE7OIg/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1723677210429
                      experiences:
                        - company_name: Google
                          job_title: null
                          company_linkedin_url: https://www.linkedin.com/company/google
                          company_linkedin_id: c346a3f2-6914-51e8-bb11-7da93440a3c0
                          company_domain: google.com
                          job_description: null
                          job_start_date: null
                          job_end_date: null
                          job_is_current: true
                          job_location:
                            city: null
                            state_code: null
                            country_code: null
                      education: []
                      skills: []
                      certifications:
                        - authority: ZiyoTek Institute of Technology
                          name: DevOps Engineer Diploma
                          url: >-
                            https://www.credly.com/badges/3708542b-26a2-4845-bd42-932727a1db9e
                        - authority: Red Hat
                          name: Red Hat Certified System Administrator (RHCSA)
                          url: https://rhtapps.redhat.com/verify
                    - first_name: Beulah
                      last_name: Lee
                      full_name: Beulah Lee
                      nickname: null
                      civility_title: null
                      headline: Software Engineer at Google
                      about_me: >-
                        I am a highly motivated and self-disciplined software
                        engineer with a strong foundation…
                      location:
                        city: Sunnyvale
                        state_code: CA
                        country_code: US
                        continent: North America
                      linkedin_url: https://www.linkedin.com/in/beulah-lee
                      connections_count: 500
                      profile_picture_url: >-
                        https://media.licdn.com/dms/image/v2/D5603AQH3qwMwMK2t6Q/profile-displayphoto-scale_200_200/B56ZpUud.kIYAY-/0/1762358059936
                      experiences:
                        - company_name: Google
                          job_title: Software Engineer
                          company_linkedin_url: https://www.linkedin.com/company/google
                          company_linkedin_id: c346a3f2-6914-51e8-bb11-7da93440a3c0
                          company_domain: google.com
                          job_description: Google Workspace
                          job_start_date: '2025-04-01'
                          job_end_date: null
                          job_is_current: true
                          job_location:
                            city: Sunnyvale
                            state_code: CA
                            country_code: US
                      education:
                        - degree: Bachelor's degree
                          start_date: '2019-01-01'
                          end_date: '2023-01-01'
                        - degree: Leadership Certificate
                          start_date: '2019-01-01'
                          end_date: '2021-01-01'
                        - degree: Minor
                          start_date: '2022-01-01'
                          end_date: '2023-01-01'
                      skills: []
                      certifications:
                        - authority: Google
                          name: Google Cloud Cybersecurity Certificate
                          url: >-
                            https://www.credly.com/badges/755d5778-3462-4f74-bbbb-aa2c6b69be2c/public_url
                        - authority: Amazon Web Services (AWS)
                          name: AWS Certified Cloud Practitioner Certification
                          url: >-
                            https://www.credly.com/badges/97bf3cd5-94a1-4d79-a672-547bb99f6a48/public_url
                        - authority: Discover Financial Services
                          name: Certified Application Security Professional
                    - first_name: Tran
                      last_name: Hang
                      full_name: Tran Hang
                      nickname: null
                      civility_title: null
                      headline: >-
                        Director Global Product Solutions: Performance Max ,
                        Lead Generation Solutions, Vertical Solutions (Travel,
                        Local, Autos, etc).
                      about_me: >-
                        Professional with: Extensive experience in product
                        strategy, go-to-market operations…
                      location:
                        city: null
                        state_code: null
                        country_code: US
                        continent: North America
                      linkedin_url: https://www.linkedin.com/in/tranhang
                      connections_count: 500
                      profile_picture_url: >-
                        https://media.licdn.com/dms/image/v2/C4E03AQEiQYQrYYmPwg/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1553146573521
                      experiences:
                        - company_name: Google
                          job_title: >-
                            Director Global Product Solutions Performance Max,
                            Lead Gen, Local, Travel
                          company_linkedin_url: https://www.linkedin.com/company/google
                          company_linkedin_id: c346a3f2-6914-51e8-bb11-7da93440a3c0
                          company_domain: google.com
                          job_description: null
                          job_start_date: '2025-05-01'
                          job_end_date: null
                          job_is_current: true
                          job_location:
                            city: null
                            state_code: null
                            country_code: null
                      education:
                        - degree: Master of Business Administration - MBA
                        - degree: Bachelor of Arts
                        - degree: Bachelor's degree
                          start_date: '1996-01-01'
                          end_date: '2000-01-01'
                      skills:
                        - sem
                        - online marketing
                        - marketing strategy
                      certifications: []
                  results_length: 3
                  max_results: 3
                  cursor: >-
                    eyJzIjpbNTAwLDQwNTE3ODE4LDMzMTk2MV0sIm8iOjN9.p_8tss535KvrL-hmwsnW9JfW7rHHbt2NLQuVODC3bjw
        '401':
          description: Response for status 401
          content:
            application/json:
              schema:
                $schema: https://json-schema.org/draft/2020-12/schema
                type: object
                properties:
                  success:
                    type: boolean
                    const: false
                  message:
                    type: string
                required:
                  - success
                  - message
                additionalProperties: false
                examples:
                  - success: false
                    message: >-
                      Invalid API key, please provide a valid API key in the
                      'x-api-key' header
        '404':
          description: Response for status 404
          content:
            application/json:
              schema:
                $schema: https://json-schema.org/draft/2020-12/schema
                type: object
                properties:
                  success:
                    type: boolean
                    const: false
                  message:
                    type: string
                required:
                  - success
                  - message
                additionalProperties: false
                examples:
                  - success: false
                    message: Not Found
        '429':
          description: Response for status 429
          content:
            application/json:
              schema:
                $schema: https://json-schema.org/draft/2020-12/schema
                type: object
                properties:
                  success:
                    type: boolean
                    const: false
                  message:
                    type: string
                required:
                  - success
                  - message
                additionalProperties: false
                examples:
                  - success: false
                    message: Rate limit exceeded, please try again later
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