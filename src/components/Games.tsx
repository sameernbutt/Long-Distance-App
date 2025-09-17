import { useState, useEffect } from 'react';
import { Dice1, Heart, Zap, Users } from 'lucide-react';
import { parse } from 'csv-parse/browser/esm';

// Define the types for our game prompts
type WouldYouRatherQuestion = string;

interface TruthOrDarePrompts {
  truth: string;
  dare: string;
}

export default function Games() {
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
      <div className="p-4 md:p-6 text-center text-gray-500">
        Loading games...
      </div>
    );
  }
  
  return (
    <div className="p-4 md:p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Couple Games</h2>
        <p className="text-gray-600 text-sm md:text-base">Fun games to play together from afar</p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Game Selection */}
        {!activeGame && (
          <div className="grid gap-6 mb-8">
            <div 
              onClick={generateWouldYouRather}
              className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4 md:p-6 border border-blue-200 cursor-pointer hover:shadow-lg active:scale-95 transition-all duration-200"
            >
              <div className="text-center">
                <div className="p-3 bg-blue-500 rounded-full w-fit mx-auto mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">Would You Rather</h3>
                <p className="text-gray-600 text-sm">Choose between two interesting options and discuss your choices</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-rose-100 rounded-xl p-4 md:p-6 border border-pink-200">
              <div className="text-center mb-4">
                <div className="p-3 bg-pink-500 rounded-full w-fit mx-auto mb-4">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">Truth or Dare</h3>
                <p className="text-gray-600 text-sm mb-4">Get to know each other better or have some fun challenges</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => generateTruthOrDare('truth')}
                  className="flex-1 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 active:scale-95 transition-all font-medium"
                >
                  Truth
                </button>
                <button
                  onClick={() => generateTruthOrDare('dare')}
                  className="flex-1 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 active:scale-95 transition-all font-medium"
                >
                  Dare
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Game */}
        {activeGame && (
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-gray-100 mb-6">
            <div className="text-center mb-6">
              <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full w-fit mx-auto mb-4">
                {activeGame === 'would-you-rather' ? (
                  <Zap className="w-6 h-6 text-white" />
                ) : (
                  <Heart className="w-6 h-6 text-white" />
                )}
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                {activeGame === 'would-you-rather' ? 'Would You Rather' : 'Truth or Dare'}
              </h3>
            </div>

            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 md:p-6 mb-6 border border-pink-200">
              <p className="text-base md:text-lg text-gray-700 text-center leading-relaxed">{currentPrompt}</p>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setActiveGame(null)}
                className="px-4 md:px-6 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 active:scale-95 transition-all text-sm md:text-base"
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
          <div className="bg-gray-50 rounded-xl p-6 border">
            <h4 className="font-semibold text-gray-800 mb-4">Recent Prompts</h4>
            <div className="space-y-3">
              {gameHistory.map((prompt, index) => (
                <div key={index} className="bg-white rounded-lg p-3 text-sm text-gray-600">
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