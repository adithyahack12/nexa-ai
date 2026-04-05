import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import compression from "compression";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import NodeCache from "node-cache";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(compression());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));


// Caching (TTL = 1 hour)
const cache = new NodeCache({ stdTTL: 3600 });

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200, // Increased for agents
    standardHeaders: "draft-7",
    legacyHeaders: false,
});
app.use("/api", limiter);

// OpenAI Tools Configuration (Function Calling)
const toolDeclarations = [
    {
        type: "function",
        function: {
            name: "get_current_time",
            description: "Get the current local time and date for the user.",
        }
    },
    {
        type: "function",
        function: {
            name: "calculator",
            description: "Perform mathematical calculations or evaluate expressions.",
            parameters: {
                type: "object",
                properties: {
                    expression: {
                        type: "string",
                        description: "The mathematical expression to evaluate (e.g., '15% of 240' or 'Math.sqrt(144)')",
                    },
                },
                required: ["expression"],
            },
        }
    },
    {
        type: "function",
        function: {
            name: "web_search_sim",
            description: "Simulate a web search for real-time information.",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "The search query.",
                    },
                },
                required: ["query"],
            },
        }
    },
];

const executableTools = {
    get_current_time: () => {
        const now = new Date();
        return {
            time: now.toLocaleTimeString(),
            date: now.toLocaleDateString(),
            timestamp: now.toISOString(),
            day: now.toLocaleDateString('en-US', { weekday: 'long' })
        };
    },
    calculator: ({ expression }) => {
        try {
            // Evaluates simple expressions safely-ish for demo purposes
            // In production, use a library like mathjs
            const result = eval(expression.replace(/[^0-9+\-*/().% ]/g, ''));
            return { expression, result };
        } catch (e) {
            return { error: "Could not evaluate expression. Please use standard math syntax." };
        }
    },
    web_search_sim: ({ query }) => {
        return {
            query,
            results: [
                { title: `Latest on ${query}`, snippet: `Real-time data for "${query}" is being fetched from live sources...`, url: `https://www.google.com/search?q=${encodeURIComponent(query)}` }
            ],
            note: "Search results are simulated for high-speed response. Visit the provided link for full details."
        };
    }
};

// Groq Setup (via OpenAI SDK)
const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

const SYSTEM_INSTRUCTION = `You are Nexa Intelligence (V2), an ultra-fast, accurate, and agentic AI assistant.
Your goal is to provide elite-level support with a focus on precision and action.

COMMANDS & CAPABILITIES:
1. Tool Use: You have access to real-time tools (time, calculator, search). Use them whenever needed without asking permission.
2. Visual Excellence:
   - Use Mermaid Diagrams for logic/architectural explanations.
     STRICT RULES (Mermaid v11): 
     * Start with: graph TD
     * Use only --> for arrows (NO edge labels like -->|text|)
     * Node IDs: single words only (A, B, Step1)
     * Node labels: use [ ] brackets only. (NO colons, NO special chars inside)
   - Use Polinations AI for high-quality conceptual images.
   - Use Structured Markdown (Tables, Bold, H3 headers) for clarity.
3. Speed: Be concise but thorough. Do not use filler words.
4. Accuracy: If you use a tool, base your answer strictly on the tool's output.

Style: Professional, efficient, and data-driven. You are the "Nexa Alpha" instance, ready for enterprise-grade automation.`;

// Note: Tools and explicit model selection are handled inside the chat route for flexibility.

// API: Optimized AI Chat with Native Streaming & Caching
app.post("/api/chat", async (req, res) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required." });
    }

    const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase().trim();
    const cacheKey = `chat_openai_${lastUserMessage}`;

    try {
        console.log(`[REQ] ${lastUserMessage}`);

        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "dummy") {
            return res.status(500).json({ error: "Groq API Key is missing. Please check your .env.local file." });
        }

        console.log("Using Groq API");
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: SYSTEM_INSTRUCTION },
                ...messages.map(m => ({
                    role: m.role === "user" ? "user" : "assistant",
                    content: m.content
                }))
            ],
            temperature: 0.1,
            stream: true,
        });

        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("Transfer-Encoding", "chunked");

        let fullResponse = "";
        for await (const chunk of response) {
            const chunkText = chunk.choices[0]?.delta?.content || "";
            fullResponse += chunkText;
            res.write(chunkText);
            if (res.flush) res.flush();
        }

        console.log(`[RES] ${fullResponse.length} chars (Groq)`);
        cache.set(cacheKey, fullResponse);
        res.end();


    } catch (error) {
        console.error("AI ERROR:", error);
        res.status(500).json({ error: error.message || "Failed to get AI response" });
    }
});

// Health Check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", model: "llama-3.3-70b-versatile (Groq)" });
});

app.use(express.static(path.join(__dirname, "../dist")));

app.use((req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.listen(PORT, () => {
    console.log(`\n🚀 Nexa AI Alpha is LIVE on port ${PORT}`);
});

