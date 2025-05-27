import { useState, useEffect } from 'react';
import React from 'react';
import shotSound3 from './audio/shot.wav';
import chamberSound3 from './audio/chamber.wav';
import missSound3 from './audio/misfire.wav';

const App = () => {
  const [chamberSize, setChamberSize] = useState(6);
  const [numBullets, setNumBullets] = useState(1);
  const [bulletPositions, setBulletPositions] = useState<number[]>([]);
  const [triggerPosition, setTriggerPosition] = useState(1);
  const [result, setResult] = useState(false);
  const [isBulletsVisible, setBulletsVisible] = useState(false);
  const [hydrated, setHydrated] = useState(false); // wait for client-side


  // const shotSound1 = typeof window !== 'undefined' ? new Audio("/shot.mp3") : null;
  // const missSound1 = typeof window !== 'undefined' ? new Audio("/misfire.mp3") : null;
  // const chamberSound1 = typeof window !== 'undefined' ? new Audio("/chamber.mp3") : null;
  //
  // let shotSound2 = new Audio("./audio/shot.wav");
  // let missSound2 = new Audio("./audio/misfire.wav");
  // let chamberSound2 = new Audio("./audio/chamber.wav");



  const pageStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '40px',
    minHeight: '100vh',
  };

  function generateBullets(numBullets: number, chamberSize: number): number[] {
    const positions = new Set<number>();
    while (positions.size < numBullets) {
      positions.add(Math.floor(Math.random() * chamberSize) + 1);
    }
    return Array.from(positions);
  }

  function validateBulletPositions(positions: number[], numBullets: number, chamberSize: number): number[] {
    const validPositions = Array.from(new Set(positions)).filter(pos => pos >= 1 && pos <= chamberSize);
    return validPositions.length === numBullets
        ? validPositions
        : generateBullets(numBullets, chamberSize);
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedChamberSize = localStorage.getItem('chamberSize');
    const initialChamberSize = savedChamberSize ? Number(savedChamberSize) : 6;

    const savedNumBullets = localStorage.getItem('numBullets');
    const initialNumBullets = savedNumBullets ? Number(savedNumBullets) : 1;

    const savedTriggerPosition = localStorage.getItem('triggerPosition');
    const initialTriggerPosition = savedTriggerPosition ? Number(savedTriggerPosition) : 1;

    const savedResult = localStorage.getItem('result');
    const initialResult = savedResult ? JSON.parse(savedResult) : false;

    const savedBulletPositions = localStorage.getItem('bulletPositions');
    const initialBulletPositions = savedBulletPositions
        ? validateBulletPositions(JSON.parse(savedBulletPositions), initialNumBullets, initialChamberSize)
        : generateBullets(initialNumBullets, initialChamberSize);

    setChamberSize(initialChamberSize);
    setNumBullets(initialNumBullets);
    setTriggerPosition(initialTriggerPosition);
    setResult(initialResult);
    setBulletPositions(initialBulletPositions);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('chamberSize', chamberSize.toString());
    localStorage.setItem('numBullets', numBullets.toString());
    localStorage.setItem('bulletPositions', JSON.stringify(bulletPositions));
    localStorage.setItem('triggerPosition', triggerPosition.toString());
    localStorage.setItem('result', JSON.stringify(result));
  }, [hydrated, chamberSize, numBullets, bulletPositions, triggerPosition, result]);

  const pullTrigger = () => {
    if (bulletPositions.includes(triggerPosition)) {
      // shotSound2?.play();
      new Audio(shotSound3).play();
      setResult(true);
    } else {
      // missSound2?.play();
      new Audio(missSound3).play();
      setTriggerPosition(triggerPosition === chamberSize ? 1 : triggerPosition + 1);
    }
  };

  const reload = () => {
    setResult(false);
    setTriggerPosition(1);
    setBulletPositions(generateBullets(numBullets, chamberSize));
    // chamberSound2?.play();
    new Audio(chamberSound3).play();
  };

  const handleBulletChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Math.max(1, Number(e.target.value)), chamberSize);
    setNumBullets(value);
    setBulletPositions(generateBullets(value, chamberSize));
  };

  const handleChamberSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Number(e.target.value));
    setChamberSize(value);
    setBulletPositions(generateBullets(numBullets, value));
    setTriggerPosition(1);
    setResult(false);
  };

  if (!hydrated) return null; // Prevent SSR issues

  return (
      <div
          style={pageStyle}
      >
        <h1 style={{fontSize: '35px', margin: 0}} onDoubleClick={() => setBulletsVisible(prev => !prev)}>Русская Рулетка</h1>

        {result && <p style={{ color: 'red', fontSize: '35px', fontWeight: '800', margin: '10px' }}>ТЫ ПРОИГРАЛ</p>}


        <div style={{display: 'flex', flexDirection: 'column'}} >
          <label>
            Размер барабана:
            <input
                type="number"
                min="1"
                value={chamberSize}
                onChange={handleChamberSizeChange}
                style={{ margin: '5px', width: '30px', marginTop: '10px' }}
                disabled={result}
            />
          </label>

          <label>
            Количество пуль:
            <input
                type="number"
                min="1"
                max={chamberSize}
                value={numBullets}
                onChange={handleBulletChange}
                style={{ margin: '5px', width: '30px' }}
                disabled={result}
            />
          </label>
        </div>


        <p>Позиция курка: {triggerPosition}</p>

        <div>
          <button onClick={pullTrigger} disabled={result} style={{ margin: '10px' }}>
            Спустить курок
          </button>
          <button onClick={reload} style={{ margin: '10px' }}>
            Перезарядить
          </button>
        </div>




        {isBulletsVisible && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '20px',
              flexWrap: 'wrap'
            }}>
              {[...Array(chamberSize)].map((_, index) => (
                  <div
                      key={index}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        margin: '5px',
                        backgroundColor: bulletPositions.includes(index + 1) ? 'red' : 'gray',
                        outline: triggerPosition === index + 1 ? '3px solid black' : 'none',
                      }}
                  />
              ))}
            </div>
        )}
      </div>
  );
};

export default App;
