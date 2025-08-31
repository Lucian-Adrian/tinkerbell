const { JWT } = require("google-auth-library");
const https = require("https");
const fs = require("fs");
const path = require("path");

class ImagenService {
    constructor() {
        this.projectId = process.env.GOOGLE_PROJECT_ID;
        this.location = "us-central1";
        this.model = "imagen-3.0-generate-002";
        
        if (!this.projectId) {
            console.warn('⚠️ GOOGLE_PROJECT_ID not found in environment variables');
            this.auth = null;
        } else {
            // Initialize Google Cloud authentication
            this.auth = new JWT({
                keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
                scopes: ["https://www.googleapis.com/auth/cloud-platform"],
            });
        }
        
        // High-quality image prompts backlog
        this.imagePromptBacklog = [
            "Professional business team celebrating success with modern digital dashboard, bright office environment, high quality, 4K photograph",
            "Modern e-commerce store interface showing growth metrics and automation tools, clean design, professional, studio lighting",
            "AI-powered marketing automation dashboard with data visualization, futuristic design, high-tech, cinematic color",
            "Team collaboration in modern office space with digital screens showing analytics, bright natural lighting, ultra-realistic",
            "Digital marketing campaign visualization with social media icons and engagement metrics, colorful, professional illustration",
            "Professional website design showcase with responsive layouts, modern UI/UX, clean aesthetic, studio photography",
            "Customer journey mapping on interactive whiteboard, business strategy session, professional setting, 4K photograph",
            "Social media content creation workspace with design tools and brand assets, creative environment, bright lighting",
            "Data analytics visualization with charts and graphs, business intelligence, modern office, professional photography",
            "Email marketing campaign design with templates and automation flows, professional design tools, clean aesthetic",
            "Mobile app interface design showing user engagement features, modern smartphone mockup, studio lighting",
            "Brand identity elements showcase with logos, colors, and typography, design studio setting, professional photography"
        ];
        
        this.currentPromptIndex = 0;
    }

    /**
     * Generate image using Google Vertex AI Imagen
     * @param {string} prompt - Image generation prompt
     * @returns {Promise<Object>} Generated image data
     */
    async generateImage(prompt) {
        console.log('🎨 Imagen (Vertex AI): Generating image...');

        if (!this.auth || !this.projectId) {
            return this._getMockImage(prompt);
        }

        try {
            // Get access token
            const { access_token } = await this.auth.authorize();
            
            // Construct the API URL
            const url = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.model}:predict`;
            
            // Prepare the request payload
            const payload = {
                instances: [{ prompt: prompt }],
                parameters: {
                    sampleCount: 1,
                    aspectRatio: "1:1",
                    addWatermark: false,
                    enhancePrompt: true
                }
            };

            // Make the API call
            const response = await this._makeHttpRequest(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (response.predictions && response.predictions.length > 0) {
                const prediction = response.predictions[0];
                const { bytesBase64Encoded } = prediction;
                
                // Save image to file
                const timestamp = Date.now();
                const filename = `imagen_${timestamp}_${Math.random().toString(36).substr(2, 9)}.png`;
                const filepath = path.join(__dirname, 'generated-images', filename);
                
                const buffer = Buffer.from(bytesBase64Encoded, "base64");
                fs.writeFileSync(filepath, buffer);
                
                console.log('✅ Imagen (Vertex AI): Image generated successfully');
                
                return {
                    success: true,
                    filename: filename,
                    path: filepath,
                    url: `/api/images/${filename}`
                };
            } else {
                throw new Error('No predictions returned from Imagen API');
            }

        } catch (error) {
            console.error('❌ Imagen (Vertex AI) Error:', error.message);
            return this._getMockImage(prompt);
        }
    }

    /**
     * Make HTTP request using Node.js built-in modules
     * @private
     */
    async _makeHttpRequest(url, options) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            
            const requestOptions = {
                hostname: urlObj.hostname,
                port: urlObj.port || 443,
                path: urlObj.pathname + urlObj.search,
                method: options.method || 'GET',
                headers: options.headers || {}
            };

            const req = https.request(requestOptions, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const jsonData = JSON.parse(data);
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            resolve(jsonData);
                        } else {
                            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(jsonData)}`));
                        }
                    } catch (parseError) {
                        reject(new Error(`Failed to parse response: ${parseError.message}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            if (options.body) {
                req.write(options.body);
            }
            
            req.end();
        });
    }

    /**
     * Generate multiple images with high-quality prompts
     * @param {number} count - Number of images to generate
     * @returns {Promise<Array>} Array of generated images
     */
    async generateMultipleImages(count = 3) {
        const images = [];
        
        for (let i = 0; i < count; i++) {
            const prompt = this.getNextHighQualityPrompt();
            const image = await this.generateImage(prompt);
            images.push(image);
            
            // Add delay between requests to avoid rate limiting
            if (i < count - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        return images;
    }

    /**
     * Get next high-quality prompt from backlog
     * @returns {string} Image prompt
     */
    getNextHighQualityPrompt() {
        const prompt = this.imagePromptBacklog[this.currentPromptIndex];
        this.currentPromptIndex = (this.currentPromptIndex + 1) % this.imagePromptBacklog.length;
        return prompt;
    }

    /**
     * Generate image for specific post content
     * @param {string} postContent - Post content to generate image for
     * @param {string} industry - Target industry
     * @returns {Promise<Object>} Generated image data
     */
    async generateImageForPost(postContent, industry) {
        // Create a more specific prompt based on post content
        const prompt = this._createPostImagePrompt(postContent, industry);
        return await this.generateImage(prompt);
    }

    /**
     * Create image prompt based on post content and industry
     * @private
     */
    _createPostImagePrompt(postContent, industry) {
        const basePrompt = "Professional, high-quality marketing image";
        
        // Extract key themes from post content
        const themes = this._extractThemes(postContent);
        const industryContext = this._getIndustryContext(industry);
        
        return `${basePrompt} for ${industry} industry, featuring ${themes}, ${industryContext}, modern design, high resolution`;
    }

    /**
     * Extract themes from post content
     * @private
     */
    _extractThemes(content) {
        const keywords = [
            'success', 'growth', 'innovation', 'technology', 'team', 'business',
            'automation', 'efficiency', 'results', 'strategy', 'marketing'
        ];
        
        const foundThemes = keywords.filter(keyword => 
            content.toLowerCase().includes(keyword)
        );
        
        return foundThemes.length > 0 ? foundThemes.join(', ') : 'business success';
    }

    /**
     * Get industry-specific visual context
     * @private
     */
    _getIndustryContext(industry) {
        const contexts = {
            'technology': 'modern office with computers and digital screens',
            'healthcare': 'clean medical environment with professional staff',
            'finance': 'corporate boardroom with financial charts',
            'retail': 'modern store or e-commerce interface',
            'education': 'learning environment with students and technology',
            'default': 'professional business environment'
        };
        
        return contexts[industry?.toLowerCase()] || contexts.default;
    }

    /**
     * Mock image generation for fallback
     * @private
     */
    _getMockImage(prompt) {
        const timestamp = Date.now();
        const filename = `mock_${timestamp}_${Math.random().toString(36).substr(2, 9)}.jpg`;
        
        return {
            success: true,
            filename: filename,
            path: null,
            url: `https://picsum.photos/800/600?random=${timestamp}`,
            imageBytes: null,
            mock: true
        };
    }
}

module.exports = ImagenService;
