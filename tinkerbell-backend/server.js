const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

// Import our enhanced services
const ImageService = require('./imageService');
const PlanableClient = require('./planableClient');
const FacebookService = require('./facebookService');
const GeminiAI = require('./geminiClient');
const ImagenService = require('./imagenService');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize services
const imageService = new ImageService();
const planableClient = new PlanableClient();
const facebookService = new FacebookService();
const geminiAI = new GeminiAI();
const imagenService = new ImagenService();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, 'uploads'))
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function(req, file, cb) {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Embedded Planable functionality (Nicolae's work - integrated directly)
const Planable = {
    async createWorkspace(workspaceName) {
        console.log(`📋 Planable: Creating workspace "${workspaceName}"`);

        // Mock workspace for reliable demo
        const mockId = `mock_ws_${Date.now()}`;
        return {
            id: mockId,
            name: workspaceName,
            url: `https://app.planable.io/workspace/${mockId}`,
            created_at: new Date().toISOString(),
            status: 'active'
        };
    },

    async schedulePost(workspaceId, postData) {
        console.log(`📝 Planable: Scheduling post for ${postData.platform}`);

        // Mock post response
        return {
            id: `mock_post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            platform: postData.platform,
            content: postData.post_text,
            status: 'scheduled',
            scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString()
        };
    },

    async scheduleMultiplePosts(workspaceId, postsData) {
        console.log(`📚 Planable: Scheduling ${postsData.length} posts in batch`);

        const results = [];

        for (const postData of postsData) {
            try {
                const result = await this.schedulePost(workspaceId, postData);
                results.push({
                    success: true,
                    postData,
                    response: result
                });
            } catch (error) {
                results.push({
                    success: false,
                    postData,
                    error: error.message
                });
            }
        }

        const successCount = results.filter(r => r.success).length;
        console.log(`✅ Planable: ${successCount}/${postsData.length} posts scheduled successfully`);

        return results;
    },

    getWorkspaceUrl(workspaceId) {
        return `https://app.planable.io/workspace/${workspaceId}`;
    }
};

// Embedded AI functionality using Gemini
const AI = {
    async generatePersonas(businessData) {
        console.log('🧠 AI: Generating customer personas...');

        // Use Gemini AI for persona generation
        try {
            console.log('🤖 Using Gemini AI...');
            return await geminiAI.generateCompleteStrategy(businessData, 'persona-generation');
        } catch (error) {
            console.log('⚠️ Gemini failed, using mock data:', error.message);
        }

        // Mock personas for reliable demo
        return {
            personas: [{
                    name: "Maria Popescu",
                    age_range: "28-35",
                    demographics: "Femeie tânără, educată, venit mediu-mare",
                    interests: ["evenimente speciale", "design interior", "fotografii"],
                    pain_points: ["lipsa timpului pentru organizare", "găsirea furnizorilor de calitate"],
                    buying_behavior: "Cercetează online, citește review-uri",
                    preferred_platforms: ["Instagram", "Facebook"],
                    communication_style: "Profesional dar prietenos"
                },
                {
                    name: "Ana Ciobanu",
                    age_range: "30-45",
                    demographics: "Femeie matură, organizator evenimente",
                    interests: ["planning evenimente", "networking", "eficiență"],
                    pain_points: ["respectarea bugetelor", "coordonarea furnizorilor"],
                    buying_behavior: "Decizii rapide, relații pe termen lung",
                    preferred_platforms: ["Facebook", "LinkedIn"],
                    communication_style: "Direct, orientat spre rezultate"
                }
            ]
        };
    },
    async generateCampaignContent(businessData, confirmedPersonas) {
        console.log('🎨 AI: Generating campaign content...');

        // Use Gemini AI for campaign generation
        try {
            console.log('🤖 Using Gemini AI for campaign...');
            return await geminiAI.generateCampaignPosts(businessData, 'content-generation', [], confirmedPersonas);
        } catch (error) {
            console.log('⚠️ Gemini failed, using mock data:', error.message);
        }

        // Mock campaign content for reliable demo
        return {
            strategy: "Creăm campanii care evidențiază calitatea și unicitatea produselor pentru a atrage clienți care valorifică excelența.",
            posts: [{
                    platform: "both",
                    post_text: "🌸 Transformăm visurile tale în realitate cu aranjamente florale unice! Fiecare buchet spune o poveste specială. ✨",
                    hashtags: ["#florarie", "#aranjamenteflorale", "#nunti", "#chisinau", "#flori"],
                    call_to_action: "Contactează-ne pentru o consultație gratuită!",
                    image_description: "Buchet elegant cu flori proaspete, aranjament profesional",
                    target_persona: "Maria Popescu",
                    post_goal: "awareness"
                },
                {
                    platform: "facebook",
                    post_text: "💍 Nuntă de vis? Avem soluția perfectă! Decorațiuni florale care vor face ca ziua ta specială să fie de neuitat. 👰",
                    hashtags: ["#nunta", "#decoratiuni", "#mireasa", "#evenimente"],
                    call_to_action: "Rezervă o întâlnire pentru planificarea nunții tale!",
                    image_description: "Decorațiuni florale elegante pentru nuntă",
                    target_persona: "Maria Popescu",
                    post_goal: "conversion"
                },
                {
                    platform: "instagram",
                    post_text: "🎯 Organizezi un eveniment special? Noi ne ocupăm de partea florală ca să fie perfect! 📞",
                    hashtags: ["#organizatorevenimente", "#florarie", "#professional", "#chisinau"],
                    call_to_action: "Trimite un mesaj pentru oferta ta personalizată!",
                    image_description: "Aranjament floral modern pentru evenimente corporate",
                    target_persona: "Ana Ciobanu",
                    post_goal: "conversion"
                }
            ]
        };
    }
};

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded and generated images
app.use('/images', express.static(path.join(__dirname, 'uploads')));
app.use('/generated', express.static(path.join(__dirname, 'generated-images')));

// Route for creating personas (Hour 2: AI Integration)
app.post('/api/create-personas', async(req, res) => {
    console.log('=== CREATE PERSONAS ENDPOINT ===');
    console.log('Request body:', req.body);
    try {
        // Use embedded AI functionality to generate personas
        const personas = await AI.generatePersonas(req.body);

        res.json({
            success: true,
            message: 'Personas generated successfully!',
            data: personas
        });

    } catch (error) {
        console.error('❌ Error generating personas:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate personas',
            error: error.message
        });
    }
});

// ==== TINKERBELL MVP API ENDPOINTS ====

// Business Context Storage
app.post('/api/business-context', async(req, res) => {
    console.log('=== BUSINESS CONTEXT ENDPOINT ===');
    console.log('Request body:', req.body);
    try {
        // Store business context (in production, save to database)
        res.json({
            success: true,
            message: 'Business context saved successfully!',
            data: req.body
        });
    } catch (error) {
        console.error('❌ Error saving business context:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save business context',
            error: error.message
        });
    }
});

// Goal Selection
app.post('/api/select-goal', async(req, res) => {
    console.log('=== GOAL SELECTION ENDPOINT ===');
    console.log('Request body:', req.body);
    try {
        res.json({
            success: true,
            message: 'Goal selected successfully!',
            data: req.body
        });
    } catch (error) {
        console.error('❌ Error saving goal:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save goal',
            error: error.message
        });
    }
});

