window.addEventListener("message", async function(event) {
  const { origin, data: { key, params } } = event;
  let result;
  let error;
  
  try {
    result = await window.function(...params);
  } catch (e) {
    result = undefined;
    error = e.toString();
  }
  
  const response = { key };
  if (result !== undefined) {
    response.result = { value: result };
  }
  if (error !== undefined) {
    response.error = error;
  }
  
  event.source.postMessage(response, "*");
});
