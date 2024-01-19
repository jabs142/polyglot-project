require("./Assistants.css");
const OpenAI = require("openai");
const { useState, useEffect } = require("react");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const assistantID = process.env.ASSISTANT_ID;
const threadID = process.env.THREAD_ID;

async function createMessage(question) {
  const threadMessages = await openai.beta.threads.messages.create(threadID, {
    role: "user",
    content: question,
  });
}

async function runThread() {
  const run = await openai.beta.threads.runs.create(threadID, {
    assistant_id: assistantID,
  });
  return run;
}

async function listMessages() {
  const listMessages = await openai.beta.threads.messages.list(threadID);
  return listMessages;
}

async function retrieveRun(thread, run) {
  const currentRun = await openai.beta.threads.runs.retrieve(thread, run);
  return currentRun;
}

const Assistants = () => {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (message.trim() !== "") {
      await createMessage(message);
      const run = await runThread();

      if (run) {
        let currentRun = await retrieveRun(threadID, run.id);
        while (currentRun.status !== "completed") {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          console.log("currentRun.status handleSendMessage", currentRun.status);
          currentRun = await retrieveRun(threadID, run.id);
        }
      }

      // Retrieve the latest messages from the thread
      const { data } = await listMessages();
      setResponse(data[0].content[0].text.value);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("response useEffect", response);
  }, [response]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setIsLoading(true);
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="assistants-outer-container">
      <div className="assistants-chat-container">
        <h1> Ask Ally</h1>
        <div className="assistants-input-container">
          <textarea
            className="assistants-textarea"
            id="messageInput"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          ></textarea>
          <button className="assistants-button" onClick={handleSendMessage}>
            <span>Send</span>
          </button>
        </div>
        <div className="assistants-response-container ">
          {isLoading && <p>Loading...</p>}
          {!isLoading && <p>{response}</p>}
        </div>
      </div>
      <p>Created with OpenAI's Assistants API</p>
    </div>
  );
};

export default Assistants;
