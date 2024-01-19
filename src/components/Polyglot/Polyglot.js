import React, { useState, useEffect } from "react";
import "./Polyglot.css";
import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HF_TOKEN);

const App = () => {
  const [textInput, setTextInput] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [textToSpeech, setTextToSpeech] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [isTranslationComplete, setIsTranslationComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setSelectedLanguage("no_input");
  }, []);

  const translateText = async () => {
    try {
      setIsLoading(true);
      const textTranslationResponse = await hf.translation({
        model: "facebook/mbart-large-50-many-to-many-mmt",
        inputs: textInput,
        parameters: {
          src_lang: "en_XX",
          tgt_lang: selectedLanguage,
        },
      });
      setTranslatedText(textTranslationResponse.translation_text);
      setIsTranslationComplete(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Error translating text:", error);
      setTranslatedText("Error: Translation failed");
      setIsTranslationComplete(false);
      setIsLoading(false);
    }
  };
  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(translatedText);
      alert("Text copied to clipboard!");
    } catch (error) {
      console.error("Error copying text:", error);
      // Fallback: Use document.execCommand('copy') for browsers that don't support clipboard API
      const textarea = document.createElement("textarea");
      textarea.value = translatedText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      alert("Text copied to clipboard!");
    }
  };

  const playText = async () => {
    try {
      const response = await hf.textToSpeech({
        inputs: translatedText,
        model: "espnet/kan-bayashi_ljspeech_vits",
      });

      const audioElement = new Audio(URL.createObjectURL(response));
      audioElement.play();
    } catch (error) {
      console.error("Error playing text:", error);
    }
  };

  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
  };

  useEffect(() => {
    setIsTranslationComplete(false);
  }, [translatedText]);

  return (
    <div className="container">
      <div className="input-container">
        <label htmlFor="textInput">Enter Text to Translate:</label>
        <textarea
          id="textInput"
          rows="4"
          cols="50"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
        ></textarea>
        <button
          className={`trans-btn ${
            selectedLanguage === "no_input" ? "disabled" : ""
          }`}
          onClick={translateText}
          disabled={selectedLanguage === "no_input"}
        >
          Translate
        </button>

        <br />
        <select value={selectedLanguage} onChange={handleLanguageChange}>
          <option value="no_input">Select a language</option>
          <option value="zh_CN">Chinese</option>
          <option value="de_DE">German</option>
          <option value="fr_XX">French</option>
          <option value="hi_IN">Hindi</option>
          <option value="id_ID">Indonesian</option>
          <option value="it_IT">Italian</option>
          <option value="ja_XX">Japanese</option>
          <option value="ko_KR">Korean</option>
          <option value="ru_RU">Russian</option>
          <option value="ta_IN">Tamil</option>
          <option value="th_TH">Thai</option>
          <option value="tl_XX">Tagalog</option>
          <option value="vi_VN">Vietnamese</option>
        </select>
      </div>

      <div className="output-container">
        <div id="translatedText"></div>
        <label htmlFor="textToSpeech">Text to Speech:</label>
        {isLoading && <p>Loading ...</p>}
        <textarea
          id="textToSpeech"
          rows="4"
          cols="50"
          value={translatedText}
          onChange={(e) => setTextToSpeech(e.target.value)}
        ></textarea>
        <div className="label-container">
          <button className="copy-btn" onClick={copyText}>
            Copy
          </button>
          <button className="play-btn" onClick={playText}>
            Play
          </button>
        </div>
      </div>
      <p className="about">
        {" "}
        Created using facebook/mbart-large-50-many-to-many-mmt to translate
        words and espnet/kan-bayashi_ljspeech_vits to voice the translated text{" "}
      </p>
    </div>
  );
};

export default App;