// Meta Pixel Integration
app.post('/api/connect-pixel', async(req, res) => {
    console.log('=== CONNECT PIXEL ENDPOINT ===');
    console.log('Request body:', req.body);
    try {
        // In production, verify the pixel ID
        res.json({
            success: true,
            message: 'Meta Pixel connected successfully!',
            data: {
                pixelId: req.body.pixelId,
                status: 'connected',
                verified: true
            }
        });
    } catch (error) {
        console.error('❌ Error connecting pixel:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to connect pixel',
            error: error.message
        });
    }
});

// Complete Strategy Generation (Gemini powered)
app.post('/api/generate-strategy', async(req, res) => {
    console.log('=== GENERATE STRATEGY ENDPOINT ===');
    console.log('Request body:', req.body);
    try {
        const { businessContext, goal, metaPixelId } = req.body;
        
        // Use Gemini to generate comprehensive strategy
        const strategy = await geminiAI.generateCompleteStrategy(businessContext, goal);
        
        res.json({
            success: true,
            message: 'Strategy generated successfully!',
            data: strategy
        });
    } catch (error) {
        console.error('❌ Error generating strategy:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate strategy',
            error: error.message
        });
    }
});

// Regenerate Industries
app.post('/api/regenerate-industries', async(req, res) => {
    console.log('=== REGENERATE INDUSTRIES ENDPOINT ===');
    try {
        const { businessContext, goal, existingIndustries } = req.body;
        
        const newIndustries = await geminiAI.generateMoreIndustries(businessContext, goal, existingIndustries);
        
        res.json({
            success: true,
            message: 'Industries regenerated successfully!',
            data: newIndustries
        });
    } catch (error) {
        console.error('❌ Error regenerating industries:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to regenerate industries',
            error: error.message
        });
    }
});

