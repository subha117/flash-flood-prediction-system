import React, { useState, useEffect, useRef, useContext } from "react";
import {
  MessageCircle,
  Bot,
  Send,
  X,
  Minimize2,
  Maximize2,
  RotateCcw,
  Settings,
  Volume2,
  VolumeX,
  Copy,
  Check,
  MapPin,
  Sparkles,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

import { LocationContext } from "../../context/LocationContext";
import { AuthContext } from "../../context/AuthContext";
import {
  askFloodBot,
  getStoredApiKey,
  setStoredApiKey,
  getSelectedModel,
  setSelectedModel,
  AI_MODELS,
} from "../../services/aiAgentService";

import "./ChatBot.css";

// Initial friendly greeting message
const INITIAL_WELCOME_MESSAGE = {
  id: "welcome-msg",
  sender: "bot",
  text: `Hello! 👋 I'm **HydroCopilot**, your flood safety assistant.

I'm here to help you stay safe. You can ask me about flood risks in your area, what to do during an emergency, how to prepare your family, or how to use this system.

**How can I help you today?**`,
  timestamp: new Date(),
};

// Common quick questions for users
const QUICK_QUESTIONS = [
  { label: "Is my area at flood risk?", icon: "🌊", prompt: "What is the current flood risk for my location? Is it safe right now?" },
  { label: "What to do in a flood emergency", icon: "🚨", prompt: "What should I do if there is a flood? Give me safety steps and emergency helpline numbers." },
  { label: "How to prepare my family", icon: "🏠", prompt: "How can I prepare my family and home before a flood? Give me a simple checklist." },
  { label: "Help me use this system", icon: "🗺️", prompt: "How do I use the different pages like Risk Map, Weather, and Predictions?" },
];

/**
 * Clean & Readable Markdown Parser
 */
function MarkdownBody({ text }) {
  if (!text) return null;

  const lines = text.split("\n");
  const elements = [];

  let inList = false;
  let listItems = [];
  let inTable = false;
  let tableRows = [];

  const flushList = (key) => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`list-${key}`} className="chat-md-list">
          {listItems.map((item, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushTable = (key) => {
    if (inTable && tableRows.length > 0) {
      const headerRow = tableRows[0];
      const dataRows = tableRows.slice(1).filter((r) => !r.every((c) => /^:?-+:?$/.test(c.trim())));

      elements.push(
        <div key={`table-${key}`} className="chat-table-wrapper">
          <table className="chat-md-table">
            <thead>
              <tr>
                {headerRow.map((h, i) => (
                  <th key={i} dangerouslySetInnerHTML={{ __html: formatInline(h.trim()) }} />
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} dangerouslySetInnerHTML={{ __html: formatInline(cell.trim()) }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  const formatInline = (str) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Table row detection
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      flushList(index);
      const cells = trimmed
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
      inTable = true;
      tableRows.push(cells);
      return;
    } else if (inTable) {
      flushTable(index);
    }

    if (trimmed.startsWith("### ")) {
      flushList(index);
      elements.push(
        <h4 key={index} className="chat-md-heading">
          {trimmed.replace("### ", "")}
        </h4>
      );
    } else if (trimmed.startsWith("#### ")) {
      flushList(index);
      elements.push(
        <h5 key={index} className="chat-md-subheading">
          {trimmed.replace("#### ", "")}
        </h5>
      );
    } else if (trimmed.startsWith("> ")) {
      flushList(index);
      elements.push(
        <blockquote
          key={index}
          className="chat-md-blockquote"
          dangerouslySetInnerHTML={{ __html: formatInline(trimmed.replace("> ", "")) }}
        />
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      inList = true;
      listItems.push(formatInline(trimmed.substring(2)));
    } else if (/^\d+\.\s/.test(trimmed)) {
      flushList(index);
      elements.push(
        <p
          key={index}
          className="chat-md-numbered"
          dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }}
        />
      );
    } else if (trimmed === "") {
      flushList(index);
    } else {
      flushList(index);
      elements.push(
        <p
          key={index}
          className="chat-md-paragraph"
          dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }}
        />
      );
    }
  });

  flushList("end");
  flushTable("end");
  return <div className="chat-markdown-root">{elements}</div>;
}

export default function ChatBot({
  isOpen,
  onClose,
  activePage = "dashboard",
  showFloatingTrigger = true,
}) {
  const { location, weather, prediction, alerts, apiOnline } = useContext(LocationContext);
  const { user } = useContext(AuthContext);

  const [visible, setVisible] = useState(isOpen ?? false);
  const [maximized, setMaximized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Messages state
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem("flood_chat_messages");
      return saved ? JSON.parse(saved) : [INITIAL_WELCOME_MESSAGE];
    } catch {
      return [INITIAL_WELCOME_MESSAGE];
    }
  });

  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Settings
  const [apiKeyInput, setApiKeyInput] = useState(() => getStoredApiKey());
  const [selectedModel, setSelectedModelState] = useState(() => getSelectedModel());

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Sync external isOpen prop
  useEffect(() => {
    if (isOpen !== undefined) {
      setVisible(isOpen);
    }
  }, [isOpen]);

  // Persist messages in session
  useEffect(() => {
    try {
      sessionStorage.setItem("flood_chat_messages", JSON.stringify(messages));
    } catch (e) {
      console.warn("Session storage save failed:", e);
    }
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    if (visible && !showSettings) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, visible, loading, showSettings]);

  // Auto-focus input
  useEffect(() => {
    if (visible && !showSettings) {
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [visible, showSettings]);

  // Text to speech
  const handleSpeak = (text) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const clean = text
      .replace(/[#*`_>|]/g, " ")
      .replace(/\(.*?\)/g, "")
      .replace(/\[(.*?)\]/g, "$1");

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Copy text
  const handleCopy = (id, text) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    });
  };

  // Clear chat
  const handleClear = () => {
    if (window.confirm("Clear this conversation?")) {
      setMessages([INITIAL_WELCOME_MESSAGE]);
      sessionStorage.removeItem("flood_chat_messages");
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Send message
  const handleSend = async (customPrompt) => {
    const promptToSend = (customPrompt || inputValue).trim();
    if (!promptToSend || loading) return;

    const userMessage = {
      id: "usr-" + Date.now(),
      sender: "user",
      text: promptToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    const context = {
      location,
      weather,
      prediction,
      alerts,
      activePage,
      userName: user?.name,
    };

    try {
      const response = await askFloodBot({
        prompt: promptToSend,
        messages: [...messages, userMessage],
        context,
      });

      const botMessage = {
        id: "bot-" + Date.now(),
        sender: "bot",
        text: response.text,
        modelUsed: response.modelUsed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);

      if (voiceEnabled) {
        handleSpeak(response.text);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: "bot-" + Date.now(),
          sender: "bot",
          text: `Sorry, I encountered an issue: ${err.message || "Unable to reach prediction assistant."}. Please try asking again.`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSaveSettings = () => {
    setStoredApiKey(apiKeyInput);
    setSelectedModel(selectedModel);
    setShowSettings(false);
  };

  const riskClass = (prediction?.risk_level || "low").toLowerCase();

  return (
    <>
      {/* Normal Floating Chat Launcher Button */}
      {showFloatingTrigger && !visible && (
        <button
          type="button"
          className="normal-chat-launcher"
          onClick={() => {
            setVisible(true);
            if (onClose && isOpen === false) onClose(true);
          }}
          title="Open Flood Assistant"
          aria-label="Open Flood Assistant"
        >
          <div className="launcher-icon-wrapper">
            <MessageCircle size={20} />
            <span className="launcher-pulse-dot" />
          </div>
          <span className="launcher-label">HydroCopilot</span>
        </button>
      )}

      {/* Normal Chatbot Window */}
      {visible && (
        <div className={`normal-chat-window ${maximized ? "window-maximized" : ""}`}>
          {/* Header */}
          <div className="normal-chat-header">
            <div className="header-left">
              <div className="header-avatar">
                <Bot size={20} />
                <span className="avatar-status-dot" />
              </div>
              <div className="header-info">
                <div className="header-title-row">
                  <h3 className="header-name">HydroCopilot</h3>
                </div>
                <p className="header-status">
                  {apiOnline ? "Online • Ready to assist" : "Offline mode"}
                </p>
              </div>
            </div>

            <div className="header-actions">
              {/* Voice Read-aloud Toggle */}
              <button
                type="button"
                className={`header-btn ${voiceEnabled ? "active" : ""}`}
                onClick={() => {
                  setVoiceEnabled(!voiceEnabled);
                  if (isSpeaking) {
                    window.speechSynthesis.cancel();
                    setIsSpeaking(false);
                  }
                }}
                title={voiceEnabled ? "Voice read-aloud active" : "Enable voice read-aloud"}
              >
                {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              {/* Clear Chat */}
              <button
                type="button"
                className="header-btn"
                onClick={handleClear}
                title="Clear conversation"
              >
                <RotateCcw size={15} />
              </button>

              {/* Settings */}
              <button
                type="button"
                className={`header-btn ${showSettings ? "active" : ""}`}
                onClick={() => setShowSettings(!showSettings)}
                title="Settings & API Key"
              >
                <Settings size={15} />
              </button>

              {/* Maximize / Minimize */}
              <button
                type="button"
                className="header-btn"
                onClick={() => setMaximized(!maximized)}
                title={maximized ? "Restore window" : "Maximize window"}
              >
                {maximized ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>

              {/* Close */}
              <button
                type="button"
                className="header-btn close-btn"
                onClick={() => {
                  setVisible(false);
                  if (onClose) onClose();
                }}
                title="Close"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Sub-header Location & Risk Context Banner */}
          <div className="normal-context-bar">
            <div className="context-location">
              <MapPin size={13} className="context-pin" />
              <span>
                {location?.name || "Chamoli"}
                {location?.state ? `, ${location.state}` : ""}
              </span>
            </div>

            <div className="context-metrics">
              {weather?.rainfall_mm_hr != null && (
                <span className="context-rain">
                  {weather.rainfall_mm_hr} mm/h rain
                </span>
              )}
              <span className={`context-risk-badge ${riskClass}`}>
                {prediction?.risk_level || "LOW"} RISK
              </span>
            </div>
          </div>

          {/* Settings Overlay Drawer */}
          {showSettings ? (
            <div className="normal-settings-panel">
              <div className="settings-header">
                <h4>Chatbot Settings</h4>
                <button
                  type="button"
                  className="header-btn"
                  onClick={() => setShowSettings(false)}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="settings-body">
                <div className="settings-field">
                  <label htmlFor="select-model">AI Engine</label>
                  <select
                    id="select-model"
                    className="settings-select"
                    value={selectedModel}
                    onChange={(e) => setSelectedModelState(e.target.value)}
                  >
                    {AI_MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <p className="settings-help-text">
                    Choose between the offline built-in engine or Google Gemini models.
                  </p>
                </div>

                <div className="settings-field">
                  <label htmlFor="input-api-key">Google Gemini API Key (Optional)</label>
                  <input
                    id="input-api-key"
                    type="password"
                    className="settings-input"
                    placeholder="AIzaSy..."
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                  />
                  <p className="settings-help-text">
                    Stored locally in your browser. Leave blank to use the built-in flood assistant.
                  </p>
                </div>

                <button
                  type="button"
                  className="settings-save-button"
                  onClick={handleSaveSettings}
                >
                  Save Settings
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Messages Feed */}
              <div className="normal-messages-area">
                {messages.map((msg) => (
                  <div key={msg.id} className={`chat-message-row ${msg.sender}`}>
                    {/* Bot Avatar on left for bot messages */}
                    {msg.sender === "bot" && (
                      <div className="msg-bot-avatar">
                        <Bot size={15} />
                      </div>
                    )}

                    <div className="chat-bubble-container">
                      <div className="chat-bubble">
                        <MarkdownBody text={msg.text} />
                      </div>

                      <div className="chat-msg-footer">
                        <span className="chat-timestamp">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>

                        {msg.sender === "bot" && (
                          <div className="bubble-actions">
                            <button
                              type="button"
                              className="bubble-action-btn"
                              onClick={() => handleCopy(msg.id, msg.text)}
                              title="Copy message"
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check size={11} color="#10b981" /> Copied
                                </>
                              ) : (
                                <>
                                  <Copy size={11} /> Copy
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              className="bubble-action-btn"
                              onClick={() => handleSpeak(msg.text)}
                              title="Listen to message"
                            >
                              <Volume2 size={11} /> Listen
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Suggested Quick Questions */}
                {messages.length === 1 && (
                  <div className="quick-suggestions-box">
                    <p className="quick-suggestions-title">Frequently Asked Questions</p>
                    <div className="quick-suggestions-grid">
                      {QUICK_QUESTIONS.map((q, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="suggestion-chip"
                          onClick={() => handleSend(q.prompt)}
                        >
                          <span className="suggestion-icon">{q.icon}</span>
                          <span className="suggestion-text">{q.label}</span>
                          <ChevronRight size={13} className="suggestion-arrow" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Typing indicator */}
                {loading && (
                  <div className="chat-message-row bot">
                    <div className="msg-bot-avatar">
                      <Bot size={15} />
                    </div>
                    <div className="chat-bubble-container">
                      <div className="chat-bubble typing-bubble">
                        <span className="dot" />
                        <span className="dot" />
                        <span className="dot" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Input Area */}
              <div className="normal-chat-footer">
                <div className="chat-input-bar">
                  <input
                    ref={inputRef}
                    type="text"
                    className="chat-text-input"
                    placeholder="Ask a question about flood risk, evacuation, model..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="chat-send-btn"
                    onClick={() => handleSend()}
                    disabled={!inputValue.trim() || loading}
                    title="Send message"
                    aria-label="Send message"
                  >
                    <Send size={15} />
                  </button>
                </div>
                <div className="chat-footer-disclaimer">
                  <span>FlashFlood Assistant &bull; Always follow official emergency announcements (112)</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
