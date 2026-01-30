import { useState, useEffect, useCallback, useRef } from 'react';
import { storyNodes, characterEmojis, endingInfo, totalEndings } from './data/storyData';
import './index.css';

const playSound = (type) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    switch(type) {
      case 'click':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
      case 'success':
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
      case 'magic':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
    }
  } catch { }
};

const storage = {
  getCollectedEndings: () => { try { return JSON.parse(localStorage.getItem('dragonAdventure_endings') || '[]'); } catch { return []; } },
  addEnding: (endingType) => { const endings = storage.getCollectedEndings(); if (!endings.includes(endingType)) { endings.push(endingType); localStorage.setItem('dragonAdventure_endings', JSON.stringify(endings)); } return endings; },
  getPlayCount: () => parseInt(localStorage.getItem('dragonAdventure_playCount') || '0'),
  incrementPlayCount: () => { const count = storage.getPlayCount() + 1; localStorage.setItem('dragonAdventure_playCount', count.toString()); return count; }
};

const sparklePositions = Array.from({ length: 12 }, (_, i) => ({ left: `${(i * 8.33 + 4) % 100}%`, top: `${((i * 13 + 7) % 100)}%`, delay: `${(i * 0.17) % 2}s` }));
const confettiData = Array.from({ length: 30 }, (_, i) => ({ left: `${(i * 3.33 + 1.5) % 100}%`, top: `${((i * 7 + 3) % 100)}%`, delay: `${(i * 0.067) % 2}s`, duration: `${1 + (i % 10) * 0.1}s`, emoji: ['🎉', '✨', '🌟', '🎊', '💫'][i % 5] }));

const Sparkles = () => (<div className="absolute inset-0 pointer-events-none overflow-hidden">{sparklePositions.map((pos, i) => (<div key={i} className="absolute text-2xl animate-pulse" style={{ left: pos.left, top: pos.top, animationDelay: pos.delay, opacity: 0.6 }}>✨</div>))}</div>);

