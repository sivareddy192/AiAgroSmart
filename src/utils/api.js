// Normalize the API base URL:
// 1. Use env var if set, else fall back to the Render backend
// 2. Strip any trailing slashes (handles hosting platform misconfigurations)
// 3. Ensure the URL always ends with /api
const rawUrl = (
  process.env.REACT_APP_API_URL ||
  'https://aiagrosmart-backend.onrender.com'
).replace(/\/+$/, ''); // strip trailing slashes

const API_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;

export default API_URL;
