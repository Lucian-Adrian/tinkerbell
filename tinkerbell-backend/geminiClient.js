const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiAI {
    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            console.warn('⚠️ GEMINI_API_KEY not found in environment variables');
            this.genAI = null;
        } else {
            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        }
    }

    /**
     * Generate comprehensive strategy including industries, ICPs, and target accounts
     * @param {Object} businessData - The business information
     * @param {string} goal - The selected marketing goal
     * @returns {Promise<Object>} Generated strategy in JSON format
     */
    async generateCompleteStrategy(businessData, goal) {
        console.log('🧠 Gemini: Generating complete marketing strategy...');

        if (!this.genAI) {
            return this._getMockStrategy(businessData, goal);
        }

        const prompt = this._buildStrategyPrompt(businessData, goal);

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const content = response.text().trim();
            
            console.log('🎯 Gemini: Strategy generated successfully');

            // Clean the response - remove markdown code blocks if present
            let cleanContent = content;
            if (content.includes('```json')) {
                cleanContent = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
            } else if (content.includes('```')) {
                cleanContent = content.replace(/```\s*/g, '');
            }

            // Parse and validate JSON
            return JSON.parse(cleanContent);

        } catch (error) {
            console.error('❌ Gemini Error generating strategy:', error.message);
            return this._getMockStrategy(businessData, goal);
        }
    }

    /**
     * Generate additional industries based on existing selection
     */
    async generateMoreIndustries(businessData, goal, existingIndustries = []) {
        console.log('🔄 Gemini: Generating additional industries...');

        if (!this.genAI) {
            return this._getMockIndustries(businessData, goal);
        }

        const prompt = `
Based on this business information:
- Business Name: ${businessData.businessName}
- Product/Service: ${businessData.productDescription}
- Pain Points Solved: ${businessData.painPoints}
- Value Proposition: ${businessData.valueProposition}
- Goal: ${goal}

And these already suggested industries: ${existingIndustries.map(i => i.name).join(', ')}

Generate 6 NEW different target industries (avoid duplicating existing ones). For each industry, provide:
- name: Industry name
- reasoning: Why this industry is perfect for the goal "${goal}"
- marketSize: Estimated market size
- competitiveAdvantage: Unique advantage we have
- confidence: Confidence score (0-100)

Return as valid JSON in this format:
{
  "industries": [
    {
      "name": "Industry Name",
      "reasoning": "Detailed reasoning...",
      "marketSize": "$XX billion",
      "competitiveAdvantage": "Our advantage...",
      "confidence": 85
    }
  ]
}`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const content = response.text().trim();
            
            let cleanContent = content;
            if (content.includes('```json')) {
                cleanContent = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
            }

            return JSON.parse(cleanContent);
        } catch (error) {
            console.error('❌ Gemini Error generating more industries:', error.message);
            return this._getMockIndustries(businessData, goal);
        }
    }

    /**
     * Generate customer profiles (ICPs) for selected industries
     */
    async generateICPs(businessData, goal, selectedIndustries) {
        console.log('👥 Gemini: Generating customer profiles...');

        if (!this.genAI) {
            return this._getMockICPs(businessData, goal, selectedIndustries);
        }

        const prompt = `
Based on this business:
- Business Name: ${businessData.businessName}
- Product/Service: ${businessData.productDescription}
- Pain Points Solved: ${businessData.painPoints}
- Value Proposition: ${businessData.valueProposition}
- Goal: ${goal}

For these target industries: ${selectedIndustries.map(i => i.name).join(', ')}

Generate 6 detailed Ideal Customer Profiles (ICPs). Each should include:
- title: Decision maker job title
- industry: Which industry they belong to
- painPoints: Array of specific pain points
- valueProps: Array of how we solve their problems
- demographics: Company size, location, etc.
- buyingBehavior: How they make decisions
- messagingAngle: Key messaging approach
- confidence: Confidence score (0-100)

Return as valid JSON:
{
  "icps": [
    {
      "title": "Job Title",
      "industry": "Industry Name",
      "painPoints": ["Pain 1", "Pain 2"],
      "valueProps": ["Value 1", "Value 2"],
      "demographics": "Details...",
      "buyingBehavior": "Behavior description...",
      "messagingAngle": "Messaging approach...",
      "confidence": 88
    }
  ]
}`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const content = response.text().trim();
            
            let cleanContent = content;
            if (content.includes('```json')) {
                cleanContent = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
            }

            return JSON.parse(cleanContent);
        } catch (error) {
            console.error('❌ Gemini Error generating ICPs:', error.message);
            return this._getMockICPs(businessData, goal, selectedIndustries);
        }
    }

    /**
     * Generate target accounts for selected ICPs
     */
    async generateTargetAccounts(businessData, selectedICPs) {
        console.log('🏢 Gemini: Generating target accounts...');

        if (!this.genAI) {
            return this._getMockTargetAccounts(businessData, selectedICPs);
        }

        const prompt = `
Based on this business context:
- Business Name: ${businessData.businessName}
- Product/Service: ${businessData.productDescription}
- Website: ${businessData.websiteUrl || 'Not provided'}

For these target customer profiles:
${selectedICPs.map(icp => `- ${icp.title} in ${icp.industry}`).join('\n')}

Generate 8 realistic target company accounts that would be perfect prospects. Include:
- companyName: Realistic company name
- industry: Which industry category
- size: Employee count
- location: Geographic location (focus on Eastern Europe if relevant)
- fitReason: Why they're a perfect fit
- decisionMaker: Which ICP role would be the contact
- confidence: How confident we are about this fit (0-100)

Return as valid JSON:
{
  "targetAccounts": [
    {
      "companyName": "Company Name",
      "industry": "Industry",
      "size": "X employees",
      "location": "City, Country",
      "fitReason": "Why they're perfect...",
      "decisionMaker": "Job Title",
      "confidence": 92
    }
  ]
}`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const content = response.text().trim();
            
            let cleanContent = content;
            if (content.includes('```json')) {
                cleanContent = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
            }

            return JSON.parse(cleanContent);
        } catch (error) {
            console.error('❌ Gemini Error generating target accounts:', error.message);
            return this._getMockTargetAccounts(businessData, selectedICPs);
        }
    }

    /**
     * Generate campaign posts for approved strategy
     */
    async generateCampaignPosts(businessData, goal, selectedIndustries, selectedICPs) {
        console.log('🎨 Gemini: Generating campaign posts...');

        if (!this.genAI) {
            return this._getMockPosts(businessData, goal);
        }

        const prompt = `
Create 8 engaging social media posts for this business:
- Business: ${businessData.businessName}
- Product: ${businessData.productDescription}
- Value Prop: ${businessData.valueProposition}
- Goal: ${goal}

Target Industries: ${selectedIndustries.map(i => i.name).join(', ')}
Target Audiences: ${selectedICPs.map(icp => icp.title).join(', ')}

Each post should:
- Be platform-agnostic (works on LinkedIn, Facebook, Instagram)
- Include engaging copy with emojis
- Have clear call-to-action
- Be tailored to specific ICP
- Include relevant hashtags

Return as valid JSON:
{
  "posts": [
    {
      "id": 1,
      "adCopy": "Engaging post text with emojis...",
      "targetICP": "Job Title",
      "industry": "Industry Name",
      "platform": "LinkedIn",
      "imagePrompt": "Description for image generation"
    }
  ]
}`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const content = response.text().trim();
            
            let cleanContent = content;
            if (content.includes('```json')) {
                cleanContent = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
            }

            return JSON.parse(cleanContent);
        } catch (error) {
            console.error('❌ Gemini Error generating posts:', error.message);
            return this._getMockPosts(businessData, goal);
        }
    }

    _buildStrategyPrompt(businessData, goal) {
        return `
You are an expert marketing strategist. Based on this business information, generate a comprehensive marketing strategy.

Business Information:
- Business Name: ${businessData.businessName}
- Product/Service Description: ${businessData.productDescription}
- Pain Points They Solve: ${businessData.painPoints}
- Value Proposition: ${businessData.valueProposition}
- Market Signals: ${businessData.marketSignals || 'Not provided'}
- Website: ${businessData.websiteUrl || 'Not provided'}
- Marketing Goal: ${goal}

Generate a comprehensive strategy with:

1. TARGET INDUSTRIES (6 industries):
   - name: Industry name
   - reasoning: Why perfect for "${goal}"
   - marketSize: Market size estimate
   - competitiveAdvantage: Our unique advantage
   - confidence: Confidence score (0-100)

2. IDEAL CUSTOMER PROFILES (6 ICPs):
   - title: Decision maker job title
   - industry: Which target industry
   - painPoints: Array of specific problems
   - valueProps: How we solve their problems
   - demographics: Company details
   - buyingBehavior: Decision process
   - messagingAngle: Key messaging
   - confidence: Confidence score (0-100)

3. TARGET ACCOUNTS (8 accounts):
   - companyName: Realistic company name
   - industry: Industry category
   - size: Employee count
   - location: Geographic location
   - fitReason: Why they're perfect
   - decisionMaker: ICP role contact
   - confidence: Fit confidence (0-100)

Return ONLY valid JSON in this exact format:
{
  "industries": [...],
  "icps": [...],
  "targetAccounts": [...]
}`;
    }

    // Mock data methods for fallback
    _getMockStrategy(businessData, goal) {
        return {
            industries: [
                {
                    name: "SaaS Technology",
                    reasoning: `Perfect for ${goal} with high digital engagement and budget`,
                    marketSize: "$120B globally",
                    competitiveAdvantage: "AI-powered automation advantage",
                    confidence: 92
                },
                {
                    name: "E-commerce",
                    reasoning: `Strong ${goal} potential with online focus and measurable ROI`,
                    marketSize: "$85B in Eastern Europe",
                    competitiveAdvantage: "Local market expertise",
                    confidence: 88
                },
                {
                    name: "Professional Services",
                    reasoning: `High-value clients seeking ${goal} solutions with good LTV`,
                    marketSize: "$45B in target region",
                    competitiveAdvantage: "Personalized AI approach",
                    confidence: 85
                },
                {
                    name: "Fintech",
                    reasoning: `Rapidly growing sector needing ${goal} for customer acquisition`,
                    marketSize: "$31B in Europe",
                    competitiveAdvantage: "Compliance-aware marketing",
                    confidence: 90
                },
                {
                    name: "Healthcare Technology",
                    reasoning: `Regulated industry needing compliant ${goal} strategies`,
                    marketSize: "$28B in target markets",
                    competitiveAdvantage: "Healthcare compliance expertise",
                    confidence: 83
                },
                {
                    name: "EdTech",
                    reasoning: `Growing demand for ${goal} in educational technology`,
                    marketSize: "$19B in Europe",
                    competitiveAdvantage: "Educational sector insights",
                    confidence: 86
                }
            ],
            icps: [
                {
                    title: "Marketing Director",
                    industry: "SaaS Technology",
                    painPoints: ["Limited marketing budget", "Need for scalable campaigns", "Attribution challenges"],
                    valueProps: ["Automated campaign creation", "Cost-effective scaling", "Clear ROI tracking"],
                    demographics: "50-200 employees, EU-based",
                    buyingBehavior: "Research online, value ROI data, need quick results",
                    messagingAngle: `${goal}-focused automation messaging`,
                    confidence: 94
                },
                {
                    title: "E-commerce Manager",
                    industry: "E-commerce",
                    painPoints: ["Seasonal traffic fluctuations", "Customer acquisition costs", "Platform management"],
                    valueProps: ["Consistent lead generation", "Optimized ad spend", "Multi-platform automation"],
                    demographics: "25-100 employees, Romania/Moldova",
                    buyingBehavior: "Quick decision making, performance-driven",
                    messagingAngle: `ROI-driven ${goal} messaging`,
                    confidence: 91
                },
                {
                    title: "Digital Strategy Lead",
                    industry: "Professional Services",
                    painPoints: ["Client acquisition", "Brand positioning", "Digital presence"],
                    valueProps: ["Professional brand building", "Client pipeline generation", "Digital authority"],
                    demographics: "10-50 employees, premium service providers",
                    buyingBehavior: "Relationship-based, value quality over cost",
                    messagingAngle: "Premium brand positioning for professionals",
                    confidence: 87
                },
                {
                    title: "Growth Marketing Manager",
                    industry: "Fintech",
                    painPoints: ["Regulatory compliance", "User acquisition costs", "Trust building"],
                    valueProps: ["Compliant marketing automation", "Cost-efficient growth", "Trust-building campaigns"],
                    demographics: "30-150 employees, regulated environments",
                    buyingBehavior: "Compliance-first, data-driven decisions",
                    messagingAngle: "Secure and compliant growth strategies",
                    confidence: 89
                },
                {
                    title: "VP of Marketing",
                    industry: "Healthcare Technology",
                    painPoints: ["HIPAA compliance", "B2B sales cycles", "Stakeholder education"],
                    valueProps: ["Compliant lead generation", "Educational content", "Stakeholder nurturing"],
                    demographics: "100-500 employees, healthcare focus",
                    buyingBehavior: "Conservative, compliance-focused, long evaluation",
                    messagingAngle: "Healthcare-compliant marketing excellence",
                    confidence: 85
                },
                {
                    title: "Customer Acquisition Lead",
                    industry: "EdTech",
                    painPoints: ["Student engagement", "Institution partnerships", "Seasonal demand"],
                    valueProps: ["Educational marketing", "Institution outreach", "Engagement optimization"],
                    demographics: "20-100 employees, education sector",
                    buyingBehavior: "Mission-driven, community-focused",
                    messagingAngle: "Educational impact and growth",
                    confidence: 88
                }
            ],
            targetAccounts: [
                {
                    companyName: "TechFlow Solutions",
                    industry: "SaaS Technology",
                    size: "150 employees",
                    location: "Bucharest, Romania",
                    fitReason: "Perfect fit for our AI marketing solution with growing team",
                    decisionMaker: "Marketing Director",
                    confidence: 96
                },
                {
                    companyName: "Digital Commerce Pro",
                    industry: "E-commerce",
                    size: "75 employees",
                    location: "Chisinau, Moldova",
                    fitReason: "High growth e-commerce needing marketing automation",
                    decisionMaker: "E-commerce Manager",
                    confidence: 93
                },
                {
                    companyName: "Innovation Labs",
                    industry: "SaaS Technology",
                    size: "120 employees",
                    location: "Cluj-Napoca, Romania",
                    fitReason: "High-growth tech company needing marketing automation",
                    decisionMaker: "Marketing Director",
                    confidence: 91
                },
                {
                    companyName: "Retail Solutions Hub",
                    industry: "E-commerce",
                    size: "90 employees",
                    location: "Iasi, Romania",
                    fitReason: "Expanding e-commerce platform seeking better customer acquisition",
                    decisionMaker: "E-commerce Manager",
                    confidence: 89
                },
                {
                    companyName: "ConsultPro Services",
                    industry: "Professional Services",
                    size: "35 employees",
                    location: "Timisoara, Romania",
                    fitReason: "Premium consulting firm needing sophisticated marketing",
                    decisionMaker: "Digital Strategy Lead",
                    confidence: 87
                },
                {
                    companyName: "FinanceNext",
                    industry: "Fintech",
                    size: "85 employees",
                    location: "Bucharest, Romania",
                    fitReason: "Growing fintech needing compliant marketing automation",
                    decisionMaker: "Growth Marketing Manager",
                    confidence: 92
                },
                {
                    companyName: "HealthTech Solutions",
                    industry: "Healthcare Technology",
                    size: "200 employees",
                    location: "Sofia, Bulgaria",
                    fitReason: "Healthcare tech company needing compliant lead generation",
                    decisionMaker: "VP of Marketing",
                    confidence: 88
                },
                {
                    companyName: "EduInnovate",
                    industry: "EdTech",
                    size: "65 employees",
                    location: "Prague, Czech Republic",
                    fitReason: "Educational platform seeking growth marketing solutions",
                    decisionMaker: "Customer Acquisition Lead",
                    confidence: 90
                }
            ]
        };
    }

    _getMockIndustries(businessData, goal) {
        return {
            industries: [
                {
                    name: "Automotive Technology",
                    reasoning: `Growing need for ${goal} in automotive digital transformation`,
                    marketSize: "$42B in Europe",
                    competitiveAdvantage: "Automotive industry expertise",
                    confidence: 84
                },
                {
                    name: "Real Estate Technology",
                    reasoning: `PropTech sector needs modern ${goal} approaches`,
                    marketSize: "$18B in target region",
                    competitiveAdvantage: "Property market insights",
                    confidence: 82
                },
                {
                    name: "Food & Beverage",
                    reasoning: `Traditional industry modernizing with ${goal} needs`,
                    marketSize: "$35B in Eastern Europe",
                    competitiveAdvantage: "Consumer behavior analytics",
                    confidence: 80
                },
                {
                    name: "Manufacturing Technology",
                    reasoning: `Industry 4.0 driving ${goal} demand in manufacturing`,
                    marketSize: "$67B in Europe",
                    competitiveAdvantage: "B2B manufacturing experience",
                    confidence: 86
                },
                {
                    name: "Travel & Hospitality Tech",
                    reasoning: `Post-pandemic recovery needs innovative ${goal} strategies`,
                    marketSize: "$25B in target markets",
                    competitiveAdvantage: "Travel industry recovery expertise",
                    confidence: 79
                },
                {
                    name: "Gaming & Entertainment",
                    reasoning: `High engagement sector perfect for ${goal} campaigns`,
                    marketSize: "$29B in Europe",
                    competitiveAdvantage: "Gaming audience insights",
                    confidence: 88
                }
            ]
        };
    }

    _getMockICPs(businessData, goal, selectedIndustries) {
        return {
            icps: [
                {
                    title: "Chief Technology Officer",
                    industry: selectedIndustries[0]?.name || "Technology",
                    painPoints: ["Technical debt", "Scalability challenges", "Innovation pressure"],
                    valueProps: ["Technical marketing alignment", "Developer-focused campaigns", "Tech credibility"],
                    demographics: "100-500 employees, tech-focused companies",
                    buyingBehavior: "Technical evaluation, peer recommendations",
                    messagingAngle: "Technical excellence and innovation leadership",
                    confidence: 91
                },
                {
                    title: "Head of Business Development",
                    industry: selectedIndustries[1]?.name || "Business Services",
                    painPoints: ["Partnership development", "Market expansion", "Revenue growth"],
                    valueProps: ["Partnership marketing", "Market entry support", "Growth acceleration"],
                    demographics: "50-200 employees, growth-stage companies",
                    buyingBehavior: "ROI-focused, strategic partnerships",
                    messagingAngle: "Strategic growth and partnership development",
                    confidence: 89
                },
                {
                    title: "Customer Success Director",
                    industry: selectedIndustries[0]?.name || "SaaS",
                    painPoints: ["Customer retention", "Expansion revenue", "User engagement"],
                    valueProps: ["Customer lifecycle marketing", "Retention campaigns", "Success amplification"],
                    demographics: "75-300 employees, subscription businesses",
                    buyingBehavior: "Customer-centric, data-driven decisions",
                    messagingAngle: "Customer success and retention excellence",
                    confidence: 93
                },
                {
                    title: "Product Marketing Manager",
                    industry: selectedIndustries[2]?.name || "Product",
                    painPoints: ["Go-to-market execution", "Product adoption", "Feature awareness"],
                    valueProps: ["Product launch marketing", "Adoption campaigns", "Feature promotion"],
                    demographics: "30-150 employees, product-led companies",
                    buyingBehavior: "Product-focused, user experience driven",
                    messagingAngle: "Product marketing and adoption excellence",
                    confidence: 87
                },
                {
                    title: "Revenue Operations Lead",
                    industry: selectedIndustries[1]?.name || "Sales",
                    painPoints: ["Revenue predictability", "Sales-marketing alignment", "Pipeline optimization"],
                    valueProps: ["Revenue-focused campaigns", "Pipeline acceleration", "Sales enablement"],
                    demographics: "100-400 employees, revenue-focused organizations",
                    buyingBehavior: "Data-driven, revenue impact focused",
                    messagingAngle: "Revenue growth and pipeline optimization",
                    confidence: 92
                },
                {
                    title: "Digital Transformation Lead",
                    industry: selectedIndustries[3]?.name || "Enterprise",
                    painPoints: ["Legacy system modernization", "Change management", "Digital adoption"],
                    valueProps: ["Digital marketing transformation", "Modern campaign delivery", "Change communication"],
                    demographics: "200-1000 employees, traditional industries",
                    buyingBehavior: "Strategic, long-term planning, stakeholder consensus",
                    messagingAngle: "Digital transformation and modernization",
                    confidence: 85
                }
            ]
        };
    }

    _getMockTargetAccounts(businessData, selectedICPs) {
        return {
            targetAccounts: [
                {
                    companyName: "NextGen Solutions",
                    industry: selectedICPs[0]?.industry || "Technology",
                    size: "180 employees",
                    location: "Warsaw, Poland",
                    fitReason: "Innovative tech company with strong growth trajectory",
                    decisionMaker: selectedICPs[0]?.title || "Marketing Director",
                    confidence: 94
                },
                {
                    companyName: "GrowthCorp",
                    industry: selectedICPs[1]?.industry || "Business Services",
                    size: "95 employees",
                    location: "Budapest, Hungary",
                    fitReason: "Rapidly expanding business needing marketing automation",
                    decisionMaker: selectedICPs[1]?.title || "Growth Manager",
                    confidence: 91
                },
                {
                    companyName: "InnovateHub",
                    industry: selectedICPs[2]?.industry || "SaaS",
                    size: "220 employees",
                    location: "Bratislava, Slovakia",
                    fitReason: "SaaS platform with international expansion plans",
                    decisionMaker: selectedICPs[2]?.title || "Customer Success Director",
                    confidence: 89
                },
                {
                    companyName: "TechAdvance",
                    industry: selectedICPs[0]?.industry || "Technology",
                    size: "145 employees",
                    location: "Ljubljana, Slovenia",
                    fitReason: "Technology innovator seeking marketing modernization",
                    decisionMaker: selectedICPs[0]?.title || "CTO",
                    confidence: 87
                },
                {
                    companyName: "ScaleUp Dynamics",
                    industry: selectedICPs[1]?.industry || "Business Services",
                    size: "78 employees",
                    location: "Vilnius, Lithuania",
                    fitReason: "High-growth company needing scalable marketing",
                    decisionMaker: selectedICPs[1]?.title || "Head of Business Development",
                    confidence: 93
                },
                {
                    companyName: "Future Systems",
                    industry: selectedICPs[3]?.industry || "Enterprise",
                    size: "350 employees",
                    location: "Tallinn, Estonia",
                    fitReason: "Enterprise modernizing their marketing approach",
                    decisionMaker: selectedICPs[3]?.title || "Digital Transformation Lead",
                    confidence: 88
                },
                {
                    companyName: "RevGrowth",
                    industry: selectedICPs[4]?.industry || "Sales Technology",
                    size: "125 employees",
                    location: "Riga, Latvia",
                    fitReason: "Revenue-focused company needing marketing alignment",
                    decisionMaker: selectedICPs[4]?.title || "Revenue Operations Lead",
                    confidence: 90
                },
                {
                    companyName: "ProductLead",
                    industry: selectedICPs[5]?.industry || "Product",
                    size: "165 employees",
                    location: "Zagreb, Croatia",
                    fitReason: "Product-led company requiring go-to-market support",
                    decisionMaker: selectedICPs[5]?.title || "Product Marketing Manager",
                    confidence: 86
                }
            ]
        };
    }

    /**
     * Regenerate post content with new variation
     * @param {string} originalContent - Original post content
     * @param {string} industry - Target industry
     * @returns {Promise<string>} Regenerated content
     */
    async regeneratePostContent(originalContent, industry) {
        console.log('🔄 Gemini: Regenerating post content...');

        if (!this.genAI) {
            return this._getMockRegeneratedContent(originalContent);
        }

        const prompt = `
        You are an expert copywriter. Take this social media post and create a completely new version that:
        - Maintains the same marketing goal and value proposition
        - Uses different wording, structure, and approach
        - Keeps it engaging and professional
        - Targets the ${industry} industry
        - Includes relevant hashtags
        - Should be between 100-200 words

        Original post:
        ${originalContent}

        Generate only the new post content, no explanations:
        `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const newContent = response.text().trim();
            
            console.log('✅ Gemini: Post content regenerated successfully');
            return newContent;

        } catch (error) {
            console.error('❌ Gemini Error regenerating content:', error.message);
            return this._getMockRegeneratedContent(originalContent);
        }
    }

    _getMockRegeneratedContent(originalContent) {
        const variations = [
            "🔥 [REGENERATED] ",
            "⚡ [NEW VERSION] ",
            "🎯 [UPDATED] ",
            "💎 [ENHANCED] "
        ];
        
        const prefix = variations[Math.floor(Math.random() * variations.length)];
        return prefix + originalContent;
    }

    _getMockPosts(businessData, goal) {
        return {
            posts: [
                {
                    id: 1,
                    adCopy: `🚀 Struggling with ${businessData.painPoints || 'marketing challenges'}?\n\n${businessData.valueProposition || 'Our solution'} helps businesses like yours achieve ${goal}.\n\nReady to transform your marketing? 👇\n\n#Marketing #${goal.replace(' ', '')} #Business #Growth #AI`,
                    targetICP: "Marketing Director",
                    industry: "SaaS Technology",
                    platform: "LinkedIn",
                    imagePrompt: "Professional marketing team celebrating success with digital dashboard"
                },
                {
                    id: 2,
                    adCopy: `💡 ${goal} doesn't have to be complicated.\n\n${businessData.businessName || 'Our platform'} makes it simple with AI-powered automation.\n\n✅ Save time\n✅ Increase ROI\n✅ Scale faster\n\nStart your free trial today! 🔗\n\n#MarketingAutomation #${goal.replace(' ', '')} #ROI #Efficiency #Scale`,
                    targetICP: "E-commerce Manager",
                    industry: "E-commerce",
                    platform: "Facebook",
                    imagePrompt: "Modern e-commerce dashboard showing growth metrics and automation"
                }
            ]
        };
    }
}

module.exports = GeminiAI;
