# Zakaria's Chatbot 🤖

A simple AI-powered chatbot built with Node.js, Express, and the Groq API (LLaMA 3.3 70B model). It features a clean chat interface inspired by modern AI assistants.

---

## Tech Stack

- **Backend** — Node.js + Express
- **Frontend** — HTML, CSS, JavaScript (vanilla)
- **AI Model** — LLaMA 3.3 70B via [Groq API](https://console.groq.com) (free)
- **Environment** — dotenv

---

## Project Structure

```
my-chatbot/
├── public/
│   ├── index.html      # Chat UI
│   ├── script.js       # Frontend logic (fetch, messages)
│   └── style.css       # Styles
├── .env                # API key (not pushed to GitHub)
├── .gitignore
├── package.json
└── server.js           # Express server + Groq API call
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Ziko-20/Zakaria-s-Chatbot.git
cd Zakaria-s-Chatbot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Get a free Groq API key

- Go to [https://console.groq.com](https://console.groq.com)
- Sign up and create an API key
- It starts with `gsk_...`

### 4. Create a `.env` file

Create a file called `.env` at the root of the project:

```dotenv
GROQ_API_KEY=gsk_your_api_key_here
```

> ⚠️ Never push this file to GitHub. It is already listed in `.gitignore`.

### 5. Run the server

```bash
node --watch server.js
```

### 6. Open the app

Go to [http://localhost:3000](http://localhost:3000) in your browser.

---

## How It Works

1. The user types a message in the chat interface
2. The frontend sends it to `/api/chat` via a POST request
3. The Express server forwards it to the Groq API
4. Groq returns a response from the LLaMA 3.3 70B model
5. The response is displayed in the chat

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Your Groq API key (get it at console.groq.com) |

---

## Author

**Zakaria Lemchaouri**  
Full-Stack Developer — Rabat, Morocco  
[GitHub](https://github.com/Ziko-20) · [LinkedIn](https://linkedin.com/in/zakaria-lemchaouri) · [Portfolio](https://portfolio-zakaria-lemchaouri.vercel.app)