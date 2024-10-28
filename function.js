window.function = async function (inputText, sourceLang, targetLang) {
  // Extract values with defaults
  const text = inputText.value ?? "";
  const source = sourceLang.value ?? "en";
  const target = targetLang.value ?? "es";

  // Input validation
  if (!text || text.trim() === "") {
    return "Please enter text to translate";
  }

  // Helper function to split text into chunks if it's too long
  function splitIntoChunks(text, maxLength = 500) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks = [];
    let currentChunk = "";

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= maxLength) {
        currentChunk += sentence;
      } else {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = sentence;
      }
    }
    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks;
  }

  // Helper function to translate a single chunk
  async function translateChunk(chunk) {
    try {
      // Add a cache buster to avoid rate limiting
      const cacheBuster = new Date().getTime();
      const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${source}|${target}&mt=1&de=your.email@example.com&cb=${cacheBuster}`;
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.responseData && data.responseData.translatedText) {
        // Clean up any HTML entities that might have been returned
        return data.responseData.translatedText
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&#39;/g, "'");
      } else {
        throw new Error(data.responseDetails || 'Translation failed');
      }
    } catch (error) {
      throw new Error(`Chunk translation failed: ${error.message}`);
    }
  }

  try {
    // Split text into manageable chunks
    const chunks = splitIntoChunks(text);
    
    // If it's just one small chunk, translate directly
    if (chunks.length === 1 && chunks[0].length <= 500) {
      return await translateChunk(chunks[0]);
    }
    
    // For longer text, translate chunks with delay between requests
    const translations = [];
    for (const chunk of chunks) {
      try {
        const translation = await translateChunk(chunk);
        translations.push(translation);
        
        // Add a small delay between chunks to avoid rate limiting
        if (chunks.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 250));
        }
      } catch (error) {
        console.error("Chunk error:", error);
        translations.push(`[Error: ${error.message}]`);
      }
    }
    
    return translations.join(' ');
    
  } catch (error) {
    console.error("Translation error:", error);
    return `Translation failed: ${error.message}. Please try again later.`;
  }
};
