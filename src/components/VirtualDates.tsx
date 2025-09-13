import { useState, useEffect, useRef } from 'react';
import { Calendar, Heart, Star, Filter, MoreVertical, Edit, Trash2, X } from 'lucide-react';

const dateIdeas = [
  {
    id: 1,
    title: "Movie Night Sync",
    description: "Watch a movie together using streaming party apps like Teleparty or Discord screen share",
    category: "Entertainment",
    difficulty: "Easy",
    time: "2-3 hours",
    icon: "🎬"
  },
  {
    id: 2,
    title: "Virtual Cooking Date",
    description: "Choose a recipe and cook the same meal together over video call",
    category: "Food & Drink",
    difficulty: "Medium",
    time: "1-2 hours",
    icon: "👨‍🍳"
  },
  {
    id: 3,
    title: "Online Museum Tour",
    description: "Take virtual tours of famous museums around the world together",
    category: "Culture",
    difficulty: "Easy",
    time: "1-2 hours",
    icon: "🏛️"
  },
  {
    id: 4,
    title: "Gaming Together",
    description: "Play online multiplayer games or co-op games together",
    category: "Gaming",
    difficulty: "Easy",
    time: "2-4 hours",
    icon: "🎮"
  },
  {
    id: 5,
    title: "Virtual Stargazing",
    description: "Use astronomy apps to explore the night sky together",
    category: "Romance",
    difficulty: "Easy",
    time: "1-2 hours",
    icon: "⭐"
  },
  {
    id: 6,
    title: "Book Club Date",
    description: "Read the same book and discuss chapters together",
    category: "Learning",
    difficulty: "Easy",
    time: "Ongoing",
    icon: "📚"
  },
  {
    id: 7,
    title: "Virtual Escape Room",
    description: "Solve puzzles and escape rooms together online",
    category: "Gaming",
    difficulty: "Medium",
    time: "1-2 hours",
    icon: "🔐"
  },
  {
    id: 8,
    title: "Online Dance Class",
    description: "Take a virtual dance lesson together",
    category: "Activity",
    difficulty: "Medium",
    time: "1 hour",
    icon: "💃"
  },
  {
    id: 9,
    title: "Virtual Coffee Date",
    description: "Have your morning coffee together over video call",
    category: "Simple",
    difficulty: "Easy",
    time: "30-60 min",
    icon: "☕"
  },
  {
    id: 10,
    title: "Online Trivia Night",
    description: "Join online trivia or create your own quiz for each other",
    category: "Gaming",
    difficulty: "Easy",
    time: "1-2 hours",
    icon: "🧠"
  },
  {
    id: 11,
    title: "Virtual Art Class",
    description: "Take an online art class or draw each other",
    category: "Creative",
    difficulty: "Medium",
    time: "1-2 hours",
    icon: "🎨"
  },
  {
    id: 12,
    title: "Workout Together",
    description: "Follow the same workout video or yoga session",
    category: "Fitness",
    difficulty: "Medium",
    time: "30-60 min",
    icon: "🏋️"
  }
];

const categories = ["All", "Entertainment", "Food & Drink", "Culture", "Gaming", "Romance", "Learning", "Activity", "Simple", "Creative", "Fitness"];

