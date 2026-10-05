import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, ChefHat } from "lucide-react";

const KNOWLEDGE_BASE = [
  {
    keywords: ["book", "booking", "how to book", "reserve"],
    answer:
      "To book a caterer: go to \"Find Caterers\", open a caterer you like, fill in your event details, select menu items, then click \"Confirm Booking\". The caterer will accept your request, and you can pay the advance online.",
  },
  {
    keywords: ["price", "cost", "pricing", "how much", "charge", "budget"],
    answer:
      "Pricing is calculated live as you select menu items: (price per dish × guest count) + 5% service charge + 5% tax. You only pay a 30% advance to confirm — the rest is due after the event.",
  },
  {
    keywords: ["advance", "deposit"],
    answer:
      "You pay a 30% advance online via Razorpay when your booking is confirmed by the caterer. The remaining 70% is due after your event.",
  },
  {
    keywords: ["payment", "pay", "razorpay", "refund"],
    answer:
      "Payments are handled securely through Razorpay (cards, UPI, netbanking, wallets). If you need a refund, please cancel your booking before the event and contact the caterer directly — refund policies vary by caterer.",
  },
  {
    keywords: ["cancel", "cancellation"],
    answer:
      "You can cancel a booking from \"My Bookings\" → open the booking → \"Cancel Booking\", as long as it isn't already completed. Cancelling frees up that date for the caterer again.",
  },
  {
    keywords: ["menu", "food", "dish", "veg", "non veg", "non-veg"],
    answer:
      "Every caterer's menu is organized by course — Welcome Drinks, Starters, Main Course, Rice, Breads, Desserts and more. You can mix and match dishes, and each item is clearly marked Veg or Non-Veg.",
  },
  {
    keywords: ["caterer", "register", "list my business", "sign up as caterer", "vendor"],
    answer:
      "Want to list your catering business? Click \"Sign up\" → choose \"I'm a caterer\" → fill in your details. Your profile will need a quick admin approval before it goes live to customers.",
  },
  {
    keywords: ["review", "rating", "rate"],
    answer:
      "You can rate and review a caterer once your event is marked \"Completed\" — just open the booking from \"My Bookings\" and you'll see a review form.",
  },
  {
    keywords: ["contact", "support", "help", "phone", "email us"],
    answer:
      "You can reach us at support@smartcater.com or +91 90000 00000. Our team typically responds within 24 hours.",
  },
  {
    keywords: ["guest", "guests", "plate", "how many people"],
    answer:
      "Just enter your expected guest count on the booking page — the total cost updates automatically based on your selected menu items × guest count.",
  },
  {
    keywords: ["event type", "wedding", "birthday", "corporate", "reception"],
    answer:
      "SmartCater supports weddings, receptions, engagements, birthdays, corporate events, college functions, anniversaries and more — just select your event type while booking.",
  },
  {
    keywords: ["hi", "hello", "hey", "vanakkam"],
    answer: "Hi there! 👋 I'm the SmartCater assistant. Ask me about booking, pricing, menus, or payments.",
  },
];

const DEFAULT_REPLY =
  "I'm not sure about that one — for anything specific, please reach out to support@smartcater.com or +91 90000 00000. You can also ask me about booking, pricing, menus, payments, or cancellations.";

const QUICK_QUESTIONS = ["How do I book a caterer?", "How is pricing calculated?", "How do I pay?", "Can I cancel a booking?"];

const findAnswer = (text) => {
  const lower = text.toLowerCase();
  const match = KNOWLEDGE_BASE.find((entry) => entry.keywords.some((k) => lower.includes(k)));
  return match ? match.answer : DEFAULT_REPLY;
};

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hi! I'm the SmartCater assistant 👋 Ask me anything about booking, pricing, menus, or payments.",
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const sendMessage = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg = { role: "user", text: trimmed };
    const botMsg = { role: "bot", text: findAnswer(trimmed) };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open chat assistant"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-paprika text-cream shadow-lift transition hover:bg-paprika-dark"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-paper shadow-lift">
          <div className="flex items-center gap-2 bg-paprika px-4 py-3 text-cream">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cream/20">
              <ChefHat size={16} />
            </span>
            <div>
              <p className="text-sm font-semibold">SmartCater Assistant</p>
              <p className="text-xs text-cream/80">Ask about booking, pricing, menus...</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-stone-50 px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "rounded-br-sm bg-paprika text-cream"
                      : "rounded-bl-sm border border-stone-200 bg-paper text-stone-700"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="rounded-full border border-stone-300 bg-paper px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:border-paprika hover:text-paprika"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-stone-200 bg-paper p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 rounded-full border border-stone-300 px-4 py-2.5 text-sm outline-none focus:border-paprika"
            />
            <button
              type="submit"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-paprika text-cream hover:bg-paprika-dark"
              aria-label="Send"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;