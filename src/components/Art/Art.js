import React, { useState, useEffect } from "react";
import { OpenAI } from "openai";
import "./Art.css";

const Art = () => {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [hasButtonBeenClicked, setHasButtonBeenClicked] = useState(false);

  useEffect(() => {
    setIsButtonDisabled(prompt.trim().length === 0);
  }, [prompt]);

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const generateImage = async () => {
    try {
      setHasButtonBeenClicked(true);
      setIsLoading(true);
      const response = await openai.images.generate({
        model: "dall-e-2",
        prompt,
        n: 1,
        size: "256x256",
        style: "natural",
        response_format: "b64_json",
      });
      setImage(response.data[0].b64_json);
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="app-container">
        <h1> ChatGPT Artworks 👩‍🎨</h1>
        <div className="frame">
          {!hasButtonBeenClicked && <h2>Generate an artwork via ChatGPT!</h2>}
          {isLoading && <div className="loading-icon">Loading...</div>}
          {image && (
            <img
              src={`data:image/png;base64,${image}`}
              alt="Generated Artwork"
            />
          )}
        </div>
        <textarea
          placeholder="A puppy with brown fur."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          onClick={generateImage}
          className={isButtonDisabled ? "disabled" : ""}
          disabled={isButtonDisabled}
        >
          Create
        </button>
        <p className="about"> Created with dall-e-2 </p>
      </div>
    </div>
  );
};

export default Art;
