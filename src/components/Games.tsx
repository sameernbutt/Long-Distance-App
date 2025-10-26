import { useState, useEffect } from 'react';
import { Dice1, Heart, Zap, Users } from 'lucide-react';
import { parse } from 'csv-parse/browser/esm';

// Define the types for our game prompts
type WouldYouRatherQuestion = string;

interface TruthOrDarePrompts {
  truth: string;
  dare: string;
}

interface GamesProps {
  isDarkMode?: boolean;
}

export default function Games({ isDarkMode = false }: GamesProps) {
  const [activeGame, setActiveGame] = useState<'would-you-rather' | 'truth-or-dare' | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [gameHistory, setGameHistory] = useState<string[]>([]);
  const [wouldYouRatherQuestions, setWouldYouRatherQuestions] = useState<WouldYouRatherQuestion[]>([]);
  const [truthOrDarePrompts, setTruthOrDarePrompts] = useState<TruthOrDarePrompts[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Use useEffect to fetch and parse the CSV files
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        // Fetch Would You Rather questions
        const wyrResponse = await fetch('/resources/wouldYouRather.csv');
        const wyrText = await wyrResponse.text();

        // Fetch Truth or Dare prompts
        const todResponse = await fetch('/resources/truthOrDare.csv');
        const todText = await todResponse.text();

        const [wyrRecords, todRecords] = await Promise.all([
          new Promise<string[][]>((resolve, reject) => {
            parse(wyrText, { columns: false, skip_empty_lines: true }, (err, records) => {
              if (err) reject(err);
              resolve(records);
            });
          }),
          new Promise<TruthOrDarePrompts[]>((resolve, reject) => {
            parse(todText, {
              columns: ['truth', 'dare'], // Explicitly name the columns
              skip_empty_lines: true,
            }, (err, records: TruthOrDarePrompts[]) => {
              if (err) reject(err);
              resolve(records);
            });
          })
        ]);

        // Process the data
        const wouldYouRatherList = wyrRecords.map(row => row[0]);
        setWouldYouRatherQuestions(wouldYouRatherList);
        setTruthOrDarePrompts(todRecords);
        
      } catch (error) {
        console.error('Error loading game data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameData();
  }, []);

  const generateWouldYouRather = () => {
    if (wouldYouRatherQuestions.length === 0) return;
    const randomQuestion = wouldYouRatherQuestions[Math.floor(Math.random() * wouldYouRatherQuestions.length)];
    setCurrentPrompt(randomQuestion);
    setActiveGame('would-you-rather');
    setGameHistory(prev => [randomQuestion, ...prev.slice(0, 4)]);
  };

  const generateTruthOrDare = (type: 'truth' | 'dare') => {
    if (truthOrDarePrompts.length === 0) return;
    const randomPrompt = truthOrDarePrompts[Math.floor(Math.random() * truthOrDarePrompts.length)][type];
    setCurrentPrompt(randomPrompt);
    setActiveGame('truth-or-dare');
    setGameHistory(prev => [`${type.toUpperCase()}: ${randomPrompt}`, ...prev.slice(0, 4)]);
  };

  if (isLoading) {
    return (
      <div className={`p-4 md:p-6 text-center transition-colors ${
        isDarkMode ? 'text-gray-400' : 'text-gray-500'
      }`}>
        Loading games...
      </div>
    );
  }
  
  return (
    <div className="p-4 md:p-6">
      <div className="text-center mb-6">
        <h2 className={`text-2xl md:text-3xl font-bold mb-2 transition-colors ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>Couple Games</h2>
        <p className={`text-sm md:text-base transition-colors ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>Fun games to play together from afar</p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Game Selection */}
        {!activeGame && (
          <div className="grid gap-6 mb-8">
            <div 
              onClick={generateWouldYouRather}
              className={`rounded-xl p-4 md:p-6 border cursor-pointer hover:shadow-lg active:scale-95 transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-black border-blue-400 text-blue-100' 
                  : 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200'
              }`}
            >
              <div className="text-center">
                <div className={`p-3 rounded-full w-fit mx-auto mb-4 ${
                  isDarkMode ? 'bg-blue-500 text-white' : 'bg-blue-500 text-white'
                }`}>
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className={`text-lg md:text-xl font-bold mb-2 transition-colors ${
                  isDarkMode ? 'text-blue-100' : 'text-gray-800'
                }`}>Would You Rather</h3>
                <p className={`text-sm transition-colors ${
                  isDarkMode ? 'text-blue-100' : 'text-gray-600'
                }`}>Choose between two interesting options and discuss your choices</p>
              </div>
            </div>

            <div className={`rounded-xl p-4 md:p-6 border transition-colors ${
              isDarkMode 
                ? 'bg-black border-pink-400 text-white' 
                : 'bg-gradient-to-br from-pink-50 to-rose-100 border-pink-200'
            }`}>
              <div className="text-center mb-4">
                <div className={`p-3 rounded-full w-fit mx-auto mb-4 ${
                  isDarkMode ? 'bg-pink-500 text-white' : 'bg-pink-500 text-white'
                }`}>
                  <Heart className="w-6 h-6" />
                </div>
                <h3 className={`text-lg md:text-xl font-bold mb-2 transition-colors ${
                  isDarkMode ? 'text-pink-100' : 'text-gray-800'
                }`}>Truth or Dare</h3>
                <p className={`text-sm mb-4 transition-colors ${
                  isDarkMode ? 'text-pink-100' : 'text-gray-600'
                }`}>Get to know each other better or have some fun challenges</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => generateTruthOrDare('truth')}
                  className={`flex-1 py-3 rounded-lg active:scale-95 transition-all font-medium ${
                    isDarkMode 
                      ? 'bg-purple-500 text-white hover:bg-purple-600' 
                      : 'bg-purple-500 text-white hover:bg-purple-600'
                  }`}
                >
                  Truth
                </button>
                <button
                  onClick={() => generateTruthOrDare('dare')}
                  className={`flex-1 py-3 rounded-lg active:scale-95 transition-all font-medium ${
                    isDarkMode 
                      ? 'bg-pink-500 text-white hover:bg-pink-600' 
                      : 'bg-pink-500 text-white hover:bg-pink-600'
                  }`}
                >
                  Dare
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Game */}
        {activeGame && (
          <div className={`rounded-xl p-4 md:p-6 shadow-lg border-2 mb-6 transition-colors ${
            isDarkMode 
              ? 'bg-black border-purple-900' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="text-center mb-6">
              <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full w-fit mx-auto mb-4">
                {activeGame === 'would-you-rather' ? (
                  <Zap className="w-6 h-6 text-white" />
                ) : (
                  <Heart className="w-6 h-6 text-white" />
                )}
              </div>
              <h3 className={`text-xl md:text-2xl font-bold mb-2 transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                {activeGame === 'would-you-rather' ? 'Would You Rather' : 'Truth or Dare'}
              </h3>
            </div>

            <div className={`rounded-xl p-4 md:p-6 mb-6 border transition-colors ${
              isDarkMode 
                ? 'bg-gradient-to-r from-gray-700 to-gray-600 border-gray-500' 
                : 'bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200'
            }`}>
              <p className={`text-base md:text-lg text-center leading-relaxed transition-colors ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>{currentPrompt}</p>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setActiveGame(null)}
                className={`px-4 md:px-6 py-2 rounded-xl border-2 active:scale-95 transition-all text-sm md:text-base ${
                  isDarkMode 
                    ? 'bg-black border-purple-900 text-gray-300 hover:border-purple-800' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
                }`}
              >
                Back to Games
              </button>
              
              {activeGame === 'would-you-rather' ? (
                <button
                  onClick={generateWouldYouRather}
                  className="flex items-center space-x-2 px-4 md:px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 active:scale-95 transition-all duration-200 text-sm md:text-base"
                >
                  <Dice1 className="w-4 h-4" />
                  <span>New Question</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => generateTruthOrDare('truth')}
                    className="flex items-center space-x-2 px-4 md:px-6 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 active:scale-95 transition-all text-sm md:text-base"
                  >
                    <Users className="w-4 h-4" />
                    <span>Truth</span>
                  </button>
                  <button
                    onClick={() => generateTruthOrDare('dare')}
                    className="flex items-center space-x-2 px-4 md:px-6 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 active:scale-95 transition-all text-sm md:text-base"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Dare</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Game History */}
        {gameHistory.length > 0 && (
          <div className={`rounded-xl p-6 border transition-colors ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <h4 className={`font-semibold mb-4 transition-colors ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>Recent Prompts</h4>
            <div className="space-y-3">
              {gameHistory.map((prompt, index) => (
                <div key={index} className={`rounded-lg p-3 text-sm transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-600 text-gray-300' 
                    : 'bg-white text-gray-600'
                }`}>
                  {prompt}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}