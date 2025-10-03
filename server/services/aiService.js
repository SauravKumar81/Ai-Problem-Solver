// server/services/aiService.js
const { OpenAI } = require('openai');
const Anthropic = require('@anthropic-ai/sdk');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
}) : null;

class AIService {
  // Generate solution using OpenAI GPT-4
  async generateSolutionGPT(problem) {
    try {
      const startTime = Date.now();

      const systemPrompt = this.getSystemPrompt(problem.category);
      const userPrompt = this.getUserPrompt(problem);

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const processingTime = Date.now() - startTime;

      return {
        answer: response.choices[0].message.content,
        model: 'gpt-4',
        tokenUsage: {
          prompt: response.usage.prompt_tokens,
          completion: response.usage.completion_tokens,
          total: response.usage.total_tokens
        },
        processingTime
      };
    } catch (error) {
      console.error('GPT-4 error:', error);
      throw new Error(`AI service error: ${error.message}`);
    }
  }

  // Generate solution using Anthropic Claude
  async generateSolutionClaude(problem) {
    if (!anthropic) {
      throw new Error('Anthropic API key not configured');
    }

    try {
      const startTime = Date.now();

      const systemPrompt = this.getSystemPrompt(problem.category);
      const userPrompt = this.getUserPrompt(problem);

      const response = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ]
      });

      const processingTime = Date.now() - startTime;

      return {
        answer: response.content[0].text,
        model: 'claude-3',
        tokenUsage: {
          prompt: response.usage.input_tokens,
          completion: response.usage.output_tokens,
          total: response.usage.input_tokens + response.usage.output_tokens
        },
        processingTime
      };
    } catch (error) {
      console.error('Claude error:', error);
      throw new Error(`AI service error: ${error.message}`);
    }
  }

  // Get system prompt based on category
  getSystemPrompt(category) {
    const prompts = {
      programming: `You are an expert programming assistant. Provide clear, well-commented code solutions with explanations. Include best practices, time/space complexity analysis, and alternative approaches when relevant.`,
      
      mathematics: `You are an expert mathematics tutor. Provide step-by-step solutions with clear explanations. Show your work, explain the reasoning, and provide alternative methods when applicable.`,
      
      writing: `You are an expert writing assistant. Help with essays, articles, creative writing, and editing. Provide constructive feedback, suggest improvements, and maintain the user's voice.`,
      
      debugging: `You are an expert debugging assistant. Analyze code, identify bugs, explain the issues, and provide fixed versions with explanations of what went wrong and how to prevent similar issues.`,
      
      optimization: `You are an expert in code optimization. Analyze code for performance bottlenecks, suggest improvements, and provide optimized versions with explanations of the optimizations made.`,
      
      'data-science': `You are an expert data scientist. Help with data analysis, statistical problems, machine learning, and data visualization. Provide code examples and explanations.`,
      
      algorithm: `You are an expert in algorithms and data structures. Explain algorithmic concepts, provide implementations, analyze complexity, and suggest optimal approaches.`,
      
      database: `You are an expert database engineer. Help with SQL queries, database design, optimization, and best practices. Explain your solutions clearly.`,
      
      'system-design': `You are an expert system architect. Help design scalable, reliable systems. Discuss trade-offs, best practices, and provide architectural diagrams when relevant.`,
      
      other: `You are a helpful AI assistant. Provide clear, accurate, and detailed solutions to the user's problems. Be thorough and explain your reasoning.`
    };

    return prompts[category] || prompts.other;
  }

  // Get user prompt
  getUserPrompt(problem) {
    let prompt = `Problem: ${problem.title}\n\n`;
    prompt += `Description: ${problem.description}\n\n`;

    if (problem.language) {
      prompt += `Programming Language: ${problem.language}\n\n`;
    }

    if (problem.difficulty) {
      prompt += `Difficulty Level: ${problem.difficulty}\n\n`;
    }

    prompt += `Please provide a comprehensive solution with:
1. A clear explanation of the approach
2. Step-by-step solution
3. Code implementation (if applicable)
4. Time and space complexity analysis (if applicable)
5. Example usage or test cases
6. Alternative approaches or optimizations (if applicable)

Make your response well-structured and easy to understand.`;

    return prompt;
  }

  // Parse AI response into structured format
  parseResponse(rawResponse) {
    const sections = {
      explanation: '',
      code: {
        language: '',
        snippet: '',
        optimizedVersion: ''
      },
      steps: [],
      complexity: ''
    };

    // Extract code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;
    const codeBlocks = [];

    while ((match = codeBlockRegex.exec(rawResponse)) !== null) {
      codeBlocks.push({
        language: match[1] || 'text',
        code: match[2].trim()
      });
    }

    if (codeBlocks.length > 0) {
      sections.code.language = codeBlocks[0].language;
      sections.code.snippet = codeBlocks[0].code;
      
      if (codeBlocks.length > 1) {
        sections.code.optimizedVersion = codeBlocks[1].code;
      }
    }

    // Extract steps (numbered lists)
    const stepRegex = /(\d+)\.\s+([^\n]+)/g;
    let stepMatch;
    let stepNumber = 1;

    while ((stepMatch = stepRegex.exec(rawResponse)) !== null) {
      sections.steps.push({
        stepNumber: stepNumber++,
        description: stepMatch[2].trim()
      });
    }

    // Extract explanation (everything before first code block or steps)
    const firstCodeIndex = rawResponse.indexOf('```');
    const explanationText = firstCodeIndex > 0 
      ? rawResponse.substring(0, firstCodeIndex).trim()
      : rawResponse.split('\n').slice(0, 3).join('\n').trim();

    sections.explanation = explanationText;

    return sections;
  }

  // Main method to generate solution
  async generateSolution(problem, aiModel = 'gpt-4') {
    try {
      let result;

      if (aiModel === 'claude-3' || aiModel === 'claude-2') {
        result = await this.generateSolutionClaude(problem);
      } else {
        result = await this.generateSolutionGPT(problem);
      }

      // Parse the response
      const parsed = this.parseResponse(result.answer);

      return {
        answer: result.answer,
        explanation: parsed.explanation,
        code: parsed.code,
        steps: parsed.steps,
        aiModel: result.model,
        tokenUsage: result.tokenUsage,
        processingTime: result.processingTime
      };
    } catch (error) {
      console.error('Generate solution error:', error);
      throw error;
    }
  }
}

module.exports = new AIService();