import { useEffect, useRef, useState } from "react";
import { clearAiChat, getAiChat, sendAiMessage } from "../api/aiChat";
import "./AiBotPage.css";

function AiBotPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef(null);

  useEffect(() => {
    loadChat();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const loadChat = async () => {
    try {
      setError("");
      const response = await getAiChat();
      setMessages(response.data);
    } catch (err) {
      console.error(err);
      setError("Could not load chat history.");
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();

    const trimmedMessage = input.trim();
    if (!trimmedMessage) return;

    try {
      setLoading(true);
      setError("");
      setInput("");

      const response = await sendAiMessage(trimmedMessage);
      setMessages(response.data);
    } catch (err) {
      console.error(err);
      setError("Could not send message.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      setError("");
      await clearAiChat();
      setMessages([]);
    } catch (err) {
      console.error(err);
      setError("Could not clear chat.");
    }
  };

  return (
    <div className="ai-bot-page">
      <div className="ai-bot-header">
        <div>
          <h2>AI Study Bot</h2>
          <p>Ask questions about studying, programming, assignments, or school topics.</p>
        </div>

        <button className="clear-chat-button" onClick={handleClearChat}>
          Clear chat
        </button>
      </div>

      {error && <div className="ai-error">{error}</div>}

      <div className="ai-chat-box">
        {messages.length === 0 && !loading && (
          <div className="empty-chat">
            <h3>Start studying with AI</h3>
            <p>Try asking: “What are the SOLID principles?”</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message ${
              msg.role === "USER" ? "user-message" : "ai-message"
            }`}
          >
            <div className="message-sender">
              {msg.role === "USER" ? "You" : "AI Bot"}
            </div>
            <div className="message-text">{msg.message}</div>
          </div>
        ))}

        {loading && (
          <div className="chat-message ai-message">
            <div className="message-sender">AI Bot</div>
            <div className="message-text">Thinking...</div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form className="ai-input-area" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Ask something like: Explain inheritance in Java"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />

        <button type="submit" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

export default AiBotPage;