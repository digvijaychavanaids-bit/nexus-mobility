import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';

const ProfileSettings = () => {
  const [name, setName] = useState(sessionStorage.getItem('name') || localStorage.getItem('name') || "");
  const [email, setEmail] = useState(sessionStorage.getItem('email') || localStorage.getItem('email') || "");
  const [avatar, setAvatar] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get('/auth/me');
        if (res.data.name) setName(res.data.name);
        if (res.data.email) setEmail(res.data.email);
        
        // Use user-specific key for avatar
        const userId = sessionStorage.getItem('user_id') || res.data.id;
        const savedAvatar = localStorage.getItem(`nexus_avatar_${userId}`);
        if (savedAvatar) setAvatar(savedAvatar);
      } catch (err) {
        console.error('Failed to load identity profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handlePhotoClick = () => fileInputRef.current?.click();

  const compressAndSaveImage = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 200;
        const MAX_HEIGHT = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setAvatar(dataUrl);
        
        // Save to user-specific key
        const userId = sessionStorage.getItem('user_id');
        if (userId) {
          localStorage.setItem(`nexus_avatar_${userId}`, dataUrl);
          // Trigger global identity sync for Topbar and other modules
          window.dispatchEvent(new Event('identityUpdate'));
        }
      };
      img.src = e.target?.result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Identity snapshot is too large (>2MB). Compression required.' });
        return;
      }
      compressAndSaveImage(file);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await api.put('/auth/me', { name });
      
      // Sync identity across all storage layers
      sessionStorage.setItem('name', name);
      localStorage.setItem('name', name);
      
      // Broadcast update to Topbar and Navigation
      window.dispatchEvent(new Event('identityUpdate'));
      
      setMessage({ type: 'success', text: 'Operational identity updated.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Registry update refused.' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <section className="bg-surface-container-low rounded-xl p-8 space-y-8 border border-on-surface/5 shadow-2xl font-body relative overflow-hidden group">
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <span className="material-symbols-outlined text-primary leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          </div>
          <h3 className="text-lg font-black text-on-surface font-headline tracking-tighter uppercase antialiased">Profile Information</h3>
        </div>
        <button 
          onClick={handleUpdate}
          disabled={loading}
          className="px-6 py-2 bg-primary text-on-surface text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? 'Propagating...' : 'Sync Registry'}
        </button>
      </div>

      {message && (
        <div className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg border ${message.type === 'success' ? 'bg-tertiary/10 border-tertiary/20 text-tertiary' : 'bg-error/10 border-error/20 text-error'}`}>
          {message.text}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
        <div className="relative group cursor-pointer transition-transform hover:scale-105 active:scale-95" onClick={handlePhotoClick}>
          <img 
            className="w-32 h-32 rounded-full object-cover ring-4 ring-surface-container-highest group-hover:ring-primary transition-all duration-300"
            src={avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuDI-goRpbTbotQIddwvjf5CLejCVFSPHbDPknglStdEgmU1heHGVagJ4Yn0ejRZE4THGHmwxrruFqaaV4ZLJDcQp1rP0Oa4d_Fs2h7z5OhrARNVEAhXdb9zNsj_984XkX_B2QWf8jAJHujqm_3oLqW-NJIM_zeSrtSVBgbOxKPw2J3NfOntXwSnhCKdjoKriPRlq_2OEpu5Lmw6uyIrAWUPBaLDBQyJf2pB1jRkSr9z0KDq-_ANma9q-mxfEp37e3121WBYsUAOBUk"} 
            alt="Profile Avatar"
          />
          <div className="absolute inset-0 bg-surface-container/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
            <span className="material-symbols-outlined text-on-surface text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        </div>
        
        <div className="flex-1 w-full space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-on-surface tracking-widest uppercase opacity-60">Full Operator Name</label>
            <input 
              className="w-full bg-surface-container-highest/50 border border-on-surface/5 rounded-lg px-4 py-4 text-sm text-on-surface focus:ring-1 focus:ring-primary focus:bg-surface-container-highest transition-all outline-none font-bold"
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-on-surface tracking-widest uppercase opacity-60">Permanent Identifier (Email)</label>
            <input 
              className="w-full bg-surface-container-highest/50 border border-on-surface/5 rounded-lg px-4 py-4 text-sm text-on-surface cursor-not-allowed opacity-80 outline-none"
              type="email" 
              value={email}
              readOnly
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileSettings;






