import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Gift, Check, Copy, Sparkles, User, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Components ---
const Card = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`glass-panel rounded-2xl p-8 w-full max-w-md mx-auto shadow-2xl relative overflow-hidden ${className}`}
  >
    <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
    {children}
  </motion.div>
);

const RoomView = () => {
  const { roomId } = useParams();
  const [participants, setParticipants] = useState([]);
  const [roomStatus, setRoomStatus] = useState('loading'); // loading, collecting, matched, error
  const [matches, setMatches] = useState(null);
  
  const [name, setName] = useState('');
  const [wish, setWish] = useState('');
  const [myIdentity, setMyIdentity] = useState(null); // { id, name }
  const [myTarget, setMyTarget] = useState(null); // { name, wish }
  
  const [isCreator, setIsCreator] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. Check identity from localStorage on mount
  useEffect(() => {
    const savedId = localStorage.getItem(`identity_${roomId}`);
    if (savedId) {
      // We will verify this ID exists in participants list later
      setMyIdentity({ id: savedId });
    }
    if (localStorage.getItem(`creator_${roomId}`)) {
      setIsCreator(true);
    }
  }, [roomId]);

  // 2. Subscribe to Room and Participants
  useEffect(() => {
    if (!roomId) return;

    // Fetch initial data
    const fetchRoom = async () => {
      const { data: room, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (error || !room) {
        setRoomStatus('error');
        return;
      }

      setRoomStatus(room.status);
      if (room.matches) setMatches(room.matches);

      const { data: parts } = await supabase
        .from('participants')
        .select('*')
        .eq('room_id', roomId);
        
      if (parts) setParticipants(parts);
    };

    fetchRoom();

    // Subscribe to changes
    const channel = supabase
      .channel(`room_${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants', filter: `room_id=eq.${roomId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setParticipants(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'DELETE') {
          setParticipants(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, (payload) => {
        setRoomStatus(payload.new.status);
        if (payload.new.matches) {
          setMatches(payload.new.matches);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // 3. Resolve Identity Detail & Match Result
  useEffect(() => {
    if (myIdentity?.id && participants.length > 0) {
      const me = participants.find(p => p.id === myIdentity.id);
      if (me) {
        setMyIdentity(me); // update with full info
      }
    }
  }, [participants, myIdentity?.id]);

  useEffect(() => {
    if (roomStatus === 'matched' && matches && myIdentity?.id) {
      const targetId = matches[myIdentity.id];
      const target = participants.find(p => p.id === targetId);
      if (target) {
        setMyTarget(target);
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#d4af37', '#ffffff'] });
      }
    }
  }, [roomStatus, matches, myIdentity, participants]);


  // Actions
  const handleJoin = async (e) => {
    e.preventDefault();
    if (!name.trim() || !wish.trim()) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('participants')
      .insert([{ room_id: roomId, name: name.trim(), wish: wish.trim() }])
      .select()
      .single();

    if (error) {
      alert('加入失败，请重试');
      setLoading(false);
      return;
    }

    setMyIdentity(data);
    localStorage.setItem(`identity_${roomId}`, data.id);
    setLoading(false);
  };

  const handleStartMatching = async () => {
    if (participants.length < 2) return;
    setLoading(true);

    // Shuffle and Match
    const ids = participants.map(p => p.id);
    const shuffled = [...ids];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    const matchMap = {};
    shuffled.forEach((id, i) => {
        const receiverId = shuffled[(i + 1) % shuffled.length];
        matchMap[id] = receiverId;
    });

    const { error } = await supabase
      .from('rooms')
      .update({ status: 'matched', matches: matchMap })
      .eq('id', roomId);

    setLoading(false);
    if (error) alert('分配失败，请重试');
  };
  
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Render ---

  if (roomStatus === 'loading') {
    return <div className="min-h-screen pt-32 text-center text-white/50">加载中...</div>;
  }

  if (roomStatus === 'error') {
    return <div className="min-h-screen pt-32 text-center text-red-400">找不到该房间</div>;
  }

  // Phase: Matched - Show Result
  if (roomStatus === 'matched') {
    return (
      <div className="min-h-screen pt-24 px-4 flex flex-col items-center">
        <Card className="text-center">
          <Sparkles size={48} className="text-amber-400 mx-auto mb-6" />
          <h2 className="font-serif text-3xl text-white mb-2">匹配完成！</h2>
          
          {myTarget ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-8 p-6 bg-gradient-to-b from-amber-500/10 to-transparent rounded-xl border border-amber-500/20"
            >
              <h3 className="text-gray-400 text-xs uppercase tracking-widest mb-2">你需要送礼给</h3>
              <h2 className="font-serif text-4xl text-amber-200 mb-4">{myTarget.name}</h2>
              <div className="h-px w-12 bg-amber-500/30 mx-auto my-4"></div>
              <p className="text-white/60 text-xs uppercase tracking-wider mb-1">愿望</p>
              <p className="text-white text-lg italic">"{myTarget.wish}"</p>
            </motion.div>
          ) : (
             myIdentity ? (
               <div className="mt-8 text-white/50">正在获取你的分配结果...</div>
             ) : (
               <div className="mt-8 text-red-300">你没有参与本轮匹配，只能围观啦。</div>
             )
          )}
        </Card>
      </div>
    );
  }

  // Phase: Collecting - Joined
  if (myIdentity) {
    return (
      <div className="min-h-screen pt-24 px-4 flex flex-col items-center">
        <Card className="text-center">
          <div className="w-16 h-16 bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-400">
            <Check size={32} />
          </div>
          <h2 className="font-serif text-2xl text-white mb-2">已加入清单</h2>
          <p className="text-white/50 text-sm mb-6">你好, {myIdentity.name}。请等待其他人加入。</p>
          
          <div className="bg-white/5 rounded-lg p-4 mb-6 text-left max-h-60 overflow-y-auto">
            <p className="text-xs text-amber-500 uppercase tracking-wider mb-3 flex justify-between">
               <span>已加入 ({participants.length})</span>
               <span className="animate-pulse">● 等待中</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {participants.map(p => (
                <span key={p.id} className="px-3 py-1 bg-white/10 border border-white/5 rounded-full text-xs text-gray-300">
                  {p.name}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={copyLink} className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-colors flex items-center justify-center gap-2">
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "已复制链接" : "复制链接分享给好友"}
            </button>
            
            {isCreator && (
               <button 
                 onClick={handleStartMatching}
                 disabled={participants.length < 2 || loading}
                 className="btn-gold w-full py-3 rounded-xl font-bold text-sm mt-4 disabled:opacity-50 disabled:grayscale"
               >
                 {loading ? "处理中..." : (participants.length < 2 ? "至少需要2人" : "开始分配礼物")}
               </button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Phase: Collecting - Not Joined
  return (
    <div className="min-h-screen pt-24 px-4 flex flex-col items-center">
      <Card>
        <div className="absolute top-4 right-4 text-xs text-white/30 font-mono">#{roomId}</div>
        <h2 className="font-serif text-3xl text-amber-100 mb-2 text-center">加入礼物交换</h2>
        <p className="text-center text-white/40 text-sm mb-8">目前已有 {participants.length} 人在等待</p>
        
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-amber-500/80 mb-1 ml-1">你的名字</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input w-full px-4 py-3 rounded-xl"
              placeholder="Your Name"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-amber-500/80 mb-1 ml-1">愿望关键词</label>
            <input
              type="text"
              value={wish}
              onChange={(e) => setWish(e.target.value)}
              className="glass-input w-full px-4 py-3 rounded-xl"
              placeholder="e.g. Books, Coffee"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={!name.trim() || !wish.trim() || loading}
            className="btn-gold w-full py-3 rounded-xl font-bold mt-4 disabled:opacity-50 disabled:grayscale"
          >
            {loading ? "加入中..." : "加入并等待分配"}
          </button>
        </form>
      </Card>
    </div>
  );
};

export default RoomView;
