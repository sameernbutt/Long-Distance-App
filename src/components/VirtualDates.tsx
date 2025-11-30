import { useState, useEffect } from 'react';
import { Calendar, Filter, MoreVertical, Trash2, Edit3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getPartnerId } from '../firebase/moods';
import { addBucketListItem, deleteBucketListItem, updateBucketListItem, subscribeToSharedBucketList, BucketListItem } from '../firebase/dates';
import DateNightCountdown from './DateNightCountdown';

interface VirtualDatesProps {
  isDarkMode?: boolean;
}

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

interface VirtualDatesProps {
  isDarkMode?: boolean;
}

export default function VirtualDates({ isDarkMode = false }: VirtualDatesProps) {
  const { user, userProfile } = useAuth();
  const [showDateIdeas, setShowDateIdeas] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeMenuId, setActiveMenuId] = useState<string | number | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  
  // Bucket list state - now using Firebase
  const [bucketList, setBucketList] = useState<BucketListItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', emoji: '🎉' });
  const [loading, setLoading] = useState(true);
  
  // Edit bucket item state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Load partner ID and bucket list with real-time sync
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const loadData = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        // Get partner ID
        const partnerIdResult = await getPartnerId(user.uid);
        setPartnerId(partnerIdResult);

        // Set up real-time subscription for bucket list
        if (partnerIdResult) {
          unsubscribe = subscribeToSharedBucketList(
            user.uid, 
            partnerIdResult, 
            (items) => {
              console.log('Bucket list updated:', items);
              setBucketList(items);
              setLoading(false);
            }
          );
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();
    
    // Cleanup subscription on component unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const handleAddToBucketList = async (idea: any) => {
    console.log('handleAddToBucketList called with:', idea);
    console.log('User:', user?.uid);
    console.log('User profile:', userProfile?.displayName);
    
    if (!user?.uid || !userProfile?.displayName) {
      console.log('Missing user data:', { userId: user?.uid, displayName: userProfile?.displayName });
      alert('Please make sure you are logged in and your profile is loaded.');
      return;
    }

    try {
      console.log('Calling addBucketListItem...');
      const { error } = await addBucketListItem(
        user.uid,
        userProfile.displayName,
        idea.title
      );
      
      if (error) {
        console.error('Error adding to bucket list:', error);
        alert('Failed to add to bucket list. Please try again.');
      } else {
        console.log('Successfully added to bucket list:', idea.title);
        // The real-time listener will automatically update the bucket list
        // and the filtered ideas will update to hide this item
      }
    } catch (error) {
      console.error('Error adding to bucket list:', error);
      alert('Failed to add to bucket list. Please try again.');
    }
    
    setActiveMenuId(null);
  };

  const handleAddCustomItem = async () => {
    if (!newItem.title.trim() || !user?.uid || !userProfile?.displayName) return;
    
    try {
      const { error } = await addBucketListItem(
        user.uid,
        userProfile.displayName,
        newItem.title
      );
      
      if (!error) {
        setNewItem({ title: '', emoji: '🎉' });
        setShowAddForm(false);
      } else {
        console.error('Error adding custom item:', error);
      }
    } catch (error) {
      console.error('Error adding custom item:', error);
    }
  };

  const handleEditBucketItem = (item: BucketListItem) => {
    setEditingItemId(item.id);
    setEditingTitle(item.title);
    setActiveMenuId(null);
  };

  const handleSaveEditBucketItem = async () => {
    if (!editingItemId || !editingTitle.trim() || !user?.uid) return;
    
    try {
      const { error } = await updateBucketListItem(editingItemId, user.uid, { title: editingTitle.trim() });
      
      if (error) {
        console.error('Error updating bucket item:', error);
        alert('Failed to update item. Please try again.');
      } else {
        setEditingItemId(null);
        setEditingTitle('');
      }
    } catch (error) {
      console.error('Error updating bucket item:', error);
      alert('Failed to update item. Please try again.');
    }
  };

  const handleCancelEditBucketItem = () => {
    setEditingItemId(null);
    setEditingTitle('');
  };

  const handleDeleteBucketItem = async (itemId: string) => {
    console.log('handleDeleteBucketItem called with itemId:', itemId);
    console.log('User:', user?.uid);
    
    if (!user?.uid) {
      console.log('No user ID, cannot delete');
      return;
    }

    try {
      console.log('Calling deleteBucketListItem...');
      const { error } = await deleteBucketListItem(itemId, user.uid);
      
      if (error) {
        console.error('Error deleting bucket item:', error);
        alert('Failed to delete item. Please try again.');
      } else {
        console.log('Successfully deleted bucket item:', itemId);
      }
    } catch (error) {
      console.error('Error deleting bucket item:', error);
      alert('Failed to delete item. Please try again.');
    }
    
    setActiveMenuId(null);
  };

  // Check if an idea is already in the bucket list
  const isIdeaInBucketList = (ideaTitle: string) => {
    return bucketList.some(item => item.title.toLowerCase() === ideaTitle.toLowerCase());
  };

  const filteredIdeas = (selectedCategory === "All" 
    ? dateIdeas 
    : dateIdeas.filter(idea => idea.category === selectedCategory))
    .filter(idea => !isIdeaInBucketList(idea.title));

  const handleMenuToggle = (ideaId: string | number) => {
    setActiveMenuId(activeMenuId === ideaId ? null : ideaId);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeMenuId !== null) {
        // Check if the click was inside a menu
        const target = event.target as Element;
        if (target && !target.closest('.menu-dropdown')) {
          setActiveMenuId(null);
        }
      }
    };

    if (activeMenuId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenuId]);

  const getCategoryColorDark = (category: string): string => {
    const colors = {
      'Entertainment': 'bg-purple-600 border-purple-400 text-white',
      'Food & Drink': 'bg-orange-600 border-orange-400 text-white',
      'Culture': 'bg-indigo-600 border-indigo-400 text-white',
      'Learning': 'bg-green-600 border-green-400 text-white',
      'Active': 'bg-red-600 border-red-400 text-white',
      'Creative': 'bg-pink-600 border-pink-400 text-white',
      'Adventure': 'bg-yellow-600 border-yellow-400 text-white',
      'Romance': 'bg-rose-600 border-rose-400 text-white'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-600 border-gray-400 text-white';
  };

  return (
    <div className="p-4 md:p-6">
      {!showDateIdeas && (
        <div className="text-center mb-6">
          <h2 className={`text-2xl md:text-3xl font-bold mb-2 transition-colors ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`} id="datesTitle">Dates</h2>
          <p className={`text-sm md:text-base transition-colors ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`} id="datesDescription">Plan dates and create a bucket list!</p>
        </div>
      )}

      {/* Date Night Countdown */}
      <DateNightCountdown isDarkMode={isDarkMode} />

      {/* Show authentication or pairing requirement */}
      {!user ? (
        <div className={`max-w-md mx-auto rounded-xl p-6 shadow-lg border-2 text-center transition-colors ${
          isDarkMode 
            ? 'bg-black border-pink-900' 
            : 'bg-white border-gray-100'
        }`}>
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className={`text-lg font-semibold mb-2 transition-colors ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>Sign In Required</h3>
          <p className={`transition-colors ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>Sign in to create and sync your bucket list with your partner</p>
        </div>
      ) : !partnerId && !loading ? (
        <div className={`max-w-md mx-auto rounded-xl p-6 shadow-lg border-2 text-center transition-colors ${
          isDarkMode 
            ? 'bg-black border-pink-900' 
            : 'bg-white border-gray-100'
        }`}>
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className={`text-lg font-semibold mb-2 transition-colors ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>Partner Required</h3>
          <p className={`transition-colors ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>Pair with your partner to create and share a bucket list together</p>
        </div>
      ) : loading ? (
        <div className={`max-w-md mx-auto rounded-xl p-6 shadow-lg border-2 text-center transition-colors ${
          isDarkMode 
            ? 'bg-black border-pink-900' 
            : 'bg-white border-gray-100'
        }`}>
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className={`transition-colors ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>Loading your bucket list...</p>
        </div>
      ) : showDateIdeas ? (
        // Date Ideas Subpage
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center mb-6 space-y-3">
            <h3 className={`text-xl font-bold transition-colors ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>Browse Date Ideas</h3>
            <button
              onClick={() => setShowDateIdeas(false)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Back to Bucket List
            </button>
          </div>


          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Filter className={`w-5 h-5 transition-colors ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`} />
              <h4 className={`font-semibold transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>Filter by Category</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                      : isDarkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
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
              <div key={idea.id} className={`rounded-xl p-6 shadow-lg border hover:shadow-xl transition-all duration-200 relative ${
                isDarkMode 
                  ? getCategoryColorDark(idea.category) + ' border-opacity-50' 
                  : 'bg-white border-gray-100'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{idea.icon}</div>
                  <div className="flex items-center space-x-2">
                    {/* 3-dots menu */}
                    <div className="relative">
                      <button
                        onClick={() => handleMenuToggle(idea.id)}
                        className={`p-2 rounded-full transition-colors ${
                          isDarkMode ? 'hover:bg-white/20' : 'hover:bg-gray-100'
                        }`}
                      >
                        <MoreVertical className={`w-5 h-5 ${
                          isDarkMode ? 'text-white/70' : 'text-gray-400'
                        }`} />
                      </button>
                      
                      {activeMenuId === idea.id && (
                        <div className={`menu-dropdown absolute right-0 top-10 rounded-lg shadow-lg border py-2 z-10 min-w-[140px] transition-colors ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600' 
                            : 'bg-white border-gray-200'
                        }`}>
                          <button
                            onClick={() => {
                              console.log('Add to Bucket List button clicked for idea:', idea);
                              handleAddToBucketList(idea);
                            }}
                            className={`w-full flex items-center space-x-2 px-4 py-2 text-sm transition-colors ${
                              isDarkMode 
                                ? 'text-gray-200 hover:bg-gray-600' 
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <Calendar className="w-4 h-4" />
                            <span>Add to Bucket List</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <p className={`mb-4 text-sm leading-relaxed transition-colors ${
                  isDarkMode ? 'text-white/80' : 'text-gray-600'
                }`}>{idea.description}</p>

                <div className={`pt-2 border-t transition-colors ${
                  isDarkMode ? 'border-white/20' : 'border-gray-100'
                }`}>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    isDarkMode 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700'
                  }`}>
                    {idea.category}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredIdeas.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className={`transition-colors ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>No date ideas found in this category</p>
            </div>
          )}
        </div>
      ) : (
        // Main Bucket List View
        <div className="max-w-4xl mx-auto">
          {/* Bucket List Section */}
          <div className={`rounded-xl p-4 md:p-6 shadow-lg border-2 mb-6 transition-colors ${
            isDarkMode 
              ? 'bg-black border-pink-900' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex flex-col items-center justify-center mb-4 space-y-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full w-fit mx-auto">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className={`text-lg font-bold transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>Bucket List</h3>
            </div>

            {/* <p className="text-sm text-gray-600 mb-4">Create a list of dates you want to try together</p> */}
            
            {/* Add Item Form */}
            {showAddForm && (
              <div className={`mb-4 p-4 rounded-lg border transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-white border-blue-100'
              }`}>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newItem.emoji}
                      onChange={(e) => setNewItem(prev => ({ ...prev, emoji: e.target.value }))}
                      className={`w-16 px-3 py-2 border rounded-lg text-center text-lg transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-600 border-gray-500 text-white' 
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                      placeholder="🎉"
                    />
                    <input
                      type="text"
                      value={newItem.title}
                      onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Describe the date activity..."
                      className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleAddCustomItem}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium text-sm hover:opacity-90 transition"
                    >
                      Add to List
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                        isDarkMode 
                          ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
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
                <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  isDarkMode
                    ? 'bg-gray-800/50 border-gray-700 text-white'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  {editingItemId === item.id ? (
                    // Edit mode
                    <div className="flex items-center space-x-2 flex-1 mr-2">
                      <span className="text-lg">📝</span>
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className={`flex-1 px-2 py-1 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEditBucketItem();
                          if (e.key === 'Escape') handleCancelEditBucketItem();
                        }}
                      />
                      <button
                        onClick={handleSaveEditBucketItem}
                        className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEditBucketItem}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          isDarkMode 
                            ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    // Display mode
                    <>
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">📝</span>
                        <div>
                          <p className={`font-medium text-md transition-colors ${
                            isDarkMode ? 'text-white' : 'text-gray-800'
                          }`}>{item.title}</p>
                          <p className={`text-[9px] opacity-50 transition-colors ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-400'
                          }`}>Added by {item.userName}</p>
                        </div>
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => handleMenuToggle(`bucket-${item.id}`)}
                          className={`p-1 rounded-full transition-colors inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-95 ${
                            isDarkMode 
                              ? 'hover:bg-gray-700 focus-visible:ring-blue-500' 
                              : 'hover:bg-gray-100 focus-visible:ring-blue-500'
                          }`}
                        >
                          <MoreVertical className={`w-4 h-4 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-400'
                          }`} />
                        </button>
                        
                        {activeMenuId === `bucket-${item.id}` && (
                          <div className={`menu-dropdown absolute right-0 top-8 rounded-lg shadow-lg border py-2 z-10 min-w-[120px] transition-colors ${
                            isDarkMode
                              ? 'bg-gray-800 border-gray-700'
                              : 'bg-white border-gray-200'
                          }`}>
                            <button
                              onClick={() => handleEditBucketItem(item)}
                              className={`w-full flex items-center space-x-2 px-4 py-2 text-sm transition-colors ${
                                isDarkMode
                                  ? 'text-gray-300 hover:bg-gray-700'
                                  : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <Edit3 className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                console.log('Delete bucket item clicked:', item);
                                handleDeleteBucketItem(item.id);
                              }}
                              className={`w-full flex items-center space-x-2 px-4 py-2 text-sm transition-colors ${
                                isDarkMode
                                  ? 'text-red-400 hover:bg-gray-700'
                                  : 'text-red-600 hover:bg-red-50'
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Remove</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
              
              {bucketList.length === 0 && (
                <div className={`text-center py-8 transition-colors ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <Calendar className={`w-8 h-8 mx-auto mb-2 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <p className="text-sm">No items in your bucket list yet</p>
                  <p className="text-xs">Add some date ideas to get started!</p>
                </div>
              )}
            </div>

            {/* Add Item Button - Now below the list */}
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium shadow hover:opacity-90 transition text-sm"
              >
                Add Item
              </button>
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