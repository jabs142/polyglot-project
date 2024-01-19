require("./PopChoice.css");
const OpenAI = require("openai");
const { useEffect, useState } = require("react");
const { createClient } = require("@supabase/supabase-js");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_API_KEY
);

const PopChoice = () => {
  const [answer1, setAnswer1] = useState("");
  const [answer2, setAnswer2] = useState("");
  const [combineAns, setCombineAns] = useState("");
  const [responseAI, setResponseAI] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCombineAns(
      `I am in the mood for ${answer1} My favorite movie is ${answer2}`
    );
  }, [answer1, answer2]);

  const createEmbeddingAndMatch = async (input) => {
    const embedding = await createEmbedding(input);
    const match = await findNearestMatch(embedding);
    const response = await getChatCompletion(match, input);
    setResponseAI(response);
    setIsLoading(false);
  };

  // Create an embedding vector representing the query
  async function createEmbedding(input) {
    await new Promise((resolve) => setTimeout(resolve, 20000));
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input,
    });
    return embeddingResponse.data[0].embedding;
  }

  // Query Supabase and return a semantically matching text chunk
  async function findNearestMatch(embedding) {
    const { data } = await supabase.rpc("match_documents", {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 3,
    });

    // Manage multiple returned matches
    const match = data.map((obj) => obj.content).join("\n");
    return match;
  }

  const chatMessages = [
    {
      role: "system",
      content: `You are an enthusiastic movie expert who loves recommending movies to people. You will be given two pieces of information - some context about the movies and a question. Your main job is to formulate a short answer to the question using the provided context. If you are unsure and cannot find the answer in the context, say, "Sorry, I don't know the answer." Please do not make up the answer.`,
    },
  ];

  async function getChatCompletion(text, query) {
    chatMessages.push({
      role: "user",
      content: `Context: ${text} Question: ${query}`,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: chatMessages,
      temperature: 0.5,
      frequency_penalty: 0.5,
    });
    return response.choices[0].message.content;
  }

  const handleButtonClick = () => {
    setIsLoading(true);
    createEmbeddingAndMatch(combineAns);
  };

  return (
    <div className="container">
      <div className="question-answer-container">
        <label htmlFor="question1">What are you in the mood for?</label>
        <textarea
          id="answer1"
          rows="2"
          value={answer1}
          placeholder="Something funny!"
          onChange={(e) => setAnswer1(e.target.value)}
        ></textarea>

        <label htmlFor="question2">What's your favorite movie?</label>
        <textarea
          id="answer2"
          rows="2"
          value={answer2}
          placeholder="Up by Pixar"
          onChange={(e) => setAnswer2(e.target.value)}
        ></textarea>

        <label> Recommended movie:</label>
        {isLoading && <p>Loading ... </p>}
        <p> {responseAI}</p>
      </div>

      <button className="action-btn" onClick={handleButtonClick}>
        Let's go!
      </button>
      <p className="about">
        RAG concept. Created with text-embedding-ada-002 for embedding, using
        RecursiveCharacterTextSplitter from LangChain and Supabase for storing
        vector embeddings. Also using gpt-3.5-turbo as a generative model.
      </p>
    </div>
  );
};

export default PopChoice;