const HomeScreen = ({ onStart, collectedEndings, playCount }) => {
  const [showCollection, setShowCollection] = useState(false);
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-400 via-amber-300 to-yellow-200 relative overflow-hidden">
      <Sparkles />
      <div className="absolute top-10 left-5 text-6xl animate-float">☁️</div>
      <div className="absolute top-20 right-10 text-5xl animate-float" style={{ animationDelay: '1s' }}>☁️</div>
      <div className="absolute bottom-20 left-10 text-4xl">🏔️</div>
      <div className="absolute bottom-20 right-5 text-5xl">🏔️</div>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        <div className="text-center mb-8">
          <div className="text-8xl mb-4 animate-bounce-slow">🐉</div>
          <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-lg mb-2">드래곤 어드벤처</h1>
          <p className="text-lg text-orange-800 font-medium">신비한 용과 함께하는 모험!</p>
        </div>
        <div className="bg-white/30 backdrop-blur rounded-2xl px-6 py-3 mb-6 flex gap-6">
          <div className="text-center"><div className="text-2xl">🎮</div><div className="text-sm text-orange-900">{playCount}번 플레이</div></div>
          <div className="text-center"><div className="text-2xl">🏆</div><div className="text-sm text-orange-900">{collectedEndings.length}/{totalEndings} 엔딩</div></div>
        </div>
        <button onClick={() => { playSound('click'); onStart(); }} className="btn-press bg-gradient-to-r from-red-500 to-orange-500 text-white text-2xl font-bold px-12 py-5 rounded-full shadow-lg mb-6">🎮 모험 시작!</button>
        <button onClick={() => { playSound('click'); setShowCollection(true); }} className="btn-press bg-white/50 backdrop-blur text-orange-700 font-bold px-8 py-3 rounded-full">📚 엔딩 컬렉션</button>
      </div>
      {showCollection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold text-gray-800">📚 엔딩 컬렉션</h2><button onClick={() => setShowCollection(false)} className="text-2xl text-gray-500">✕</button></div>
            <p className="text-gray-600 mb-4">수집한 엔딩: {collectedEndings.length} / {totalEndings}</p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(endingInfo).map(([key, info]) => {
                const isCollected = collectedEndings.includes(key);
                return (<div key={key} className={`p-3 rounded-xl ${isCollected ? 'bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300' : 'bg-gray-100 border-2 border-gray-200'}`}><div className="text-3xl mb-1">{isCollected ? info.emoji : '❓'}</div><div className={`font-bold text-sm ${isCollected ? 'text-gray-800' : 'text-gray-400'}`}>{isCollected ? info.title : '???'}</div><div className={`text-xs ${isCollected ? 'text-gray-600' : 'text-gray-400'}`}>{isCollected ? info.description : '아직 발견하지 못했어요'}</div></div>);
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StoryContent = ({ currentNode, history, onChoice, onBack, onHome }) => {
  const [showText, setShowText] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState(null);
  useEffect(() => { const t1 = setTimeout(() => setShowText(true), 300); const t2 = setTimeout(() => setShowChoices(true), 800); return () => { clearTimeout(t1); clearTimeout(t2); }; }, []);
  const characterEmoji = characterEmojis[currentNode.character] || '🐉';
  const effectClass = currentNode.effect === 'shake' ? 'animate-shake' : currentNode.effect === 'glow' ? 'animate-glow' : currentNode.effect === 'bounce' ? 'animate-bounce' : currentNode.effect === 'float' ? 'animate-float' : '';
  return (
    <div className={`min-h-screen bg-gradient-to-b ${currentNode.background || 'from-sky-300 to-blue-200'} flex flex-col relative overflow-hidden`}>
      <div className="bg-white/80 backdrop-blur-sm p-3 flex items-center justify-between sticky top-0 z-20">
        <button onClick={() => { playSound('click'); onBack(); }} className="btn-press text-2xl w-10 h-10 flex items-center justify-center rounded-full bg-white shadow" disabled={history.length === 0}>{history.length > 0 ? '←' : ''}</button>
        <div className="flex items-center gap-2"><span className="text-2xl">🐉</span><span className="font-bold text-gray-700">{currentNode.title}</span></div>
        <button onClick={() => { playSound('click'); onHome(); }} className="btn-press text-2xl w-10 h-10 flex items-center justify-center rounded-full bg-white shadow">🏠</button>
      </div>
      <div className="px-4 py-2"><div className="flex justify-center gap-1">{[...Array(Math.min(history.length + 1, 10))].map((_, i) => (<div key={i} className={`w-3 h-3 rounded-full ${i === history.length ? 'bg-white' : 'bg-white/50'}`} />))}</div></div>
      <div className="flex-shrink-0 h-48 md:h-64 flex items-center justify-center relative"><Sparkles /><div className={`text-[120px] md:text-[150px] ${effectClass}`}>{characterEmoji}</div></div>
      <div className="flex-grow px-4 pb-4 overflow-y-auto"><div className={`bg-white/90 backdrop-blur rounded-3xl p-5 shadow-lg transition-all duration-500 ${showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}><p className="text-gray-700 text-lg md:text-xl leading-relaxed">{currentNode.text}</p></div></div>
      <div className={`p-4 space-y-3 transition-all duration-500 ${showChoices ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {currentNode.choices?.map((choice, idx) => (<button key={idx} onClick={() => { playSound('click'); setSelectedChoice(idx); setTimeout(() => onChoice(choice.nextId), 200); }} disabled={selectedChoice !== null} className={`btn-press w-full bg-white hover:bg-orange-50 border-2 border-orange-300 rounded-2xl p-4 text-left flex items-center gap-4 transition-all ${selectedChoice === idx ? 'bg-orange-100 scale-95' : ''} ${selectedChoice !== null && selectedChoice !== idx ? 'opacity-50' : ''}`}><span className="text-3xl">{choice.emoji}</span><span className="text-gray-700 font-medium text-lg">{choice.text}</span></button>))}
      </div>
    </div>
  );
};

const StoryScreen = (props) => (<StoryContent key={props.currentNode.id} {...props} />);

const EndingScreen = ({ node, onRestart, onHome, isNewEnding, onCreateBook }) => {
  const [showContent, setShowContent] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  useEffect(() => { playSound('success'); const t1 = setTimeout(() => setShowContent(true), 500); const t2 = setTimeout(() => setShowButtons(true), 1500); const t3 = setTimeout(() => setShowConfetti(false), 5000); return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); }; }, []);
  return (
    <div className={`min-h-screen bg-gradient-to-b ${node.background || 'from-yellow-300 to-orange-300'} flex flex-col items-center justify-center p-6 relative overflow-hidden`}>
      {showConfetti && (<div className="absolute inset-0 pointer-events-none">{confettiData.map((c, i) => (<div key={i} className="absolute text-3xl animate-bounce" style={{ left: c.left, top: c.top, animationDelay: c.delay, animationDuration: c.duration }}>{c.emoji}</div>))}</div>)}
      <div className={`text-center transition-all duration-1000 ${showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
        <div className="text-7xl mb-4 animate-bounce-slow">{characterEmojis[node.character] || '🐉'}</div>
        <h1 className="text-4xl font-black text-white drop-shadow-lg mb-4">{node.title}</h1>
        {isNewEnding && (<div className="bg-yellow-400 text-yellow-900 font-bold px-6 py-2 rounded-full mb-4 inline-block animate-pulse">🆕 새로운 엔딩 발견!</div>)}
        <div className="bg-white/90 backdrop-blur rounded-3xl p-6 shadow-lg max-w-md mx-auto mb-8"><p className="text-gray-700 text-lg leading-relaxed">{node.text}</p></div>
        <div className={`space-y-4 transition-all duration-500 ${showButtons ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <button onClick={() => { playSound('magic'); onCreateBook(); }} className="btn-press block w-full max-w-xs mx-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl font-bold px-8 py-4 rounded-full shadow-lg">📖 나만의 동화책 만들기</button>
          <button onClick={() => { playSound('click'); onRestart(); }} className="btn-press block w-full max-w-xs mx-auto bg-gradient-to-r from-red-500 to-orange-500 text-white text-xl font-bold px-8 py-4 rounded-full shadow-lg">🔄 다시 모험하기!</button>
          <button onClick={() => { playSound('click'); onHome(); }} className="btn-press block w-full max-w-xs mx-auto bg-white/50 backdrop-blur text-orange-700 font-bold px-8 py-3 rounded-full">🏠 홈으로</button>
        </div>
      </div>
    </div>
  );
};

const BookCreatorScreen = ({ history, endingNode, onHome, onRestart }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const bookRef = useRef(null);

  const storySummary = [...history, endingNode.id].map(nodeId => {
    const node = storyNodes[nodeId];
    return node ? { title: node.title, emoji: characterEmojis[node.character] || '🐉' } : null;
  }).filter(Boolean);

  const downloadImage = async () => {
    if (!bookRef.current) return;
    try {
      const html2canvas = (await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm')).default;
      const canvas = await html2canvas(bookRef.current, { backgroundColor: null, scale: 2 });
      const link = document.createElement('a');
      link.download = `${title || '나의 드래곤 이야기'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      alert('이미지 저장 중 오류가 발생했습니다. 스크린샷을 이용해주세요!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-400 via-pink-300 to-orange-200 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onHome} className="btn-press text-2xl w-10 h-10 flex items-center justify-center rounded-full bg-white shadow">🏠</button>
          <h1 className="text-2xl font-black text-white drop-shadow-lg">📖 나만의 동화책</h1>
          <div className="w-10"></div>
        </div>

        {!showPreview ? (
          <div className="bg-white rounded-3xl p-6 shadow-xl">
            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-2">📚 책 제목</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="나의 드래곤 이야기" className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none text-lg" />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-2">✍️ 작가 이름</label>
              <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="홍길동" className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none text-lg" />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-2">🗺️ 나의 모험 경로</label>
              <div className="flex flex-wrap gap-2">
                {storySummary.map((item, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-1 rounded-full text-sm">
                    <span>{item.emoji}</span>
                    <span className="text-gray-700">{item.title}</span>
                  </span>
                ))}
              </div>
            </div>
            <button onClick={() => { playSound('click'); setShowPreview(true); }} className="btn-press w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl font-bold py-4 rounded-full shadow-lg">✨ 미리보기</button>
          </div>
        ) : (
          <div>
            <div ref={bookRef} className="bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl p-6 shadow-xl border-4 border-amber-200 mb-6">
              <div className="text-center mb-4">
                <div className="text-6xl mb-2">🐉</div>
                <h2 className="text-2xl font-black text-amber-800">{title || '나의 드래곤 이야기'}</h2>
                <p className="text-amber-600 mt-1">글: {author || '익명의 모험가'}</p>
              </div>
              <div className="border-t-2 border-dashed border-amber-300 my-4"></div>
              <div className="space-y-2">
                <p className="text-center text-amber-700 font-bold mb-3">📜 나의 모험</p>
                {storySummary.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-amber-800">
                    <span className="text-xl">{item.emoji}</span>
                    <span className="flex-grow">{item.title}</span>
                    {idx < storySummary.length - 1 && <span className="text-amber-400">▼</span>}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <span className="inline-block bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold px-4 py-2 rounded-full shadow">🏆 {endingNode.title}</span>
              </div>
              <div className="mt-4 text-center text-xs text-amber-500">드래곤 어드벤처 🐉 나만의 동화책</div>
            </div>
            <div className="space-y-3">
              <button onClick={downloadImage} className="btn-press w-full bg-gradient-to-r from-green-500 to-teal-500 text-white text-xl font-bold py-4 rounded-full shadow-lg">📥 이미지로 저장하기</button>
              <button onClick={() => setShowPreview(false)} className="btn-press w-full bg-white text-purple-600 font-bold py-3 rounded-full shadow border-2 border-purple-200">✏️ 다시 수정하기</button>
              <button onClick={() => { playSound('click'); onRestart(); }} className="btn-press w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-3 rounded-full shadow-lg">🔄 새로운 모험 시작하기</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  const [screen, setScreen] = useState('home');
  const [currentNodeId, setCurrentNodeId] = useState('start');
  const [history, setHistory] = useState([]);
  const [collectedEndings, setCollectedEndings] = useState(() => storage.getCollectedEndings());
  const [playCount, setPlayCount] = useState(() => storage.getPlayCount());
  const [isNewEnding, setIsNewEnding] = useState(false);
  const currentNode = storyNodes[currentNodeId];
  
  const handleStart = useCallback(() => { setCurrentNodeId('start'); setHistory([]); setScreen('story'); storage.incrementPlayCount(); setPlayCount(prev => prev + 1); }, []);
  const handleChoice = useCallback((nextId) => { const nextNode = storyNodes[nextId]; setHistory(prev => [...prev, currentNodeId]); setCurrentNodeId(nextId); if (nextNode?.isEnding) { const endings = storage.getCollectedEndings(); const wasNew = !endings.includes(nextNode.endingType); setIsNewEnding(wasNew); if (wasNew) { storage.addEnding(nextNode.endingType); setCollectedEndings(storage.getCollectedEndings()); } setTimeout(() => setScreen('ending'), 500); } }, [currentNodeId]);
  const handleBack = useCallback(() => { if (history.length > 0) { const newHistory = [...history]; const prevNodeId = newHistory.pop(); setHistory(newHistory); setCurrentNodeId(prevNodeId); } }, [history]);
  const handleHome = useCallback(() => { setScreen('home'); setCurrentNodeId('start'); setHistory([]); }, []);
  const handleRestart = useCallback(() => { setCurrentNodeId('start'); setHistory([]); setScreen('story'); storage.incrementPlayCount(); setPlayCount(prev => prev + 1); }, []);
  const handleCreateBook = useCallback(() => { setScreen('book'); }, []);

  return (
    <div className="max-w-lg mx-auto min-h-screen relative bg-gray-900">
      {screen === 'home' && (<HomeScreen onStart={handleStart} collectedEndings={collectedEndings} playCount={playCount} />)}
      {screen === 'story' && currentNode && (<StoryScreen currentNode={currentNode} history={history} onChoice={handleChoice} onBack={handleBack} onHome={handleHome} />)}
      {screen === 'ending' && currentNode && (<EndingScreen node={currentNode} onRestart={handleRestart} onHome={handleHome} isNewEnding={isNewEnding} onCreateBook={handleCreateBook} />)}
      {screen === 'book' && currentNode && (<BookCreatorScreen history={history} endingNode={currentNode} onHome={handleHome} onRestart={handleRestart} />)}
    </div>
  );
}

export default App;
