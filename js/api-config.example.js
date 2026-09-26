/*
AURA backend configuration example.

Do not put private API keys here in a public frontend.

Example backend endpoints:

POST /api/chat
POST /api/vision
GET  /api/weather?city=Pune
GET  /api/youtube?q=python
POST /api/document/analyze
*/

export const API = {
  chat: "/api/chat",
  vision: "/api/vision",
  weather: "/api/weather",
  youtube: "/api/youtube",
  document: "/api/document/analyze"
};