// Generate ICPs for selected industries
app.post('/api/generate-icps', async(req, res) => {
    console.log('=== GENERATE ICPS ENDPOINT ===');
    try {
        const { businessContext, goal, selectedIndustries } = req.body;
        
        const icps = await geminiAI.generateICPs(businessContext, goal, selectedIndustries);
        
        res.json({
            success: true,
            message: 'ICPs generated successfully!',
            data: icps
        });
    } catch (error) {
        console.error('❌ Error generating ICPs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate ICPs',
            error: error.message
        });
    }
});

// Generate Target Accounts
app.post('/api/generate-accounts', async(req, res) => {
    console.log('=== GENERATE ACCOUNTS ENDPOINT ===');
    try {
        const { businessContext, selectedICPs } = req.body;
        
        const accounts = await geminiAI.generateTargetAccounts(businessContext, selectedICPs);
        
        res.json({
            success: true,
            message: 'Target accounts generated successfully!',
            data: accounts
        });
    } catch (error) {
        console.error('❌ Error generating accounts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate accounts',
            error: error.message
        });
    }
});

// Generate Campaign Posts
app.post('/api/generate-posts', async(req, res) => {
    console.log('=== GENERATE POSTS ENDPOINT ===');
    try {
        const { businessContext, goal, selectedIndustries, selectedICPs } = req.body;
        
        const posts = await geminiAI.generateCampaignPosts(businessContext, goal, selectedIndustries, selectedICPs);
        
        // Generate images for each post
        const postsWithImages = [];
        for (const post of posts.posts) {
            try {
                const imageResult = await imageService.generateImage(post.imagePrompt);
                postsWithImages.push({
                    ...post,
                    image: {
                        url: `/generated/${imageResult.filename}`,
                        imageBytes: 'placeholder-image-data'
                    }
                });
            } catch (error) {
                console.error('❌ Error generating image for post:', error);
                postsWithImages.push({
                    ...post,
                    image: {
                        url: '/api/placeholder-image/' + post.id,
                        imageBytes: 'placeholder-image-data'
                    }
                });
            }
        }
        
        res.json({
            success: true,
            message: 'Campaign posts generated successfully!',
            data: postsWithImages
        });
    } catch (error) {
        console.error('❌ Error generating posts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate posts',
            error: error.message
        });
    }
});

