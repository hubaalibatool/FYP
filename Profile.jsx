import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut, Settings, UserCircle, History } from 'lucide-react';

const Profile = ({ isOpen, onClose }) => {
  // Demo Data (Aap isay real user data se replace kar sakte hain)
  const user = {
    name: "Ali Raza",
    email: "ali.raza@mathvision.com",
    lastActive: "2 hours ago",
    equationsSaved: 42,
  };

  // Framer Motion backdrop variants
  const backdrop = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  // Framer Motion modal variants
  const modal = {
    hidden: { y: "-100vh", opacity: 0, transition: { duration: 0.2 } },
    visible: { 
      y: "0", 
      opacity: 1,
      transition: { delay: 0.1, type: "spring", stiffness: 100 } 
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
          variants={backdrop}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose} // Backdrop click hone par band ho jaye
        >
          <motion.div
            className="w-11/12 md:w-1/3 p-6 rounded-xl bg-gray-900 shadow-2xl relative"
            variants={modal}
            onClick={(e) => e.stopPropagation()} // Modal click hone par band na ho
          >
            {/* Close Button */}
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex flex-col items-center text-white">
              {/* Profile Icon */}
              <UserCircle className="w-20 h-20 text-blue-400 mb-4" />
              
              <h2 className="text-3xl font-bold mb-1">{user.name}</h2>
              <p className="text-sm text-gray-400 mb-4">{user.email}</p>
              
              {/* Stats Section */}
              <div className="flex justify-around w-full border-t border-b border-gray-700 py-3 mb-6">
                <div className="text-center">
                  <p className="text-xl font-semibold text-blue-400">{user.equationsSaved}</p>
                  <p className="text-xs text-gray-400">Equations Saved</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-semibold text-blue-400">{user.lastActive}</p>
                  <p className="text-xs text-gray-400">Last Active</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 w-full">
                <button className="flex items-center w-full p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
                  <Settings className="w-5 h-5 mr-3 text-yellow-500" />
                  Account Settings
                </button>
                <button className="flex items-center w-full p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
                  <History className="w-5 h-5 mr-3 text-green-500" />
                  View History (Sidebar Link)
                </button>
                
                {/* Logout Button */}
                <button className="flex items-center w-full p-3 bg-red-600 rounded-lg mt-4 hover:bg-red-700 transition font-semibold">
                  <LogOut className="w-5 h-5 mr-3" />
                  Log Out
                </button>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Profile;