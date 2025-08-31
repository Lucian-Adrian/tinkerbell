/**
 * Tinkerbell MVP - Final Implementation
 * Implements the exact 5-step flow according to the Copilot Blueprint
 */

class TinkerbellApp {
    constructor() {
        this.currentStep = 1;
        this.businessContext = {};
        this.selectedGoal = null;
        this.metaPixelId = null;
        this.generatedStrategy = {};
        this.selectedIndustries = [];
        this.selectedICPs = [];
        this.targetAccounts = [];
        this.generatedPosts = [];
        this.connectedPlatforms = [];
        
        this.init();
    }

    init() {
        console.log('🚀 Initializing Tinkerbell MVP - Beautiful Professional Version');
        this.setupEventListeners();
        this.updateStepIndicator();
    }

    setupEventListeners() {
        // Step 1: Business Context Form
        const contextForm = document.getElementById('business-context-form');
        if (contextForm) {
            contextForm.addEventListener('submit', (e) => this.handleBusinessContextSubmit(e));
        }

        // File upload for pitch deck
        const pitchDeckUpload = document.getElementById('pitchDeckUpload');
        const pitchDeckInput = document.getElementById('pitchDeck');
        if (pitchDeckUpload && pitchDeckInput) {
            pitchDeckUpload.addEventListener('click', () => pitchDeckInput.click());
            pitchDeckInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        // Step 2: Goal Selection
        const goalCards = document.querySelectorAll('.goal-card');
        goalCards.forEach(card => {
            card.addEventListener('click', () => this.selectGoal(card.dataset.goal));
        });

        const continueToPixel = document.getElementById('continue-to-pixel');
        if (continueToPixel) {
            continueToPixel.addEventListener('click', () => this.goToStep(3));
        }

        // Step 3: Platform Connections
        // Meta Pixel specific functionality
        const verifyPixel = document.getElementById('verify-pixel');
        if (verifyPixel) {
            verifyPixel.addEventListener('click', () => this.verifyMetaPixel());
        }

        const autoInstallPixel = document.getElementById('auto-install-pixel');
        if (autoInstallPixel) {
            autoInstallPixel.addEventListener('click', () => this.autoInstallPixel());
        }

        const showAllPlatforms = document.getElementById('show-all-platforms');
        if (showAllPlatforms) {
            showAllPlatforms.addEventListener('click', () => this.showAllPlatforms());
        }

        const connectPlatformBtns = document.querySelectorAll('.connect-platform');
        connectPlatformBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.connectPlatform(e.target.dataset.platform));
        });

        const continueToStrategy = document.getElementById('continue-to-strategy');
        if (continueToStrategy) {
            continueToStrategy.addEventListener('click', () => this.generateStrategy());
        }

        const skipPlatforms = document.getElementById('skip-platforms');
        if (skipPlatforms) {
            skipPlatforms.addEventListener('click', () => this.generateStrategy());
        }

        // Step 4: Strategy Review Tabs
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Strategy Review Actions
        this.setupStrategyActions();

        // Step 5: Campaign Launchpad
        const approveStrategy = document.getElementById('approve-strategy');
        if (approveStrategy) {
            approveStrategy.addEventListener('click', () => this.generateCampaignAssets());
        }

        const launchCampaigns = document.getElementById('launch-campaigns');
        if (launchCampaigns) {
            launchCampaigns.addEventListener('click', () => this.launchAllCampaigns());
        }

        // Post Actions
        const removeHashtags = document.getElementById('remove-hashtags');
        if (removeHashtags) {
            removeHashtags.addEventListener('click', () => this.removeHashtagsFromPosts());
        }

        const generateMorePosts = document.getElementById('generate-more-posts');
        if (generateMorePosts) {
            generateMorePosts.addEventListener('click', () => this.generateMorePosts());
        }

        // Success modal close
        const closeModal = document.getElementById('close-success-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeSuccessModal());
        }
    }

    setupStrategyActions() {
        // Industries Tab Actions
        const regenerateIndustries = document.getElementById('regenerate-industries');
        if (regenerateIndustries) {
            regenerateIndustries.addEventListener('click', () => this.regenerateIndustries());
        }

        // Custom Industry Modal
        const addCustomIndustry = document.getElementById('add-custom-industry');
        const customIndustryModal = document.getElementById('custom-industry-modal');
        const saveCustomIndustry = document.getElementById('save-custom-industry');
        const cancelCustomIndustry = document.getElementById('cancel-custom-industry');

        if (addCustomIndustry) {
            addCustomIndustry.addEventListener('click', () => {
                customIndustryModal.style.display = 'flex';
                setTimeout(() => customIndustryModal.classList.add('show'), 10);
            });
        }

        if (cancelCustomIndustry) {
            cancelCustomIndustry.addEventListener('click', () => {
                customIndustryModal.classList.remove('show');
                setTimeout(() => customIndustryModal.style.display = 'none', 300);
            });
        }

        if (saveCustomIndustry) {
            saveCustomIndustry.addEventListener('click', () => this.addCustomIndustry());
        }

        // ICPs Tab Actions
        const regenerateICPs = document.getElementById('regenerate-icps');
        if (regenerateICPs) {
            regenerateICPs.addEventListener('click', () => this.regenerateICPs());
        }

        // Custom ICP Modal
        const addCustomICP = document.getElementById('add-custom-icp');
        const customICPModal = document.getElementById('custom-icp-modal');
        const saveCustomICP = document.getElementById('save-custom-icp');
        const cancelCustomICP = document.getElementById('cancel-custom-icp');

        if (addCustomICP) {
            addCustomICP.addEventListener('click', () => {
                customICPModal.style.display = 'flex';
                setTimeout(() => customICPModal.classList.add('show'), 10);
            });
        }

        if (cancelCustomICP) {
            cancelCustomICP.addEventListener('click', () => {
                customICPModal.classList.remove('show');
                setTimeout(() => customICPModal.style.display = 'none', 300);
            });
        }

        if (saveCustomICP) {
            saveCustomICP.addEventListener('click', () => this.addCustomICP());
        }

        // Target Accounts Actions
        const loadMoreAccounts = document.getElementById('load-more-accounts');
        if (loadMoreAccounts) {
            loadMoreAccounts.addEventListener('click', () => this.loadMoreAccounts());
        }

        // Account upload
        const accountUpload = document.getElementById('account-upload');
        const accountFile = document.getElementById('account-file');
        if (accountUpload && accountFile) {
            accountUpload.addEventListener('click', () => accountFile.click());
            accountFile.addEventListener('change', (e) => this.handleAccountUpload(e));
        }
    }

    // Step Navigation
    goToStep(stepNumber) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show target page
        const targetPage = this.getPageForStep(stepNumber);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        this.currentStep = stepNumber;
        this.updateStepIndicator();
    }

    getPageForStep(step) {
        const pageMap = {
            1: 'page-business-context',
            2: 'page-goal-selection',
            3: 'page-meta-pixel',
            4: 'page-strategy-review',
            5: 'page-campaign-launchpad'
        };
        return document.getElementById(pageMap[step]);
    }

    updateStepIndicator() {
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNumber === this.currentStep) {
                step.classList.add('active');
            } else if (stepNumber < this.currentStep) {
                step.classList.add('completed');
            }
        });
    }

    // Step 1: Business Context Handling
    async handleBusinessContextSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        this.businessContext = {
            businessName: formData.get('businessName'),
            productDescription: formData.get('productDescription'),
            painPoints: formData.get('painPoints'),
            valueProposition: formData.get('valueProposition'),
            marketSignals: formData.get('marketSignals'),
            websiteUrl: formData.get('websiteUrl'),
            pitchDeck: formData.get('pitchDeck')
        };

        console.log('📋 Business Context Captured:', this.businessContext);
        
        // Save business context to backend
        try {
            const response = await fetch('/api/business-context', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.businessContext)
            });

            if (response.ok) {
                this.goToStep(2);
            } else {
                throw new Error('Failed to save business context');
            }
        } catch (error) {
            console.error('❌ Error saving business context:', error);
            // Continue anyway for MVP
            this.goToStep(2);
        }
    }

    handleFileUpload(e) {
        const file = e.target.files[0];
        if (file) {
            console.log('📎 File uploaded:', file.name);
            // Update UI to show file selected
            const uploadArea = document.getElementById('pitchDeckUpload');
            uploadArea.innerHTML = `
                <i class="fas fa-file-pdf"></i>
                <span>${file.name}</span>
            `;
        }
    }

    // Step 2: Goal Selection
    selectGoal(goal) {
        // Remove previous selection
        document.querySelectorAll('.goal-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Add selection to clicked card
        event.target.closest('.goal-card').classList.add('selected');
        
        this.selectedGoal = goal;
        console.log('🎯 Goal Selected:', goal);

        // Enable continue button
        document.getElementById('continue-to-pixel').disabled = false;

        // Save goal selection
        this.saveGoalSelection(goal);
    }

    async saveGoalSelection(goal) {
        try {
            const response = await fetch('/api/select-goal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ goal })
            });

            if (!response.ok) {
                throw new Error('Failed to save goal selection');
            }
        } catch (error) {
            console.error('❌ Error saving goal:', error);
            // Continue anyway for MVP
        }
    }

    // Step 3: Meta Pixel and Platform Connections
    verifyMetaPixel() {
        const pixelId = document.getElementById('meta-pixel-id').value.trim();
        const statusElement = document.getElementById('pixel-status');
        
        if (!pixelId) {
            statusElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Please enter a Pixel ID';
            statusElement.className = 'pixel-status error';
            return;
        }

        // Basic validation for Pixel ID format (15-16 digits)
        const pixelIdRegex = /^\d{15,16}$/;
        if (!pixelIdRegex.test(pixelId)) {
            statusElement.innerHTML = '<i class="fas fa-times-circle"></i> Invalid Pixel ID format';
            statusElement.className = 'pixel-status error';
            return;
        }

        // Simulate verification
        statusElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
        statusElement.className = 'pixel-status';
        
        setTimeout(() => {
            statusElement.innerHTML = '<i class="fas fa-check-circle"></i> Pixel verified successfully!';
            statusElement.className = 'pixel-status success';
            this.metaPixelId = pixelId;
            this.showNotification('Meta Pixel verified and connected!', 'success');
        }, 2000);
    }

    autoInstallPixel() {
        this.showNotification('Auto-install feature simulated! Pixel code would be automatically added to your website.', 'info');
        
        // Simulate auto-install process
        const statusElement = document.getElementById('pixel-status');
        statusElement.innerHTML = '<i class="fas fa-magic"></i> Auto-installing pixel...';
        statusElement.className = 'pixel-status';
        
        setTimeout(() => {
            statusElement.innerHTML = '<i class="fas fa-check-circle"></i> Pixel installed and verified!';
            statusElement.className = 'pixel-status success';
            document.getElementById('meta-pixel-id').value = '123456789012345';
            this.metaPixelId = '123456789012345';
            this.showNotification('Meta Pixel auto-installed successfully!', 'success');
        }, 3000);
    }

    showAllPlatforms() {
        const platformsList = document.getElementById('all-platforms-list');
        const showBtn = document.getElementById('show-all-platforms');
        
        if (platformsList.classList.contains('hidden')) {
            platformsList.classList.remove('hidden');
            showBtn.innerHTML = '<i class="fas fa-minus"></i> Hide Platforms';
        } else {
            platformsList.classList.add('hidden');
            showBtn.innerHTML = '<i class="fas fa-plus"></i> Connect Other Accounts';
        }
    }

    // Step 3: Platform Connections
    async connectPlatform(platform) {
        console.log('🔗 Connecting platform:', platform);
        
        const platformCard = document.querySelector(`.platform-card[data-platform="${platform}"]`);
        const connectBtn = platformCard.querySelector('.connect-platform');
        
        // Show loading state
        const originalText = connectBtn.innerHTML;
        connectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
        connectBtn.disabled = true;

        // Simulate connection process
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mark as connected
        platformCard.classList.add('connected');
        connectBtn.innerHTML = '<i class="fas fa-check"></i> Connected';
        connectBtn.classList.remove('btn-outline');
        connectBtn.classList.add('btn-success');
        
        // Add to connected platforms
        if (!this.connectedPlatforms.includes(platform)) {
            this.connectedPlatforms.push(platform);
        }
        
        // Update summary
        this.updatePlatformSummary();
        
        // Show non-intrusive notification
        this.showNotification(`${this.getPlatformName(platform)} connected successfully!`, 'success');
        
        console.log('✅ Platform connected:', platform);
    }

    updatePlatformSummary() {
        const connectedCount = document.getElementById('connected-count');
        const continueBtn = document.getElementById('continue-to-strategy');
        
        connectedCount.textContent = `${this.connectedPlatforms.length} platform${this.connectedPlatforms.length !== 1 ? 's' : ''} connected`;
        
        // Enable continue button if at least one platform is connected
        continueBtn.disabled = this.connectedPlatforms.length === 0;
    }

    getPlatformName(platform) {
        const names = {
            'meta': 'Meta (Facebook & Instagram)',
            'linkedin': 'LinkedIn Ads',
            'google': 'Google Ads',
            'twitter': 'X (Twitter) Ads',
            'tiktok': 'TikTok Ads',
            'youtube': 'YouTube Ads'
        };
        return names[platform] || platform;
    }

    showNotification(message, type = 'success') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(n => n.remove());
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="notification-text">${message}</div>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show with animation
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Step 4: Strategy Generation & Review
    async generateStrategy() {
        console.log('🧠 Generating Strategy with Gemini AI...');

        // Go to the loading page first
        this.goToStep(4);
        
        // Show the beautiful loading screen with proper page IDs
        const loadingPage = document.getElementById('page-strategy-review');
        const strategyTabs = document.getElementById('strategy-tabs');
        const strategyLoading = document.getElementById('strategy-loading');
        
        if (strategyTabs) strategyTabs.classList.add('hidden');
        if (strategyLoading) strategyLoading.classList.remove('hidden');

        // Start the animated loading process
        this.animateStrategyGeneration();

        try {
            // Make actual API call to Gemini
            const response = await fetch('http://localhost:3000/api/generate-strategy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    businessContext: this.businessContext,
                    goal: this.selectedGoal,
                    metaPixelId: this.metaPixelId
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.generatedStrategy = result.data;
                console.log('✅ Strategy generated by Gemini:', this.generatedStrategy);
            } else {
                throw new Error('Strategy generation failed');
            }
        } catch (error) {
            console.error('❌ Strategy Generation Error:', error);
            // Show mock data for MVP demonstration
            this.generateMockStrategy();
        }

        // Complete the loading animation
        await this.completeLoadingAnimation();
        
        // Switch to review page and display strategy
        if (strategyLoading) strategyLoading.classList.add('hidden');
        if (strategyTabs) strategyTabs.classList.remove('hidden');
        this.displayStrategy();
    }

    async animateStrategyGeneration() {
        const steps = [
            { id: 'step-analysis', text: 'Analyzing business context...', duration: 3000 },
            { id: 'step-industries', text: 'Identifying target industries...', duration: 3500 },
            { id: 'step-personas', text: 'Creating customer profiles...', duration: 4000 },
            { id: 'step-accounts', text: 'Researching target accounts...', duration: 3500 },
            { id: 'step-messaging', text: 'Crafting messaging strategy...', duration: 3000 }
        ];

        let progress = 0;
        const progressBar = document.getElementById('strategyProgress');
        const progressText = document.getElementById('strategyProgressText');

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            
            // Update progress text
            if (progressText) {
                progressText.textContent = step.text;
            }
            
            // Mark current step as active
            const stepElement = document.getElementById(step.id);
            if (stepElement) {
                stepElement.classList.add('active');
            }
            
            // Animate progress bar
            progress = ((i + 1) / steps.length) * 100;
            if (progressBar) {
                progressBar.style.width = progress + '%';
            }
            
            // Wait for step duration
            await new Promise(resolve => setTimeout(resolve, step.duration));
            
            // Mark step as completed
            if (stepElement) {
                stepElement.classList.remove('active');
                stepElement.classList.add('completed');
            }
        }
    }

    async completeLoadingAnimation() {
        const progressText = document.getElementById('strategyProgressText');
        progressText.textContent = 'Strategy complete! Preparing review...';
        
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    generateMockStrategy() {
        this.generatedStrategy = {
            industries: [
                {
                    name: "SaaS Technology",
                    reasoning: `Perfect for ${this.selectedGoal} with high digital engagement`,
                    marketSize: "$120B globally",
                    competitiveAdvantage: "AI-powered automation advantage"
                },
                {
                    name: "E-commerce",
                    reasoning: `Strong ${this.selectedGoal} potential with online focus`,
                    marketSize: "$85B in Eastern Europe",
                    competitiveAdvantage: "Local market expertise"
                },
                {
                    name: "Professional Services",
                    reasoning: `High-value clients seeking ${this.selectedGoal} solutions`,
                    marketSize: "$45B in target region",
                    competitiveAdvantage: "Personalized AI approach"
                }
            ],
            icps: [
                {
                    title: "Marketing Director",
                    industry: "SaaS Technology",
                    painPoints: ["Limited marketing budget", "Need for scalable campaigns"],
                    valueProps: ["Automated campaign creation", "Cost-effective scaling"],
                    demographics: "50-200 employees, EU-based",
                    buyingBehavior: "Research online, value ROI data",
                    messagingAngle: `${this.selectedGoal}-focused automation messaging`
                },
                {
                    title: "E-commerce Manager",
                    industry: "E-commerce",
                    painPoints: ["Seasonal traffic fluctuations", "Customer acquisition costs"],
                    valueProps: ["Consistent lead generation", "Optimized ad spend"],
                    demographics: "25-100 employees, Romania/Moldova",
                    buyingBehavior: "Quick decision making, performance-driven",
                    messagingAngle: `ROI-driven ${this.selectedGoal} messaging`
                }
            ],
            targetAccounts: [
                {
                    companyName: "TechFlow Solutions",
                    industry: "SaaS Technology",
                    size: "150 employees",
                    location: "Bucharest, Romania",
                    fitReason: "Perfect fit for our AI marketing solution",
                    decisionMaker: "Marketing Director"
                },
                {
                    companyName: "Digital Commerce Pro",
                    industry: "E-commerce",
                    size: "75 employees",
                    location: "Chisinau, Moldova",
                    fitReason: "High growth e-commerce needing marketing automation",
                    decisionMaker: "E-commerce Manager"
                }
            ]
        };
    }

    displayStrategy() {
        // Hide loading, show strategy tabs
        document.getElementById('strategy-loading').classList.add('hidden');
        document.getElementById('strategy-tabs').classList.remove('hidden');

        // Display industries
        this.displayIndustries();
        
        // Initially disable approve button until selections are made
        document.getElementById('approve-strategy').disabled = true;
    }

    displayIndustries() {
        const industriesGrid = document.getElementById('industries-grid');
        industriesGrid.innerHTML = '';

        // Show first 6 industries initially
        const industriesToShow = this.generatedStrategy.industries.slice(0, 6);

        industriesToShow.forEach((industry, index) => {
            const industryCard = document.createElement('div');
            industryCard.className = 'selection-card industry-card';
            industryCard.dataset.index = index;
            
            industryCard.innerHTML = `
                <div class="card-header">
                    <h4>${industry.name}</h4>
                    <div class="card-actions">
                        <div class="confidence-score">
                            <span class="confidence-label">Confidence</span>
                            <span class="confidence-value">${industry.confidence || 85}%</span>
                        </div>
                        <div class="selection-checkbox">
                            <i class="fas fa-check"></i>
                        </div>
                    </div>
                </div>
                <div class="card-content">
                    <p class="reasoning">${industry.reasoning}</p>
                    <div class="card-meta">
                        <span class="market-size">Market: ${industry.marketSize}</span>
                        <span class="advantage">${industry.competitiveAdvantage}</span>
                    </div>
                </div>
            `;

            industryCard.addEventListener('click', () => this.toggleIndustrySelection(index));
            industriesGrid.appendChild(industryCard);
        });

        // Add "Load More" button if there are more than 6 industries
        if (this.generatedStrategy.industries.length > 6) {
            this.addLoadMoreButton('industries-grid', 'Load More Industries', () => this.loadMoreIndustries());
        }
    }

    toggleIndustrySelection(index) {
        const card = document.querySelector(`.industry-card[data-index="${index}"]`);
        const isSelected = card.classList.contains('selected');

        if (isSelected) {
            card.classList.remove('selected');
            this.selectedIndustries = this.selectedIndustries.filter(i => i !== index);
        } else {
            card.classList.add('selected');
            this.selectedIndustries.push(index);
        }

        // Update ICPs based on selected industries
        if (this.selectedIndustries.length > 0) {
            this.updateICPsForSelectedIndustries();
        }

        this.checkStrategyApprovalConditions();
    }

    updateICPsForSelectedIndustries() {
        // Filter ICPs based on selected industries
        const selectedIndustryNames = this.selectedIndustries.map(index => 
            this.generatedStrategy.industries[index].name
        );
        
        const relevantICPs = this.generatedStrategy.icps.filter(icp =>
            selectedIndustryNames.includes(icp.industry)
        );

        this.displayICPs(relevantICPs);
    }

    displayICPs(icps = this.generatedStrategy.icps) {
        const icpsGrid = document.getElementById('icps-grid');
        icpsGrid.innerHTML = '';

        // Show first 6 ICPs initially
        const icpsToShow = icps.slice(0, 6);

        icpsToShow.forEach((icp, index) => {
            const icpCard = document.createElement('div');
            icpCard.className = 'selection-card icp-card';
            icpCard.dataset.index = index;
            
            icpCard.innerHTML = `
                <div class="card-header">
                    <h4>${icp.title}</h4>
                    <div class="card-actions">
                        <div class="confidence-score">
                            <span class="confidence-label">Confidence</span>
                            <span class="confidence-value">${icp.confidence || 88}%</span>
                        </div>
                        <button class="btn-icon edit-icp" data-index="${index}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <div class="selection-checkbox">
                            <i class="fas fa-check"></i>
                        </div>
                    </div>
                </div>
                <div class="card-content">
                    <div class="icp-industry">${icp.industry}</div>
                    <div class="pain-points">
                        <strong>Pain Points:</strong>
                        <ul>
                            ${icp.painPoints.map(point => `<li>${point}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="value-props">
                        <strong>How We Help:</strong>
                        <ul>
                            ${icp.valueProps.map(prop => `<li>${prop}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="demographics">
                        <strong>Demographics:</strong> ${icp.demographics}
                    </div>
                </div>
            `;

            icpCard.addEventListener('click', (e) => {
                if (!e.target.closest('.edit-icp')) {
                    this.toggleICPSelection(index);
                }
            });

            // Edit button functionality
            icpCard.querySelector('.edit-icp').addEventListener('click', (e) => {
                e.stopPropagation();
                this.editICP(index);
            });

            icpsGrid.appendChild(icpCard);
        });

        // Add "Load More" button if there are more than 6 ICPs
        if (icps.length > 6) {
            this.addLoadMoreButton('icps-grid', 'Load More ICPs', () => this.loadMoreICPs());
        }
    }

    loadMoreICPs() {
        console.log('📈 Loading more ICPs...');
        // Show all ICPs when load more is clicked
        const icpsGrid = document.getElementById('icps-grid');
        
        // Remove load more button first
        const loadMoreBtn = icpsGrid.querySelector('.load-more-btn');
        if (loadMoreBtn) loadMoreBtn.remove();
        
        // Add remaining ICPs
        const currentCount = icpsGrid.querySelectorAll('.icp-card').length;
        const remainingICPs = this.generatedStrategy.icps.slice(currentCount);
        
        remainingICPs.forEach((icp, index) => {
            const actualIndex = currentCount + index;
            const icpCard = document.createElement('div');
            icpCard.className = 'selection-card icp-card';
            icpCard.dataset.index = actualIndex;
            
            icpCard.innerHTML = `
                <div class="card-header">
                    <h4>${icp.title}</h4>
                    <div class="card-actions">
                        <div class="confidence-score">
                            <span class="confidence-label">Confidence</span>
                            <span class="confidence-value">${icp.confidence || 88}%</span>
                        </div>
                        <button class="btn-icon edit-icp" data-index="${actualIndex}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <div class="selection-checkbox">
                            <i class="fas fa-check"></i>
                        </div>
                    </div>
                </div>
                <div class="card-content">
                    <div class="icp-industry">${icp.industry}</div>
                    <div class="pain-points">
                        <strong>Pain Points:</strong>
                        <ul>
                            ${icp.painPoints.map(point => `<li>${point}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="value-props">
                        <strong>How We Help:</strong>
                        <ul>
                            ${icp.valueProps.map(prop => `<li>${prop}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="demographics">
                        <strong>Demographics:</strong> ${icp.demographics}
                    </div>
                </div>
            `;

            icpCard.addEventListener('click', (e) => {
                if (!e.target.closest('.edit-icp')) {
                    this.toggleICPSelection(actualIndex);
                }
            });

            icpCard.querySelector('.edit-icp').addEventListener('click', (e) => {
                e.stopPropagation();
                this.editICP(actualIndex);
            });

            icpsGrid.appendChild(icpCard);
        });
    }

    toggleICPSelection(index) {
        const card = document.querySelector(`.icp-card[data-index="${index}"]`);
        const isSelected = card.classList.contains('selected');

        if (isSelected) {
            card.classList.remove('selected');
            this.selectedICPs = this.selectedICPs.filter(i => i !== index);
        } else {
            card.classList.add('selected');
            this.selectedICPs.push(index);
        }

        // Update target accounts based on selected ICPs
        if (this.selectedICPs.length > 0) {
            this.updateTargetAccountsForSelectedICPs();
        }

        this.checkStrategyApprovalConditions();
    }

    updateTargetAccountsForSelectedICPs() {
        // Filter accounts based on selected ICPs
        const selectedICPTitles = this.selectedICPs.map(index => 
            this.generatedStrategy.icps[index].title
        );
        
        const relevantAccounts = this.generatedStrategy.targetAccounts.filter(account =>
            selectedICPTitles.includes(account.decisionMaker)
        );

        this.displayTargetAccounts(relevantAccounts);
    }

    displayTargetAccounts(accounts = this.generatedStrategy.targetAccounts) {
        const accountsGrid = document.getElementById('accounts-grid');
        accountsGrid.innerHTML = '';

        accounts.forEach((account, index) => {
            const accountCard = document.createElement('div');
            accountCard.className = 'selection-card account-card';
            accountCard.dataset.index = index;
            
            accountCard.innerHTML = `
                <div class="card-header">
                    <h4>${account.companyName}</h4>
                    <div class="card-actions">
                        <div class="confidence-score">
                            <span class="confidence-label">Fit</span>
                            <span class="confidence-value">${account.confidence || 90}%</span>
                        </div>
                        <div class="company-size">${account.size}</div>
                    </div>
                </div>
                <div class="card-content">
                    <div class="company-info">
                        <div class="industry">${account.industry}</div>
                        <div class="location">${account.location}</div>
                    </div>
                    <div class="fit-reason">${account.fitReason}</div>
                    <div class="decision-maker">
                        <strong>Decision Maker:</strong> ${account.decisionMaker}
                    </div>
                </div>
            `;

            accountsGrid.appendChild(accountCard);
        });
    }

    checkStrategyApprovalConditions() {
        // Enable approve button if at least 2 industries and 1 ICP are selected
        const canApprove = this.selectedIndustries.length >= 2 && this.selectedICPs.length >= 1;
        document.getElementById('approve-strategy').disabled = !canApprove;
    }

    // Tab switching for strategy review
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`tab-${tabName}`).classList.add('active');

        // Load content if not already loaded
        if (tabName === 'icps' && this.selectedIndustries.length > 0) {
            this.updateICPsForSelectedIndustries();
        } else if (tabName === 'accounts' && this.selectedICPs.length > 0) {
            this.updateTargetAccountsForSelectedICPs();
        }
    }

    // Strategy Actions
    async regenerateIndustries() {
        console.log('🔄 Regenerating Industries with Gemini...');
        
        const regenerateBtn = document.getElementById('regenerate-industries');
        const originalText = regenerateBtn.innerHTML;
        regenerateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Regenerating...';
        regenerateBtn.disabled = true;

        try {
            const response = await fetch('http://localhost:3000/api/regenerate-industries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    businessContext: this.businessContext,
                    goal: this.selectedGoal,
                    existingIndustries: this.generatedStrategy.industries
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.generatedStrategy.industries = result.data.industries;
                this.displayIndustries();
            } else {
                throw new Error('Failed to regenerate industries');
            }
        } catch (error) {
            console.error('❌ Error regenerating industries:', error);
            // Fallback to shuffling existing ones
            this.generatedStrategy.industries = this.shuffleArray([...this.generatedStrategy.industries]);
            this.displayIndustries();
        }

        regenerateBtn.innerHTML = originalText;
        regenerateBtn.disabled = false;
    }

    loadMoreIndustries() {
        console.log('📈 Loading more industries...');
        // Show all industries when load more is clicked
        const industriesGrid = document.getElementById('industries-grid');
        
        // Remove load more button first
        const loadMoreBtn = industriesGrid.querySelector('.load-more-btn');
        if (loadMoreBtn) loadMoreBtn.remove();
        
        // Add remaining industries
        const currentCount = industriesGrid.querySelectorAll('.industry-card').length;
        const remainingIndustries = this.generatedStrategy.industries.slice(currentCount);
        
        remainingIndustries.forEach((industry, index) => {
            const actualIndex = currentCount + index;
            const industryCard = document.createElement('div');
            industryCard.className = 'selection-card industry-card';
            industryCard.dataset.index = actualIndex;
            
            industryCard.innerHTML = `
                <div class="card-header">
                    <h4>${industry.name}</h4>
                    <div class="card-actions">
                        <div class="confidence-score">
                            <span class="confidence-label">Confidence</span>
                            <span class="confidence-value">${industry.confidence || 85}%</span>
                        </div>
                        <div class="selection-checkbox">
                            <i class="fas fa-check"></i>
                        </div>
                    </div>
                </div>
                <div class="card-content">
                    <p class="reasoning">${industry.reasoning}</p>
                    <div class="card-meta">
                        <span class="market-size">Market: ${industry.marketSize}</span>
                        <span class="advantage">${industry.competitiveAdvantage}</span>
                    </div>
                </div>
            `;

            industryCard.addEventListener('click', () => this.toggleIndustrySelection(actualIndex));
            industriesGrid.appendChild(industryCard);
        });
    }

    addLoadMoreButton(containerId, buttonText, clickHandler) {
        const container = document.getElementById(containerId);
        const loadMoreBtn = document.createElement('div');
        loadMoreBtn.className = 'load-more-btn';
        loadMoreBtn.innerHTML = `
            <button class="btn btn-outline">
                <i class="fas fa-plus"></i>
                ${buttonText}
            </button>
        `;
        loadMoreBtn.addEventListener('click', clickHandler);
        container.appendChild(loadMoreBtn);
    }

    addCustomIndustry() {
        const industryInput = document.getElementById('custom-industry-name');
        const reasoningInput = document.getElementById('custom-industry-reasoning');
        
        const industryName = industryInput.value.trim();
        const reasoning = reasoningInput.value.trim();
        
        if (!industryName) {
            alert('Please enter an industry name');
            return;
        }
        
        // Add the custom industry
        this.generatedStrategy.industries.push({
            name: industryName,
            reasoning: reasoning || `Custom industry for ${this.selectedGoal}`,
            marketSize: "To be determined",
            competitiveAdvantage: "Custom positioning"
        });
        
        // Close modal and refresh display
        const modal = document.getElementById('custom-industry-modal');
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 300);
        
        // Clear inputs
        industryInput.value = '';
        reasoningInput.value = '';
        
        this.displayIndustries();
        
        console.log('✅ Custom industry added:', industryName);
    }

    async regenerateICPs() {
        console.log('🔄 Regenerating ICPs with Gemini...');
        
        const regenerateBtn = document.getElementById('regenerate-icps');
        const originalText = regenerateBtn.innerHTML;
        regenerateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Regenerating...';
        regenerateBtn.disabled = true;

        try {
            const selectedIndustries = this.selectedIndustries.map(index => 
                this.generatedStrategy.industries[index]
            );

            const response = await fetch('http://localhost:3000/api/generate-icps', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    businessContext: this.businessContext,
                    goal: this.selectedGoal,
                    selectedIndustries: selectedIndustries
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.generatedStrategy.icps = result.data.icps;
                this.displayICPs();
            } else {
                throw new Error('Failed to regenerate ICPs');
            }
        } catch (error) {
            console.error('❌ Error regenerating ICPs:', error);
            // Fallback to shuffling existing ones
            this.generatedStrategy.icps = this.shuffleArray([...this.generatedStrategy.icps]);
            this.displayICPs();
        }

        regenerateBtn.innerHTML = originalText;
        regenerateBtn.disabled = false;
    }

    addCustomICP() {
        const titleInput = document.getElementById('custom-icp-title');
        const industrySelect = document.getElementById('custom-icp-industry');
        const painPointsInput = document.getElementById('custom-icp-pain-points');
        const valuePropsInput = document.getElementById('custom-icp-value-props');
        const demographicsInput = document.getElementById('custom-icp-demographics');
        
        const title = titleInput.value.trim();
        const industry = industrySelect.value;
        const painPoints = painPointsInput.value.trim().split('\n').filter(p => p.trim());
        const valueProps = valuePropsInput.value.trim().split('\n').filter(v => v.trim());
        const demographics = demographicsInput.value.trim();
        
        if (!title) {
            alert('Please enter a decision maker title');
            return;
        }
        
        // Add the custom ICP
        this.generatedStrategy.icps.push({
            title: title,
            industry: industry || "Custom",
            painPoints: painPoints.length > 0 ? painPoints : ["Custom pain point"],
            valueProps: valueProps.length > 0 ? valueProps : ["Custom value proposition"],
            demographics: demographics || "To be defined",
            buyingBehavior: "To be analyzed",
            messagingAngle: `Custom ${this.selectedGoal} messaging`
        });
        
        // Close modal and refresh display
        const modal = document.getElementById('custom-icp-modal');
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 300);
        
        // Clear inputs
        titleInput.value = '';
        industrySelect.value = '';
        painPointsInput.value = '';
        valuePropsInput.value = '';
        demographicsInput.value = '';
        
        this.displayICPs();
        
        console.log('✅ Custom ICP added:', title);
    }

    editICP(index) {
        // Implementation for editing ICP
        const icp = this.generatedStrategy.icps[index];
        const newTitle = prompt('Edit decision maker title:', icp.title);
        if (newTitle) {
            this.generatedStrategy.icps[index].title = newTitle;
            this.displayICPs();
        }
    }

    handleAccountUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        console.log('📎 Account file uploaded:', file.name);
        
        // Update UI to show file uploaded
        const uploadArea = document.getElementById('account-upload');
        uploadArea.innerHTML = `
            <i class="fas fa-file-csv" style="color: var(--primary-green);"></i>
            <span style="color: var(--primary-green);">${file.name}</span>
            <small style="color: var(--text-muted);">Processing accounts...</small>
        `;
        
        // Simulate file processing
        setTimeout(() => {
            // Add mock accounts based on file upload
            const mockUploadedAccounts = [
                {
                    companyName: "Uploaded Tech Co",
                    industry: "SaaS Technology",
                    size: "200 employees",
                    location: "Uploaded Location",
                    fitReason: "Imported from uploaded file",
                    decisionMaker: "Marketing Director"
                },
                {
                    companyName: "Uploaded E-commerce",
                    industry: "E-commerce",
                    size: "150 employees", 
                    location: "Uploaded Location",
                    fitReason: "Imported from uploaded file",
                    decisionMaker: "E-commerce Manager"
                }
            ];
            
            this.generatedStrategy.targetAccounts.push(...mockUploadedAccounts);
            this.displayTargetAccounts();
            
            // Update upload UI to show success
            uploadArea.innerHTML = `
                <i class="fas fa-check-circle" style="color: var(--success-green);"></i>
                <span style="color: var(--success-green);">${mockUploadedAccounts.length} accounts imported</span>
                <small style="color: var(--text-muted);">From ${file.name}</small>
            `;
            
            console.log('✅ Accounts imported successfully');
        }, 2000);
    }

    async loadMoreAccounts() {
        console.log('📊 Loading more target accounts with Gemini...');
        
        const loadMoreBtn = document.getElementById('load-more-accounts');
        const originalText = loadMoreBtn.innerHTML;
        loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        loadMoreBtn.disabled = true;

        try {
            const selectedICPs = this.selectedICPs.map(index => 
                this.generatedStrategy.icps[index]
            );

            const response = await fetch('http://localhost:3000/api/generate-accounts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    businessContext: this.businessContext,
                    selectedICPs: selectedICPs
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.generatedStrategy.targetAccounts.push(...result.data.targetAccounts);
                this.displayTargetAccounts();
            } else {
                throw new Error('Failed to load more accounts');
            }
        } catch (error) {
            console.error('❌ Error loading more accounts:', error);
            // Fallback to mock accounts
            const mockAccounts = [
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
                }
            ];
            
            this.generatedStrategy.targetAccounts.push(...mockAccounts);
            this.displayTargetAccounts();
        }

        loadMoreBtn.innerHTML = originalText;
        loadMoreBtn.disabled = false;
    }

    // Step 5: Campaign Asset Generation & Launch
    async generateCampaignAssets() {
        this.goToStep(5);
        
        // Show loading state
        document.getElementById('assets-loading').classList.remove('hidden');
        document.getElementById('campaign-posts').classList.add('hidden');

        // Generate posts with Gemini
        await this.generatePosts();
    }

    async generatePosts() {
        console.log('🎨 Generating Campaign Posts with Gemini...');

        // Animate progress bar
        this.animatePostGeneration();

        try {
            // Get selected industries and ICPs
            const selectedIndustries = this.selectedIndustries.map(index => 
                this.generatedStrategy.industries[index]
            );
            const selectedICPs = this.selectedICPs.map(index => 
                this.generatedStrategy.icps[index]
            );

            const response = await fetch('http://localhost:3000/api/generate-posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    businessContext: this.businessContext,
                    goal: this.selectedGoal,
                    selectedIndustries,
                    selectedICPs
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.generatedPosts = result.data;
                console.log('✅ Posts generated by Gemini:', this.generatedPosts);
            } else {
                throw new Error('Post generation failed');
            }
        } catch (error) {
            console.error('❌ Post Generation Error:', error);
            // Generate mock posts for MVP
            this.generateMockPosts();
        }

        // Complete loading animation
        await new Promise(resolve => setTimeout(resolve, 1000));

        this.displayGeneratedPosts();
    }

    async animatePostGeneration() {
        const progressBar = document.getElementById('post-generation-progress');
        let progress = 0;
        
        const steps = [
            { text: 'Analyzing target audiences...', duration: 1500 },
            { text: 'Creating compelling copy...', duration: 2000 },
            { text: 'Generating visual concepts...', duration: 2500 },
            { text: 'Optimizing for platforms...', duration: 1500 },
            { text: 'Finalizing campaigns...', duration: 1000 }
        ];

        for (let i = 0; i < steps.length; i++) {
            progress = ((i + 1) / steps.length) * 100;
            progressBar.style.width = progress + '%';
            await new Promise(resolve => setTimeout(resolve, steps[i].duration));
        }
    }

    displayGeneratedPosts() {
        // Hide loading, show posts
        document.getElementById('assets-loading').classList.add('hidden');
        document.getElementById('campaign-posts').classList.remove('hidden');
        document.getElementById('platform-connections').classList.remove('hidden');

        // Update summary stats
        document.getElementById('posts-count').textContent = this.generatedPosts.length;
        document.getElementById('platforms-count').textContent = this.connectedPlatforms.length;
        document.getElementById('approved-count').textContent = '0';

        // Create carousel
        this.createPostsCarousel();
        
        // Show connected platforms
        this.displayConnectedPlatforms();
        
        // Initialize carousel controls
        this.initializeCarousel();
    }

    createPostsCarousel() {
        const postsWrapper = document.getElementById('posts-wrapper');
        const indicators = document.getElementById('carousel-indicators');
        
        postsWrapper.innerHTML = '';
        indicators.innerHTML = '';

        this.generatedPosts.forEach((post, index) => {
            // Create post slide
            const postSlide = document.createElement('div');
            postSlide.className = 'post-slide';
            postSlide.innerHTML = `
                <div class="post-preview">
                    <div class="post-image-preview ${post.image ? '' : 'placeholder'}">
                        ${post.image ? 
                            `<img src="${post.image.url}" alt="Generated post image" />` : 
                            '<i class="fas fa-image"></i>'
                        }
                    </div>
                    <div class="post-copy-preview">${post.adCopy}</div>
                </div>
                
                <div class="post-details">
                    <div class="post-meta">
                        <span class="meta-tag">${post.targetICP || 'General Audience'}</span>
                        <span class="meta-tag">${post.industry || 'Multi-Industry'}</span>
                        <span class="meta-tag">${post.platform || 'All Platforms'}</span>
                    </div>
                    
                    <div class="post-editor">
                        <h4>Edit Post Copy</h4>
                        <textarea class="post-copy-editor" data-post-id="${post.id}">${post.adCopy}</textarea>
                    </div>
                    
                    <div class="post-controls">
                        <button class="btn btn-outline approve-post" data-post-id="${post.id}">
                            <i class="fas fa-check"></i>
                            Approve
                        </button>
                        <button class="btn btn-outline edit-image" data-post-id="${post.id}">
                            <i class="fas fa-image"></i>
                            Change Image
                        </button>
                        <button class="btn btn-outline schedule-post" data-post-id="${post.id}">
                            <i class="fas fa-calendar"></i>
                            Schedule
                        </button>
                        <button class="btn btn-outline regenerate-post" data-post-id="${post.id}">
                            <i class="fas fa-refresh"></i>
                            Regenerate
                        </button>
                        <button class="btn btn-outline delete-post" data-post-id="${post.id}">
                            <i class="fas fa-trash"></i>
                            Delete
                        </button>
                    </div>
                </div>
            `;

            // Add event listeners for post controls
            this.addPostControlListeners(postSlide, post);
            
            postsWrapper.appendChild(postSlide);

            // Create indicator
            const indicator = document.createElement('div');
            indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
            indicator.dataset.index = index;
            indicator.addEventListener('click', () => this.goToSlide(index));
            indicators.appendChild(indicator);
        });
    }

    addPostControlListeners(postSlide, post) {
        // Approve post
        postSlide.querySelector('.approve-post').addEventListener('click', () => {
            this.approvePost(post.id);
        });

        // Edit image
        postSlide.querySelector('.edit-image').addEventListener('click', () => {
            this.editPostImage(post.id);
        });

        // Schedule post
        postSlide.querySelector('.schedule-post').addEventListener('click', () => {
            this.schedulePost(post.id);
        });

        // Regenerate post
        postSlide.querySelector('.regenerate-post').addEventListener('click', () => {
            this.regeneratePost(post.id);
        });

        // Delete post
        postSlide.querySelector('.delete-post').addEventListener('click', () => {
            this.deletePost(post.id);
        });

        // Real-time copy editing
        postSlide.querySelector('.post-copy-editor').addEventListener('input', (e) => {
            const postId = parseInt(e.target.dataset.postId);
            const postIndex = this.generatedPosts.findIndex(p => p.id === postId);
            if (postIndex !== -1) {
                this.generatedPosts[postIndex].adCopy = e.target.value;
                // Update preview
                postSlide.querySelector('.post-copy-preview').textContent = e.target.value;
            }
        });
    }

    initializeCarousel() {
        this.currentSlide = 0;
        
        // Previous button
        document.getElementById('prev-post').addEventListener('click', () => {
            this.previousSlide();
        });
        
        // Next button
        document.getElementById('next-post').addEventListener('click', () => {
            this.nextSlide();
        });
        
        // Bulk actions
        document.getElementById('select-all-posts').addEventListener('click', () => {
            this.selectAllPosts();
        });
        
        document.getElementById('regenerate-all-posts').addEventListener('click', () => {
            this.regenerateAllPosts();
        });
        
        // Main actions
        document.getElementById('save-draft').addEventListener('click', () => {
            this.saveDraft();
        });
        
        // Update carousel navigation
        this.updateCarouselNavigation();
    }

    goToSlide(index) {
        this.currentSlide = index;
        const wrapper = document.getElementById('posts-wrapper');
        wrapper.style.transform = `translateX(-${index * 100}%)`;
        
        // Update indicators
        document.querySelectorAll('.indicator').forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
        
        this.updateCarouselNavigation();
    }

    previousSlide() {
        if (this.currentSlide > 0) {
            this.goToSlide(this.currentSlide - 1);
        }
    }

    nextSlide() {
        if (this.currentSlide < this.generatedPosts.length - 1) {
            this.goToSlide(this.currentSlide + 1);
        }
    }

    updateCarouselNavigation() {
        const prevBtn = document.getElementById('prev-post');
        const nextBtn = document.getElementById('next-post');
        
        prevBtn.disabled = this.currentSlide === 0;
        nextBtn.disabled = this.currentSlide === this.generatedPosts.length - 1;
    }

    approvePost(postId) {
        const post = this.generatedPosts.find(p => p.id === postId);
        if (post) {
            post.approved = !post.approved;
            
            // Update approve button
            const approveBtn = document.querySelector(`[data-post-id="${postId}"].approve-post`);
            if (post.approved) {
                approveBtn.innerHTML = '<i class="fas fa-check-circle"></i> Approved';
                approveBtn.classList.remove('btn-outline');
                approveBtn.classList.add('btn-success');
            } else {
                approveBtn.innerHTML = '<i class="fas fa-check"></i> Approve';
                approveBtn.classList.remove('btn-success');
                approveBtn.classList.add('btn-outline');
            }
            
            // Update approved count
            const approvedCount = this.generatedPosts.filter(p => p.approved).length;
            document.getElementById('approved-count').textContent = approvedCount;
            
            this.showNotification(`Post ${post.approved ? 'approved' : 'unapproved'}!`, 'success');
        }
    }

    displayConnectedPlatforms() {
        const platformsList = document.getElementById('connected-platforms-list');
        platformsList.innerHTML = '';
        
        this.connectedPlatforms.forEach(platform => {
            const platformCard = document.createElement('div');
            platformCard.className = 'connected-platform-card ready';
            platformCard.innerHTML = `
                <div class="platform-icon">
                    <i class="fab fa-${platform === 'meta' ? 'facebook' : platform}"></i>
                </div>
                <div class="platform-info">
                    <h4>${this.getPlatformName(platform)}</h4>
                    <p>Ready to receive posts</p>
                </div>
                <div class="platform-status">
                    <i class="fas fa-check-circle" style="color: var(--success-color);"></i>
                </div>
            `;
            platformsList.appendChild(platformCard);
        });
    }

    editPost(postId) {
        console.log('✏️ Editing post:', postId);
        const post = this.generatedPosts.find(p => p.id === postId);
        if (post) {
            const newCopy = prompt('Edit ad copy:', post.adCopy);
            if (newCopy) {
                post.adCopy = newCopy;
                this.displayGeneratedPosts();
            }
        }
    }

    downloadPost(postId) {
        console.log('⬇️ Downloading post:', postId);
        const post = this.generatedPosts.find(p => p.id === postId);
        if (post) {
            // Create downloadable content
            const content = `Ad Copy:\n${post.adCopy}\n\nTarget: ${post.targetICP.title} in ${post.industry.name}`;
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `tinkerbell-post-${postId}.txt`;
            a.click();
            
            URL.revokeObjectURL(url);
        }
    }

    schedulePost(postId) {
        console.log('📅 Scheduling post:', postId);
        // For MVP, show a simple alert
        alert(`Post ${postId} scheduled successfully! (Mock implementation for MVP)`);
    }

    async launchAllCampaigns() {
        console.log('🚀 Launching all campaigns...');
        
        const launchBtn = document.getElementById('launch-campaigns');
        const originalText = launchBtn.innerHTML;
        launchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Launching...';
        launchBtn.disabled = true;

        // Simulate launch process
        await new Promise(resolve => setTimeout(resolve, 3000));

        alert('🎉 All campaigns launched successfully!\n\nYour AI-generated marketing campaigns are now live and driving results.');
        
        launchBtn.innerHTML = originalText;
        launchBtn.disabled = false;
    }

    // Platform and Post Management Methods
    getPlatformName(platform) {
        const names = {
            'meta': 'Meta (Facebook & Instagram)',
            'linkedin': 'LinkedIn',
            'google': 'Google Ads',
            'twitter': 'Twitter/X',
            'tiktok': 'TikTok',
            'youtube': 'YouTube'
        };
        return names[platform] || platform;
    }

    generateMockPosts() {
        this.generatedPosts = [
            {
                id: 1,
                adCopy: `🚀 Struggling with ${this.businessContext.painPoints || 'marketing challenges'}?\n\n${this.businessContext.valueProposition || 'Our solution'} helps businesses like yours achieve ${this.selectedGoal}.\n\nReady to transform your marketing? 👇\n\n#Marketing #${this.selectedGoal.replace(' ', '')} #Business #Growth #AI`,
                image: {
                    imageBytes: 'placeholder-image-data',
                    url: 'https://picsum.photos/400/400?random=1'
                },
                targetICP: this.generatedStrategy.icps[0]?.title || 'Target Audience 1',
                industry: this.generatedStrategy.industries[0]?.name || 'General Industry',
                platform: 'All Platforms',
                approved: false
            },
            {
                id: 2,
                adCopy: `💡 ${this.selectedGoal} doesn't have to be complicated.\n\n${this.businessContext.businessName || 'Our platform'} makes it simple with AI-powered automation.\n\n✅ Save time\n✅ Increase ROI\n✅ Scale faster\n\nStart your free trial today! 🔗\n\n#MarketingAutomation #${this.selectedGoal.replace(' ', '')} #ROI #Efficiency #Scale`,
                image: {
                    imageBytes: 'placeholder-image-data',
                    url: 'https://picsum.photos/400/400?random=2'
                },
                targetICP: this.generatedStrategy.icps[1]?.title || this.generatedStrategy.icps[0]?.title || 'Target Audience 2',
                industry: this.generatedStrategy.industries[1]?.name || this.generatedStrategy.industries[0]?.name || 'General Industry',
                platform: 'Meta',
                approved: false
            },
            {
                id: 3,
                adCopy: `📈 Ready to scale your ${this.businessContext.industry || 'business'}?\n\nDiscover how ${this.businessContext.businessName || 'our solution'} transforms your ${this.selectedGoal.toLowerCase()}.\n\n🎯 Proven results\n💰 Guaranteed ROI\n⚡ Quick implementation\n\nBook a demo today!\n\n#GrowthHacking #${this.selectedGoal.replace(' ', '')} #ROI #MarketingStrategy`,
                image: {
                    imageBytes: 'placeholder-image-data',
                    url: 'https://picsum.photos/400/400?random=3'
                },
                targetICP: this.generatedStrategy.icps[0]?.title || 'Target Audience 3',
                industry: this.generatedStrategy.industries[0]?.name || 'General Industry',
                platform: 'LinkedIn',
                approved: false
            },
            {
                id: 4,
                adCopy: `🎯 Stop wasting money on ineffective ${this.selectedGoal.toLowerCase()}!\n\n${this.businessContext.businessName || 'Our AI-powered platform'} delivers:\n\n🔥 Higher conversion rates\n📊 Better targeting\n💪 Stronger ROI\n\nJoin 10,000+ successful businesses!\n\n#MarketingROI #${this.selectedGoal.replace(' ', '')} #ConversionOptimization #AI`,
                image: {
                    imageBytes: 'placeholder-image-data',
                    url: 'https://picsum.photos/400/400?random=4'
                },
                targetICP: this.generatedStrategy.icps[1]?.title || 'Target Audience 4',
                industry: this.generatedStrategy.industries[1]?.name || 'General Industry',
                platform: 'Google Ads',
                approved: false
            },
            {
                id: 5,
                adCopy: `⚡ Game-changing ${this.selectedGoal.toLowerCase()} is here!\n\n${this.businessContext.valueProposition || 'Transform your marketing'} with our revolutionary approach.\n\n🚀 2x faster results\n💎 Premium quality\n🎯 Laser-focused targeting\n\nLimited time offer - Act now!\n\n#Innovation #${this.selectedGoal.replace(' ', '')} #MarketingRevolution #LimitedOffer`,
                image: {
                    imageBytes: 'placeholder-image-data',
                    url: 'https://picsum.photos/400/400?random=5'
                },
                targetICP: this.generatedStrategy.icps[0]?.title || 'Target Audience 5',
                industry: this.generatedStrategy.industries[0]?.name || 'General Industry',
                platform: 'Twitter',
                approved: false
            },
            {
                id: 6,
                adCopy: `🔥 The secret to ${this.selectedGoal.toLowerCase()} success?\n\n${this.businessContext.businessName || 'Smart automation'} + proven strategies = unstoppable growth!\n\n📈 Increase conversions by 300%\n⏰ Save 20+ hours per week\n💰 Reduce costs by 50%\n\nStart your transformation today!\n\n#MarketingAutomation #Growth #Efficiency #${this.selectedGoal.replace(' ', '')}`,
                image: {
                    imageBytes: 'placeholder-image-data',
                    url: 'https://picsum.photos/400/400?random=6'
                },
                targetICP: this.generatedStrategy.icps[1]?.title || 'Target Audience 6',
                industry: this.generatedStrategy.industries[1]?.name || 'General Industry',
                platform: 'TikTok',
                approved: false
            }
        ];
    }

    // Post Action Methods
    async editPostImage(postId) {
        this.showNotification('Image editing feature coming soon!', 'info');
    }

    async schedulePost(postId) {
        const post = this.generatedPosts.find(p => p.id === postId);
        if (post) {
            // Mock scheduling
            this.showNotification(`Post scheduled for ${post.platform || 'all platforms'}!`, 'success');
        }
    }

    async regeneratePost(postId) {
        this.showNotification('Regenerating post...', 'info');
        
        try {
            // Call the new regenerate API
            const post = this.generatedPosts.find(p => p.id === postId);
            const response = await fetch('http://localhost:3000/api/regenerate-post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postId: postId,
                    postContent: post.adCopy,
                    industry: post.industry,
                    regenerateImage: true,
                    regenerateText: true
                })
            });

            if (response.ok) {
                const result = await response.json();
                const postIndex = this.generatedPosts.findIndex(p => p.id === postId);
                
                if (postIndex !== -1) {
                    // Update with regenerated content
                    if (result.data.newText) {
                        this.generatedPosts[postIndex].adCopy = result.data.newText;
                    }
                    if (result.data.newImage && result.data.newImage.success) {
                        this.generatedPosts[postIndex].image.url = result.data.newImage.url;
                    }
                    
                    // Update display
                    this.createPostsCarousel();
                    this.goToSlide(this.currentSlide);
                    
                    this.showNotification('Post regenerated successfully!', 'success');
                }
            } else {
                throw new Error('Regeneration API failed');
            }
        } catch (error) {
            console.error('❌ Post Regeneration Error:', error);
            // Fallback to mock regeneration
            const postIndex = this.generatedPosts.findIndex(p => p.id === postId);
            if (postIndex !== -1) {
                // Remove any existing [REGENERATED] tags to prevent stacking
                let cleanContent = this.generatedPosts[postIndex].adCopy.replace(/🔄 \[REGENERATED\]\s*/g, '');
                this.generatedPosts[postIndex].adCopy = cleanContent;
                this.generatedPosts[postIndex].image.url = `https://picsum.photos/400/400?random=${Date.now()}`;
                
                this.createPostsCarousel();
                this.goToSlide(this.currentSlide);
                
                this.showNotification('Post regenerated successfully!', 'success');
            }
        }
    }

    deletePost(postId) {
        if (confirm('Are you sure you want to delete this post?')) {
            const postIndex = this.generatedPosts.findIndex(p => p.id === postId);
            if (postIndex !== -1) {
                this.generatedPosts.splice(postIndex, 1);
                
                // Update display
                if (this.generatedPosts.length === 0) {
                    // No posts left
                    document.getElementById('campaign-posts').innerHTML = '<p>No posts available. Please regenerate campaign.</p>';
                } else {
                    // Adjust current slide if necessary
                    if (this.currentSlide >= this.generatedPosts.length) {
                        this.currentSlide = this.generatedPosts.length - 1;
                    }
                    
                    this.createPostsCarousel();
                    this.goToSlide(this.currentSlide);
                }
                
                // Update stats
                document.getElementById('posts-count').textContent = this.generatedPosts.length;
                
                this.showNotification('Post deleted successfully!', 'success');
            }
        }
    }

    selectAllPosts() {
        this.generatedPosts.forEach(post => post.approved = true);
        this.createPostsCarousel();
        this.goToSlide(this.currentSlide);
        
        // Update approved count
        document.getElementById('approved-count').textContent = this.generatedPosts.length;
        
        this.showNotification('All posts approved!', 'success');
    }

    async regenerateAllPosts() {
        if (confirm('This will regenerate all posts. Are you sure?')) {
            this.showNotification('Regenerating all posts...', 'info');
            
            try {
                // Show loading
                document.getElementById('assets-loading').classList.remove('hidden');
                document.getElementById('campaign-posts').classList.add('hidden');
                
                await this.generatePosts();
                
                this.showNotification('All posts regenerated successfully!', 'success');
            } catch (error) {
                this.showNotification('Failed to regenerate posts. Please try again.', 'error');
            }
        }
    }

    saveDraft() {
        // Mock save functionality
        const draftData = {
            businessContext: this.businessContext,
            selectedGoal: this.selectedGoal,
            generatedStrategy: this.generatedStrategy,
            selectedIndustries: this.selectedIndustries,
            selectedICPs: this.selectedICPs,
            generatedPosts: this.generatedPosts,
            connectedPlatforms: this.connectedPlatforms,
            savedAt: new Date().toISOString()
        };
        
        localStorage.setItem('tinkerbellDraft', JSON.stringify(draftData));
        this.showNotification('Campaign draft saved successfully!', 'success');
    }

    // New Post Management Methods
    removeHashtagsFromPosts() {
        if (confirm('Remove all hashtags from posts? This cannot be undone.')) {
            this.generatedPosts.forEach(post => {
                // Remove hashtags (# followed by word characters)
                post.adCopy = post.adCopy.replace(/#[\w]+/g, '').replace(/\s+/g, ' ').trim();
            });
            
            // Refresh the carousel
            this.createPostsCarousel();
            this.goToSlide(this.currentSlide);
            
            this.showNotification('Hashtags removed from all posts!', 'success');
        }
    }

    async generateMorePosts() {
        this.showNotification('Generating 3 more posts...', 'info');
        
        try {
            // Show loading
            document.getElementById('assets-loading').classList.remove('hidden');
            document.getElementById('campaign-posts').classList.add('hidden');
            
            // Generate 3 more posts
            const response = await fetch('http://localhost:3000/api/generate-posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    businessContext: this.businessContext,
                    goal: this.selectedGoal,
                    selectedIndustries: this.selectedIndustries.map(index => 
                        this.generatedStrategy.industries[index]
                    ),
                    selectedICPs: this.selectedICPs.map(index => 
                        this.generatedStrategy.icps[index]
                    ),
                    existingPostsCount: this.generatedPosts.length,
                    additionalPosts: 3
                })
            });

            if (response.ok) {
                const result = await response.json();
                const newPosts = result.data;
                
                // Add unique IDs and append to existing posts
                newPosts.forEach((post, index) => {
                    post.id = this.generatedPosts.length + index + 1;
                    post.approved = false;
                });
                
                this.generatedPosts.push(...newPosts);
                console.log('✅ Additional posts generated:', newPosts);
            } else {
                throw new Error('Additional post generation failed');
            }
        } catch (error) {
            console.error('❌ Additional Post Generation Error:', error);
            // Generate mock additional posts
            this.generateMockAdditionalPosts();
        }

        // Hide loading and refresh display
        document.getElementById('assets-loading').classList.add('hidden');
        document.getElementById('campaign-posts').classList.remove('hidden');
        
        // Update posts count
        document.getElementById('posts-count').textContent = this.generatedPosts.length;
        
        // Refresh carousel
        this.createPostsCarousel();
        this.goToSlide(this.currentSlide);
        
        this.showNotification(`3 more posts generated! Total: ${this.generatedPosts.length}`, 'success');
    }

    generateMockAdditionalPosts() {
        const additionalPosts = [
            {
                id: this.generatedPosts.length + 1,
                adCopy: `🌟 Transform your ${this.selectedGoal.toLowerCase()} today!\n\n${this.businessContext.businessName || 'Our innovative solution'} delivers measurable results.\n\n✨ Proven methodology\n📊 Data-driven approach\n🎯 Targeted execution\n\nDon't wait - start now!\n\n#Transformation #${this.selectedGoal.replace(' ', '')} #Results #Innovation`,
                image: {
                    imageBytes: 'placeholder-image-data',
                    url: `https://picsum.photos/400/400?random=${Date.now()}`
                },
                targetICP: this.generatedStrategy.icps[0]?.title || 'Target Audience',
                industry: this.generatedStrategy.industries[0]?.name || 'General Industry',
                platform: 'LinkedIn',
                approved: false
            },
            {
                id: this.generatedPosts.length + 2,
                adCopy: `💡 Ready to revolutionize your ${this.selectedGoal.toLowerCase()}?\n\nJoin thousands of businesses achieving incredible results with ${this.businessContext.businessName || 'our platform'}.\n\n🔥 Instant impact\n📈 Scalable solutions\n💰 Maximum ROI\n\nGet started today!\n\n#Revolution #${this.selectedGoal.replace(' ', '')} #BusinessGrowth #Success`,
                image: {
                    imageBytes: 'placeholder-image-data',
                    url: `https://picsum.photos/400/400?random=${Date.now() + 1}`
                },
                targetICP: this.generatedStrategy.icps[1]?.title || 'Target Audience',
                industry: this.generatedStrategy.industries[1]?.name || 'General Industry',
                platform: 'Meta',
                approved: false
            },
            {
                id: this.generatedPosts.length + 3,
                adCopy: `🎯 Master ${this.selectedGoal.toLowerCase()} with AI precision!\n\n${this.businessContext.valueProposition || 'Our cutting-edge technology'} gives you the competitive edge you need.\n\n⚡ Lightning fast\n🎨 Creative excellence\n📊 Analytics-driven\n\nTake control now!\n\n#AI #${this.selectedGoal.replace(' ', '')} #Precision #Technology`,
                image: {
                    imageBytes: 'placeholder-image-data',
                    url: `https://picsum.photos/400/400?random=${Date.now() + 2}`
                },
                targetICP: this.generatedStrategy.icps[0]?.title || 'Target Audience',
                industry: this.generatedStrategy.industries[0]?.name || 'General Industry',
                platform: 'Google Ads',
                approved: false
            }
        ];
        
        this.generatedPosts.push(...additionalPosts);
    }

    // Notification System
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="close-notification" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add to notification container
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Utility Methods
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TinkerbellApp();
});
