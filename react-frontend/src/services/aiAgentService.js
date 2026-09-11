/**
 * Flood Assistant AI Service
 * Provides friendly, user-centric flood risk guidance, safety protocols,
 * and system help for citizens and users of the Flash Flood Prediction System.
 */

// Storage keys
const GEMINI_API_KEY_STORAGE = "flood_chat_api_key";
const GEMINI_MODEL_STORAGE = "flood_chat_model";

export const AI_MODELS = [
  { id: "built-in", name: "Built-in Flood Assistant (Fast & Offline)", provider: "Local" },
  { id: "gemini-1.5-flash", name: "Google Gemini 1.5 Flash (Recommended)", provider: "Google AI" },
  { id: "gemini-2.0-flash", name: "Google Gemini 2.0 Flash (Fast)", provider: "Google AI" },
  { id: "gemini-1.5-pro", name: "Google Gemini 1.5 Pro (Detailed)", provider: "Google AI" },
];

/**
 * Get stored Gemini API key
 */
export function getStoredApiKey() {
  let envKey = "";
  try {
    envKey = import.meta.env?.VITE_GEMINI_API_KEY || "";
  } catch {
    envKey = "";
  }
  return localStorage.getItem(GEMINI_API_KEY_STORAGE) || envKey || "";
}

/**
 * Save Gemini API key
 */
export function setStoredApiKey(key) {
  if (key && key.trim()) {
    localStorage.setItem(GEMINI_API_KEY_STORAGE, key.trim());
  } else {
    localStorage.removeItem(GEMINI_API_KEY_STORAGE);
  }
}

/**
 * Get selected model
 */
export function getSelectedModel() {
  return localStorage.getItem(GEMINI_MODEL_STORAGE) || "gemini-1.5-flash";
}

/**
 * Save selected model
 */
export function setSelectedModel(modelId) {
  localStorage.setItem(GEMINI_MODEL_STORAGE, modelId);
}

/**
 * User-focused system prompt for Gemini API
 */
function buildSystemInstruction(context) {
  const loc = context?.location || {};
  const weather = context?.weather || {};
  const pred = context?.prediction || {};
  const activePage = context?.activePage || "dashboard";

  return `You are a friendly, caring, and helpful Flood Assistant for the Flash Flood Prediction System.
You are talking to regular users, families, and residents who want practical help, reassurance, and clear answers.

LIVE CONDITIONS FOR THE USER:
- Monitored Location: ${loc.name || "Chamoli"}, ${loc.state || "Uttarakhand"}, ${loc.country || "India"}
- Live Rainfall: ${weather.rainfall_mm_hr != null ? weather.rainfall_mm_hr + " mm/h" : "No rain detected"}
- Current Temperature: ${weather.temperature != null ? weather.temperature + "°C" : "Normal"}
- Flood Risk Level: ${pred.risk_level || "LOW"}
- Flood Probability: ${pred.flood_probability != null ? (pred.flood_probability * 100).toFixed(0) + "%" : "Normal"}
- Active Screen: ${activePage}

COMMUNICATION RULES:
1. Speak in plain, warm, and easy-to-understand language. Avoid complex academic jargon or formulas.
2. Focus on practical safety: tell the user whether conditions are safe, what they should watch out for, and what simple steps they should take.
3. If risk is HIGH or CRITICAL, give urgent, clear life-saving steps: move to higher ground, never cross flood water, and dial 112 / 1077 for help.
4. If asked about how prediction works, explain it simply using intuitive everyday analogies (like rain soaking a sponge).
5. If asked about website navigation, explain the menu items (Dashboard, Risk Map, Weather, Alerts) simply.
6. Use clear bullet points and bold text so it is easy to scan on mobile or in an emergency.`;
}

/**
 * Send message to Google Gemini API
 */
async function callGeminiApi(apiKey, model, messages, systemInstruction) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const contents = [];
  const recentMessages = messages.slice(-8);
  for (const msg of recentMessages) {
    contents.push({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    });
  }

  const payload = {
    contents,
    systemInstruction: {
      parts: [{ text: systemInstruction }],
    },
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 800,
    },
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const message =
      errData?.error?.message ||
      `Gemini API returned an error (${res.status})`;
    throw new Error(message);
  }

  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "I'm sorry, I couldn't process that. Please ask again.";

  return text;
}

/**
 * User-Centric Built-in Assistant Responses
 * Clear, helpful, practical advice for normal users.
 */