// Route for scheduling campaign (Hour 2: AI Integration)
app.post('/api/schedule-campaign', async(req, res) => {
    console.log('=== SCHEDULE CAMPAIGN ENDPOINT ===');
    console.log('Request body:', req.body);

    try {
        const { businessData, confirmedPersonas } = req.body; // Use embedded AI functionality to generate campaign content
        const campaignContent = await AI.generateCampaignContent(businessData, confirmedPersonas); // Nicolae's Planable integration (Hour 3)
        const workspaceName = `${businessData.businessName || 'Tinkerbell'} Campaign - ${new Date().toLocaleDateString()}`;
        console.log('📋 Creating Planable workspace...');
        const workspace = await Planable.createWorkspace(workspaceName);

        console.log('📝 Scheduling posts to Planable...');
        const schedulingResults = await Planable.scheduleMultiplePosts(workspace.id, campaignContent.posts);

        const successfulPosts = schedulingResults.filter(r => r.success).length;
        const workspaceUrl = Planable.getWorkspaceUrl(workspace.id);

        res.json({
            success: true,
            message: `Campaign scheduled successfully! ${successfulPosts}/${campaignContent.posts.length} posts created.`,
            data: {
                campaign: campaignContent,
                workspace: {
                    id: workspace.id,
                    name: workspace.name,
                    url: workspaceUrl
                },
                scheduling: {
                    total: campaignContent.posts.length,
                    successful: successfulPosts,
                    results: schedulingResults
                }
            },
            planableWorkspaceUrl: workspaceUrl
        });

    } catch (error) {
        console.error('❌ Error generating campaign:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate campaign',
            error: error.message
        });
    }
});

// Image upload endpoint
app.post('/api/upload-images', upload.array('images', 10), async(req, res) => {
    console.log('=== UPLOAD IMAGES ENDPOINT ===');

    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No images uploaded'
            });
        }

        const uploadedImages = req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            size: file.size,
            mimetype: file.mimetype,
            url: `/images/${file.filename}`
        }));

        console.log(`📷 Uploaded ${uploadedImages.length} images`);

        res.json({
            success: true,
            message: `Successfully uploaded ${uploadedImages.length} images`,
            data: {
                images: uploadedImages,
                count: uploadedImages.length
            }
        });

    } catch (error) {
        console.error('❌ Error uploading images:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload images',
            error: error.message
        });
    }
});

// Generate image endpoint
app.post('/api/generate-image', async(req, res) => {
    console.log('=== GENERATE IMAGE ENDPOINT ===');

    try {
        const { description, businessName } = req.body;

        if (!description) {
            return res.status(400).json({
                success: false,
                message: 'Image description is required'
            });
        }

        const generatedImage = await imageService.generateImage(description, businessName || 'Business');

        res.json({
            success: true,
            message: 'Image generated successfully',
            data: generatedImage
        });

    } catch (error) {
        console.error('❌ Error generating image:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate image',
            error: error.message
        });
    }
});

