import { useTavily } from './useTavily'
// Import other LLM composables as you create them
// import { useGpt } from './useGpt'
// import { useGemini } from './useGemini'
// import { useDeepseek } from './useDeepseek'

export function useLlm() {
  const tavily = useTavily()
  // Initialize other LLM services
  // const gpt = useGpt()
  // const gemini = useGemini()
  // const deepseek = useDeepseek()
  
  return {
    tavily,
    // Return other services
    // gpt,
    // gemini,
    // deepseek
  }
}