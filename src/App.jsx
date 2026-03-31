import { useCallback, useEffect, useRef, useState } from 'react'

const App = () => {

  const [seconds, setSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [quote, setQuote] = useState('Stay focused and keep going 🚀')
  const [history, setHistory] = useState(() => {
    const savedData = localStorage.getItem("timer_history");
    return savedData ? JSON.parse(savedData) : [];
  })
  const timeRef = useRef(null);

  //  Save history to LocalStorage
  useEffect(() => {
    localStorage.setItem("timer_history", JSON.stringify(history))
  }, [history]);

  //  Fetch API (Motivation Quote)
  useEffect(() => {
    const fetchTimer = async () => {
      try {
        const res = await fetch('https://api.quotable.io/random');
        if (!res.ok) throw new Error("Network issues");
        const data = await res.json();
        setQuote(data.content);
      } catch (err) {
        setQuote('Success is not final, failure is not fatal: it is the courage to continue that counts.');
        console.log('Fetch Error:' + err);
      }
    };
    fetchTimer();
  }, []);

  // Timer Logic
  useEffect(() => {
    if (isActive && !isPaused && seconds > 0) {
      timeRef.current = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    };

    if (seconds === 0 && isActive) {
      setHistory(prev => [
        {
          time: new Date().toLocaleTimeString(),
          duration: formatTime(totalSeconds)
        },
        ...prev
      ]);
      clearInterval(timeRef.current);
      setIsActive(false);
      setIsPaused(false);
      alert("Done! 🎉");
    };

    return () => clearInterval(timeRef.current);
  }, [isActive, isPaused, seconds]);

  // Formatting Function (00 : 00)
  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${String(mins).padStart(2, '0')} : ${String(secs).padStart(2, '0')}`;
  }

  // Progress Calculation
  const getProgress = () => {
    if (totalSeconds === 0) return 0;
    return (seconds / totalSeconds) * 100;
  };

  // Handler for Inputs
  const handleInputChange = useCallback((m, s) => {
    const total = (Number(m || 0) * 60) + Number(s || 0);
    setSeconds(total);
    setTotalSeconds(total);
  }, []);

  return (
    <div className='container py-5'>
      <div className='row justify-content-center'>
        <div className='col-md-6'>

          <div className='card shadow-lg p-4 text-center border-0 rounded-4'>
            <h2 className='text-primary fw-bold mb-3'>Pro Timer v6.0</h2>
            <p className='text-muted small px-3 mb-4'>"{quote}"</p>

            {/* Display Timer */}
            <div className='display-1 fw-bold my-4 font-monospace'>
              {formatTime(seconds)}
            </div>

            {/* Progress Bar */}
            <div className='progress mb-4' style={{ height: '12px' }}>
              <div
                className={`progress-bar progress-bar-striped progress-bar-animated ${seconds < 10 ? 'bg-danger' : 'bg-success'}`}
                role='progressbar'
                style={{ width: `${getProgress()}%`, transition: 'width 1s linear' }}
              ></div>
            </div>

            {/* Input Section (Hidden when active) */}
            {!isActive && (
              <div className='row g-2 mb-4'>
                <div className='col'>
                  <div className='input-group shadow-sm'>
                    <span className='input-group-text bg-light border-0'>Min</span>
                    <input
                      type='number'
                      className='form-control border-0 bg-light'
                      placeholder='0'
                      onChange={(e) => handleInputChange(e.target.value, seconds % 60)}
                    />
                  </div>
                </div>
                <div className='col'>
                  <div className='input-group shadow-sm'>
                    <span className='input-group-text bg-light border-0'>Sec</span>
                    <input
                      type='number'
                      className='form-control border-0 bg-light'
                      placeholder='0'
                      max="59"
                      onChange={(e) => handleInputChange(Math.floor(seconds / 60), e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Control Buttons */}
            <div className='d-flex gap-2 justify-content-center'>
              {!isActive ? (
                <button
                  className='btn btn-success btn-lg px-5 rounded-pill shadow'
                  onClick={() => setIsActive(true)}
                  disabled={seconds === 0}
                >Start</button>
              ) : (
                <>
                  <button
                    className={`btn btn-lg px-4 rounded-pill shadow ${isPaused ? 'btn-info text-white' : 'btn-secondary'}`}
                    onClick={() => setIsPaused(!isPaused)}
                  >
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>
                  <button
                    className='btn btn-danger btn-lg px-4 rounded-pill shadow'
                    onClick={() => {
                      setIsActive(false);
                      setIsPaused(false);
                      setSeconds(0);
                      setTotalSeconds(0);
                    }}
                  >Reset</button>
                </>
              )}
            </div>
          </div>

          {/* History Section */}
          <div className='mt-5'>
            <h5 className='text-secondary mb-3'>📜 Session History</h5>
            <ul className='list-group shadow-sm overflow-auto' style={{ maxHeight: '200px' }}>
              {history.length > 0 ? (
                history.map((item, i) => (
                  <li key={i} className='list-group-item d-flex justify-content-between align-items-center border-0 mb-1 rounded bg-white shadow-sm'>
                    <span className='text-muted small'>{item.time}</span>
                    <span className='badge bg-primary rounded-pill px-3'>Duration: {item.duration}</span>
                  </li>
                ))
              ) : (
                <li className='list-group-item text-center text-muted border-0 small'>No records yet.</li>
              )}
            </ul>
          </div>

        </div>
      </div>
    </div>
  )
}

export default App
