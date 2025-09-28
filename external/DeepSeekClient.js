/**
 * DeepSeek Local Model Client
 * Handles communication with local DeepSeek model for X-rated content generation
 */

import http from 'http';
import https from 'https';

class DeepSeekClient {
    constructor(options = {}) {
        this.baseUrl = options.baseUrl || 'http://localhost:11434'; // Default Ollama endpoint
        this.model = options.model || 'deepseek-r1:latest';
        this.timeout = options.timeout || 30000;
        this.maxRetries = options.maxRetries || 3;
    }

    /**
     * Check if DeepSeek model is available
     */
    async isAvailable() {
        try {
            const response = await this._makeRequest('/api/tags', 'GET');
            const models = response.models || [];
            return models.some(model => model.name.includes('deepseek'));
        } catch (error) {
            console.warn('DeepSeek model not available:', error.message);
            return false;
        }
    }

    /**
     * Generate X-rated story content using DeepSeek
     */
    async generateXRatedContent(prompt, options = {}) {
        const xRatedPrompt = this._enhancePromptForXRated(prompt, options);

        try {
            const response = await this._generateCompletion(xRatedPrompt, {
                temperature: options.temperature || 0.9,
                max_tokens: options.maxTokens || 2000,
                top_p: options.topP || 0.95
            });

            return this._parseXRatedResponse(response);
        } catch (error) {
            console.error('DeepSeek generation failed:', error.message);
            throw new Error(`X-rated content generation failed: ${error.message}`);
        }
    }

    /**
     * Enhance prompt specifically for X-rated content generation
     */
    _enhancePromptForXRated(basePrompt, options = {}) {
        const contentRating = options.rating || 'R';
        const themes = options.themes || ['adult', 'mature'];

        const enhancedPrompt = `
You are an expert adult fiction writer creating ${contentRating}-rated interactive story content.

CONTENT GUIDELINES:
- Generate mature, adult-oriented narrative content
- Include explicit themes when appropriate: ${themes.join(', ')}
- Maintain story coherence and character development
- Create meaningful choices with adult consequences
- Include mature relationship dynamics and situations
- Use vivid, descriptive language appropriate for adult audiences

STORY CONTEXT: ${basePrompt}

Generate engaging, mature story content with:
1. Adult themes and situations
2. Realistic character interactions
3. Meaningful player choices
4. Consequences that affect story progression
5. Rich, descriptive narrative text

Return your response in JSON format with the following structure:
{
    "pages": {
        "page_id": {
            "background": "scene_description",
            "text": "Adult-themed narrative text with mature content",
            "choices": [
                {"text": "Choice option", "target": "next_page_id"}
            ],
            "mature_content": true,
            "content_tags": ["adult", "mature"]
        }
    }
}
`;

        return enhancedPrompt;
    }

    /**
     * Generate completion using local DeepSeek model
     */
    async _generateCompletion(prompt, options = {}) {
        const requestData = {
            model: this.model,
            prompt: prompt,
            stream: false,
            options: {
                temperature: options.temperature || 0.8,
                num_predict: options.max_tokens || 1500,
                top_p: options.top_p || 0.9,
                stop: options.stop || []
            }
        };

        const response = await this._makeRequest('/api/generate', 'POST', requestData);
        return response.response || '';
    }

    /**
     * Parse DeepSeek response for story content
     */
    _parseXRatedResponse(response) {
        try {
            // Try to extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.pages) {
                    // Mark all pages as mature content
                    Object.values(parsed.pages).forEach(page => {
                        page.mature_content = true;
                        page.content_tags = page.content_tags || ['adult', 'mature'];
                    });
                    return parsed;
                }
            }

            // Fallback: create structured response from text
            return this._createFallbackXRatedContent(response);
        } catch (error) {
            console.warn('Failed to parse DeepSeek response, using fallback');
            return this._createFallbackXRatedContent(response);
        }
    }

    /**
     * Create fallback X-rated content when parsing fails
     */
    _createFallbackXRatedContent(text) {
        const pageId = `xrated_${Date.now()}`;
        return {
            pages: {
                [pageId]: {
                    background: "mature_scene",
                    text: text || "The story takes a more adult turn, with mature themes and situations developing.",
                    choices: [
                        { text: "Continue with mature content", target: "next_mature_scene" },
                        { text: "Explore intimate dynamics", target: "intimate_scene" },
                        { text: "Face adult consequences", target: "consequence_scene" }
                    ],
                    mature_content: true,
                    content_tags: ["adult", "mature", "x-rated"]
                }
            }
        };
    }

    /**
     * Make HTTP request to local model
     */
    async _makeRequest(endpoint, method = 'GET', data = null) {
        return new Promise((resolve, reject) => {
            const url = new URL(endpoint, this.baseUrl);
            const isHttps = url.protocol === 'https:';
            const httpModule = isHttps ? https : http;

            const options = {
                hostname: url.hostname,
                port: url.port || (isHttps ? 443 : 80),
                path: url.pathname + url.search,
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'DeepSeek-Story-Generator/1.0'
                },
                timeout: this.timeout
            };

            if (data) {
                const postData = JSON.stringify(data);
                options.headers['Content-Length'] = Buffer.byteLength(postData);
            }

            const req = httpModule.request(options, (res) => {
                let responseData = '';

                res.on('data', (chunk) => {
                    responseData += chunk;
                });

                res.on('end', () => {
                    try {
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            const parsed = JSON.parse(responseData);
                            resolve(parsed);
                        } else {
                            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
                        }
                    } catch (error) {
                        reject(new Error(`Invalid JSON response: ${error.message}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(new Error(`Request failed: ${error.message}`));
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            if (data) {
                req.write(JSON.stringify(data));
            }

            req.end();
        });
    }

    /**
     * Get model information
     */
    async getModelInfo() {
        try {
            const response = await this._makeRequest('/api/show', 'POST', { name: this.model });
            return {
                name: response.details?.family || this.model,
                parameters: response.details?.parameter_size || 'Unknown',
                quantization: response.details?.quantization_level || 'Unknown',
                available: true
            };
        } catch (error) {
            return {
                name: this.model,
                available: false,
                error: error.message
            };
        }
    }
}

export default DeepSeekClient;