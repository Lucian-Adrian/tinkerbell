# Requirements Document

## Introduction

Tinkerbell is a full-stack autonomous marketing platform designed to bridge the gap between marketing strategy and execution for funded technology startups. The platform functions as an AI Chief Marketing Officer, taking users from initial business context through automated strategy generation to live, iterating campaigns. It solves the fundamental disconnect between strategic planning (the "Birdiva layer") and campaign execution (the "Icon layer") by creating a unified, intelligent system that leverages hyper-iteration with microbudgets.

The platform employs a "Glass Box" architecture where every AI transformation, prompt, and state transition is explicit and traceable, utilizing advanced Gemini and Imagen models for strategic reasoning, creative generation, and visual asset creation.

## Requirements

### Requirement 1: Business Context Ingestion

**User Story:** As a startup founder, I want to provide my company's basic information through structured text fields so that the platform can understand my business and generate relevant marketing strategies.

#### Acceptance Criteria

1. WHEN a user creates a new business profile THEN the system SHALL prompt for structured business information as the primary input method
2. WHEN collecting business context THEN the system SHALL require the following text fields: product description (3-5 sentences), specific pain points of target audience, value proposition/solution description, and market signals indicating need
3. WHEN a user provides business description THEN the system SHALL validate minimum content requirements and provide guidance for completion
4. IF a user wants to provide additional context THEN the system SHALL allow optional pitch deck upload in PDF format (maximum 20MB)
5. IF a user wants to provide supplementary context THEN the system SHALL allow optional website URL input
6. WHEN optional files are uploaded THEN the system SHALL validate file format, size constraints, and URL accessibility
7. WHEN all required structured text fields are completed THEN the system SHALL enable the "Generate My Strategy" action

### Requirement 2: Autonomous Strategy Generation

**User Story:** As a startup founder, I want the platform to automatically analyze my business and generate a comprehensive go-to-market strategy so that I don't need expensive consultants or manual research.

#### Acceptance Criteria

1. WHEN a user initiates strategy generation THEN the system SHALL display a loading interface with progress indicators
2. WHEN analyzing business context THEN the system SHALL extract key information from the website and pitch deck
3. WHEN identifying target markets THEN the system SHALL generate 5-10 recommended industries with opportunity scores
4. WHEN defining customer profiles THEN the system SHALL create detailed ICPs including title, department, key challenges, and value propositions
5. WHEN researching target accounts THEN the system SHALL identify real companies with relevant buying signals
6. WHEN crafting messaging THEN the system SHALL generate persona-specific value propositions and messaging angles
7. WHEN strategy generation is complete THEN the system SHALL present results in an organized dashboard format

### Requirement 3: Human-in-the-Loop Strategy Review

**User Story:** As a startup founder, I want to review and approve the AI-generated strategy before campaign creation so that I maintain control over my marketing direction.

#### Acceptance Criteria

1. WHEN strategy generation completes THEN the system SHALL present a multi-tabbed review dashboard
2. WHEN displaying industries THEN the system SHALL show recommended industries ranked by opportunity score
3. WHEN a user reviews industries THEN the system SHALL require selection of top 3 industries to proceed
4. WHEN displaying ICPs THEN the system SHALL show detailed customer profile cards for selected industries
5. WHEN showing target accounts THEN the system SHALL display real companies with identified buying signals
6. WHEN displaying buying signals THEN the system SHALL show specific, actionable insights for each target company
7. WHEN strategy review is complete THEN the system SHALL enable strategy approval and campaign generation

### Requirement 4: Autonomous Campaign Asset Generation

**User Story:** As a startup founder, I want the platform to automatically create campaign assets based on my approved strategy so that I can launch marketing campaigns without manual creative work.

#### Acceptance Criteria

1. WHEN strategy is approved THEN the system SHALL initiate autonomous campaign generation
2. WHEN generating campaigns THEN the system SHALL display progress indicators for asset creation
3. WHEN creating ad copy THEN the system SHALL generate multiple variants tailored to each ICP
4. WHEN generating visuals THEN the system SHALL create static images and brand visuals for each campaign variant
5. WHEN creating hashtags THEN the system SHALL generate relevant hashtags for each ad variant
6. WHEN determining platforms THEN the system SHALL recommend appropriate social media platforms for each variant
7. WHEN asset generation completes THEN the system SHALL organize results by strategic angle or ICP and show them in a clean organized way

### Requirement 5: Campaign Dashboard and Multi-Channel Distribution

**User Story:** As a startup founder, I want to view all generated campaign assets in an organized dashboard and distribute them through multiple channels (direct posting or manual download) so that I can efficiently launch my marketing campaigns.

#### Acceptance Criteria

