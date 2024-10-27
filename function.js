window.function = async function (inputText, sourceLang, targetLang) {
  // Extract values or assign defaults
  const text = inputText.value ?? "";
  const source = sourceLang.value ?? "en";  // default to English if not provided
  const target = targetLang.value ?? "es";  // default to Spanish if not provided

  // If no text is provided, return empty result
  if (text.trim() === "") {
    return "";
  }

  // API call to LibreTranslate
  const apiUrl = "https://libretranslate.de/translate";
  
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        q: text,
        source: source,
        target: target,
        format: "text"
      })
    });

    // Get translated text from response
    const data = await response.json();
    
    return data.translatedText; // Return the translated text to Glide

  } catch (error) {
    console.error("Translation API Error:", error);
    return "Error occurred during translation";
  }
};
