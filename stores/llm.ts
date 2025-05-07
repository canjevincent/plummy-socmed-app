import { defineStore } from 'pinia'

// Define types for Tavily API
interface TavilyOptions {
  topic: string
  search_depth: string
  chunks_per_source: number
  max_results: number
  time_range: string | null
  days: number
  include_answer: boolean
  include_raw_content: boolean
  include_images: boolean
  include_image_descriptions: boolean
  include_domains: string[]
  exclude_domains: string[]
}

interface TavilyPayload extends TavilyOptions {
  query: string
}

interface TavilySource {
  title: string
  url: string
  snippet: string
  score: number
  [key: string]: any // For any additional properties
}

interface TavilyResponse {
  answer: string
  sources: TavilySource[]
  [key: string]: any // For any additional properties
}

interface TavilyResults {
  answer: string
  sources: {
    title: string
    url: string
    snippet: string
  }[]
}

// Define the state interface
interface LlmState {
  tavily: {
    results: TavilyResults | null
    isLoading: boolean
    error: Error | null
  }
  // Add other LLM state types as needed
}

export const useLlmStore = defineStore('llm', {
  state: (): LlmState => ({
    tavily: {
      results: null,
      isLoading: false,
      error: null
    },
    // Add other LLM states as needed (deepseek, gpt, gemini)
  }),
  
  actions: {
    // Search Tavily and return results
    async searchTavily(query: string) {
      const config = useRuntimeConfig()
      const tavilyApiKey = config.public.tavilyApiKey

      const defaultOptions: TavilyOptions = {
        topic: "general",
        search_depth: "basic",
        chunks_per_source: 3,
        max_results: 1,
        time_range: null,
        days: 7,
        include_answer: true,
        include_raw_content: false,
        include_images: false,
        include_image_descriptions: false,
        include_domains: [],
        exclude_domains: []
      }

      try {
        // Set loading state
        this.tavily.isLoading = true
        this.tavily.error = null
        
        const prompt = "Improve this text by fixing grammar, spelling, punctuation, and enhancing clarity while preserving the original meaning: '" + (query.length > 260 ? query.substring(0, 260) + "..." : query) + "'";

        console.log("Prompt length: ", prompt);

        // Create payload
        const payload: TavilyPayload = {
          query:prompt,
          ...defaultOptions
        }
        
        // Make API request
        const response = await $fetch<TavilyResponse>('https://api.tavily.com/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tavilyApiKey}`,
            'Content-Type': 'application/json'
          },
          body: payload
        })
        
        // Process the response
        const processedData = this.processSearchResults(response)
        
        // Update state
        this.tavily.results = processedData
        
        // Return processed data
        return processedData
      } catch (error) {
        // Handle error
        this.tavily.error = error as Error
        console.error('Error with Tavily search:', error)
        throw error
      } finally {
        // Reset loading state
        this.tavily.isLoading = false
      }
    },
    
    // Process the search results
    processSearchResults(data: TavilyResponse): TavilyResults {
      return {
        answer: data.answer,
        sources: data.sources?.map(source => ({
          title: source.title,
          url: source.url,
          snippet: source.snippet
        })) || []
      }
    }
  }
})