const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  },
  body: JSON.stringify({
    model: "gpt-3.5-turbo",
    messages: [{ role: "system", content: todoContext }, ...updatedMessages],
    max_tokens: 1000,
  }),
});