1. WHEN campaign generation completes THEN the system SHALL display a comprehensive campaign dashboard
2. WHEN organizing campaigns THEN the system SHALL group assets by strategic angle or ICP
3. WHEN displaying ad variants THEN the system SHALL show generated image, ad copy, hashtags, recommended platform, and posting status
4. WHEN a user wants to post directly THEN the system SHALL provide "Post/Schedule" buttons for each campaign variant
5. WHEN a user wants to export assets THEN the system SHALL provide "Download Assets" functionality as an alternative distribution method
6. WHEN exporting campaigns THEN the system SHALL package all assets in an organized, ready-to-use format
7. WHEN viewing the dashboard THEN the system SHALL provide clear visual organization, posting status indicators, and easy navigation between campaign variants
8. WHEN campaigns are posted THEN the system SHALL display posting history and status for each variant

### Requirement 6: User Account and Business Management

**User Story:** As a startup founder, I want to manage my account and business profiles so that I can organize multiple projects and maintain my marketing strategies.

#### Acceptance Criteria

1. WHEN a new user visits the platform THEN the system SHALL provide account signup functionality
2. WHEN a user signs up THEN the system SHALL create a secure user account with authentication
3. WHEN a user logs in THEN the system SHALL provide access to their business profiles and campaigns
4. WHEN creating a business profile THEN the system SHALL allow users to manage multiple business entities
5. WHEN accessing existing profiles THEN the system SHALL display previous strategies and campaigns
6. WHEN managing account settings THEN the system SHALL provide user preference and profile management options

###
 Requirement 7: Backend Worker Architecture and State Management

**User Story:** As a system administrator, I want a robust backend architecture that can handle autonomous AI processing so that the platform can reliably generate strategies and campaigns at scale.

#### Acceptance Criteria

1. WHEN a campaign generation is initiated THEN the system SHALL queue the job in Redis with appropriate priority and timeout settings
2. WHEN processing campaign jobs THEN the system SHALL maintain explicit state transitions: PENDING → STRATEGY_GENERATING → STRATEGY_READY → CAMPAIGN_GENERATING → COMPLETE
3. WHEN state transitions occur THEN the system SHALL update the campaigns table with current status and timestamp
4. WHEN errors occur during processing THEN the system SHALL transition to appropriate failure states (STRATEGY_FAILED, CAMPAIGN_FAILED) with error details
5. WHEN jobs are queued THEN the system SHALL implement proper retry logic with exponential backoff for transient failures
6. WHEN processing multiple campaigns THEN the system SHALL handle concurrent job execution without resource conflicts
7. WHEN job status is requested THEN the system SHALL provide real-time status updates to the frontend via WebSocket or polling

### Requirement 8: AI Strategy Generation with Gemini Integration

**User Story:** As a system, I need to leverage advanced AI models to generate comprehensive marketing strategies so that users receive high-quality, contextually relevant strategic recommendations.

#### Acceptance Criteria

1. WHEN generating strategy THEN the system SHALL use gemini-2.5-pro with thinkingBudget=-1 for maximum reasoning depth
2. WHEN campaign.url is provided THEN the system SHALL enable URL Context tool for external grounding and website analysis
3. WHEN building prompts THEN the system SHALL create layered prompt sequences including owner-input JSON, optional URL context, and optional pitch-deck text
4. WHEN requesting AI responses THEN the system SHALL enforce strict response_schema JSON via API-level schema configuration
5. WHEN generating responses THEN the system SHALL set responseMimeType="application/json" to ensure machine-readable outputs
6. WHEN strategy generation completes THEN the system SHALL validate response against expected schema properties: icps, target_accounts, industries, value_propositions
7. WHEN validation fails THEN the system SHALL retry with refined prompts or transition to failure state with detailed error logging

### Requirement 9: AI Campaign Asset Generation with Multi-Model Integration

**User Story:** As a system, I need to generate high-quality campaign assets using specialized AI models so that users receive professional-grade marketing materials.

#### Acceptance Criteria

1. WHEN generating ad copy THEN the system SHALL use gemini-2.5-flash for each ICP/value proposition combination to create multiple variations
2. WHEN creating image prompts THEN the system SHALL use gemini-2.5-flash to generate rich, detailed Imagen prompt strings
3. WHEN generating preview images THEN the system SHALL use imagen-4-fast for rapid preview generation
4. WHEN users request final assets THEN the system SHALL provide upgrade option to regenerate using imagen-4-ultra for highest quality
5. WHEN processing multiple asset requests THEN the system SHALL batch similar requests for efficiency
6. WHEN generating assets THEN the system SHALL maintain consistent brand elements and messaging across all variants
7. WHEN asset generation fails THEN the system SHALL implement fallback strategies and provide meaningful error messages

### Requirement 10: Glass Box Architecture and Traceability

**User Story:** As a developer and system administrator, I need complete visibility into AI processing so that I can debug issues, optimize performance, and ensure quality outputs.

#### Acceptance Criteria

