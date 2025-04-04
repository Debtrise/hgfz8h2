import React, { useState } from 'react';
import './TextToSpeech.css';

const TextToSpeech = () => {
  const [text, setText] = useState('');
  const [voiceId, setVoiceId] = useState('21m00Tcm4TlvDq8ikWAM'); // Default voice ID
  const [stability, setStability] = useState(0.75);
  const [similarityBoost, setSimilarityBoost] = useState(0.85);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setAudioUrl(null);

    try {
      const response = await fetch('https://elevenlabs-tts-service-154842307047.us-central1.run.app/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voiceId,
          voiceSettings: {
            stability,
            similarity_boost: similarityBoost,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="tts-container">
      <h1>Text to Speech Converter</h1>
      <form onSubmit={handleSubmit} className="tts-form">
        <div className="form-group">
          <label htmlFor="text">Text to Convert:</label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to convert to speech..."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="voiceId">Voice ID:</label>
          <input
            type="text"
            id="voiceId"
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
            placeholder="Enter voice ID"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="stability">Stability: {stability}</label>
          <input
            type="range"
            id="stability"
            min="0"
            max="1"
            step="0.01"
            value={stability}
            onChange={(e) => setStability(parseFloat(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label htmlFor="similarityBoost">Similarity Boost: {similarityBoost}</label>
          <input
            type="range"
            id="similarityBoost"
            min="0"
            max="1"
            step="0.01"
            value={similarityBoost}
            onChange={(e) => setSimilarityBoost(parseFloat(e.target.value))}
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Converting...' : 'Convert to Speech'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {audioUrl && (
        <div className="audio-player">
          <h2>Generated Audio</h2>
          <audio controls src={audioUrl}>
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
};

export default TextToSpeech; 