
import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  BrainCircuit,
  Send,
  RotateCcw
} from "lucide-react";

// This model runs locally in the browser.
// No Cloudflare AI API key or token quota is needed.
const MODEL =
  "SmolLM2-360M-Instruct-q4f32_1-MLC";

const MAX_HISTORY = 6;

export default function StudyChat({
  className,
  gradeLevel
}) {
  const engine = useRef(null);

  const [status, setStatus] =
    useState("idle");

  const [progress, setProgress] =
    useState("");

  const [question, setQuestion] =
    useState("");

  const [messages, setMessages] =
    useState([]);

  const [error, setError] =
    useState("");

  useEffect(() => {
    return () => {
      if (engine.current?.unload) {
        void engine.current.unload();
      }
    };
  }, []);

  useEffect(() => {
    setMessages([]);
    setQuestion("");
    setError("");
  }, [
    className,
    gradeLevel
  ]);

  async function start() {
    if (
      engine.current ||
      status === "loading"
    ) {
      return;
    }

    setStatus("loading");
    setError("");

    try {
      if (!navigator.gpu) {
        throw new Error(
          "This browser does not support WebGPU. " +
          "Try a current version of Chrome or Safari " +
          "on a compatible device."
        );
      }

      const webllm = await import(
        "@mlc-ai/web-llm"
      );

      engine.current =
        await webllm.CreateMLCEngine(
          MODEL,
          {
            initProgressCallback: p => {
              setProgress(
                p.text ||
                "Downloading and preparing the model..."
              );
            }
          }
        );

      setStatus("ready");
    } catch (error) {
      setStatus("unavailable");

      setError(
        error?.message ||
        "Could not load the on-device AI model."
      );
    }
  }

  async function ask(event) {
    event.preventDefault();

    const prompt =
      question.trim();

    if (
      !prompt ||
      status !== "ready" ||
      !engine.current
    ) {
      return;
    }

    const previous =
      messages.slice(-MAX_HISTORY);

    setMessages(old => [
      ...old,
      {
        role: "user",
        content: prompt
      }
    ]);

    setQuestion("");
    setStatus("thinking");
    setError("");

    try {
      const result =
        await engine.current.chat.completions.create(
          {
            messages: [
              {
                role: "system",
                content:
                  `You are a patient K-12 study helper ` +
                  `for ${className || "a school subject"}, ` +
                  `level ${gradeLevel || "school"}. ` +
                  `Explain concepts simply and encourage ` +
                  `the student to show their work. ` +
                  `Give helpful hints and examples. ` +
                  `Never pretend to be their actual tutor. ` +
                  `If unsure, say so. Keep replies short, ` +
                  `under 130 words. Do not ask for names, ` +
                  `passwords, addresses, or other personal information.`
              },

              ...previous,

              {
                role: "user",
                content: prompt
              }
            ],

            temperature: 0.4,

            // Limits response length, not daily usage.
            max_tokens: 180
          }
        );

      const reply =
        result.choices?.[0]?.message
          ?.content?.trim();

      if (!reply) {
        throw new Error(
          "The model returned no answer. Please try again."
        );
      }

      setMessages(old => [
        ...old,
        {
          role: "assistant",
          content: reply
        }
      ]);
    } catch (error) {
      setError(
        error?.message ||
        "The AI could not answer this question."
      );
    } finally {
      setStatus("ready");
    }
  }

  return (
    <section
      className="panel"
      style={{ marginTop: 24 }}
      aria-label="Optional on-device study chat"
    >
      <div className="panel-heading">
        <h2>
          <BrainCircuit size={19} />
          On-device AI study helper
        </h2>
      </div>

      <p className="muted tiny">
        Ask practice questions about{" "}
        {className || "your class"}.
        The AI runs on your device instead of
        Cloudflare AI, so LessonBilly has no
        per-chat API charge or daily token quota.
        It cannot read your PDFs or grades.
        Answers may be incorrect. Chat history
        is not saved to LessonBilly.
      </p>

      {status === "idle" ||
      status === "unavailable" ? (
        <>
          <p className="muted tiny">
            Starting downloads an AI model
            (hundreds of MB). Your browser
            must support WebGPU and your
            device needs sufficient memory.
            Do not enter personal information.
          </p>

          <button
            type="button"
            className="button"
            onClick={start}
          >
            <BrainCircuit size={17} />
            Start local AI
          </button>
        </>
      ) : status === "loading" ? (
        <p className="muted tiny">
          Loading AI:{" "}
          {progress || "Preparing..."}
        </p>
      ) : (
        <>
          <div
            style={{
              maxHeight: 340,
              overflowY: "auto",
              background: "#f6f8fc",
              borderRadius: 12,
              padding: 14,
              marginBottom: 15
            }}
          >
            {messages.length === 0 && (
              <p className="muted tiny">
                Try asking "Explain fractions
                with an example" or "Give me
                a practice question."
              </p>
            )}

            {messages.map(
              (message, index) => (
                <div
                  key={index}
                  style={{
                    margin: "10px 0",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                    overflowWrap: "anywhere"
                  }}
                >
                  <strong>
                    {message.role === "user"
                      ? "You"
                      : "AI helper"}
                    :
                  </strong>{" "}
                  {message.content}
                </div>
              )
            )}
          </div>

          <form
            className="stack-form"
            onSubmit={ask}
          >
            <label>
              Your question

              <input
                required
                maxLength={360}
                value={question}
                disabled={
                  status !== "ready"
                }
                placeholder="Ask a short school question..."
                onChange={event =>
                  setQuestion(
                    event.target.value
                  )
                }
              />
            </label>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap"
              }}
            >
              <button
                type="submit"
                className="button"
                disabled={
                  status !== "ready" ||
                  !question.trim()
                }
              >
                <Send size={16} />

                {status === "thinking"
                  ? "Thinking..."
                  : "Ask"}
              </button>

              <button
                type="button"
                className="subtle-button"
                onClick={() =>
                  setMessages([])
                }
                disabled={
                  status === "thinking"
                }
              >
                <RotateCcw size={16} />
                Clear chat
              </button>
            </div>
          </form>
        </>
      )}

      {error && (
        <div
          className="alert"
          role="alert"
        >
          {error}
        </div>
      )}
    </section>
  );
}