1. WHEN any AI model is called THEN the system SHALL log the complete prompt, model parameters, and response
2. WHEN state transitions occur THEN the system SHALL record detailed transition logs with timestamps and triggering events
3. WHEN processing campaigns THEN the system SHALL maintain audit trails for all transformations and decisions
4. WHEN errors occur THEN the system SHALL capture complete context including input data, processing state, and error details
5. WHEN performance monitoring is needed THEN the system SHALL track model response times, token usage, and success rates
6. WHEN debugging is required THEN the system SHALL provide tools to replay processing steps and inspect intermediate results
7. WHEN quality assurance is performed THEN the system SHALL enable comparison of outputs across different model configurations

### Requirement 11: Model Selection and Performance Optimization

**User Story:** As a system architect, I need intelligent model selection and performance optimization so that the platform delivers fast, cost-effective, and high-quality results.

#### Acceptance Criteria

1. WHEN performing strategic reasoning THEN the system SHALL use gemini-2.5-pro for complex analysis and decision-making tasks
2. WHEN generating creative content THEN the system SHALL use gemini-2.5-flash for rapid copy generation and prompt engineering
3. WHEN creating visual previews THEN the system SHALL use imagen-4-fast for quick iteration and user feedback
4. WHEN producing final visual assets THEN the system SHALL offer imagen-4-ultra upgrade for maximum quality
5. WHEN processing batch requests THEN the system SHALL optimize API calls to minimize latency and cost
6. WHEN models are unavailable THEN the system SHALL implement graceful fallback strategies with appropriate user notification
7. WHEN performance degrades THEN the system SHALL automatically adjust model parameters or switch to alternative approaches
### R
equirement 12: Social & Ad Account Integration

**User Story:** As a startup founder, I want to connect my company's social media and ad accounts to Tinkerbell so that I can seamlessly post and schedule my campaigns.

#### Acceptance Criteria

1. WHEN a user navigates to settings THEN the system SHALL present a "Connected Accounts" section
2. WHEN viewing the "Connected Accounts" section THEN the system SHALL display UI elements (logo and "Connect" button) for Meta (Facebook & Instagram), Google Ads, X (Twitter), TikTok, and LinkedIn
3. WHEN a user clicks a "Connect" button THEN the system SHALL initiate the appropriate OAuth flow for production or display mock confirmation for MVP
4. WHEN implementing MVP mock THEN the system SHALL display confirmation message ("Account successfully connected!") without real OAuth flow
5. WHEN an account is connected THEN the system SHALL visually update its status with green checkmark and "Disconnect" button text
6. WHEN designing the integration layer THEN the system SHALL implement a pluggable architecture that allows easy transition from mock to real OAuth implementations
7. WHEN storing connection status THEN the system SHALL maintain account connection state in the database for consistent UI behavior

### Requirement 13: Campaign Auto-Posting and Scheduling

**User Story:** As a startup founder, I want to instantly publish or schedule my generated campaign assets to my connected accounts directly from the Tinkerbell dashboard.

#### Acceptance Criteria

1. WHEN viewing the campaign dashboard THEN each generated ad variant SHALL display both "Post/Schedule" and "Download Assets" buttons as primary actions
2. WHEN a user clicks the "Post" or "Schedule" button THEN the system SHALL open a modal displaying connected social accounts
3. WHEN the posting modal is open THEN the user SHALL be able to select one or more accounts and set scheduling options
4. WHEN the user confirms posting selection THEN the system SHALL execute posting logic (real API calls in production, mock success in MVP)
5. WHEN implementing MVP mock THEN the system SHALL display success message ("Your post has been scheduled!") and update ad variant status to "Scheduled"
6. WHEN an ad is posted/scheduled THEN the system SHALL maintain posting history and status for each variant
7. WHEN designing the posting architecture THEN the system SHALL implement a service layer that abstracts social media APIs for easy testing and mock/real implementation switching

### Requirement 14: Modular Architecture and Testing Framework

**User Story:** As a developer, I want a well-structured, modular system architecture so that components can be easily tested, debugged, and modified independently.

#### Acceptance Criteria

1. WHEN implementing social media integration THEN the system SHALL use dependency injection for OAuth providers and posting services
2. WHEN building the posting system THEN the system SHALL implement interface-based abstractions (ISocialMediaService, IOAuthProvider) for easy mocking
3. WHEN creating the service layer THEN the system SHALL separate concerns: authentication services, posting services, and campaign management services
4. WHEN implementing configuration THEN the system SHALL use environment-based configuration to switch between mock and real implementations
5. WHEN writing tests THEN the system SHALL provide comprehensive unit tests for all service interfaces and business logic
6. WHEN debugging is needed THEN the system SHALL implement structured logging with correlation IDs for tracing requests across services
7. WHEN deploying THEN the system SHALL support feature flags to enable/disable social media posting functionality independently