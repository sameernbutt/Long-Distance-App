import { useState, useEffect } from 'react';
import { Calendar, Filter, MoreVertical, Trash2 } from 'lucide-react';

const dateIdeas = [
  {
    id: 1,
    title: "Movie Night Sync",
    description: "Watch a movie together",
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
  const [showDateIdeas, setShowDateIdeas] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeMenuId, setActiveMenuId] = useState<string | number | null>(null);
  
  // Bucket list state
  const [bucketList, setBucketList] = useState<Array<{id: number, title: string, emoji: string, addedBy: string}>>(() => {
    const saved = localStorage.getItem('bucketList');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', emoji: '🎉' });

  const handleAddToBucketList = (idea: any) => {
    const newBucketItem = {
      id: Date.now(),
      title: idea.title,
      emoji: idea.icon,
      addedBy: 'You'
    };
    const updatedBucketList = [...bucketList, newBucketItem];
    setBucketList(updatedBucketList);
    localStorage.setItem('bucketList', JSON.stringify(updatedBucketList));
    setActiveMenuId(null);
  };

  const handleAddCustomItem = () => {
    if (!newItem.title.trim()) return;
    
    const newBucketItem = {
      id: Date.now(),
      title: newItem.title,
      emoji: newItem.emoji,
      addedBy: 'You'
    };
    const updatedBucketList = [...bucketList, newBucketItem];
    setBucketList(updatedBucketList);
    localStorage.setItem('bucketList', JSON.stringify(updatedBucketList));
    setNewItem({ title: '', emoji: '🎉' });
    setShowAddForm(false);
  };

  const handleDeleteBucketItem = (itemId: number) => {
    const updatedBucketList = bucketList.filter(item => item.id !== itemId);
    setBucketList(updatedBucketList);
    localStorage.setItem('bucketList', JSON.stringify(updatedBucketList));
    setActiveMenuId(null);
  };

  const filteredIdeas = selectedCategory === "All" 
    ? dateIdeas 
    : dateIdeas.filter(idea => idea.category === selectedCategory);

  const handleMenuToggle = (ideaId: string | number) => {
    setActiveMenuId(activeMenuId === ideaId ? null : ideaId);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
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
      {!showDateIdeas && (
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2" id="datesTitle">Dates</h2>
          <p className="text-gray-600 text-sm md:text-base" id="datesDescription">Plan dates and create a bucket list!</p>
        </div>
      )}

      {showDateIdeas ? (
        // Date Ideas Subpage
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center mb-6 space-y-3">
            <h3 className="text-xl font-bold text-gray-800">Browse Date Ideas</h3>
            <button
              onClick={() => setShowDateIdeas(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to Bucket List
            </button>
          </div>


          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <h4 className="font-semibold text-gray-800">Filter by Category</h4>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIdeas.map(idea => (
              <div key={idea.id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200 relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{idea.icon}</div>
                  <div className="flex items-center space-x-2">
                    {/* 3-dots menu */}
                    <div className="relative">
                      <button
                        onClick={() => handleMenuToggle(idea.id)}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </button>
                      
                      {activeMenuId === idea.id && (
                        <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[140px]">
                          <button
                            onClick={() => handleAddToBucketList(idea)}
                            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Calendar className="w-4 h-4" />
                            <span>Add to Bucket List</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 text-sm leading-relaxed">{idea.description}</p>

                <div className="pt-2 border-t border-gray-100">
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 rounded-full text-xs font-medium">
                    {idea.category}
                  </span>
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
      ) : (
        // Main Bucket List View
        <div className="max-w-4xl mx-auto">
          {/* Bucket List Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 md:p-6 border border-blue-200 mb-6">
            <div className="flex flex-col items-center justify-center mb-4 space-y-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg md:text-xl font-bold text-gray-800">Bucket List</h3>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                Add Item
              </button>
            </div>

            {/* <p className="text-sm text-gray-600 mb-4">Create a list of dates you want to try together</p> */}
            
            {/* Add Item Form */}
            {showAddForm && (
              <div className="mb-4 p-4 bg-white rounded-lg border border-blue-100">
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newItem.emoji}
                      onChange={(e) => setNewItem(prev => ({ ...prev, emoji: e.target.value }))}
                      className="w-16 px-3 py-2 border border-gray-200 rounded-lg text-center text-lg"
                      placeholder="🎉"
                    />
                    <input
                      type="text"
                      value={newItem.title}
                      onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Describe the date activity..."
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleAddCustomItem}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                      Add to List
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Bucket List Items */}
            <div className="space-y-2">
              {bucketList.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{item.emoji}</span>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{item.title}</p>
                      <p className="text-xs text-gray-500">Added by {item.addedBy}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => handleMenuToggle(`bucket-${item.id}`)}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                    
                    {activeMenuId === `bucket-${item.id}` && (
                      <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[120px]">
                        <button
                          onClick={() => {
                            // Edit functionality - could open a modal or inline edit
                            console.log('Edit bucket item:', item);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <MoreVertical className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteBucketItem(item.id)}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remove</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {bucketList.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No items in your bucket list yet</p>
                  <p className="text-xs">Add some date ideas to get started!</p>
                </div>
              )}
            </div>
          </div>

          {/* View Date Ideas Button */}
          <div className="text-center">
            <button
              onClick={() => setShowDateIdeas(true)}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-200 font-medium shadow-lg"
            >
              View Date Ideas
            </button>
          </div>
        </div>
      )}
    </div>
  );

}