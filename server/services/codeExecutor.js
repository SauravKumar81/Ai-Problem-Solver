// server/services/codeExecutor.js
const axios = require('axios');

class CodeExecutor {
  constructor() {
    this.apiUrl = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
    this.apiKey = process.env.RAPIDAPI_KEY;
    
    // Language ID mappings for Judge0
    this.languageIds = {
      'javascript': 63,
      'python': 71,
      'java': 62,
      'cpp': 54,
      'c': 50,
      'csharp': 51,
      'ruby': 72,
      'go': 60,
      'rust': 73,
      'php': 68,
      'swift': 83,
      'kotlin': 78,
      'typescript': 74
    };
  }

  // Execute code using Judge0 API
  async executeCode(code, language, input = '') {
    if (!this.apiKey) {
      throw new Error('Judge0 API key not configured');
    }

    try {
      const languageId = this.languageIds[language.toLowerCase()];
      
      if (!languageId) {
        throw new Error(`Language '${language}' not supported for execution`);
      }

      // Step 1: Submit code for execution
      const submissionResponse = await axios.post(
        `${this.apiUrl}/submissions?base64_encoded=false&wait=false`,
        {
          source_code: code,
          language_id: languageId,
          stdin: input,
          cpu_time_limit: 2,
          memory_limit: 128000
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': this.apiKey,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
          }
        }
      );

      const token = submissionResponse.data.token;

      // Step 2: Poll for results
      let result = await this.getSubmissionResult(token);
      let attempts = 0;
      const maxAttempts = 10;

      while (result.status.id <= 2 && attempts < maxAttempts) {
        await this.delay(1000);
        result = await this.getSubmissionResult(token);
        attempts++;
      }

      return this.formatResult(result);
    } catch (error) {
      console.error('Code execution error:', error);
      throw new Error(`Code execution failed: ${error.message}`);
    }
  }

  // Get submission result
  async getSubmissionResult(token) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/submissions/${token}?base64_encoded=false`,
        {
          headers: {
            'X-RapidAPI-Key': this.apiKey,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get submission result: ${error.message}`);
    }
  }

  // Format execution result
  formatResult(rawResult) {
    const statusMap = {
      1: 'In Queue',
      2: 'Processing',
      3: 'Accepted',
      4: 'Wrong Answer',
      5: 'Time Limit Exceeded',
      6: 'Compilation Error',
      7: 'Runtime Error (SIGSEGV)',
      8: 'Runtime Error (SIGXFSZ)',
      9: 'Runtime Error (SIGFPE)',
      10: 'Runtime Error (SIGABRT)',
      11: 'Runtime Error (NZEC)',
      12: 'Runtime Error (Other)',
      13: 'Internal Error',
      14: 'Exec Format Error'
    };

    return {
      status: statusMap[rawResult.status.id] || 'Unknown',
      statusId: rawResult.status.id,
      output: rawResult.stdout || '',
      error: rawResult.stderr || rawResult.compile_output || '',
      time: rawResult.time || '0',
      memory: rawResult.memory || '0',
      exitCode: rawResult.exit_code
    };
  }

  // Helper delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Validate code before execution
  validateCode(code, language) {
    if (!code || code.trim().length === 0) {
      throw new Error('Code cannot be empty');
    }

    if (!language) {
      throw new Error('Programming language must be specified');
    }

    // Check for potentially dangerous operations
    const dangerousPatterns = [
      /exec\s*\(/i,
      /eval\s*\(/i,
      /system\s*\(/i,
      /popen\s*\(/i,
      /os\.system/i,
      /subprocess\./i,
      /import\s+os/i,
      /require\s*\(\s*['"]child_process['"]\s*\)/i
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        throw new Error('Code contains potentially dangerous operations');
      }
    }

    return true;
  }

  // Get supported languages
  getSupportedLanguages() {
    return Object.keys(this.languageIds);
  }
}

module.exports = new CodeExecutor();