// Enhanced schedule campaign endpoint with image processing
app.post('/api/schedule-campaign-with-images', upload.array('images', 10), async(req, res) => {
    console.log('=== ENHANCED SCHEDULE CAMPAIGN ENDPOINT ===');
    console.log('Request body:', req.body);
    console.log('Uploaded files:', req.files ? req.files.length : 0);
    try {
        const { businessData, confirmedPersonas, generateMissingImages, uploadedImageData } = req.body;

        // Parse JSON strings if they exist
        const parsedBusinessData = typeof businessData === 'string' ? JSON.parse(businessData) : businessData;
        const parsedPersonas = typeof confirmedPersonas === 'string' ? JSON.parse(confirmedPersonas) : confirmedPersonas;
        const shouldGenerateMissing = generateMissingImages === 'true' || generateMissingImages === true;

        // Generate campaign content first
        const campaignContent = await AI.generateCampaignContent(parsedBusinessData, parsedPersonas);

        // Process uploaded images - either from current request or previously uploaded
        let uploadedImages = [];

        // Handle images from current request (if any)
        if (req.files && req.files.length > 0) {
            uploadedImages = req.files.map(file => ({
                filename: file.filename,
                originalName: file.originalname,
                path: file.path,
                size: file.size,
                mimetype: file.mimetype
            }));
        }

        // Handle previously uploaded images
        if (uploadedImageData) {
            const previousImages = typeof uploadedImageData === 'string' ? JSON.parse(uploadedImageData) : uploadedImageData;
            if (Array.isArray(previousImages)) {
                // Convert server URLs back to file paths for processing
                const processedPreviousImages = previousImages.map(img => ({
                    filename: img.filename,
                    originalName: img.originalName,
                    path: path.join(__dirname, 'uploads', img.filename), // Reconstruct full path
                    size: img.size,
                    mimetype: img.mimetype
                }));
                uploadedImages.push(...processedPreviousImages);
            }
        }

        console.log(`📸 Processing ${uploadedImages.length} uploaded images for campaign`);

        // Process images for campaign posts
        const imageResults = await imageService.processCampaignImages(
            campaignContent.posts,
            uploadedImages,
            shouldGenerateMissing
        );

        // Update posts with image information
        const postsWithImages = imageResults.processed_posts;

        // Create Planable workspace
        const workspaceName = `${parsedBusinessData.businessName || 'Tinkerbell'} Campaign - ${new Date().toLocaleDateString()}`;
        console.log('📋 Creating Planable workspace...');
        const workspace = await planableClient.getOrCreateWorkspace(workspaceName);

        // Schedule posts with images to Planable
        console.log('📝 Scheduling posts with images to Planable...');
        const schedulingResults = await planableClient.scheduleMultiplePosts(workspace.id, postsWithImages);

        const successfulPosts = schedulingResults.filter(r => r.success).length;
        const workspaceUrl = planableClient.getWorkspaceUrl(workspace.id);

        res.json({
            success: true,
            message: `Campaign with images scheduled successfully! ${successfulPosts}/${postsWithImages.length} posts created.`,
            data: {
                campaign: {
                    ...campaignContent,
                    posts: postsWithImages
                },
                workspace: {
                    id: workspace.id,
                    name: workspace.name,
                    url: workspaceUrl
                },
                images: {
                    processing_summary: imageResults.processing_summary,
                    uploaded_images: uploadedImages.length,
                    generated_images: imageResults.generated_images.length,
                    matched_images: imageResults.matched_images.length
                },
                scheduling: {
                    total: postsWithImages.length,
                    successful: successfulPosts,
                    results: schedulingResults
                },
                auto_posting: {
                    enabled: planableClient.autoPost,
                    facebook_page_id: planableClient.facebookPageId || 'Not configured'
                }
            },
            planableWorkspaceUrl: workspaceUrl
        });

    } catch (error) {
        console.error('❌ Error generating enhanced campaign:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate campaign with images',
            error: error.message
        });
    }
});

// Analyze uploaded images endpoint
app.post('/api/analyze-images', upload.array('images', 10), async(req, res) => {
    console.log('=== ANALYZE IMAGES ENDPOINT ===');

    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No images to analyze'
            });
        }

        const { campaignPosts } = req.body;
        const parsedPosts = typeof campaignPosts === 'string' ? JSON.parse(campaignPosts) : campaignPosts;

        const uploadedImages = req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            size: file.size,
            mimetype: file.mimetype
        }));

        const analysisResults = await imageService.analyzeAndMatchImages(uploadedImages, parsedPosts || []);

        res.json({
            success: true,
            message: 'Images analyzed successfully',
            data: {
                analysis: analysisResults,
                uploaded_count: uploadedImages.length,
                matches_found: analysisResults.matches.length
            }
        });

    } catch (error) {
        console.error('❌ Error analyzing images:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to analyze images',
            error: error.message
        });
    }
});

