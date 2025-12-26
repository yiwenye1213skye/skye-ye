import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateRoomId } from '../lib/utils';

const HomeView = () => {
  const navigate = useNavigate();

  const createRoom = async () => {
    const newRoomId = generateRoomId();
    
    // Create room in Supabase
    const { error } = await supabase
      .from('rooms')
      .insert([{ id: newRoomId, status: 'collecting' }]);

    if (error) {
      console.error('Error creating room:', error);
      alert('创建房间失败，请重试');
      return;
    }

    // 标记我是创建者 (本地标记即可，用于显示"开始分配"按钮)
    localStorage.setItem(`creator_${newRoomId}`, 'true');
    navigate(`/room/${newRoomId}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-0">
      <div className="text-center space-y-6 max-w-lg">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          className="inline-block p-4 rounded-full bg-amber-500/10 mb-4"
        >
          <Sparkles size={48} className="text-amber-400 animate-float" />
        </motion.div>
        
        <h1 className="font-serif text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 pb-2">
          Secret Santa
        </h1>
        
        <p className="text-gray-300 font-sans text-lg leading-relaxed max-w-md mx-auto">
          在线版<br/>
          创建一个房间，分享链接给好友。<br/>
          系统将自动为你们秘密匹配礼物对象。
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={createRoom}
          className="btn-gold px-12 py-4 rounded-full text-lg shadow-lg shadow-amber-500/20 mt-8 flex items-center gap-2 mx-auto"
        >
          创建新房间 <ArrowRight size={20} />
        </motion.button>
      </div>
    </div>
  );
};

export default HomeView;
