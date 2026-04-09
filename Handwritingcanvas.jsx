import React, { useRef, useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';

// === ZAROORI PACKAGES KO YAHAN IMPORT KAREIN (Air Writing Ke Liye) ===
// NOTE: Jab yeh packages install ho jaayen tab in lines ko uncomment karein:
// import * as tf from '@tensorflow/tfjs';
// import * as handpose from '@tensorflow-models/handpose'; 
// ========================================================================

const HandWritingCanvas = ({ onStopCamera }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('🖐️ Ready to Write');
  const [recognizedText, setRecognizedText] = useState('X');

  // Yeh hook component load hone par chalta hai aur camera ko open karta hai.
  useEffect(() => {
    let animationFrameId;

    // Canvas Context Setup
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'red'; 

    // Camera Access Shuru Karna (Core Function)
    const startCamera = async () => {
      try {
        // navigator.mediaDevices.getUserMedia() browser se camera ki permission maangta hai
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'user', // Front camera use karne ke liye
                width: 640,
                height: 480 
            } 
        });
        
        // Stream ko video element se jorna
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            // Video load hone ke baad canvas ki size set karna
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            setStatus('✅ Camera On, Loading AI Model...');
            // TODO: Yahan ML Model Load aur Tracking loop shuru karein
            // loadModelAndStartTracking(); 
          };
        }
      } catch (err) {
        // Agar user camera access deny karta hai ya koi error aata hai
        console.error("Camera access failed:", err);
        setStatus('❌ Camera Error: Check permissions');
      }
    };

    startCamera();

    // Cleanup: Component band hone par camera band kar dena
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []); // [] ka matlab hai ki yeh sirf ek baar load hoga

  // Save/Capture Logic
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL('image/png');
    console.log("Canvas content saved as Image Data URL:", dataURL);
    
    alert("Equation Captured! Check console for image data.");
  };

  return (
    <div className="relative w-4/5 h-3/4 bg-black/60 backdrop-blur-lg rounded-xl flex items-center justify-center">
      
      {/* Back Button */}
      <button
        onClick={onStopCamera} 
        className="absolute top-3 left-3 bg-gray-800 px-3 py-1 rounded-lg flex items-center gap-1 text-white hover:bg-gray-700 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Video Element (Camera Feed) */}
      <video 
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full object-cover rounded-xl scale-x-[-1] opacity-40" 
        autoPlay 
        playsInline 
        muted
      />
      
      {/* Canvas Element (Red Writing Area) */}
      <canvas 
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full rounded-xl scale-x-[-1]" 
      />

      {/* Recognized Text / Status Display */}
      <div className="absolute bottom-4 left-4 bg-white/20 p-2 rounded-lg text-white font-mono text-lg">
        <p>Status: {status}</p>
        <p>Writing: {recognizedText}</p>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="absolute bottom-4 right-4 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition flex items-center gap-2"
      >
        <Save className="w-5 h-5" /> Save Frame (Thumbs)
      </button>

    </div>
  );
};

export default HandWritingCanvas;