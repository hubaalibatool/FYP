import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, User, ArrowLeft, Loader2, Camera, Eraser, Send, X, Edit3, Save } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// --- CONFIGURATION ---
const API_KEY = ""; // Leave as is. Canvas will provide the key at runtime.
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025"; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

// Global Firebase setup variables (MUST BE used)
// Note: In a real Vite/React setup, these variables are typically read from environment files, 
// but we use the global variables provided by the canvas environment for simplicity.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};

// Initialize Firebase
const app = Object.keys(firebaseConfig).length ? initializeApp(firebaseConfig) : null;
const db = app ? getFirestore(app) : null;
const auth = app ? getAuth(app) : null;

// Mock Profile Icons since actual image upload is not possible
const PROFILE_ICONS = ["🧠", "✏️", "🧑‍🔬", "🤖", "⭐", "🚀", "📐"];

// --- 1. PROFILE COMPONENT ---
const Profile = ({ isOpen, onClose, userId, profileData, updateProfile, isSaving }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localName, setLocalName] = useState(profileData.name);
    const [localIcon, setLocalIcon] = useState(profileData.icon);

    useEffect(() => {
        setLocalName(profileData.name);
        setLocalIcon(profileData.icon);
    }, [profileData]);

    const handleSave = () => {
        if (!localName.trim()) {
            // Note: Replaced alert() with console error as per instructions
            console.error("Profile name cannot be empty!");
            return;
        }
        updateProfile(localName, localIcon);
        setIsEditing(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed top-0 right-0 w-full md:w-80 h-full bg-indigo-900/90 backdrop-blur-xl shadow-2xl p-6 z-[60] flex flex-col text-white overflow-y-auto"
                    initial={{ x: "100%" }}
                    animate={{ x: "0%" }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                >
                    <div className="flex justify-between items-center mb-6 border-b border-blue-400 pb-3">
                        <h2 className="text-3xl font-extrabold text-blue-300">My Profile</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition">
                            <X className="w-6 h-6 text-white" />
                        </button>
                    </div>

                    {/* Profile Picture (Icon) */}
                    <div className="flex flex-col items-center mb-8 bg-black/20 p-4 rounded-xl shadow-inner">
                        <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-5xl font-bold mb-3 border-4 border-blue-300">
                            {profileData.icon}
                        </div>
                        
                        {/* Name and Edit/Save Button */}
                        <div className="flex items-center space-x-2 mt-2">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={localName}
                                    onChange={(e) => setLocalName(e.target.value)}
                                    className="bg-white/10 text-white text-xl font-semibold p-1 rounded text-center w-36"
                                    maxLength={20}
                                />
                            ) : (
                                <p className="text-xl font-semibold">{profileData.name}</p>
                            )}

                            <button
                                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                                className={`p-1 rounded-full transition ${isEditing ? 'bg-green-500 hover:bg-green-600' : 'bg-indigo-500 hover:bg-indigo-600'}`}
                                disabled={isSaving}
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : isEditing ? <Save className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                            </button>
                        </div>
                        
                        <p className="text-xs text-gray-400 mt-2 break-all">
                            User ID: {userId}
                        </p>
                    </div>

                    {/* DP Edit Section (Icon Selection) */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-blue-400 border-b border-blue-400 pb-1 flex items-center justify-between">
                            Edit Profile Icon
                            <span className="text-sm text-gray-400">({isEditing ? 'Select and Save' : 'Click Edit above'})</span>
                        </h3>
                        
                        <div className="flex flex-wrap gap-3 p-2 bg-black/30 rounded-lg">
                            {PROFILE_ICONS.map(icon => (
                                <motion.button
                                    key={icon}
                                    onClick={() => isEditing && setLocalIcon(icon)}
                                    className={`w-10 h-10 text-2xl rounded-full transition-all ${
                                        localIcon === icon 
                                            ? 'bg-blue-400 scale-110 shadow-lg ring-2 ring-white' 
                                            : isEditing ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-700 opacity-50 cursor-default'
                                    }`}
                                    whileHover={isEditing ? { scale: 1.15 } : {}}
                                    disabled={!isEditing}
                                >
                                    {icon}
                                </motion.button>
                            ))}
                        </div>
                        
                        <h3 className="text-xl font-bold text-blue-400 border-b border-blue-400 pb-1 mt-6">App Settings</h3>
                        <p className="text-gray-300">
                            **Writing Tool:** <span className="text-green-400">Simulated Gesture (Active)</span>
                        </p>
                        <p className="text-gray-300">
                            **Math Model:** <span className="text-green-400">Gemini-2.5-Flash</span>
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// --- 2. HANDWRITING CANVAS COMPONENT ---

const HandWritingCanvas = ({ onStopCamera }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const lastPointRef = useRef(null);
    const isDrawingRef = useRef(false);
    
    const [isLoading, setIsLoading] = useState(false);
    const [resultText, setResultText] = useState("Your math solution will appear here..."); 
    const [mode, setMode] = useState('write'); // 'write' or 'erase'

    // Load camera
    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                }
            } catch (err) {
                console.error("Error accessing camera. Please ensure camera permissions are granted.", err);
                setResultText("Error: Camera access denied or failed. Please check permissions."); 
            }
        };

        startCamera();
        
        // Setup Canvas Context
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';

        // Cleanup: Stop camera stream on component unmount
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, []);
    
    // --- CANVAS DRAWING HANDLERS (Simulating Gesture Drawing) ---

    const getCursorPosition = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        
        // Handle both mouse and touch events
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (e) => {
        e.preventDefault();
        // Drawing simulates the gesture (finger down = start of gesture)
        if (mode) { 
            isDrawingRef.current = true;
            const { x, y } = getCursorPosition(e);
            lastPointRef.current = { x, y };
        }
    };

    const draw = (e) => {
        if (!isDrawingRef.current) return;
        e.preventDefault();

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const { x, y } = getCursorPosition(e);
        
        // 'write' mode simulates Index Finger Gesture; 'erase' simulates Whole Hand Gesture
        ctx.strokeStyle = mode === 'write' ? 'white' : 'rgba(0,0,0,0.6)'; 
        ctx.lineWidth = mode === 'write' ? 8 : 40; 

        ctx.beginPath();
        ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
        ctx.lineTo(x, y);
        ctx.stroke();

        lastPointRef.current = { x, y };
    };

    const stopDrawing = () => {
        isDrawingRef.current = false;
        lastPointRef.current = null;
    };

    // --- FUNCTIONALITY HANDLERS ---

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setResultText("Canvas cleared. Ready for the next equation!"); 
    };
    
    // Function to handle the Math API call
    const solveEquation = async () => {
        setIsLoading(true);
        setResultText("Sending equation to Gemini for analysis..."); 

        try {
            const canvas = canvasRef.current;
            
            // 1. Convert Canvas to PNG Base64 Data
            const base64Image = canvas.toDataURL('image/png').split(',')[1];
            
            const systemPrompt = "You are MathVision, a specialized AI for solving handwritten equations. Analyze the provided image of handwriting, determine the mathematical question or expression, and provide a clear, step-by-step solution. Respond in Markdown using LaTeX syntax for equations ($$). For example: 'The area is $A = \pi r^2$.'";

            const userQuery = "Analyze this handwriting. What is the mathematical problem and its solution? Please show the steps.";
            
            const payload = {
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: userQuery },
                            {
                                inlineData: {
                                    mimeType: "image/png",
                                    data: base64Image
                                }
                            }
                        ]
                    }
                ],
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                }
            };
            
            // 2. Fetch with exponential backoff
            const maxRetries = 3;
            let response;
            for (let i = 0; i < maxRetries; i++) {
                try {
                    response = await fetch(API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    if (response.ok) break;
                } catch (error) {
                    console.warn(`Attempt ${i + 1} failed. Retrying in ${Math.pow(2, i)}s...`);
                    if (i < maxRetries - 1) {
                        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
                    } else {
                        throw error; 
                    }
                }
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API returned status ${response.status}: ${errorData.error.message}`);
            }

            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "Solution not available. Please try writing more clearly."; 
            
            setResultText(text);
            clearCanvas(); // Clear canvas after successful solve
            
        } catch (error) {
            console.error("Math Solving Error:", error);
            setResultText(`An error occurred while solving the problem: ${error.message}`); 
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="flex flex-col md:flex-row w-full max-w-6xl h-full bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-4 gap-4 transition-all duration-300">
            {/* Left Section: Camera Feed and Drawing Canvas */}
            <div className="flex-1 relative bg-black rounded-xl overflow-hidden shadow-inner shadow-black/50">
                <video ref={videoRef} className="w-full h-full object-cover opacity-30" autoPlay playsInline muted />
                
                {/* Overlay Canvas for Drawing */}
                <canvas 
                    ref={canvasRef} 
                    className="absolute top-0 left-0 w-full h-full cursor-crosshair"
                    width={800} // Actual pixel width for better resolution
                    height={600} // Actual pixel height
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                ></canvas>
                
                {/* Control Buttons */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4 p-3 bg-white/20 backdrop-blur-sm rounded-full shadow-lg">
                    {/* Write Mode Button - Active by default */}
                    <button 
                        onClick={() => setMode('write')} 
                        className={`p-3 rounded-full transition-all flex items-center justify-center ${
                            mode === 'write' 
                                ? 'bg-blue-600 text-white shadow-xl ring-4 ring-blue-300' 
                                : 'bg-gray-700 text-gray-300 hover:bg-blue-500'
                        }`}
                        title="Write Mode (Index Finger Gesture)"
                        disabled={isLoading}
                    >
                        <Camera className="w-6 h-6" />
                    </button>
                    
                    {/* Erase Mode Button */}
                    <button 
                        onClick={() => setMode('erase')} 
                        className={`p-3 rounded-full transition-all flex items-center justify-center ${
                            mode === 'erase' 
                                ? 'bg-red-600 text-white shadow-xl ring-4 ring-red-300' 
                                : 'bg-gray-700 text-gray-300 hover:bg-red-500'
                        }`}
                        title="Erase Mode (Whole Hand Gesture)"
                        disabled={isLoading}
                    >
                        <Eraser className="w-6 h-6" />
                    </button>
                    
                    {/* Clear Canvas Button */}
                    <button 
                        onClick={clearCanvas} 
                        className="p-3 rounded-full bg-yellow-500 text-white hover:bg-yellow-600 transition shadow-xl"
                        title="Clear Canvas"
                        disabled={isLoading}
                    >
                        <X className="w-6 h-6" />
                    </button>
                    
                    {/* Solve Equation Button */}
                    <button 
                        onClick={solveEquation} 
                        className="p-3 rounded-full bg-green-500 text-white hover:bg-green-600 transition shadow-xl flex items-center justify-center"
                        title="Solve Equation"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Right Section: Results Panel */}
            <div className="md:w-1/3 w-full flex flex-col bg-white/10 p-4 rounded-xl shadow-inner border border-white/20">
                <div className="flex justify-between items-center mb-4 border-b pb-2 border-white/30">
                    <h3 className="text-2xl font-bold text-white">Math Solution</h3>
                    <button 
                        onClick={onStopCamera} 
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center space-x-1 shadow-lg"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Stop Camera</span>
                    </button>
                </div>
                
                <div className="flex-grow overflow-y-auto p-3 bg-white/5 rounded-lg text-gray-200">
                    <p className="font-semibold mb-2">Instructions:</p>
                    <p className="text-sm italic mb-4 border-l-4 border-blue-400 pl-2">
                        **Air Writing Simulation:** Click the **Camera icon** to select the writing tool, then use your **mouse or finger on the canvas to simulate the index finger gesture** shown in the video. Click the **Eraser icon** for the 'whole hand' erase gesture. Press the **Send button** to get the solution!
                    </p>
                    
                    <div className="w-full h-px bg-white/30 my-4"></div>

                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="prose prose-invert max-w-none break-words"
                    >
                        {resultText}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

// --- 3. WRITING PAGE (Main App Layout) ---

function WritingPage() {
    const [cameraOn, setCameraOn] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    
    // Firebase State
    const [userId, setUserId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [profileData, setProfileData] = useState({ name: "Visionary Solver", icon: "🧠" });

    const symbols = ["+", "-", "×", "/", "≠", "≤", "≥", "√", "π", "∞", "∑", "∫", "x²", "±", "Δ", "θ", "Ω", "µ"];

    // 1. Auth and Profile Initialization
    useEffect(() => {
        if (!auth || !db) {
            console.error("Firebase not initialized. Cannot load user profile.");
            return;
        }

        const setupAuthAndLoadProfile = async (user) => {
            let currentUserId = user ? user.uid : crypto.randomUUID(); // Use random ID for unauthenticated
            setUserId(currentUserId);

            // Load user profile from Firestore
            const profileDocRef = doc(db, `artifacts/${appId}/users/${currentUserId}/profile/data`);
            try {
                const profileSnap = await getDoc(profileDocRef);
                if (profileSnap.exists()) {
                    setProfileData(profileSnap.data());
                }
            } catch (e) {
                console.error("Error loading profile:", e);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                await setupAuthAndLoadProfile(user);
            } else {
                try {
                    // Sign in with custom token if available, otherwise sign in anonymously
                    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                        const userCredential = await signInWithCustomToken(auth, __initial_auth_token);
                        await setupAuthAndLoadProfile(userCredential.user);
                    } else {
                        const userCredential = await signInAnonymously(auth);
                        await setupAuthAndLoadProfile(userCredential.user);
                    }
                } catch (error) {
                    console.error("Firebase Auth Error:", error);
                }
            }
        });

        return () => unsubscribe();
    }, []);
    
    // 2. Profile Update Function
    const updateProfile = useCallback(async (newName, newIcon) => {
        if (!db || !userId) {
            console.error("Database or User ID not ready.");
            return;
        }
        setIsSaving(true);
        const newData = { name: newName, icon: newIcon };
        
        try {
            const profileDocRef = doc(db, `artifacts/${appId}/users/${userId}/profile/data`);
            await setDoc(profileDocRef, newData, { merge: true });
            setProfileData(newData);
            console.log("Profile saved successfully.");
        } catch (e) {
            console.error("Error saving profile:", e);
        } finally {
            setIsSaving(false);
        }
    }, [userId]);

    // 3. Load MediaPipe for gesture simulation instructions (not the actual logic)
    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/hands.js";
        script.async = true;
        document.head.appendChild(script);

        return () => {
             document.head.removeChild(script);
        };
    }, []);

    return (
        <div className="relative flex flex-col h-screen w-screen items-center justify-start py-8 px-4 
           bg-gradient-to-br from-blue-900 to-indigo-700 overflow-hidden font-inter">

            {/* Floating Symbols */}
            {symbols.map((symbol, i) => (
                <motion.div
                    key={i}
                    className="absolute text-white text-3xl pointer-events-none select-none opacity-50"
                    initial={{
                        x: Math.random() * window.innerWidth, 
                        y: window.innerHeight + 70, 
                        opacity: 0,
                    }}
                    animate={{
                        y: -50, 
                        opacity: [0, 0.4, 0], 
                        x: [
                            Math.random() * window.innerWidth * 0.8, 
                            Math.random() * window.innerWidth * 0.8,
                        ],
                    }}
                    transition={{
                        duration: 10 + Math.random() * 10, 
                        repeat: Infinity,
                        ease: "linear",
                        delay: Math.random() * 5, 
                    }}
                >
                    {symbol}
                </motion.div>
            ))}

            {/* Header */}
            <div className="relative w-full max-w-6xl flex items-center justify-between mb-8 z-20">
                
                {/* Left: Hamburger */}
                <button 
                    onClick={() => setSidebarOpen(true)} 
                    className="bg-indigo-600 p-3 rounded-full shadow-lg shadow-indigo-400/50 hover:bg-indigo-700 transition"
                >
                    <Menu className="w-6 h-6 text-white" />
                </button>

                {/* Center: Title */}
                <div className="text-center">
                    <h1 className="text-5xl font-extrabold text-white relative">
                        Math Vision
                        <motion.span 
                            className="absolute left-0 -bottom-2 w-full h-1 bg-gradient-to-r from-blue-300 to-indigo-400"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                        ></motion.span>
                    </h1>
                </div>

                {/* Right: Profile */}
                <div className="flex items-center space-x-3">
                    <div className="text-right hidden sm:block">
                         <p className="text-sm font-semibold text-white">{profileData.name}</p>
                         <p className="text-xs text-gray-300">({profileData.icon})</p>
                    </div>
                    <button
                        onClick={() => setProfileOpen(true)}
                        className="bg-indigo-600 p-3 rounded-full shadow-lg shadow-indigo-400/50 hover:bg-indigo-700 transition"
                    >
                        <User className="w-6 h-6 text-white" />
                    </button>
                </div>
            </div>

            {/* Sidebar (History) */}
            <motion.div
                className="fixed top-0 left-0 w-64 h-full bg-black/80 backdrop-blur-md shadow-lg p-6 z-50 overflow-y-auto"
                initial={{ x: "-100%" }}
                animate={{ x: sidebarOpen ? "0%" : "-100%" }}
                transition={{ duration: 0.4 }}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-blue-300">History</h2>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="text-white hover:text-blue-300 p-1 transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <ul className="space-y-4 text-gray-300">
                    <li className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition cursor-pointer">4 + 5 = 9</li>
                    <li className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition cursor-pointer">Area of circle $\pi r^2$</li>
                    <li className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition cursor-pointer">Quadratic formula</li>
                    <li className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition cursor-pointer">10x + 5 = 25</li>
                </ul>
            </motion.div>

            {/* Main Content Area */}
            <motion.div 
                className="w-full max-w-6xl flex items-center justify-center h-[90%] md:h-[calc(100vh-120px)] relative z-10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
            >
                {!cameraOn ? (
                    <motion.div
                        className="flex flex-col items-center justify-center text-white p-10 bg-black/30 rounded-3xl shadow-2xl"
                        initial={{ y: 20 }}
                        animate={{ y: 0 }}
                        transition={{ type: "spring", stiffness: 100 }}
                    >
                        <div className="text-center mb-8 space-y-4">
                            <p className="text-3xl font-extrabold text-yellow-300">
                                Gesture Guide (Camera Required)
                            </p>
                            <p className="text-xl font-semibold">
                                <span className="bg-green-500 rounded-full p-1 mr-2 inline-block">👉</span> Use Index Finger for Writing (Simulated)
                            </p>
                            <p className="text-xl font-semibold">
                                <span className="bg-red-500 rounded-full p-1 mr-2 inline-block">🖐️</span> Use Whole Hand for Erasing (Simulated)
                            </p>
                        </div>
                        
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(99, 102, 241, 0.8)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setCameraOn(true)}
                            className="px-10 py-5 rounded-full bg-blue-600 text-2xl font-bold text-white shadow-xl shadow-blue-800/50 transition-all duration-300 flex items-center space-x-2"
                        >
                            <Camera className="w-7 h-7" />
                            <span>Start Math Vision</span>
                        </motion.button>
                    </motion.div>
                ) : (
                    <HandWritingCanvas onStopCamera={() => setCameraOn(false)} />
                )}
            </motion.div>
            
            {/* Profile Component (Overlay) */}
            <Profile 
                isOpen={profileOpen} 
                onClose={() => setProfileOpen(false)} 
                userId={userId || "Loading..."}
                profileData={profileData}
                updateProfile={updateProfile}
                isSaving={isSaving}
            />
        </div>
    );
}

// Default export for the runnable file
export default WritingPage;