function runBuiltInAgent(query, context) {
  const q = query.toLowerCase().trim();
  const loc = context?.location || {};
  const weather = context?.weather || {};
  const pred = context?.prediction || {};
  const activePage = context?.activePage || "dashboard";

  const locName = loc.name || "Chamoli";
  const stateName = loc.state || "Uttarakhand";
  const riskLevel = pred.risk_level || "LOW";
  const rainRate = weather.rainfall_mm_hr != null ? `${weather.rainfall_mm_hr} mm/h` : "0.0 mm/h";
  const prob = pred.flood_probability != null ? `${(pred.flood_probability * 100).toFixed(0)}%` : "12%";
  const isSevere = riskLevel === "CRITICAL" || riskLevel === "HIGH";

  // 1. Current Risk Query
  if (
    q.includes("current risk") ||
    q.includes("flood risk") ||
    q.includes("risk in") ||
    q.includes("status") ||
    q.includes("check risk") ||
    q.includes("safe") ||
    q.includes("is it safe")
  ) {
    if (isSevere) {
      return `### ⚠️ High Flood Alert for **${locName}, ${stateName}**

- **Risk Level**: **HIGH** (${prob} chance of flood)
- **Current Rainfall**: **${rainRate}** (Heavy rainfall active)

> **Important Notice for Your Safety**: Heavy rain is falling on steep terrain in your area. Water levels in nearby streams and rivers can rise very fast.

**What you should do right now:**
1. **Move to higher ground**: If you are in a low-lying area or close to a river or stream, move to a safer, elevated location immediately.
2. **Never walk or drive through flowing water**: Even a few inches of rushing water can knock you down, and 12 inches can sweep away a car.
3. **Turn off utilities**: Switch off your electricity mains and cooking gas cylinder if you need to leave.
4. **Emergency help**: Call **112** (Emergency) or **1077** (District Disaster Helpline) if you or someone else needs immediate rescue.`;
    }

    return `### Current Flood Status for **${locName}, ${stateName}**

- **Risk Level**: **${riskLevel}** (Safe / Normal conditions)
- **Flood Probability**: **${prob}**
- **Rainfall Right Now**: **${rainRate}**

> **Good news**: Conditions in your area are currently normal and safe. There is no immediate threat of a flash flood.

**Helpful Tips to Stay Prepared:**
- You can check the **Weather & Data** page to see if heavy rain is expected later today.
- Keep your phone charged and stay tuned to local weather advisories.
- If you notice sudden intense rainfall or rapidly rising river water, call the 24/7 disaster helpline at **1077** or **112**.`;
  }

  // 2. Emergency / Evacuation / Safety Checklist
  if (
    q.includes("emergency") ||
    q.includes("evacuat") ||
    q.includes("safety") ||
    q.includes("checklist") ||
    q.includes("what should i do") ||
    q.includes("sos") ||
    q.includes("help") ||
    q.includes("tips")
  ) {
    return `### Flash Flood Emergency & Safety Guide

Here are practical, life-saving steps you and your family should follow:

#### Immediate Safety Actions:
- **Move to Higher Ground**: If you see rapidly rising water or hear a loud roaring sound from the hills, head to higher ground immediately without waiting.
- **Turn Around, Don't Drown**: Never walk, swim, or drive through flooded roads. Most flood casualties happen when vehicles get swept away.
- **Disconnect Utilities**: Turn off electricity at the main switch and turn off your gas cylinders before leaving your home.

#### What to Pack in Your Emergency Grab Bag:
- **Drinking Water**: At least 3 liters of clean water per person and some water purification tablets.
- **Ready-to-Eat Food**: High-energy dry food like biscuits, nuts, and canned snacks.
- **Medicines & First Aid**: Any daily family prescriptions, antiseptic liquid, and bandages.
- **Flashlight & Power Bank**: A charged battery torch and power bank to keep your phone running.
- **Documents in Plastic**: Put IDs, passports, and cards inside a sealable waterproof bag.

#### Emergency Contact Numbers (Always Free & 24/7):
- **All-in-One National Emergency**: \`112\`
- **Disaster Response (NDRF)**: \`1070\`
- **District Disaster Helpline**: \`1077\`
- **Ambulance**: \`108\``;
  }

  // 3. How Flood Prediction Works
  if (
    q.includes("model") ||
    q.includes("how does it work") ||
    q.includes("how it works") ||
    q.includes("predict") ||
    q.includes("prediction") ||
    q.includes("algorithm")
  ) {
    return `### How We Predict Flash Floods (Simple Explanation)

Our system monitors live conditions and predicts flood danger well before it happens by looking at 4 main factors:

1. **How hard it is raining right now**: Measured in millimeters per hour.
2. **How much rain fell earlier**: We check rain over the past 1, 3, 6, 12, and 24 hours. Just like a sponge that is already soaked, when the soil is full of water, any new rain immediately runs off and causes flooding.
3. **The slope and height of the hills**: Steep mountain slopes make rainwater rush down into valley rivers much faster.
4. **Sudden cloudburst spikes**: Sudden bursts of intense rain are detected immediately.

Our computer model connects all these pieces together and gives you an easy-to-understand **Risk Level** (**Low**, **Moderate**, **High**, or **Critical**) so you have time to stay safe!`;
  }

  // 4. How to Use the Website / System Help
  if (
    q.includes("navigate") ||
    q.includes("page") ||
    q.includes("how to use") ||
    q.includes("dashboard") ||
    q.includes("risk map") ||
    q.includes("weather") ||
    q.includes("alert") ||
    q.includes("website")
  ) {
    return `### How to Use This Website

Here is a quick guide to help you find what you need:

- **Dashboard**: See your local weather, hourly rainfall, and overall flood risk at a glance.
- **Risk Map**: View an interactive map of your region showing safe zones and color-coded flood hazard areas.
- **Prediction**: Test what would happen if it rains heavily by adjusting rainfall numbers.
- **Weather & Data**: View live temperature, humidity, and upcoming rain forecasts.
- **Alerts**: Read official emergency warnings and advisories for your district.
- **Historical Analysis**: Look back at past flood events and cloudburst history in Uttarakhand and West Bengal.
- **Settings**: Adjust temperature units (Celsius/Fahrenheit) and notification options.

*(You are currently on the **${activePage}** page)*`;
  }

  // 5. Cloudburst & Flash Flood explanation
  if (
    q.includes("cloudburst") ||
    q.includes("what is flash flood") ||
    q.includes("why do floods happen")
  ) {
    return `### What is a Flash Flood & Cloudburst?

- **Flash Flood**: A sudden, violent flood that happens within minutes or a few hours after extremely heavy rain. Because mountains have steep rocky slopes, the water cannot soak into the ground, so it collects into narrow river gorges and rushes down like a wall of water.
- **Cloudburst**: A massive downpour where an extraordinary amount of rain (over 100 mm in an hour) dumps over a small area in a very short time.

The best defense is **early warning** &mdash; which is exactly what this system provides!`;
  }

  // Default friendly response
  return `### Hello! I'm here to help you.

I am your personal flood assistant for **${locName}, ${stateName}**.

Current conditions here are **${riskLevel} RISK** with **${rainRate}** rainfall.

**Here are some questions you can ask me:**
- *"Is it safe in my area right now?"*
- *"What should I do during a flood emergency?"*
- *"How does the flood prediction work?"*
- *"Help me navigate the website"*

Feel free to type whatever you need help with!`;
}

/**
 * Main query function
 */
export async function askFloodBot({ prompt, messages = [], context = {} }) {
  const model = getSelectedModel();
  const apiKey = getStoredApiKey();

  // If user selected built-in, or if no Gemini key is provided, use built-in engine
  if (model === "built-in" || !apiKey) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      text: runBuiltInAgent(prompt, context),
      modelUsed: "Flood Assistant",
      isFallback: !apiKey && model !== "built-in",
    };
  }

  // Use Google Gemini API
  try {
    const systemInstruction = buildSystemInstruction(context);
    const responseText = await callGeminiApi(
      apiKey,
      model,
      [...messages, { sender: "user", text: prompt }],
      systemInstruction
    );

    return {
      text: responseText,
      modelUsed: model,
      isFallback: false,
    };
  } catch (error) {
    console.warn("Gemini API call failed, falling back to built-in helper:", error);
    const fallbackText = runBuiltInAgent(prompt, context);
    return {
      text: fallbackText,
      modelUsed: "Flood Assistant",
      isFallback: true,
      error: error.message,
    };
  }
}

export default {
  askFloodBot,
  getStoredApiKey,
  setStoredApiKey,
  getSelectedModel,
  setSelectedModel,
  AI_MODELS,
};
