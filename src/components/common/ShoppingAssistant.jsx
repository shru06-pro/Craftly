// src/components/common/ShoppingAssistant.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  ShoppingBag,
  MapPin,
  Scissors,
  Check
} from 'lucide-react';
import { parseShoppingQuery } from '../../utils/assistantNLP';
import { formatINR } from '../../utils/formatCurrency';
import { getProductPreviewImage, getCraftlyFallbackSvg } from '../../utils/productCustomization';
import { useCart } from '../../context/CartContext';
import './ShoppingAssistant.css';

const DEFAULT_SUGGESTED_PROMPTS = [
  "Show me kurtas under ₹1000",
  "Find products in indigo",
  "Suggest an outfit for a wedding",
  "Show me handmade products",
  "Help me choose a size",
];

const getCurrentTimestamp = () => {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function ShoppingAssistant({ isOpen, onClose, onOpen, onSelectProduct }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [internalOpen, setInternalOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [addedItemIds, setAddedItemIds] = useState({});
  const messagesEndRef = useRef(null);

  // Synchronize internal state with external isOpen prop
  const isChatOpen = isOpen !== undefined ? isOpen : internalOpen;

  const handleToggle = () => {
    if (isChatOpen) {
      if (onClose) onClose();
      setInternalOpen(false);
    } else {
      if (onOpen) onOpen();
      setInternalOpen(true);
    }
  };

  const [messages, setMessages] = useState(() => [
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: "Namaste! I am your Craftly Craft Advisor. From 32-stitch Lucknowi Chikankari kurtas to Bagru hand-block prints and bespoke sizing, I can help you discover genuine handcrafted pieces from certified Indian master artisans. How can I assist you today?",
      products: [],
      suggestedPrompts: DEFAULT_SUGGESTED_PROMPTS,
      timestamp: 'Atelier Live',
    },
  ]);

  // Auto-scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen]);

let msgCounter = 1;
function nextMsgId(prefix) {
  return `${prefix}-${msgCounter++}`;
}

  const handleSendMessage = (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const timeStr = getCurrentTimestamp();

    // Append user message
    const userMessage = {
      id: nextMsgId('user'),
      sender: 'user',
      text: query,
      timestamp: timeStr,
    };

    // Parse with rule-based NLP parser
    const responseData = parseShoppingQuery(query);

    const assistantMessage = {
      id: nextMsgId('assistant'),
      sender: 'assistant',
      text: responseData.text,
      products: responseData.products || [],
      suggestedPrompts: responseData.suggestedPrompts || [],
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: "Namaste! Chat reset. How may I assist your craft journey today?",
        products: [],
        suggestedPrompts: DEFAULT_SUGGESTED_PROMPTS,
        timestamp: 'Atelier Live',
      },
    ]);
  };

  const handleProductSelect = (product) => {
    if (onSelectProduct) {
      onSelectProduct(product);
    } else {
      navigate(`/product/${product.id}`);
      if (onClose) onClose();
      setInternalOpen(false);
    }
  };

  const handleQuickAdd = (product) => {
    addToCart(product, {
      selectedColor: product.colorVariants?.[0] || null,
      selectedSize: product.availableSizes?.[0] || 'Standard',
      quantity: 1,
    });
    setAddedItemIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  return (
    <>
      {/* Floating Pill Craft Advisor Launcher Button (Bottom-Right) */}
      <button
        type="button"
        className={`floating-craft-advisor-btn ${isChatOpen ? 'active' : ''}`}
        onClick={handleToggle}
        aria-label={isChatOpen ? 'Close Craft Advisor' : 'Open Craft Advisor'}
        title="Open Craftly AI Shopping Advisor"
      >
        <Sparkles size={16} className="advisor-sparkle-icon" />
        <span className="advisor-btn-text">Craft Advisor</span>
      </button>

      {/* Responsive Chat Panel */}
      {isChatOpen && (
        <div className="assistant-panel" role="dialog" aria-modal="true" aria-label="Craftly Shopping Assistant">
          {/* Header */}
          <div className="assistant-header">
            <div className="assistant-title-group">
              <div className="assistant-avatar">
                <Sparkles size={16} color="var(--color-terracotta)" />
              </div>
              <div>
                <h3 className="assistant-title">Craftly Craft Advisor</h3>
                <span className="assistant-status">
                  <span className="status-indicator-dot" /> Live Catalogue Guide
                </span>
              </div>
            </div>

            <div className="assistant-header-actions">
              <button
                type="button"
                className="btn-assistant-header"
                onClick={handleResetChat}
                title="Restart Conversation"
                aria-label="Restart Conversation"
              >
                <RotateCcw size={15} />
              </button>
              <button
                type="button"
                className="btn-assistant-header"
                onClick={handleToggle}
                title="Close Advisor"
                aria-label="Close Advisor"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="assistant-body">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`assistant-msg-row ${msg.sender === 'user' ? 'user-row' : 'assistant-row'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="assistant-avatar-small">
                    <Sparkles size={12} color="var(--color-terracotta)" />
                  </div>
                )}

                <div className="assistant-bubble-wrap">
                  <div className={`assistant-bubble ${msg.sender === 'user' ? 'user-bubble' : 'assistant-bubble-content'}`}>
                    <p className="bubble-text">{msg.text}</p>
                    <span className="bubble-timestamp">{msg.timestamp}</span>
                  </div>

                  {/* Render Product Cards if matching products exist */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="assistant-products-grid">
                      {msg.products.map((product) => {
                        const previewImg = getProductPreviewImage(product, product.colorVariants?.[0]);
                        const isAdded = addedItemIds[product.id];

                        return (
                          <div key={product.id} className="assistant-product-card">
                            <div
                              className="assistant-prod-img-wrap"
                              onClick={() => handleProductSelect(product)}
                            >
                              <img
                                src={previewImg}
                                alt={product.name}
                                className="assistant-prod-img"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = getCraftlyFallbackSvg(product);
                                }}
                              />
                              {product.badge && (
                                <span className="assistant-badge">{product.badge}</span>
                              )}
                            </div>

                            <div className="assistant-prod-body">
                              <h4
                                className="assistant-prod-title"
                                onClick={() => handleProductSelect(product)}
                                title={product.name}
                              >
                                {product.name}
                              </h4>

                              <span className="assistant-prod-artisan">
                                <MapPin size={10} color="var(--color-terracotta)" style={{ marginRight: '3px' }} />
                                {product.artisan?.studio} • {product.artisan?.location.split(',')[0]}
                              </span>

                              <div className="assistant-prod-price-row">
                                <span className="assistant-prod-price">{formatINR(product.price)}</span>
                                {product.originalPrice && (
                                  <span className="assistant-prod-orig-price">{formatINR(product.originalPrice)}</span>
                                )}
                              </div>

                              <div className="assistant-prod-actions">
                                <button
                                  type="button"
                                  className="btn-assistant-view"
                                  onClick={() => handleProductSelect(product)}
                                >
                                  {product.allowsCustomMeasurements ? (
                                    <>
                                      <Scissors size={11} style={{ marginRight: '3px' }} />
                                      Tailor & View
                                    </>
                                  ) : (
                                    'View Piece'
                                  )}
                                </button>

                                <button
                                  type="button"
                                  className="btn-assistant-add"
                                  onClick={() => handleQuickAdd(product)}
                                  title="Add directly to Studio Bag"
                                >
                                  {isAdded ? <Check size={13} /> : <ShoppingBag size={13} />}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Render Clickable Suggested Prompt Chips */}
                  {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                    <div className="assistant-prompts-wrap">
                      <span className="prompts-kicker">Suggested inquiries:</span>
                      <div className="prompts-chips-list">
                        {msg.suggestedPrompts.map((promptText) => (
                          <button
                            key={promptText}
                            type="button"
                            className="prompt-chip-btn"
                            onClick={() => handleSendMessage(promptText)}
                          >
                            {promptText}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="assistant-footer">
            <form
              className="assistant-input-box"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <input
                type="text"
                placeholder="Ask about kurtas, indigo, sizes, weddings..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="assistant-input-field"
                aria-label="Message to Craft Advisor"
              />
              <button
                type="submit"
                className={`assistant-send-btn ${inputText.trim() ? 'active' : ''}`}
                disabled={!inputText.trim()}
                aria-label="Send query"
              >
                <Send size={15} />
              </button>
            </form>
            <div className="assistant-disclaimer">
              Catalogue-aware rule assistant • 100% verified Indian handloom pieces
            </div>
          </div>
        </div>
      )}
    </>
  );
}
