# Server: Gemini fallback

This server supports using OpenAI (via `OPENAI_API_KEY`) by default. If OpenAI is unavailable or calls fail, the code will attempt to call a Gemini-style endpoint as a fallback.

Environment variables used for Gemini fallback:

- `GEMINI_API_KEY` - API key for the Gemini/Generative endpoint (or `GOOGLE_API_KEY` as alternative).
- `GEMINI_API_URL` - Full URL to POST chat/generate requests. The code expects a JSON request with a `prompt` field and an optional `model` field.
- `GEMINI_MODEL` - Optional default model name.

Notes:
- The repository contains a flexible, best-effort Gemini wrapper. Because Gemini/Google's generative API shapes vary, the fallback expects a JSON response with `text` or `output` fields; otherwise it will attempt to parse JSON returned text.
- For embeddings, if OpenAI embeddings fail and Gemini does not return embeddings, the server falls back to a simple keyword overlap ranking to keep search features working.

Configure your environment variables before starting the server. Example (PowerShell):

```powershell
$env:GEMINI_API_KEY = 'your_key_here'
$env:GEMINI_API_URL = 'https://your-gemini-endpoint.example.com/generate'
node src/server.js
```