export default function VirtualDates() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem('favoriteDateIdeas');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [editingDate, setEditingDate] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: '',
    time: ''
  });

  const filteredIdeas = selectedCategory === "All" 
    ? dateIdeas 
    : dateIdeas.filter(idea => idea.category === selectedCategory);

  const toggleFavorite = (id: number) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter(fav => fav !== id)
      : [...favorites, id];
    
    setFavorites(newFavorites);
    localStorage.setItem('favoriteDateIdeas', JSON.stringify(newFavorites));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEditDate = (idea: any) => {
    setEditingDate(idea.id);
    setEditForm({
      title: idea.title,
      description: idea.description,
      category: idea.category,
      difficulty: idea.difficulty,
      time: idea.time
    });
    setActiveMenuId(null);
  };

  const handleSaveEdit = () => {
    // Here you would typically save to your backend
    console.log('Saving edited date:', editForm);
    setEditingDate(null);
    setEditForm({
      title: '',
      description: '',
      category: '',
      difficulty: '',
      time: ''
    });
  };

  const handleDeleteDate = (ideaId: number) => {
    // Here you would typically delete from your backend
    console.log('Deleting date:', ideaId);
    setActiveMenuId(null);
  };

  const handleMenuToggle = (ideaId: number) => {
    setActiveMenuId(activeMenuId === ideaId ? null : ideaId);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeMenuId !== null) {
        setActiveMenuId(null);
      }
    };

    if (activeMenuId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenuId]);

  return (
    <div className="p-4 md:p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Date Ideas</h2>
        <p className="text-gray-600 text-sm md:text-base">Plan virtual dates and create your bucket list</p>
      </div>

      {/* Category Filter */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Filter by Category</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Date Ideas Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIdeas.map(idea => (
            <div key={idea.id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200 relative">
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">{idea.icon}</div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleFavorite(idea.id)}
                    className={`p-2 rounded-full transition-colors ${
                      favorites.includes(idea.id)
                        ? 'bg-pink-100 text-pink-500'
                        : 'bg-gray-100 text-gray-400 hover:bg-pink-100 hover:text-pink-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${favorites.includes(idea.id) ? 'fill-current' : ''}`} />
                  </button>
                  
                  {/* 3-dots menu */}
                  <div className="relative">
                    <button
                      onClick={() => handleMenuToggle(idea.id)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                    
                    {activeMenuId === idea.id && (
                      <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[120px]">
                        <button
                          onClick={() => handleEditDate(idea)}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteDate(idea.id)}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remove</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2">{idea.title}</h3>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">{idea.description}</p>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Duration:</span>
                  <span className="font-medium text-gray-700">{idea.time}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Difficulty:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(idea.difficulty)}`}>
                    {idea.difficulty}
                  </span>
                </div>
                
                <div className="pt-2 border-t border-gray-100">
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 rounded-full text-xs font-medium">
                    {idea.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredIdeas.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No date ideas found in this category</p>
          </div>
        )}
      </div>

      {/* Date Bucket List Section */}
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 md:p-6 border border-blue-200">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg md:text-xl font-bold text-gray-800">Date Bucket List</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Create a list of dates you want to try together</p>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Add a date idea to your bucket list..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                Add
              </button>
            </div>
            
            {/* Sample bucket list items with 3-dots menu */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">🎬</span>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">Watch a movie together</p>
                    <p className="text-xs text-gray-500">Added by you</p>
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={() => handleMenuToggle(999)}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                  
                  {activeMenuId === 999 && (
                    <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[120px]">
                      <button
                        onClick={() => {
                          console.log('Edit bucket item');
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          console.log('Delete bucket item');
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remove</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <div className="max-w-4xl mx-auto mt-8 p-4 md:p-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200">
          <div className="flex items-center space-x-2 mb-4">
            <Star className="w-5 h-5 text-pink-500 fill-current" />
            <h3 className="text-lg md:text-xl font-bold text-gray-800">Your Favorite Date Ideas</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {dateIdeas
              .filter(idea => favorites.includes(idea.id))
              .map(idea => (
                <div key={idea.id} className="bg-white rounded-lg p-3 shadow-sm border border-pink-100">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{idea.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">{idea.title}</h4>
                      <p className="text-xs text-gray-600">{idea.time} • {idea.category}</p>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* Edit Date Modal */}
      {editingDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Edit Date Idea</h3>
              <button
                onClick={() => setEditingDate(null)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    {categories.slice(1).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={editForm.difficulty}
                    onChange={(e) => setEditForm(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="">Select difficulty</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <input
                  type="text"
                  value={editForm.time}
                  onChange={(e) => setEditForm(prev => ({ ...prev, time: e.target.value }))}
                  placeholder="e.g., 1-2 hours, 30 min"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-200 font-medium"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditingDate(null)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}