// Direct Facebook posting endpoint (bypassing Planable)
app.post('/api/post-to-facebook', async(req, res) => {
    console.log('=== DIRECT FACEBOOK POSTING ENDPOINT ===');
    console.log('Request body:', req.body);

    try {
        const { businessData, confirmedPersonas } = req.body;

        // Generate campaign content
        const campaignContent = await AI.generateCampaignContent(businessData, confirmedPersonas);

        // Test Facebook connection first
        const connectionTest = await facebookService.testConnection();
        if (!connectionTest.success) {
            console.warn('⚠️ Facebook connection failed, but continuing with mock responses');
        }

        // Post directly to Facebook
        console.log('📘 Posting directly to Facebook...');
        const facebookResults = await facebookService.postMultiplePosts(campaignContent.posts);

        const successfulPosts = facebookResults.filter(r => r.success).length;

        res.json({
            success: true,
            message: `Direct Facebook posting completed! ${successfulPosts}/${facebookResults.length} posts created.`,
            data: {
                campaign: campaignContent,
                facebook_connection: connectionTest,
                facebook_results: {
                    total: facebookResults.length,
                    successful: successfulPosts,
                    posts: facebookResults
                },
                scheduled_posts: facebookResults.filter(r => r.success),
                generated_images: []
            }
        });

    } catch (error) {
        console.error('❌ Error with direct Facebook posting:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to post to Facebook',
            error: error.message
        });
    }
});

// Enhanced schedule campaign endpoint with direct Facebook posting
app.post('/api/schedule-campaign-facebook', upload.array('images', 10), async(req, res) => {
    console.log('=== ENHANCED FACEBOOK CAMPAIGN ENDPOINT ===');
    console.log('Request body:', req.body);
    console.log('Uploaded files:', req.files ? req.files.length : 0);

    try {
        const { businessData, confirmedPersonas, generateMissingImages, uploadedImageData } = req.body;

        // Parse JSON strings if they exist
        const parsedBusinessData = typeof businessData === 'string' ? JSON.parse(businessData) : businessData;
        const parsedPersonas = typeof confirmedPersonas === 'string' ? JSON.parse(confirmedPersonas) : confirmedPersonas;
        const shouldGenerateMissing = generateMissingImages === 'true' || generateMissingImages === true;

        // Generate campaign content first
        const campaignContent = await AI.generateCampaignContent(parsedBusinessData, parsedPersonas);

        // Process uploaded images - either from current request or previously uploaded
        let uploadedImages = [];

        // Handle images from current request (if any)
        if (req.files && req.files.length > 0) {
            uploadedImages = req.files.map(file => ({
                filename: file.filename,
                originalName: file.originalname,
                path: file.path,
                size: file.size,
                mimetype: file.mimetype
            }));
        }

        // Handle previously uploaded images
        if (uploadedImageData) {
            const previousImages = typeof uploadedImageData === 'string' ? JSON.parse(uploadedImageData) : uploadedImageData;
            if (Array.isArray(previousImages)) {
                // Convert server URLs back to file paths for processing
                const processedPreviousImages = previousImages.map(img => ({
                    filename: img.filename,
                    originalName: img.originalName,
                    path: path.join(__dirname, 'uploads', img.filename), // Reconstruct full path
                    size: img.size,
                    mimetype: img.mimetype
                }));
                uploadedImages.push(...processedPreviousImages);
            }
        }

        console.log(`📸 Processing ${uploadedImages.length} uploaded images for campaign`);

        // Process images for campaign posts
        const imageResults = await imageService.processCampaignImages(
            campaignContent.posts,
            uploadedImages,
            shouldGenerateMissing
        );

        // Update posts with image information
        const postsWithImages = imageResults.processed_posts;

        // Test Facebook connection first
        const connectionTest = await facebookService.testConnection();
        if (!connectionTest.success) {
            console.warn('⚠️ Facebook connection failed, but continuing with mock responses');
        }

        // Post directly to Facebook with images
        console.log('📘 Posting to Facebook with images...');
        const facebookResults = await facebookService.postMultiplePosts(postsWithImages);

        const successfulPosts = facebookResults.filter(r => r.success).length;

        res.json({
            success: true,
            message: `Enhanced Facebook campaign completed! ${successfulPosts}/${postsWithImages.length} posts created.`,
            data: {
                campaign: {
                    ...campaignContent,
                    posts: postsWithImages
                },
                facebook_connection: connectionTest,
                images: {
                    processing_summary: imageResults.processing_summary,
                    uploaded_images: uploadedImages.length,
                    generated_images: imageResults.generated_images.length,
                    matched_images: imageResults.matched_images.length
                },
                facebook_results: {
                    total: facebookResults.length,
                    successful: successfulPosts,
                    posts: facebookResults
                },
                scheduled_posts: facebookResults.filter(r => r.success),
                generated_images: imageResults.generated_images
            }
        });

    } catch (error) {
        console.error('❌ Error generating enhanced Facebook campaign:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate Facebook campaign with images',
            error: error.message
        });
    }
});

