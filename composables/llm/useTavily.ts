import { useMutation } from '@tanstack/vue-query'
import { useLlmStore } from '~/stores/llm'
// import { useRuntimeConfig } from '#app'

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

interface TavilyProcessedResults {
  answer: string
  sources: {
    title: string
    url: string
    snippet: string
  }[]
}

export function useTavily() {
  const config = useRuntimeConfig()
  const tavilyApiKey = config.public.tavilyApiKey
  const llmStore = useLlmStore()

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

  const { mutate: searchTavily, isPending } = useMutation({
    mutationFn: async (query: string): Promise<TavilyResponse> => {
      const payload: TavilyPayload = {
        query,
        ...defaultOptions
      }
      
      llmStore.setTavilyLoading(true)
      
      return await $fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tavilyApiKey}`,
          'Content-Type': 'application/json'
        },
        body: payload
      })
    },
    onSuccess: (data: TavilyResponse) => {
      // Process the data before storing it
      const processedData = processSearchResults(data)
      llmStore.setTavilyResults(processedData)
      llmStore.setTavilyLoading(false)
      return processedData
    },
    onError: (error: Error) => {
      llmStore.setTavilyError(error)
      llmStore.setTavilyLoading(false)
      console.error('Error with Tavily search:', error)
    }
  })

  // Process the search results before returning to components
  const processSearchResults = (data: TavilyResponse): TavilyProcessedResults => {
    // Modify the result as needed
    // For example, extract only the most relevant parts
    return {
      answer: data.answer,
      sources: data.sources?.map(source => ({
        title: source.title,
        url: source.url,
        snippet: source.snippet
      })) || []
    }
  }

  return {
    searchTavily,
    isSearching: isPending
  }
}