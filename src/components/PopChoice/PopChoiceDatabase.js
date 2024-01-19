const OpenAI = require("openai");
const movies = require("../PopChoice/content");
const { createClient } = require("@supabase/supabase-js");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_API_KEY
);

async function splitDocument(document) {
  try {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 150,
      chunkOverlap: 15,
    });
    const contents = document.map((movie) => movie.content);
    const output = await splitter.createDocuments(contents);
    console.log(output);
    return output;
  } catch (e) {
    console.error("There was an issue with splitting text");
    throw e;
  }
}

async function createAndStoreEmbeddings() {
  try {
    const chunkData = await splitDocument(movies);

    // Batch chunks for processing
    const batchSize = 5;
    const batchedChunks = [];
    for (let i = 0; i < chunkData.length; i += batchSize) {
      batchedChunks.push(chunkData.slice(i, i + batchSize));
    }

    const data = await Promise.all(
      batchedChunks.map(async (batch) => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const embeddingsPromises = batch.map(async (chunk) => {
          const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: chunk.pageContent,
            max_tokens: 20,
          });
          return {
            content: chunk.pageContent,
            embedding: embeddingResponse.data[0].embedding,
          };
        });
        return Promise.all(embeddingsPromises);
      })
    );

    // Flatten the nested array structure
    const flattenedData = data.flat();

    const { error } = await supabase.from("documents").insert(flattenedData);
    console.log("Embedding and storing complete!");
    if (error) {
      throw new Error("Issue inserting data into the database.");
    }
  } catch (e) {
    console.error("ERROR: " + e.message);
  }
}

createAndStoreEmbeddings();