// Test Facebook connection endpoint
app.get('/api/test-facebook', async(req, res) => {
    console.log('=== TEST FACEBOOK CONNECTION ===');

    try {
        const connectionTest = await facebookService.testConnection();

        res.json({
            success: true,
            message: 'Facebook connection test completed',
            data: connectionTest
        });

    } catch (error) {
        console.error('❌ Error testing Facebook connection:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to test Facebook connection',
            error: error.message
        });
    }
});

// Enhanced image generation with Imagen
app.post('/api/generate-imagen', async (req, res) => {
    console.log('=== GENERATE IMAGEN ENDPOINT ===');
    const { prompt, count = 1 } = req.body;

    try {
        let images;
        if (count > 1) {
            images = await imagenService.generateMultipleImages(count);
        } else {
            const image = await imagenService.generateImage(prompt);
            images = [image];
        }

        res.json({
            success: true,
            message: `Generated ${images.length} image(s) with Imagen`,
            data: images
        });

    } catch (error) {
        console.error('❌ Error generating Imagen:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate image with Imagen',
            error: error.message
        });
    }
});

// Regenerate specific post with new image
app.post('/api/regenerate-post', async (req, res) => {
    console.log('=== REGENERATE POST ENDPOINT ===');
    const { postId, postContent, industry, regenerateImage = true, regenerateText = true } = req.body;

    try {
        let newImage, newText;

        if (regenerateImage) {
            newImage = await imagenService.generateImageForPost(postContent, industry);
        }

        if (regenerateText) {
            // Use Gemini to regenerate text
            newText = await geminiAI.regeneratePostContent(postContent, industry);
        }

        res.json({
            success: true,
            message: 'Post regenerated successfully',
            data: {
                postId,
                newImage: newImage || null,
                newText: newText || postContent,
                regenerated: {
                    image: regenerateImage && newImage?.success,
                    text: regenerateText && newText
                }
            }
        });

    } catch (error) {
        console.error('❌ Error regenerating post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to regenerate post',
            error: error.message
        });
    }
});

// Serve generated images
app.get('/api/images/:filename', (req, res) => {
    const filename = req.params.filename;
    const imagePath = path.join(__dirname, 'generated-images', filename);
    
    if (require('fs').existsSync(imagePath)) {
        res.sendFile(imagePath);
    } else {
        res.status(404).json({ error: 'Image not found' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'Tinkerbell Backend is running!'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🎯 Tinkerbell Backend server running on port ${PORT}`);
    console.log(`📍 API endpoints available:`);
    console.log(`   POST /api/create-personas`);
    console.log(`   POST /api/schedule-campaign`);
    console.log(`   POST /api/upload-images`);
    console.log(`   POST /api/generate-image`);
    console.log(`   POST /api/schedule-campaign-with-images`);
    console.log(`   POST /api/analyze-images`);
    console.log(`   POST /api/post-to-facebook`);
    console.log(`   POST /api/schedule-campaign-facebook`);
    console.log(`   GET  /health`);
});

module.exports = app;