/**
 * Groq AI Model Fallback System
 * 
 * Tries Groq models in priority order until one succeeds.
 * All models use GROQ_API_KEY (no OPENAI_API_KEY needed).
 * 
 * Production-ready with proper error handling, resource cleanup, and leak prevention.
 */

const MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant', 
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b'
] as const;

type GroqModel = typeof MODELS[number];

interface GroqSuccessResponse {
  success: true;
  data: string;
  modelUsed: GroqModel;
}

interface GroqErrorResponse {
  success: false;
  error: string;
}

type GroqResponse = GroqSuccessResponse | GroqErrorResponse;

interface GroqApiResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
    type?: string;
  };
}

/**
 * Sanitizes error messages to prevent leaking sensitive information
 */
function sanitizeError(error: unknown): string {
  if (typeof error === 'string') {
    // Remove potential API keys or tokens
    return error.replace(/Bearer\s+[\w-]+/gi, 'Bearer [REDACTED]')
                .replace(/api[_-]?key["\s:=]+[\w-]+/gi, 'api_key=[REDACTED]')
                .substring(0, 200); // Limit length
  }
  if (error instanceof Error) {
    return sanitizeError(error.message);
  }
  return 'Unknown error';
}

/**
 * Creates an abort signal with timeout, with fallback for older environments
 */
function createTimeoutSignal(timeoutMs: number): AbortSignal {
  // AbortSignal.timeout is available in Node.js 17.3+ and modern browsers
  if (typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal) {
    return AbortSignal.timeout(timeoutMs);
  }
  
  // Fallback for older environments
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  // Clean up timeout if signal is already aborted (prevents leaks)
  controller.signal.addEventListener('abort', () => {
    clearTimeout(timeoutId);
  }, { once: true });
  
  return controller.signal;
}

/**
 * Validates input parameters
 */
function validateInputs(
  prompt: string,
  temperature?: number,
  maxTokens?: number,
  timeout?: number
): string | null {
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return 'Prompt must be a non-empty string';
  }
  
  if (prompt.length > 100000) {
    return 'Prompt exceeds maximum length of 100,000 characters';
  }
  
  if (temperature !== undefined) {
    if (typeof temperature !== 'number' || temperature < 0 || temperature > 2) {
      return 'Temperature must be a number between 0 and 2';
    }
  }
  
  if (maxTokens !== undefined) {
    if (typeof maxTokens !== 'number' || maxTokens < 1 || maxTokens > 32000) {
      return 'Max tokens must be a number between 1 and 32,000';
    }
  }
  
  if (timeout !== undefined) {
    if (typeof timeout !== 'number' || timeout < 1000 || timeout > 60000) {
      return 'Timeout must be a number between 1,000 and 60,000 milliseconds';
    }
  }
  
  return null;
}

/**
 * Calls Groq API with fallback across multiple models.
 * Tries each model in priority order until one succeeds.
 * 
 * @param prompt - The user prompt to send to the model
 * @param options - Optional configuration
 * @param options.temperature - Temperature for generation (default: 0.7, range: 0-2)
 * @param options.maxTokens - Maximum tokens to generate (default: 2000, range: 1-32000)
 * @param options.timeout - Request timeout in milliseconds (default: 10000, range: 1000-60000)
 * @returns Promise resolving to success or error response
 */
export async function callGroqWithFallback(
  prompt: string,
  options?: {
    temperature?: number;
    maxTokens?: number;
    timeout?: number;
  }
): Promise<GroqResponse> {
  // Validate inputs
  const validationError = validateInputs(
    prompt,
    options?.temperature,
    options?.maxTokens,
    options?.timeout
  );
  
  if (validationError) {
    return {
      success: false,
      error: validationError
    };
  }

  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    return {
      success: false,
      error: 'GROQ_API_KEY environment variable is not set'
    };
  }

  const temperature = Math.max(0, Math.min(2, options?.temperature ?? 0.7));
  const maxTokens = Math.max(1, Math.min(32000, Math.floor(options?.maxTokens ?? 2000)));
  const timeout = Math.max(1000, Math.min(60000, Math.floor(options?.timeout ?? 10000)));

  const errors: string[] = [];

  for (const model of MODELS) {
    let response: Response | null = null;
    
    try {
      const signal = createTimeoutSignal(timeout);
      
      response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt.trim() }],
          temperature,
          max_tokens: maxTokens
        }),
        signal
      });

      // Read response body once (can only be read once)
      let responseText: string;
      try {
        responseText = await response.text();
      } catch (readError) {
        const errorMsg = `Model ${model} failed to read response body`;
        errors.push(errorMsg);
        console.warn(`[Groq Fallback] ${errorMsg}:`, sanitizeError(readError));
        continue;
      }

      // Always consume response body to prevent leaks, even on errors
      if (!response.ok) {
        const sanitizedError = sanitizeError(responseText);
        const errorMsg = `Model ${model} failed with status ${response.status}`;
        errors.push(errorMsg);
        console.warn(`[Groq Fallback] ${errorMsg}`);
        continue;
      }

      // Parse JSON with proper error handling
      if (!responseText || responseText.trim().length === 0) {
        errors.push(`Model ${model} returned empty response`);
        console.warn(`[Groq Fallback] Model ${model} returned empty response`);
        continue;
      }

      let data: GroqApiResponse;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        const errorMsg = `Model ${model} returned invalid JSON`;
        errors.push(errorMsg);
        console.warn(`[Groq Fallback] ${errorMsg}:`, sanitizeError(parseError));
        continue;
      }

      // Check for API error response
      if (data.error) {
        const errorMsg = data.error.message || data.error.type || 'Unknown API error';
        errors.push(`Model ${model}: ${sanitizeError(errorMsg)}`);
        console.warn(`[Groq Fallback] Model ${model} API error:`, sanitizeError(errorMsg));
        continue;
      }
      
      // Validate response structure
      const content = data.choices?.[0]?.message?.content;
      if (!content || typeof content !== 'string') {
        errors.push(`Model ${model} returned invalid response structure`);
        console.warn(`[Groq Fallback] Model ${model} returned invalid response structure`);
        continue;
      }

      // Success - log and return
      console.log(`[Groq Fallback] Successfully used model: ${model}`);
      
      return {
        success: true,
        data: content,
        modelUsed: model
      };
    } catch (err) {
      // Ensure response body is consumed even on exception (if not already read)
      if (response && !response.bodyUsed) {
        try {
          // Consume body to prevent memory leaks
          await response.text().catch(() => {
            // Ignore errors during cleanup
          });
        } catch {
          // Ignore errors during cleanup
        }
      }

      if (err instanceof Error) {
        if (err.name === 'AbortError' || err.message.includes('aborted')) {
          const errorMsg = `Model ${model} timed out after ${timeout}ms`;
          errors.push(errorMsg);
          console.warn(`[Groq Fallback] ${errorMsg}`);
        } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
          const errorMsg = `Model ${model} network error`;
          errors.push(errorMsg);
          console.warn(`[Groq Fallback] ${errorMsg}:`, sanitizeError(err));
        } else {
          const errorMsg = `Model ${model} error: ${sanitizeError(err)}`;
          errors.push(errorMsg);
          console.warn(`[Groq Fallback] ${errorMsg}`);
        }
      } else {
        const errorMsg = `Model ${model} unknown error`;
        errors.push(errorMsg);
        console.warn(`[Groq Fallback] ${errorMsg}:`, sanitizeError(err));
      }
      continue;
    }
  }

  // All models failed
  const errorSummary = errors.length > 0 
    ? `All models failed. Last errors: ${errors.slice(-3).join('; ')}`
    : 'All models failed';
    
  return {
    success: false,
    error: errorSummary
  };
}

/**
 * Get the list of models in priority order
 */
export function getGroqModels(): readonly GroqModel[] {
  return MODELS;
}

