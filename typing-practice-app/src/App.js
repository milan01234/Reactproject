
import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  let newText = "";
  let counter;
  async function collectData() {
    try {
      // Get a random quote
      const response = await fetch('https://baconipsum.com/api/?type=all-meat&paras=1');
      const data = await response.json();
      const newText = data[0];
      return newText;
    } catch (error) {
      console.error('Error fetching text:', error);
      let default_text = 'The quick brown fox jumps over the lazy dog.';
      return default_text;
    }
  }

  const [sampleText, setSampleText] = useState(newText);
  const [typed, setTyped] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [timeout, setTimeoutState] = useState(0);  // Renamed to avoid conflict with timeout function
  const [timeOn, setTimeOn] = useState(null);
  const [timeoutCounter, setTimeoutCounter] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const inputRef = useRef(null);
  const [inputValue, setInputValue] = useState("");

  // Focus input on load
  useEffect(() => {
    async function fetchText() {
      const newText = await collectData();
      setSampleText(newText); // Update state, triggering re-render
    }
    
    fetchText();
  }, []);

  // Reset the game with a new text
  const resetGame = async () => {
    // Fetch new text
    const newText = await collectData();
    setSampleText(newText);

    // Reset states
    setTyped('');
    setStartTime(null);
    setEndTime(null);
    setTimeoutState(0);
    setTimeoutCounter(0);
    setWpm(0);
    setAccuracy(100);
    setIsCompleted(false);

    // Clear any existing timeout
    if (timeOn) {
      clearTimeout(timeOn);
    }
    setTimeOn(null);

    // Focus input on reset
    inputRef.current.focus();
  };

  // Timer function
  const timedCount = (counter) => {
    setTimeoutCounter(counter);  // Update timeout counter
    if (counter < 60) {
      const timeoutId = setTimeout(() => timedCount(counter + 1), 1000);  // Increment every second
      setTimeOn(timeoutId);  // Save the timeout ID to clear it later
    } else {
      // Time is up - calculate final WPM and stop the test
      const end = new Date();
      setEndTime(end);
      const timeInMinutes = 1; // Fixed at 1 minute
      const words = typed.split(' ').length;
      const calculatedWpm = Math.round(words / timeInMinutes);
      setWpm(calculatedWpm);
      setIsCompleted(true);

      // Clear the timeout
      if (timeOn) {
        clearTimeout(timeOn);
      }
      setTimeOn(null);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    
    // Start timer on first keystroke
    if (!startTime && value.length === 1) {
      setStartTime(new Date());
      timedCount(0);  // Start counting from 0 when the user starts typing
    }

    setTyped(value);
    
    // Calculate accuracy
    let correctChars = 0;
    for (let i = 0; i < value.length; i++) {
      if (i < sampleText.length && value[i] === sampleText[i]) {
        correctChars++;
      }
    }
    const newAccuracy = Math.round((correctChars / value.length) * 100) || 100;
    setAccuracy(newAccuracy);
  };

  return (
    <div className="app">
      <header>
        <h1>TypeMaster</h1>
        <p>One-Minute Typing Challenge</p>
      </header>

      <main>
        <div className="typing-container">
          <div className="sample-text">
            {sampleText.split('').map((char, index) => {
              let charClass = '';
              if (index < typed.length) {
                charClass = typed[index] === char ? 'correct' : 'incorrect';
              }
              return (
                <span key={index} className={charClass}>
                  {char}
                </span>
              );
            })}
          </div>

          <div className="input-container">
            <input
              ref={inputRef}
              type="text"
              value={typed}
              onChange={handleInputChange}
              placeholder="Start typing here..."
              disabled={isCompleted}
            />
          </div>

          <div className="stats">
            <div className="stat">
              <span className="stat-label">Accuracy</span>
              <span className="stat-value">{accuracy}%</span>
            </div>
            {(isCompleted || timeoutCounter === 60) && (
              <div className="stat">
                <span className="stat-label">WPM</span>
                <span className="stat-value">{wpm}</span>
              </div>
            )}
            <div className="stat">
              <span className="stat-label">Time Left</span>
              <span className="stat-value">{60 - timeoutCounter}s</span>
            </div>
          </div>

          {isCompleted && (
            <div className="completion">
              <p>Time's up! Here are your results:</p>
              <p>Words Per Minute: {wpm}</p>
              <p>Accuracy: {accuracy}%</p>
              <button onClick={resetGame} className="btn">Try Again</button>
            </div>
          )}

          {!isCompleted && typed.length > 0 && (
            <button onClick={resetGame} className="btn btn-outline">Reset</button>
          )}
        </div>
      </main>

      <footer>
        <p>© {new Date().getFullYear()} TypeMaster - One Minute to Test Your Speed</p>
      </footer>
    </div>
  );
}

export default App;