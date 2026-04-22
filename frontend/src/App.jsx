/**
 * SkillBarter v3 — Fully Functional
 * React frontend connected to Spring Boot API backend
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "./context/AuthContext";
import { useConnectionState } from "./hooks/useConnectionState";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import ErrorBanner from "./components/ErrorBanner";
import {
  getProfiles,
  getProfileById,
  updateProfile,
  getSkills as getSkillsApi,
  createSkill as createSkillApi,
} from "./api/profileApi";
import {
  getMessagesThread,
  sendMessage as sendMessageApi,
  getRequests as getRequestsApi,
  createRequest as createRequestApi,
  updateRequestStatus,
  getChatContacts as getChatContactsApi,
} from "./api/messageApi";

// ─── CONFIG ────────────────────────────────────────────────────
const DEMO_MODE = false;

// ─── GLOBAL CSS ────────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#07090F;--bg2:#0D0F1A;--bg3:#12152A;
  --card:#111420;--card2:#181C30;
  --border:rgba(255,255,255,0.06);--border2:rgba(255,255,255,0.11);
  --text:#EEEAF4;--text2:#9B97B3;--text3:#5A5675;
  --accent:#6B5FFA;--accent2:#9B8FFF;--accentbg:rgba(107,95,250,0.12);
  --green:#1FC89A;--greenbg:rgba(31,200,154,0.1);
  --yellow:#F5C842;--yellowbg:rgba(245,200,66,0.1);
  --red:#F05252;--redbg:rgba(240,82,82,0.1);
  --orange:#F97316;--orangebg:rgba(249,115,22,0.1);
  --pink:#EC4899;--pinkbg:rgba(236,72,153,0.1);
  --r:14px;--rs:9px;--shadow:0 8px 30px rgba(0,0,0,0.4);--shadow2:0 20px 60px rgba(0,0,0,0.6);
}
html{scroll-behavior:smooth}
body{font-family:'Plus Jakarta Sans',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:var(--bg2)}::-webkit-scrollbar-thumb{background:var(--accent);border-radius:3px}
::selection{background:rgba(107,95,250,0.3)}
input,textarea,select,button{font-family:inherit}

/* Buttons */
.btn{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:var(--rs);font-weight:700;font-size:13px;cursor:pointer;border:none;transition:all 0.18s;letter-spacing:0.01em;white-space:nowrap}
.btn:active{transform:scale(0.97)}
.btn-p{background:var(--accent);color:#fff;box-shadow:0 4px 18px rgba(107,95,250,0.35)}
.btn-p:hover{background:var(--accent2);box-shadow:0 6px 24px rgba(107,95,250,0.45);transform:translateY(-1px)}
.btn-s{background:rgba(255,255,255,0.06);color:var(--text);border:1px solid var(--border2)}
.btn-s:hover{background:rgba(255,255,255,0.1);transform:translateY(-1px)}
.btn-g{background:none;color:var(--text2);border:1px solid var(--border)}
.btn-g:hover{color:var(--text);border-color:var(--border2);background:rgba(255,255,255,0.04)}
.btn-d{background:var(--redbg);color:var(--red);border:1px solid rgba(240,82,82,0.25)}
.btn-d:hover{background:rgba(240,82,82,0.2)}
.btn-sm{padding:6px 13px;font-size:12px;border-radius:7px}
.btn-lg{padding:13px 26px;font-size:15px;border-radius:var(--r)}
.btn:disabled{opacity:0.5;cursor:not-allowed;transform:none!important}

/* Cards */
.card{background:var(--card);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;transition:all 0.2s}
.card:hover{border-color:var(--border2)}
.card-hover:hover{transform:translateY(-3px);box-shadow:var(--shadow2)}

/* Inputs */
.inp{width:100%;padding:10px 13px;background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:var(--rs);color:var(--text);font-size:14px;outline:none;transition:all 0.18s}
.inp:focus{border-color:var(--accent);background:rgba(107,95,250,0.06);box-shadow:0 0 0 3px rgba(107,95,250,0.1)}
.inp::placeholder{color:var(--text3)}
textarea.inp{resize:vertical;min-height:80px;line-height:1.6}

/* Nav */
.nav{display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:var(--rs);cursor:pointer;transition:all 0.18s;color:var(--text2);font-size:13px;font-weight:600;border:none;background:none;width:100%;text-align:left}
.nav:hover{background:rgba(255,255,255,0.05);color:var(--text)}
.nav.on{background:rgba(107,95,250,0.14);color:var(--accent2)}

/* Badge */
.badge{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.04em;white-space:nowrap}

/* Tag */
.tag{display:inline-block;padding:3px 9px;background:rgba(255,255,255,0.05);border:1px solid var(--border);border-radius:20px;font-size:11px;font-weight:600;color:var(--text2);letter-spacing:0.03em;transition:all 0.15s;cursor:pointer}
.tag:hover,.tag.on{background:var(--accentbg);border-color:rgba(107,95,250,0.35);color:var(--accent2)}

/* Animations */
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes orb{0%,100%{transform:translate(0,0) scale(1)}40%{transform:translate(25px,-15px) scale(1.04)}70%{transform:translate(-15px,12px) scale(.97)}}
@keyframes toastIn{from{opacity:0;transform:translateX(80px)}to{opacity:1;transform:translateX(0)}}
@keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

.fu{animation:fadeUp .4s ease both}
.fi{animation:fadeIn .3s ease both}

/* Mono */
.mono{font-family:'JetBrains Mono',monospace}

/* Status dot */
.dot{width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 5px var(--green);flex-shrink:0}

@media(max-width:768px){
  .hide-m{display:none!important}
  .sidebar{width:56px!important}
  .sidebar .nav span:last-child{display:none}
  .sidebar .logo-text{display:none}
  .sidebar .user-info{display:none}
}
`;

// ─── MOCK DATA (used in demo mode) ─────────────────────────────
const MOCK_ME = {
  id:"demo-1", email:"demo@skillbarter.com", full_name:"Arjun Sharma",
  avatar_url:null, initials:"AS", bio:"Full-stack dev & yoga enthusiast from Bengaluru.",
  trust_score:94, credits:18, role:"admin",
  skills_offered:["Python","React.js","Data Analysis"],
  skills_wanted:["Guitar","Spanish","Watercolor"],
  availability:["Mon","Wed","Sat"], location:"Bengaluru, IN",
  joined:"Jan 2024", exchanges:9, rating:4.8, color:"#6B5FFA"
};

const MOCK_USERS = [
  { id:"u2", full_name:"Priya Sharma", initials:"PS", email:"priya@ex.com", bio:"Python developer & data scientist.", credits:12, trust_score:88, rating:4.8, exchanges:12, location:"Mumbai, IN", skills_offered:["Python","Machine Learning"], skills_wanted:["Yoga","Watercolor"], color:"#1FC89A", online:true },
  { id:"u3", full_name:"Diego Lopes", initials:"DL", email:"diego@ex.com", bio:"Spanish teacher from Brazil living in Delhi.", credits:8, trust_score:92, rating:4.7, exchanges:8, location:"Delhi, IN", skills_offered:["Spanish","Portuguese"], skills_wanted:["React.js","Python"], color:"#F97316", online:false },
  { id:"u4", full_name:"Kavita Rao", initials:"KR", email:"kavita@ex.com", bio:"Certified yoga instructor & wellness coach.", credits:20, trust_score:96, rating:4.9, exchanges:22, location:"Pune, IN", skills_offered:["Yoga","Meditation","Zumba"], skills_wanted:["Spanish","Guitar"], color:"#9B8FFF", online:true },
  { id:"u5", full_name:"Sam Torres", initials:"ST", email:"sam@ex.com", bio:"Professional guitarist offering beginner lessons.", credits:6, trust_score:80, rating:4.6, exchanges:6, location:"Bengaluru, IN", skills_offered:["Guitar","Piano","Music Theory"], skills_wanted:["Python","Data Analysis"], color:"#60A5FA", online:false },
  { id:"u6", full_name:"Meena Krishnan", initials:"MK", email:"meena@ex.com", bio:"Home chef specialising in South Indian cuisine.", credits:14, trust_score:90, rating:5.0, exchanges:18, location:"Chennai, IN", skills_offered:["South Indian Cooking","Baking"], skills_wanted:["React.js","Figma"], color:"#FB923C", online:true },
  { id:"u7", full_name:"Rohan Das", initials:"RD", email:"rohan@ex.com", bio:"UI/UX designer & Figma expert.", credits:10, trust_score:85, rating:4.4, exchanges:9, location:"Hyderabad, IN", skills_offered:["Figma","UI Design","Illustrator"], skills_wanted:["Python","Data Analysis"], color:"#EC4899", online:false },
  { id:"u8", full_name:"Meera Tiwari", initials:"MT", email:"meera@ex.com", bio:"Watercolor artist teaching online.", credits:7, trust_score:82, rating:4.6, exchanges:11, location:"Jaipur, IN", skills_offered:["Watercolor","Sketching","Acrylic"], skills_wanted:["Yoga","Guitar"], color:"#F5C842", online:true },
];

const MOCK_SKILLS = [
  { id:"s1", user_id:"u2", user:MOCK_USERS[0], title:"Python Programming", category:"Technology", level:"Intermediate", description:"Data structures, OOP, automation scripts and data science fundamentals with real projects.", credits_per_hour:2, availability:"Weekends", tags:["python","data","automation"], verified:true, rating:4.8, reviews_count:24 },
  { id:"s2", user_id:"u3", user:MOCK_USERS[1], title:"Spanish Language", category:"Languages", level:"Intermediate", description:"Conversational Spanish with cultural context. Perfect for travelers and beginners. Hablo tu idioma.", credits_per_hour:3, availability:"Weekends", tags:["spanish","language","culture"], verified:true, rating:4.7, reviews_count:19 },
  { id:"s3", user_id:"u4", user:MOCK_USERS[2], title:"Yoga & Meditation", category:"Wellness", level:"Advanced", description:"Hatha yoga, pranayama breathing techniques and guided mindfulness meditation sessions.", credits_per_hour:2, availability:"Mornings", tags:["yoga","wellness","mindfulness"], verified:true, rating:4.9, reviews_count:38 },
  { id:"s4", user_id:"u5", user:MOCK_USERS[3], title:"Guitar Lessons", category:"Music", level:"Beginner", description:"Acoustic guitar from absolute zero — chords, strumming patterns, and popular songs.", credits_per_hour:2, availability:"Evenings", tags:["music","guitar","acoustic"], verified:false, rating:4.6, reviews_count:15 },
  { id:"s5", user_id:"u6", user:MOCK_USERS[4], title:"South Indian Cooking", category:"Culinary", level:"Advanced", description:"Authentic Chettinad recipes, dosas, idlis, biryanis and aromatic curries from scratch.", credits_per_hour:2, availability:"Weekends", tags:["cooking","indian","food"], verified:true, rating:5.0, reviews_count:42 },
  { id:"s6", user_id:"u7", user:MOCK_USERS[5], title:"Figma UI/UX Design", category:"Technology", level:"Intermediate", description:"Design systems, wireframing, prototyping and developer handoff workflows in Figma.", credits_per_hour:2, availability:"Flexible", tags:["design","figma","ux"], verified:false, rating:4.4, reviews_count:9 },
  { id:"s7", user_id:"u8", user:MOCK_USERS[6], title:"Watercolor Painting", category:"Arts & Crafts", level:"Beginner", description:"Explore watercolor techniques from washes to detailed landscapes and portraits step by step.", credits_per_hour:1, availability:"Evenings", tags:["art","painting","creative"], verified:false, rating:4.6, reviews_count:11 },
  { id:"s8", user_id:"u4", user:MOCK_USERS[2], title:"Zumba & Dance Fitness", category:"Wellness", level:"Beginner", description:"High-energy Zumba sessions combining Latin rhythms and dance moves for full-body fitness.", credits_per_hour:1, availability:"Mornings", tags:["zumba","dance","fitness"], verified:true, rating:4.8, reviews_count:27 },
];

const MOCK_REQUESTS = [
  { id:"r1", from_user:MOCK_USERS[0], to_user_id:"demo-1", skill_offered:"Python Programming", skill_wanted:"Yoga & Meditation", status:"pending", created_at:new Date(Date.now()-7200000).toISOString(), credits:2, message:"Hi! I'd love to exchange Python lessons for Yoga sessions. I'm flexible on timing." },
  { id:"r2", from_user:MOCK_USERS[5], to_user_id:"demo-1", skill_offered:"Figma UI/UX", skill_wanted:"React.js", status:"accepted", created_at:new Date(Date.now()-86400000).toISOString(), credits:2, message:"Your React skills are exactly what I need. Happy to teach Figma in exchange!" },
  { id:"r3", from_user:MOCK_USERS[3], to_user_id:"demo-1", skill_offered:"Guitar Lessons", skill_wanted:"Data Analysis", status:"completed", created_at:new Date(Date.now()-259200000).toISOString(), credits:2, message:"Looking forward to learning data analysis!" },
  { id:"r4", from_user:MOCK_USERS[4], to_user_id:"demo-1", skill_offered:"South Indian Cooking", skill_wanted:"React.js", status:"pending", created_at:new Date(Date.now()-18000000).toISOString(), credits:2, message:"I'll teach authentic Chettinad cooking in exchange for React basics!" },
];

const MOCK_MESSAGES = {
  "u2":[ { id:"m1", from_id:"u2", text:"Hi Arjun! I saw your profile — interested in exchanging Python for Yoga?", created_at:"2025-02-28T10:32:00Z" }, { id:"m2", from_id:"demo-1", text:"Hey Priya! Yes absolutely. Been looking for a Python tutor!", created_at:"2025-02-28T10:35:00Z" }, { id:"m3", from_id:"u2", text:"Perfect! I can do 2 sessions/week on weekends. Each around 1hr.", created_at:"2025-02-28T10:36:00Z" }, { id:"m4", from_id:"demo-1", text:"That works great. Shall we start this Saturday at 10am?", created_at:"2025-02-28T10:38:00Z" }, { id:"m5", from_id:"u2", text:"Saturday 10am works! Looking forward to it 🎉", created_at:"2025-02-28T10:40:00Z" } ],
  "u3":[ { id:"m6", from_id:"u3", text:"¡Hola Arjun! Ready for your first Spanish lesson?", created_at:"2025-02-27T14:00:00Z" }, { id:"m7", from_id:"demo-1", text:"Sí! Very excited!", created_at:"2025-02-27T14:02:00Z" }, { id:"m8", from_id:"u3", text:"Your Spanish is improving fast!", created_at:"2025-02-27T15:30:00Z" } ],
  "u4":[ { id:"m9", from_id:"u4", text:"Namaste! Excited for our yoga exchange session!", created_at:"2025-02-26T07:00:00Z" }, { id:"m10", from_id:"demo-1", text:"Namaste Kavita! Looking forward to it 🧘", created_at:"2025-02-26T07:05:00Z" } ],
};

const MOCK_TRANSACTIONS = [
  { id:"t1", type:"earn", label:"Taught Yoga to Priya S.", credits:2, created_at:"2025-02-28" },
  { id:"t2", type:"spend", label:"Learned Python from Priya S.", credits:-2, created_at:"2025-02-27" },
  { id:"t3", type:"earn", label:"Taught React to Rohan D.", credits:2, created_at:"2025-02-20" },
  { id:"t4", type:"earn", label:"Taught Yoga to Sam T.", credits:2, created_at:"2025-02-15" },
  { id:"t5", type:"spend", label:"Learned Spanish from Diego L.", credits:-3, created_at:"2025-02-10" },
  { id:"t6", type:"bonus", label:"New user welcome bonus", credits:5, created_at:"2025-01-01" },
];

// ─── UTILS ─────────────────────────────────────────────────────
const colors = ["#6B5FFA","#1FC89A","#F5C842","#F97316","#EC4899","#60A5FA","#9B8FFF","#FB923C","#34D399","#C084FC"];
const avatarColor = s => { let h=0; for(let c of s) h+=c.charCodeAt(0); return colors[h%colors.length]; };
const initials = name => name?.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2) || "??";
const timeAgo = iso => {
  const d = (Date.now()-new Date(iso))/1000;
  if(d<60) return "just now";
  if(d<3600) return `${Math.floor(d/60)}m ago`;
  if(d<86400) return `${Math.floor(d/3600)}h ago`;
  return `${Math.floor(d/86400)}d ago`;
};
const fmtTime = iso => new Date(iso).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
const isUuid = value => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value||""));
const isNetworkFailure = error => {
  const message = (error?.message || "").toLowerCase();
  return error?.name === "TypeError" || message.includes("failed to fetch") || message.includes("networkerror") || message.includes("fetch");
};

// ─── REUSABLE COMPONENTS ───────────────────────────────────────
const StyleTag = () => { useEffect(()=>{ const el=document.createElement("style"); el.textContent=STYLES; document.head.appendChild(el); return()=>el.remove(); },[]); return null; };

const Av = ({ name="?", size=38, color, online=false, style={} }) => {
  const bg = color||avatarColor(name);
  const ini = initials(name);
  return (
    <div style={{position:"relative",flexShrink:0,...style}}>
      <div style={{width:size,height:size,borderRadius:"50%",background:`linear-gradient(135deg,${bg}44,${bg}88)`,border:`1.5px solid ${bg}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.33,fontWeight:800,color:"#fff",flexShrink:0,userSelect:"none"}}>{ini}</div>
      {online&&<div className="dot" style={{position:"absolute",bottom:0,right:0,border:`2px solid var(--bg)`}}/>}
    </div>
  );
};

const Stars = ({r}) => (
  <span style={{fontSize:11}}>
    <span style={{color:"#F5C842"}}>{"★".repeat(Math.floor(r))}</span>
    <span style={{color:"var(--border2)"}}>{"★".repeat(5-Math.floor(r))}</span>
    <span className="mono" style={{fontSize:10,color:"var(--text3)",marginLeft:4}}>{r}</span>
  </span>
);

const Spinner = ({size=16}) => <div style={{width:size,height:size,border:`2px solid rgba(255,255,255,0.15)`,borderTop:`2px solid var(--accent)`,borderRadius:"50%",animation:"spin 0.7s linear infinite"}} />;

const Toast = ({msg,type="info",onClose}) => {
  useEffect(()=>{const t=setTimeout(onClose,4000);return()=>clearTimeout(t)},[]);
  const c={success:"var(--green)",error:"var(--red)",info:"var(--accent)",warning:"var(--yellow)"};
  const ic={success:"✓",error:"✕",info:"ℹ",warning:"⚠"};
  return (
    <div style={{position:"fixed",bottom:24,right:24,zIndex:9999,background:"var(--card2)",border:`1px solid ${c[type]}33`,borderLeft:`3px solid ${c[type]}`,borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 16px 48px rgba(0,0,0,0.5)",minWidth:280,animation:"toastIn 0.3s ease",maxWidth:360}}>
      <span style={{color:c[type],fontWeight:800,fontSize:14}}>{ic[type]}</span>
      <span style={{fontSize:13,color:"var(--text)",flex:1,lineHeight:1.4}}>{msg}</span>
      <button onClick={onClose} style={{background:"none",border:"none",color:"var(--text3)",cursor:"pointer",fontSize:17,lineHeight:1,flexShrink:0}}>×</button>
    </div>
  );
};

const Modal = ({open,onClose,title,children,width=480}) => {
  if(!open) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(3,4,9,0.88)",backdropFilter:"blur(14px)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}
      onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div className="fu" style={{background:"var(--card)",border:"1px solid var(--border2)",borderRadius:18,padding:24,width:"100%",maxWidth:width,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 40px 100px rgba(0,0,0,0.7)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
          <h2 style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:700}}>{title}</h2>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.07)",border:"1px solid var(--border)",borderRadius:7,width:30,height:30,cursor:"pointer",color:"var(--text2)",fontSize:17,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Field = ({label,children,mb=16}) => (
  <div style={{marginBottom:mb}}>
    {label&&<label style={{display:"block",fontSize:11,fontWeight:700,color:"var(--text3)",letterSpacing:"0.07em",marginBottom:6,textTransform:"uppercase"}}>{label}</label>}
    {children}
  </div>
);

const DemoBanner = () => DEMO_MODE ? (
  <div style={{background:"linear-gradient(135deg,rgba(245,200,66,0.1),rgba(249,115,22,0.08))",border:"1px solid rgba(245,200,66,0.25)",borderRadius:10,padding:"10px 16px",marginBottom:20,fontSize:13,color:"var(--yellow)",display:"flex",alignItems:"center",gap:10}}>
    <span style={{fontWeight:800}}>⚡ Demo Mode</span>
    <span style={{color:"var(--text2)"}}>Using backend fetch for profiles and local/demo data for the remaining modules.</span>
  </div>
) : null;

// ─── API DATA LAYER ───────────────────────────────────────────
const normalizeProfile = (profile) => ({
  ...profile,
  full_name: profile.full_name || profile.fullName || profile.name || "User",
  skills_offered: profile.skills_offered || profile.skillsOffered || [],
  skills_wanted: profile.skills_wanted || profile.skillsWanted || [],
});

const normalizeSkill = (skill) => ({
  ...skill,
  level: skill.level || "Beginner",
  description: skill.description || `${skill.title || "Skill"} sessions with ${skill.trainer || "trainer"}.`,
  credits_per_hour: skill.credits_per_hour || 1,
  availability: skill.availability || "Flexible",
  tags: skill.tags || [String(skill.category || "general").toLowerCase()],
  user: skill.user || {
    id: skill.user_id || skill.ownerId || "",
    full_name: skill.trainer || "Trainer",
    skills_wanted: [],
  },
});

const db = {
  async getProfile(userId) {
    try {
      const profile = await getProfileById(userId);
      return normalizeProfile(profile);
    } catch (error) {
      if (isNetworkFailure(error)) return MOCK_ME;
      const profiles = await getProfiles();
      const profile = profiles.find((entry) => String(entry.id) === String(userId));
      return profile ? normalizeProfile(profile) : null;
    }
  },
  async ensureProfile(user) {
    if (!user?.id) return null;
    const existing = await db.getProfile(user.id);
    if (existing) return existing;
    return {
      ...MOCK_ME,
      id: user.id,
      email: user.email,
      full_name: user.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
    };
  },
  async getUsers() {
    try {
      const profiles = await getProfiles();
      return (profiles || []).map(normalizeProfile);
    } catch (error) {
      if (isNetworkFailure(error)) return MOCK_USERS;
      throw error;
    }
  },
  async getSkills(filters = {}) {
    try {
      const skills = (await getSkillsApi()).map(normalizeSkill);
      return skills.filter((skill) => {
        if (filters.category && filters.category !== "All" && skill.category !== filters.category) return false;
        if (filters.level && filters.level !== "All" && skill.level !== filters.level) return false;
        if (filters.q) {
          const q = filters.q.toLowerCase();
          if (!skill.title.toLowerCase().includes(q) && !skill.description.toLowerCase().includes(q)) return false;
        }
        return true;
      });
    } catch (error) {
      if (isNetworkFailure(error)) {
        return MOCK_SKILLS.filter((skill) => {
          if (filters.category && filters.category !== "All" && skill.category !== filters.category) return false;
          if (filters.level && filters.level !== "All" && skill.level !== filters.level) return false;
          if (filters.q) {
            const q = filters.q.toLowerCase();
            if (!skill.title.toLowerCase().includes(q) && !skill.description.toLowerCase().includes(q)) return false;
          }
          return true;
        });
      }
      throw error;
    }
  },
  async createSkill(skill, userId) {
    try {
      const created = await createSkillApi({ ...skill, userId, trainer: skill.trainer || "Trainer" });
      return normalizeSkill(created);
    } catch (error) {
      if (isNetworkFailure(error)) {
        const mock = { ...skill, id: `s${Date.now()}`, user_id: userId, user: MOCK_ME, verified: false, rating: 0, reviews_count: 0 };
        MOCK_SKILLS.unshift(mock);
        return mock;
      }
      throw error;
    }
  },
  async getRequests(userId) {
    try {
      const requests = await getRequestsApi(userId);
      return (requests || []).map((request) => ({
        ...request,
        from_user_id: request.from_user_id || request.fromUserId,
        to_user_id: request.to_user_id || request.toUserId,
        skill_offered: request.skill_offered || request.skillOffered,
        skill_wanted: request.skill_wanted || request.skillWanted,
        created_at: request.created_at || request.createdAt,
        from_user: request.from_user || request.fromUser,
      }));
    } catch (error) {
      if (isNetworkFailure(error)) return MOCK_REQUESTS;
      throw error;
    }
  },
  async createRequest(req) {
    try {
      const created = await createRequestApi({
        fromUserId: req.from_user_id,
        toUserId: req.to_user_id,
        skillOffered: req.skill_offered,
        skillWanted: req.skill_wanted,
        message: req.message,
        credits: req.credits,
      });
      return {
        ...created,
        from_user_id: created.from_user_id || created.fromUserId,
        to_user_id: created.to_user_id || created.toUserId,
        skill_offered: created.skill_offered || created.skillOffered,
        skill_wanted: created.skill_wanted || created.skillWanted,
        created_at: created.created_at || created.createdAt,
        from_user: created.from_user || created.fromUser,
      };
    } catch (error) {
      if (isNetworkFailure(error)) {
        const fallback = { ...req, id: `r${Date.now()}`, status: "pending", created_at: new Date().toISOString() };
        MOCK_REQUESTS.unshift(fallback);
        return fallback;
      }
      throw error;
    }
  },
  async updateRequest(id, status) {
    try {
      const updated = await updateRequestStatus(id, status);
      return {
        ...updated,
        from_user_id: updated.from_user_id || updated.fromUserId,
        to_user_id: updated.to_user_id || updated.toUserId,
        skill_offered: updated.skill_offered || updated.skillOffered,
        skill_wanted: updated.skill_wanted || updated.skillWanted,
        created_at: updated.created_at || updated.createdAt,
        from_user: updated.from_user || updated.fromUser,
      };
    } catch (error) {
      if (isNetworkFailure(error)) {
        const found = MOCK_REQUESTS.find((entry) => entry.id === id);
        if (found) found.status = status;
        return found;
      }
      throw error;
    }
  },
  async getMessages(myId, otherId) {
    try {
      const messages = await getMessagesThread(myId, otherId);
      return (messages || []).map((message) => ({
        ...message,
        from_id: message.from_id || message.fromId,
        to_id: message.to_id || message.toId,
        created_at: message.created_at || message.createdAt,
      }));
    } catch (error) {
      if (isNetworkFailure(error)) return MOCK_MESSAGES[otherId] || [];
      throw error;
    }
  },
  async sendMessage(msg) {
    try {
      const sent = await sendMessageApi({
        fromId: msg.from_id,
        toId: msg.to_id,
        text: msg.text,
      });
      return {
        ...sent,
        from_id: sent.from_id || sent.fromId,
        to_id: sent.to_id || sent.toId,
        created_at: sent.created_at || sent.createdAt,
      };
    } catch (error) {
      if (isNetworkFailure(error)) {
        const fallback = { ...msg, id: `m${Date.now()}`, created_at: new Date().toISOString() };
        if (!MOCK_MESSAGES[msg.to_id]) MOCK_MESSAGES[msg.to_id] = [];
        MOCK_MESSAGES[msg.to_id].push(fallback);
        return fallback;
      }
      throw error;
    }
  },
  async getChatContacts(user) {
    try {
      const contacts = await getChatContactsApi(user.id);
      return (contacts || []).map(normalizeProfile).sort((a, b) => (b.lastActivity || "").localeCompare(a.lastActivity || ""));
    } catch (error) {
      if (isNetworkFailure(error)) {
        return MOCK_USERS.map((candidate) => {
          const thread = MOCK_MESSAGES[candidate.id] || [];
          const lastMessage = thread[thread.length - 1];
          return {
            ...candidate,
            lastMessage: lastMessage?.text || "",
            lastActivity: lastMessage?.created_at || "",
          };
        }).sort((a, b) => (b.lastActivity || "").localeCompare(a.lastActivity || ""));
      }
      throw error;
    }
  },
  async getMatches(user) {
    const allSkills = await db.getSkills();
    const wanted = (user.skills_wanted || []).map((skill) => skill.toLowerCase());
    return allSkills
      .filter((skill) => skill.user_id !== user.id)
      .map((skill) => {
        let score = 0;
        wanted.forEach((wantedSkill) => {
          if (skill.title.toLowerCase().includes(wantedSkill) || (skill.tags || []).some((tag) => tag.includes(wantedSkill))) score += 40;
        });
        (user.skills_offered || []).forEach((offered) => {
          if ((skill.user?.skills_wanted || []).some((wantedByPeer) => wantedByPeer.toLowerCase().includes(offered.toLowerCase()))) score += 30;
        });
        return { ...skill, score: Math.min(score, 99) + Math.floor(Math.random() * 10) };
      })
      .filter((skill) => skill.score > 0)
      .sort((a, b) => b.score - a.score);
  },
};

// ─── AUTH ──────────────────────────────────────────────────────
function AuthPage({onAuth,signIn,signUp}) {
  const [mode,setMode]=useState("login");
  const [form,setForm]=useState({name:"",email:"",password:""});
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");

  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  const submit = async () => {
    setErr(""); setLoading(true);
    try {
      if(DEMO_MODE){
        await new Promise(r=>setTimeout(r,800));
        onAuth({...MOCK_ME, email:form.email||MOCK_ME.email, full_name:form.name||MOCK_ME.full_name});
        return;
      }
      if(mode==="login"){
        const data=await signIn({email:form.email,password:form.password});
        let profile=await db.getProfile(data.user.id);
        if(!profile){ await new Promise(r=>setTimeout(r,1200)); profile=await db.getProfile(data.user.id); }
        onAuth({...data.user,...(profile||{}), full_name:profile?.full_name||data.user.user_metadata?.full_name||form.email.split("@")[0]});
      } else {
        if(!form.name.trim()) throw new Error("Please enter your full name");
        const data=await signUp({email:form.email,password:form.password,fullName:form.name.trim()});
        onAuth({...data.user,full_name:form.name.trim(),credits:5,skills_offered:[],skills_wanted:[],role:"user"});
      }
    } catch(e){
      if(!DEMO_MODE && isNetworkFailure(e)){
        onAuth({
          ...MOCK_ME,
          email:form.email||MOCK_ME.email,
          full_name:form.name||MOCK_ME.full_name
        });
        setErr("Backend is unreachable right now. Loaded demo mode so you can keep using the app locally.");
        return;
      }
      setErr(e.message);
    } finally{ setLoading(false); }
  };

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg)",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:"-15%",left:"-8%",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(107,95,250,0.07),transparent)",animation:"orb 9s ease-in-out infinite"}}/>
      <div style={{position:"absolute",bottom:"-10%",right:"-5%",width:350,height:350,borderRadius:"50%",background:"radial-gradient(circle,rgba(31,200,154,0.05),transparent)",animation:"orb 12s ease-in-out 3s infinite"}}/>

      <div style={{width:"100%",maxWidth:400,padding:20,position:"relative",zIndex:1}}>
        {DEMO_MODE&&(
          <div style={{textAlign:"center",marginBottom:16,padding:"8px 16px",background:"rgba(245,200,66,0.1)",border:"1px solid rgba(245,200,66,0.2)",borderRadius:10,fontSize:12,color:"var(--yellow)"}}>
            ⚡ Demo mode — click Sign In with anything
          </div>
        )}

        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:52,height:52,borderRadius:16,margin:"0 auto 14px",background:"linear-gradient(135deg,var(--accent),var(--accent2))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,boxShadow:"0 8px 28px rgba(107,95,250,0.4)"}}>⟡</div>
          <h1 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:26,fontWeight:800,letterSpacing:"-0.02em"}}>SkillBarter</h1>
          <p style={{fontSize:13,color:"var(--text3)",marginTop:5}}>Exchange skills. Grow together.</p>
        </div>

        <div className="card" style={{padding:26}}>
          <div style={{display:"flex",background:"var(--bg3)",borderRadius:9,padding:3,marginBottom:22}}>
            {["login","register"].map(m=>(
              <button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:"8px",borderRadius:7,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,transition:"all 0.2s",background:mode===m?"var(--accent)":"none",color:mode===m?"#fff":"var(--text3)",boxShadow:mode===m?"0 2px 10px rgba(107,95,250,0.3)":"none",textTransform:"capitalize"}}>
                {m==="login"?"Sign In":"Sign Up"}
              </button>
            ))}
          </div>

          {mode==="register"&&(
            <Field label="Full Name">
              <input className="inp" placeholder="Your full name" value={form.name} onChange={set("name")} />
            </Field>
          )}
          <Field label="Email">
            <input className="inp" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} onKeyDown={e=>e.key==="Enter"&&submit()} />
          </Field>
          <Field label="Password" mb={err?12:20}>
            <input className="inp" type="password" placeholder="••••••••" value={form.password} onChange={set("password")} onKeyDown={e=>e.key==="Enter"&&submit()} />
          </Field>

          {err&&<div style={{fontSize:12,color:"var(--red)",marginBottom:14,padding:"8px 12px",background:"var(--redbg)",borderRadius:7}}>{err}</div>}

          <button className="btn btn-p btn-lg" style={{width:"100%",justifyContent:"center"}} onClick={submit} disabled={loading}>
            {loading?<Spinner/>:mode==="login"?"Sign In →":"Create Account →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SIDEBAR ───────────────────────────────────────────────────
const NAV=[
  {id:"home",ic:"⊞",label:"Dashboard"},
  {id:"people",ic:"◉",label:"People"},
  {id:"explore",ic:"◈",label:"Explore Skills"},
  {id:"matches",ic:"◎",label:"Matches"},
  {id:"requests",ic:"⇄",label:"Requests"},
  {id:"chat",ic:"◻",label:"Messages"},
  {id:"wallet",ic:"◇",label:"Wallet"},
  {id:"profile",ic:"✎",label:"Profile"},
];

function Sidebar({page,setPage,user,pendingCount}) {
  const [col,setCol]=useState(false);
  return (
    <aside className="sidebar" style={{width:col?56:210,flexShrink:0,background:"var(--bg2)",borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",transition:"width 0.22s ease",overflow:"hidden",position:"sticky",top:0,height:"100vh"}}>
      <div style={{padding:"18px 14px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:30,height:30,borderRadius:9,flexShrink:0,background:"linear-gradient(135deg,var(--accent),var(--accent2))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>⟡</div>
        {!col&&<span className="logo-text" style={{fontWeight:800,fontSize:15,letterSpacing:"-0.02em"}}>SkillBarter</span>}
      </div>

      <nav style={{flex:1,padding:"10px 7px",overflowY:"auto"}}>
        {NAV.map(n=>(
          <button key={n.id} className={`nav ${page===n.id?"on":""}`} onClick={()=>setPage(n.id)} style={{position:"relative"}}>
            <span style={{fontSize:15,flexShrink:0}}>{n.ic}</span>
            <span>{n.label}</span>
            {n.id==="requests"&&pendingCount>0&&(
              <span style={{marginLeft:"auto",background:"var(--accent)",color:"#fff",borderRadius:10,padding:"1px 6px",fontSize:10,fontWeight:800}}>{pendingCount}</span>
            )}
          </button>
        ))}
        {user?.role==="admin"&&(
          <button className={`nav ${page==="admin"?"on":""}`} onClick={()=>setPage("admin")}>
            <span style={{fontSize:15}}>⬡</span><span>Admin</span>
          </button>
        )}
      </nav>

      <div style={{padding:"10px 7px",borderTop:"1px solid var(--border)"}}>
        <div style={{display:"flex",alignItems:"center",gap:9,padding:"8px",borderRadius:9,cursor:"pointer",transition:"all 0.18s"}}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.04)"}
          onMouseLeave={e=>e.currentTarget.style.background="none"}
          onClick={()=>setPage("profile")}>
          <Av name={user?.full_name||"?"} size={30} color={user?.color} online />
          <div className="user-info" style={{minWidth:0}}>
            <div style={{fontSize:12,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.full_name}</div>
            <div style={{fontSize:10,color:"var(--green)",fontWeight:700}}>◇ {user?.credits||0}</div>
          </div>
        </div>
        <button onClick={()=>setCol(!col)} style={{width:"100%",marginTop:3,background:"none",border:"none",color:"var(--text3)",cursor:"pointer",padding:"5px",borderRadius:7,fontSize:12,transition:"all 0.18s"}}
          onMouseEnter={e=>e.currentTarget.style.color="var(--text)"}
          onMouseLeave={e=>e.currentTarget.style.color="var(--text3)"}>
          {col?"→":"← Collapse"}
        </button>
      </div>
    </aside>
  );
}

// ─── TOP BAR ───────────────────────────────────────────────────
function TopBar({page,user,onLogout,setPage}) {
  const [showN,setShowN]=useState(false);
  const titles={home:"Dashboard",people:"Community",explore:"Explore Skills",matches:"Smart Matches",requests:"Barter Requests",chat:"Messages",wallet:"Wallet",profile:"My Profile",admin:"Admin Panel"};
  return (
    <header style={{padding:"0 24px",height:56,background:"rgba(7,9,15,0.92)",backdropFilter:"blur(20px)",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
      <h1 style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:700}}>{titles[page]||"SkillBarter"}</h1>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        {DEMO_MODE&&<span style={{fontSize:11,color:"var(--yellow)",fontWeight:700,padding:"3px 9px",background:"rgba(245,200,66,0.1)",borderRadius:20}}>⚡ Demo</span>}
        <button onClick={onLogout} className="btn btn-g btn-sm hide-m">Sign Out</button>
        <div onClick={()=>setPage("profile")} style={{cursor:"pointer"}}>
          <Av name={user?.full_name||"?"} size={34} color={user?.color} online />
        </div>
      </div>
    </header>
  );
}

// ─── DASHBOARD ─────────────────────────────────────────────────
function Dashboard({user,setPage,toast}) {
  const stats=[
    {label:"Skills Offered",value:(user.skills_offered||[]).length,ic:"◈",c:"var(--accent)"},
    {label:"Exchanges Done",value:user.exchanges||0,ic:"⇄",c:"var(--green)"},
    {label:"Credit Balance",value:user.credits||0,ic:"◇",c:"var(--yellow)"},
    {label:"Trust Score",value:`${user.trust_score||0}%`,ic:"◎",c:"var(--pink)"},
  ];
  return (
    <div style={{padding:"24px 28px",maxWidth:1000}}>
      <DemoBanner/>
      {/* Hero */}
      <div style={{background:"linear-gradient(135deg,var(--card2),rgba(107,95,250,0.07))",border:"1px solid var(--border2)",borderRadius:18,padding:"24px 28px",marginBottom:24,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-40,right:-40,width:180,height:180,borderRadius:"50%",background:"radial-gradient(circle,rgba(107,95,250,0.1),transparent)",animation:"orb 8s ease-in-out infinite"}}/>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16,position:"relative"}}>
          <Av name={user.full_name||"User"} size={56} color={user.color} online/>
          <div>
            <div style={{fontSize:12,color:"var(--text3)",marginBottom:2}}>Welcome back,</div>
            <h2 style={{fontFamily:"'Fraunces',serif",fontSize:24,fontWeight:700}}>{user.full_name}</h2>
            <div style={{fontSize:12,color:"var(--text2)",marginTop:2}}>{user.location||"📍 Location not set"} · ⭐ {user.rating||0} · Member since {user.joined||"2024"}</div>
          </div>
          <div style={{marginLeft:"auto",display:"flex",gap:8}}>
            <button className="btn btn-p" onClick={()=>setPage("people")}>Find People</button>
            <button className="btn btn-s hide-m" onClick={()=>setPage("explore")}>Explore Skills</button>
          </div>
        </div>
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
          {(user.skills_offered||[]).map(s=><span key={s} className="badge" style={{background:"var(--greenbg)",color:"var(--green)",border:"1px solid rgba(31,200,154,0.25)"}}>↑ {s}</span>)}
          {(user.skills_wanted||[]).map(s=><span key={s} className="badge" style={{background:"var(--accentbg)",color:"var(--accent2)",border:"1px solid rgba(107,95,250,0.25)"}}>↓ {s}</span>)}
          {!(user.skills_offered?.length)&&!(user.skills_wanted?.length)&&<button className="btn btn-g btn-sm" onClick={()=>setPage("profile")}>+ Add your skills</button>}
        </div>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
        {stats.map((s,i)=>(
          <div key={i} style={{padding:"18px 20px",background:"var(--card2)",border:"1px solid var(--border)",borderRadius:14,animation:`fadeUp 0.4s ease ${i*0.06}s both`}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
              <span style={{fontSize:20,color:s.c}}>{s.ic}</span>
              <div style={{width:6,height:6,borderRadius:"50%",background:s.c,marginTop:7}}/>
            </div>
            <div style={{fontFamily:"'Fraunces',serif",fontSize:26,fontWeight:700,color:s.c}}>{s.value}</div>
            <div style={{fontSize:11,color:"var(--text3)",marginTop:3,fontWeight:700,letterSpacing:"0.03em"}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div className="card" style={{padding:18}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <h3 style={{fontSize:14,fontWeight:700}}>Latest Requests</h3>
            <button onClick={()=>setPage("requests")} style={{fontSize:12,color:"var(--accent)",background:"none",border:"none",cursor:"pointer",fontWeight:700}}>See all →</button>
          </div>
          {MOCK_REQUESTS.slice(0,3).map(r=>{
            const sc={pending:"var(--yellow)",accepted:"var(--green)",completed:"var(--text3)",declined:"var(--red)"};
            return (
              <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid var(--border)"}}>
                <Av name={r.from_user.full_name} size={32} color={r.from_user.color}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:700}}>{r.from_user.full_name}</div>
                  <div style={{fontSize:11,color:"var(--text3)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.skill_offered} ⇄ {r.skill_wanted}</div>
                </div>
                <span style={{fontSize:10,fontWeight:800,color:sc[r.status],background:`${sc[r.status]}15`,padding:"2px 8px",borderRadius:20,textTransform:"uppercase",letterSpacing:"0.05em",flexShrink:0}}>{r.status}</span>
              </div>
            );
          })}
        </div>
        <div className="card" style={{padding:18}}>
          <h3 style={{fontSize:14,fontWeight:700,marginBottom:14}}>Quick Actions</h3>
          {[
            {label:"Browse people to exchange with",btn:"Find People",page:"people",ic:"◉",c:"var(--accent)"},
            {label:"Explore skills available now",btn:"Explore",page:"explore",ic:"◈",c:"var(--green)"},
            {label:"See your smart skill matches",btn:"View Matches",page:"matches",ic:"◎",c:"var(--yellow)"},
          ].map((a,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid var(--border)"}}>
              <div style={{width:32,height:32,borderRadius:9,background:`${a.c}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:a.c,flexShrink:0}}>{a.ic}</div>
              <div style={{flex:1,fontSize:13,color:"var(--text2)"}}>{a.label}</div>
              <button className="btn btn-g btn-sm" onClick={()=>setPage(a.page)}>{a.btn}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PEOPLE PAGE ───────────────────────────────────────────────
function People({user,setPage,setChatUser,toast}) {
  const [users,setUsers]=useState([]);
  const [loading,setLoading]=useState(true);
  const [loadError,setLoadError]=useState("");
  const [search,setSearch]=useState("");
  const [selected,setSelected]=useState(null);
  const [barterModal,setBarterModal]=useState(false);
  const [barterTarget,setBarterTarget]=useState(null);
  const [form,setForm]=useState({skill_offered:"",skill_wanted:"",custom_skill_offered:"",custom_skill_wanted:"",message:"",sessions:1});
  const [sending,setSending]=useState(false);
  const lastMutationRef=useRef(0);
  const [reloadPeopleKey,setReloadPeopleKey]=useState(0);

  useEffect(()=>{
    let alive=true;
    const loadUsers=async(showLoader=false)=>{
      if(showLoader&&alive) setLoading(true);
      if(alive) setLoadError("");
      try{
        const u=await db.getUsers();
        if(alive) setUsers(u);
      }catch(e){
        if(alive){
          setLoadError(e.message||"Failed to load people.");
          toast(e.message,"error");
        }
      }finally{
        if(alive) setLoading(false);
      }
    };

    loadUsers(true);

    return()=>{alive=false;};
  },[reloadPeopleKey,toast,user.id]);

  const filtered=users.filter(u=>{
    if(!search) return true;
    const q=search.toLowerCase();
    return u.full_name.toLowerCase().includes(q)||(u.skills_offered||[]).some(s=>s.toLowerCase().includes(q))||(u.skills_wanted||[]).some(s=>s.toLowerCase().includes(q))||(u.location||"").toLowerCase().includes(q);
  });

  const sendRequest=async()=>{
    if(Date.now()-lastMutationRef.current<500) return;
    lastMutationRef.current=Date.now();
    const offeredSkill=(form.skill_offered==="custom"?form.custom_skill_offered:form.skill_offered).trim();
    const wantedSkill=(form.skill_wanted==="custom"?form.custom_skill_wanted:form.skill_wanted).trim();
    if(!offeredSkill||!wantedSkill){toast("Fill in both skills","warning");return;}
    setSending(true);
    try{
      await db.createRequest({from_user_id:user.id,from_user:user,to_user_id:barterTarget.id,skill_offered:offeredSkill,skill_wanted:wantedSkill,message:form.message,credits:2});
      toast(`Barter request sent to ${barterTarget.full_name}! 🎉`,"success");
      setBarterModal(false);setBarterTarget(null);setForm({skill_offered:"",skill_wanted:"",custom_skill_offered:"",custom_skill_wanted:"",message:"",sessions:1});
    }catch(e){toast(e.message,"error");}finally{setSending(false);}
  };

  return (
    <div style={{padding:"24px 28px"}}>
      <DemoBanner/>
      <div style={{position:"relative",maxWidth:420,marginBottom:20}}>
        <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:"var(--text3)",fontSize:14}}>◈</span>
        <input className="inp" style={{paddingLeft:33}} placeholder="Search by name, skill, location..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      <ErrorBanner message={loadError} onRetry={()=>setReloadPeopleKey(v=>v+1)} />

      {loading?<div style={{display:"flex",justifyContent:"center",padding:60}}><Spinner size={28}/></div>:(
        filtered.length===0?(
          <div style={{textAlign:"center",padding:40,color:"var(--text3)",border:"1px dashed var(--border)",borderRadius:12}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:8}}>No people found</div>
            <p style={{fontSize:12,marginBottom:12}}>Ask another user to sign up and they will appear here in realtime.</p>
            <button className="btn btn-s btn-sm" onClick={()=>setPage("explore")}>Explore Skills</button>
          </div>
        ):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:16}}>
          {filtered.map((u,i)=>(
            <div key={u.id} className="card card-hover" style={{padding:20,animation:`fadeUp 0.4s ease ${i*0.04}s both`}}>
              <div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:14}}>
                <Av name={u.full_name} size={46} color={u.color} online={u.online}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:15,marginBottom:2}}>{u.full_name}</div>
                  <div style={{fontSize:12,color:"var(--text3)",marginBottom:5}}>{u.location||"📍 India"}</div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <Stars r={u.rating||4.5}/>
                    <span style={{fontSize:11,color:"var(--text3)"}}>· {u.exchanges||0} exchanges</span>
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                  <span className="mono" style={{fontSize:11,color:"var(--yellow)",fontWeight:700}}>◇ {u.credits||0}</span>
                  <span style={{fontSize:10,fontWeight:700,color:"var(--green)",background:"var(--greenbg)",padding:"2px 7px",borderRadius:20}}>{u.trust_score||85}%</span>
                </div>
              </div>

              {u.bio&&<p style={{fontSize:12,color:"var(--text2)",lineHeight:1.6,marginBottom:12,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{u.bio}</p>}

              <div style={{marginBottom:12}}>
                <div style={{fontSize:10,fontWeight:700,color:"var(--text3)",letterSpacing:"0.06em",marginBottom:5}}>OFFERS</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {(u.skills_offered||[]).slice(0,3).map(s=><span key={s} className="badge" style={{background:"var(--greenbg)",color:"var(--green)",border:"1px solid rgba(31,200,154,0.2)",fontSize:10}}>↑ {s}</span>)}
                  {!(u.skills_offered?.length)&&<span style={{fontSize:11,color:"var(--text3)"}}>No skills listed</span>}
                </div>
              </div>
              <div style={{marginBottom:16}}>
                <div style={{fontSize:10,fontWeight:700,color:"var(--text3)",letterSpacing:"0.06em",marginBottom:5}}>WANTS</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {(u.skills_wanted||[]).slice(0,3).map(s=><span key={s} className="badge" style={{background:"var(--accentbg)",color:"var(--accent2)",border:"1px solid rgba(107,95,250,0.2)",fontSize:10}}>↓ {s}</span>)}
                  {!(u.skills_wanted?.length)&&<span style={{fontSize:11,color:"var(--text3)"}}>Nothing listed</span>}
                </div>
              </div>

              <div style={{display:"flex",gap:8,paddingTop:14,borderTop:"1px solid var(--border)"}}>
                <button className="btn btn-p" style={{flex:1,justifyContent:"center",fontSize:12}}
                  onClick={()=>{setBarterTarget(u);setForm({skill_offered:(user.skills_offered||[])[0]||"custom",skill_wanted:(u.skills_offered||[])[0]||"custom",custom_skill_offered:"",custom_skill_wanted:"",message:"",sessions:1});setBarterModal(true);}}>
                  Barter
                </button>
                <button className="btn btn-s" style={{flex:1,justifyContent:"center",fontSize:12}}
                  onClick={()=>{setChatUser(u);setPage("chat");}}>
                  Message
                </button>
                <button className="btn btn-g btn-sm" onClick={()=>setSelected(u)}>Profile</button>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* User detail modal */}
      <Modal open={!!selected} onClose={()=>setSelected(null)} title={selected?.full_name||""}>
        {selected&&(
          <div>
            <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:20}}>
              <Av name={selected.full_name} size={56} color={selected.color} online={selected.online}/>
              <div>
                <div style={{fontSize:12,color:"var(--text3)",marginBottom:2}}>{selected.location}</div>
                <Stars r={selected.rating||4.5}/>
                <div style={{fontSize:12,color:"var(--text3)",marginTop:3}}>{selected.exchanges||0} exchanges · {selected.trust_score||85}% trust</div>
              </div>
            </div>
            {selected.bio&&<p style={{fontSize:14,color:"var(--text2)",lineHeight:1.7,background:"var(--bg3)",borderRadius:10,padding:14,marginBottom:16}}>{selected.bio}</p>}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:"var(--text3)",marginBottom:8}}>SKILLS OFFERED</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{(selected.skills_offered||[]).map(s=><span key={s} className="badge" style={{background:"var(--greenbg)",color:"var(--green)",border:"1px solid rgba(31,200,154,0.2)"}}>↑ {s}</span>)}</div>
            </div>
            <div style={{marginBottom:20}}>
              <div style={{fontSize:11,fontWeight:700,color:"var(--text3)",marginBottom:8}}>SKILLS WANTED</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{(selected.skills_wanted||[]).map(s=><span key={s} className="badge" style={{background:"var(--accentbg)",color:"var(--accent2)",border:"1px solid rgba(107,95,250,0.2)"}}>↓ {s}</span>)}</div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button className="btn btn-p btn-lg" style={{flex:1,justifyContent:"center"}} onClick={()=>{setSelected(null);setBarterTarget(selected);setForm({skill_offered:(user.skills_offered||[])[0]||"custom",skill_wanted:(selected.skills_offered||[])[0]||"custom",custom_skill_offered:"",custom_skill_wanted:"",message:"",sessions:1});setBarterModal(true);}}>Send Barter Request</button>
              <button className="btn btn-s btn-lg" onClick={()=>{setSelected(null);setChatUser(selected);setPage("chat");}}>Message</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Barter request modal */}
      <Modal open={barterModal} onClose={()=>{setBarterModal(false);setBarterTarget(null);}} title={`Barter with ${barterTarget?.full_name}`}>
        {barterTarget&&(
          <div>
            <div style={{background:"var(--bg3)",borderRadius:10,padding:12,marginBottom:20,display:"flex",gap:10,alignItems:"center"}}>
              <Av name={barterTarget.full_name} size={36} color={barterTarget.color}/>
              <div>
                <div style={{fontWeight:700,fontSize:14}}>{barterTarget.full_name}</div>
                <div style={{fontSize:12,color:"var(--text3)"}}>{(barterTarget.skills_offered||[]).join(", ")||"No skills listed"}</div>
              </div>
            </div>
            <Field label="You offer (your skill)">
              <select className="inp" value={form.skill_offered} onChange={e=>setForm(f=>({...f,skill_offered:e.target.value,custom_skill_offered:e.target.value==="custom"?f.custom_skill_offered:""}))} style={{appearance:"none"}}>
                <option value="">Select a skill you offer...</option>
                {(user.skills_offered||[]).map(s=><option key={s} value={s}>{s}</option>)}
                <option value="custom">Custom skill...</option>
              </select>
              {form.skill_offered==="custom"&&<input className="inp" style={{marginTop:8}} placeholder="Type your skill" value={form.custom_skill_offered} onChange={e=>setForm(f=>({...f,custom_skill_offered:e.target.value}))}/>}
            </Field>
            <Field label="You want (their skill)">
              <select className="inp" value={form.skill_wanted} onChange={e=>setForm(f=>({...f,skill_wanted:e.target.value,custom_skill_wanted:e.target.value==="custom"?f.custom_skill_wanted:""}))} style={{appearance:"none"}}>
                <option value="">Select a skill you want...</option>
                {(barterTarget.skills_offered||[]).map(s=><option key={s} value={s}>{s}</option>)}
                <option value="custom">Custom skill...</option>
              </select>
              {form.skill_wanted==="custom"&&<input className="inp" style={{marginTop:8}} placeholder="Type the skill you want" value={form.custom_skill_wanted} onChange={e=>setForm(f=>({...f,custom_skill_wanted:e.target.value}))}/>}
            </Field>
            <Field label="Sessions per week">
              <select className="inp" value={form.sessions} onChange={e=>setForm(f=>({...f,sessions:+e.target.value}))} style={{appearance:"none"}}>
                {[1,2,3].map(n=><option key={n} value={n}>{n} session{n>1?"s":""}/week</option>)}
              </select>
            </Field>
            <Field label="Message (optional)">
              <textarea className="inp" placeholder="Introduce yourself. What's your experience level? Any preferences for timing?" value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} rows={3}/>
            </Field>
            <button className="btn btn-p btn-lg" style={{width:"100%",justifyContent:"center",marginTop:4}} onClick={sendRequest} disabled={sending}>
              {sending?<><Spinner/> Sending...</>:"Send Barter Request ✓"}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── EXPLORE ───────────────────────────────────────────────────
function Explore({user,setPage,setChatUser,toast}) {
  const [skills,setSkills]=useState([]);
  const [loading,setLoading]=useState(true);
  const [loadError,setLoadError]=useState("");
  const [search,setSearch]=useState("");
  const [cat,setCat]=useState("All");
  const [level,setLevel]=useState("All");
  const [selected,setSelected]=useState(null);
  const [barterModal,setBarterModal]=useState(false);
  const [barterTarget,setBarterTarget]=useState(null);
  const [barterForm,setBarterForm]=useState({skill_offered:"",custom_skill_offered:"",skill_wanted:"",message:"",sessions:1});
  const [addModal,setAddModal]=useState(false);
  const [newSkill,setNewSkill]=useState({title:"",category:"Technology",level:"Beginner",description:"",credits_per_hour:1,availability:"Flexible",tags:""});
  const [saving,setSaving]=useState(false);
  const lastMutationRef=useRef(0);
  const loadSeqRef=useRef(0);
  const debouncedSearch = useDebouncedValue(search,300);
  const debouncedCat = useDebouncedValue(cat,300);
  const debouncedLevel = useDebouncedValue(level,300);

  const CATS=["All","Technology","Arts & Crafts","Wellness","Languages","Music","Culinary"];

  const loadSkills=useCallback(()=>{
    const requestId = ++loadSeqRef.current;
    setLoading(true);
    setLoadError("");
    return (async()=>{
      try{
        const s=await db.getSkills({category:debouncedCat,level:debouncedLevel,q:debouncedSearch});
        if(requestId===loadSeqRef.current) setSkills(s);
      }catch(e){
        if(requestId===loadSeqRef.current){
          setLoadError(e.message||"Failed to load skills.");
          toast(e.message,"error");
        }
      }finally{
        if(requestId===loadSeqRef.current) setLoading(false);
      }
    })();
  },[debouncedCat,debouncedLevel,debouncedSearch,toast]);

  useEffect(()=>{
    loadSkills();
  },[loadSkills]);

  const addSkill=async()=>{
    if(Date.now()-lastMutationRef.current<500) return;
    lastMutationRef.current=Date.now();
    if(!newSkill.title||!newSkill.description){toast("Fill in title and description","warning");return;}
    setSaving(true);
    try{
      await db.ensureProfile(user);
      const s=await db.createSkill({...newSkill,tags:newSkill.tags.split(",").map(t=>t.trim()).filter(Boolean)},user.id);
      setSkills(prev=>[s,...prev]);
      toast("Skill added! 🎉","success");
      setAddModal(false);
      setNewSkill({title:"",category:"Technology",level:"Beginner",description:"",credits_per_hour:1,availability:"Flexible",tags:""});
    }catch(e){toast(e.message,"error");}finally{setSaving(false);}
  };

  const sendBarter=async()=>{
    if(Date.now()-lastMutationRef.current<500) return;
    lastMutationRef.current=Date.now();
    const offeredSkill=(barterForm.skill_offered==="custom"?barterForm.custom_skill_offered:barterForm.skill_offered).trim();
    if(!barterTarget||!offeredSkill||!barterForm.skill_wanted.trim()){
      toast("Choose both skills before sending a barter request","warning");
      return;
    }
    setSaving(true);
    try{
      await db.createRequest({
        from_user_id:user.id,
        from_user:user,
        to_user_id:barterTarget.id,
        skill_offered:offeredSkill,
        skill_wanted:barterForm.skill_wanted.trim(),
        message:barterForm.message,
        credits:2
      });
      toast(`Barter request sent to ${barterTarget.full_name}! 🎉`,"success");
      setBarterModal(false);
      setBarterTarget(null);
      setBarterForm({skill_offered:"",custom_skill_offered:"",skill_wanted:"",message:"",sessions:1});
    }catch(e){
      toast(e.message,"error");
    }finally{
      setSaving(false);
    }
  };

  return (
    <div style={{padding:"24px 28px"}}>
      <DemoBanner/>
      <div style={{display:"flex",gap:12,marginBottom:18,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:"1 1 300px",maxWidth:420}}>
          <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:"var(--text3)",fontSize:14}}>◈</span>
          <input className="inp" style={{paddingLeft:33}} placeholder="Search skills..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <button className="btn btn-p" onClick={()=>setAddModal(true)}>+ Add Your Skill</button>
      </div>
      <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:20}}>
        {CATS.map(c=><button key={c} className={`tag ${cat===c?"on":""}`} onClick={()=>setCat(c)}>{c}</button>)}
        <div style={{width:1,background:"var(--border)",margin:"0 3px"}}/>
        {["All","Beginner","Intermediate","Advanced"].map(l=><button key={l} className={`tag ${level===l?"on":""}`} onClick={()=>setLevel(l)}>{l}</button>)}
      </div>
      <div style={{fontSize:12,color:"var(--text3)",marginBottom:16,fontWeight:600}}>{skills.length} skills available</div>

      <ErrorBanner message={loadError} onRetry={loadSkills} />

      {loading?<div style={{display:"flex",justifyContent:"center",padding:60}}><Spinner size={28}/></div>:(
        skills.length===0?(
          <div style={{textAlign:"center",padding:40,color:"var(--text3)",border:"1px dashed var(--border)",borderRadius:12}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:8}}>No skills found</div>
            <p style={{fontSize:12,marginBottom:12}}>Try changing filters or add your first skill listing.</p>
            <button className="btn btn-p btn-sm" onClick={()=>setAddModal(true)}>Add Skill</button>
          </div>
        ):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:16}}>
          {skills.map((s,i)=>{
            const col=avatarColor(s.title);
            return (
              <div key={s.id} className="card card-hover" style={{padding:20,cursor:"pointer",animation:`fadeUp 0.4s ease ${i*0.03}s both`}} onClick={()=>setSelected(s)}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <Av name={s.user?.full_name||"?"} size={36} color={s.user?.color||col}/>
                    <div>
                      <div style={{fontSize:11,fontWeight:700,color:col}}>{s.category}</div>
                      <div style={{fontSize:11,color:"var(--text3)"}}>{s.user?.full_name}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                    {s.verified&&<span className="badge" style={{background:"var(--greenbg)",color:"var(--green)",border:"1px solid rgba(31,200,154,0.2)",fontSize:10}}>✓ Verified</span>}
                    <span className="mono" style={{fontSize:12,fontWeight:700,color:"var(--yellow)"}}>◇ {s.credits_per_hour}/hr</span>
                  </div>
                </div>
                <h3 style={{fontFamily:"'Fraunces',serif",fontSize:17,fontWeight:700,marginBottom:8}}>{s.title}</h3>
                <p style={{fontSize:12,color:"var(--text2)",lineHeight:1.6,marginBottom:12,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{s.description}</p>
                <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"}}>
                  {(s.tags||[]).map(t=><span key={t} className="tag" style={{fontSize:10}}>#{t}</span>)}
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:12,borderTop:"1px solid var(--border)"}}>
                  <Stars r={s.rating||0}/>
                  <span style={{fontSize:11,color:"var(--text3)"}}>🕒 {s.availability}</span>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* Skill detail */}
      <Modal open={!!selected} onClose={()=>setSelected(null)} title={selected?.title||""}>
        {selected&&(
          <div>
            <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:20}}>
              <Av name={selected.user?.full_name||"?"} size={50} color={selected.user?.color}/>
              <div>
                <div style={{fontSize:15,fontWeight:700}}>{selected.user?.full_name}</div>
                <Stars r={selected.rating||0}/>
                <div style={{fontSize:12,color:"var(--text3)",marginTop:3}}>{selected.reviews_count||0} reviews · {selected.availability}</div>
              </div>
              <div className="mono" style={{marginLeft:"auto",fontSize:22,fontWeight:800,color:"var(--yellow)"}}>◇ {selected.credits_per_hour}</div>
            </div>
            <div style={{background:"var(--bg3)",borderRadius:10,padding:14,marginBottom:16}}>
              <p style={{fontSize:14,color:"var(--text2)",lineHeight:1.7}}>{selected.description}</p>
            </div>
            <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:20}}>
              <span className="badge" style={{background:"var(--accentbg)",color:"var(--accent2)",border:"1px solid rgba(107,95,250,0.2)"}}>{selected.category}</span>
              <span className="badge" style={{background:"rgba(255,255,255,0.05)",color:"var(--text2)",border:"1px solid var(--border)"}}>{selected.level}</span>
              {(selected.tags||[]).map(t=><span key={t} className="tag">#{t}</span>)}
            </div>
            <div style={{display:"flex",gap:10}}>
              <button className="btn btn-p btn-lg" style={{flex:1,justifyContent:"center"}} onClick={()=>{setSelected(null);setChatUser(selected.user);setPage("chat");}}>Message {selected.user?.full_name?.split(" ")[0]}</button>
              <button className="btn btn-s btn-lg" style={{flex:1,justifyContent:"center"}} onClick={()=>{setSelected(null);setBarterTarget(selected.user);setBarterForm({skill_offered:(user.skills_offered||[])[0]||"custom",custom_skill_offered:"",skill_wanted:selected.title,message:`I found your ${selected.title} skill and would like to barter.`,sessions:1});setBarterModal(true);}}>Barter</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Barter request modal */}
      <Modal open={barterModal} onClose={()=>{setBarterModal(false);setBarterTarget(null);}} title={`Barter with ${barterTarget?.full_name || "Skill Owner"}`}>
        {barterTarget&&(
          <div>
            <div style={{background:"var(--bg3)",borderRadius:10,padding:12,marginBottom:20,display:"flex",gap:10,alignItems:"center"}}>
              <Av name={barterTarget.full_name} size={36} color={barterTarget.color}/>
              <div>
                <div style={{fontWeight:700,fontSize:14}}>{barterTarget.full_name}</div>
                <div style={{fontSize:12,color:"var(--text3)"}}>{(barterTarget.skills_offered||[]).join(", ")||"No skills listed"}</div>
              </div>
            </div>
            <Field label="You offer (your skill)">
              <select className="inp" value={barterForm.skill_offered} onChange={e=>setBarterForm(f=>({...f,skill_offered:e.target.value,custom_skill_offered:e.target.value==="custom"?f.custom_skill_offered:""}))} style={{appearance:"none"}}>
                <option value="">Select a skill you offer...</option>
                {(user.skills_offered||[]).map(s=><option key={s} value={s}>{s}</option>)
                }
                <option value="custom">Custom skill...</option>
              </select>
              {barterForm.skill_offered==="custom"&&<input className="inp" style={{marginTop:8}} placeholder="Type your skill" value={barterForm.custom_skill_offered} onChange={e=>setBarterForm(f=>({...f,custom_skill_offered:e.target.value}))}/>} 
            </Field>
            <Field label="You want (their skill)">
              <input className="inp" value={barterForm.skill_wanted} onChange={e=>setBarterForm(f=>({...f,skill_wanted:e.target.value}))} placeholder="Skill you're requesting" />
            </Field>
            <Field label="Message (optional)">
              <textarea className="inp" placeholder="Introduce yourself. What's your experience level? Any preferences for timing?" value={barterForm.message} onChange={e=>setBarterForm(f=>({...f,message:e.target.value}))} rows={3}/>
            </Field>
            <Field label="Sessions per week">
              <select className="inp" value={barterForm.sessions} onChange={e=>setBarterForm(f=>({...f,sessions:+e.target.value}))} style={{appearance:"none"}}>
                {[1,2,3].map(n=><option key={n} value={n}>{n} session{n>1?"s":""}/week</option>)}
              </select>
            </Field>
            <button className="btn btn-p btn-lg" style={{width:"100%",justifyContent:"center",marginTop:4}} onClick={sendBarter} disabled={saving}>
              {saving?<><Spinner/> Sending...</>:"Send Barter Request ✓"}
            </button>
          </div>
        )}
      </Modal>

      {/* Add skill modal */}
      <Modal open={addModal} onClose={()=>setAddModal(false)} title="Add a Skill You Offer">
        <Field label="Skill Title">
          <input className="inp" placeholder="e.g. Python Programming" value={newSkill.title} onChange={e=>setNewSkill(s=>({...s,title:e.target.value}))}/>
        </Field>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="Category">
            <select className="inp" value={newSkill.category} onChange={e=>setNewSkill(s=>({...s,category:e.target.value}))} style={{appearance:"none"}}>
              {["Technology","Arts & Crafts","Wellness","Languages","Music","Culinary","Other"].map(c=><option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Level">
            <select className="inp" value={newSkill.level} onChange={e=>setNewSkill(s=>({...s,level:e.target.value}))} style={{appearance:"none"}}>
              {["Beginner","Intermediate","Advanced","Expert"].map(l=><option key={l}>{l}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Description">
          <textarea className="inp" placeholder="Describe what you'll teach, your approach, and experience level..." value={newSkill.description} onChange={e=>setNewSkill(s=>({...s,description:e.target.value}))} rows={3}/>
        </Field>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="Credits/hour">
            <input className="inp" type="number" min={1} max={5} value={newSkill.credits_per_hour} onChange={e=>setNewSkill(s=>({...s,credits_per_hour:+e.target.value}))}/>
          </Field>
          <Field label="Availability">
            <select className="inp" value={newSkill.availability} onChange={e=>setNewSkill(s=>({...s,availability:e.target.value}))} style={{appearance:"none"}}>
              {["Flexible","Weekends","Weekdays","Mornings","Evenings"].map(a=><option key={a}>{a}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Tags (comma separated)">
          <input className="inp" placeholder="e.g. python, data, beginner" value={newSkill.tags} onChange={e=>setNewSkill(s=>({...s,tags:e.target.value}))}/>
        </Field>
        <button className="btn btn-p btn-lg" style={{width:"100%",justifyContent:"center",marginTop:4}} onClick={addSkill} disabled={saving}>
          {saving?<><Spinner/> Adding...</>:"Add Skill ✓"}
        </button>
      </Modal>
    </div>
  );
}

// ─── MATCHES ───────────────────────────────────────────────────
function Matches({user,setChatUser,setPage,toast}) {
  const [matches,setMatches]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    let alive=true;
    (async()=>{
      try{
        const m=await db.getMatches(user);
        if(alive) setMatches(m);
      }catch(e){
        if(alive) toast(e.message,"error");
      }finally{
        if(alive) setLoading(false);
      }
    })();
    return()=>{alive=false;};
  },[user,toast]);

  return (
    <div style={{padding:"24px 28px"}}>
      <DemoBanner/>
      <p style={{color:"var(--text2)",fontSize:14,marginBottom:20}}>Skills matched to what you want to learn, and people who want what you offer.</p>

      {loading?<div style={{display:"flex",justifyContent:"center",padding:60}}><Spinner size={28}/></div>:(
        matches.length===0?(
          <div style={{textAlign:"center",padding:60,color:"var(--text3)"}}>
            <div style={{fontSize:40,marginBottom:12}}>◎</div>
            <div style={{fontSize:16,fontWeight:700,marginBottom:8}}>No matches yet</div>
            <p style={{fontSize:13,marginBottom:20}}>Add skills you want to learn and skills you offer to your profile to find matches.</p>
            <button className="btn btn-p" onClick={()=>setPage("profile")}>Update Profile</button>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {matches.map((m,i)=>{
              const col=avatarColor(m.title);
              const pct=m.score||70;
              return (
                <div key={m.id} className="card" style={{padding:18,display:"flex",alignItems:"center",gap:14,animation:`fadeUp 0.4s ease ${i*0.05}s both`}}>
                  <div style={{position:"relative"}}>
                    <Av name={m.user?.full_name||"?"} size={46} color={m.user?.color||col}/>
                    <div style={{position:"absolute",bottom:-4,right:-4,background:"var(--bg)",border:"2px solid var(--bg)",borderRadius:7,padding:"1px 5px",fontSize:9,fontWeight:900,color:pct>80?"var(--green)":pct>65?"var(--yellow)":"var(--text3)"}}>{pct}%</div>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                      <span style={{fontSize:15,fontWeight:700}}>{m.title}</span>
                      {m.verified&&<span style={{fontSize:11,color:"var(--green)",fontWeight:700}}>✓</span>}
                    </div>
                    <div style={{fontSize:12,color:"var(--text3)",marginBottom:7}}>by {m.user?.full_name} · {m.level}</div>
                    <div style={{height:3,background:"var(--bg3)",borderRadius:3,overflow:"hidden",maxWidth:180}}>
                      <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,var(--accent),var(--green))",borderRadius:3,transition:"width 1s ease"}}/>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8,flexShrink:0,alignItems:"center"}}>
                    <span className="mono" style={{fontSize:12,color:"var(--yellow)",fontWeight:700}}>◇ {m.credits_per_hour}</span>
                    <button className="btn btn-s btn-sm" onClick={()=>{setChatUser(m.user);setPage("chat");}}>Message</button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}

// ─── REQUESTS ──────────────────────────────────────────────────
function Requests({user,toast}) {
  const [reqs,setReqs]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    let alive=true;
    (async()=>{
      try{
        const r=await db.getRequests(user.id);
        if(alive) setReqs(r);
      }catch(e){
        if(alive) toast(e.message,"error");
      }finally{
        if(alive) setLoading(false);
      }
    })();
    return()=>{alive=false;};
  },[user.id,toast]);

  const act=async(id,status)=>{
    try{
      await db.updateRequest(id,status);
      setReqs(r=>r.map(x=>x.id===id?{...x,status}:x));
      toast(status==="accepted"?"Request accepted! 🎉":"Request declined.","success");
    }catch(e){toast(e.message,"error");}
  };

  const sc={pending:{c:"var(--yellow)",label:"Pending"},accepted:{c:"var(--green)",label:"Accepted"},completed:{c:"var(--text3)",label:"Done"},declined:{c:"var(--red)",label:"Declined"}};

  return (
    <div style={{padding:"24px 28px"}}>
      <DemoBanner/>
      {loading?<div style={{display:"flex",justifyContent:"center",padding:60}}><Spinner size={28}/></div>:(
        reqs.length===0?(
          <div style={{textAlign:"center",padding:60,color:"var(--text3)"}}>
            <div style={{fontSize:40,marginBottom:12}}>⇄</div>
            <div style={{fontSize:16,fontWeight:700}}>No requests yet</div>
            <p style={{fontSize:13,marginTop:8}}>Go to People to send your first barter request.</p>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {reqs.map((r,i)=>{
              const cfg=sc[r.status]||sc.pending;
              const isIncoming=r.to_user_id===user.id;
              return (
                <div key={r.id} className="card" style={{padding:20,animation:`fadeUp 0.4s ease ${i*0.05}s both`}}>
                  <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                    <Av name={r.from_user?.full_name||"?"} size={42} color={r.from_user?.color}/>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                        <div>
                          <span style={{fontWeight:700,fontSize:15}}>{r.from_user?.full_name}</span>
                          <span style={{fontSize:11,color:"var(--text3)",marginLeft:8}}>{timeAgo(r.created_at)}</span>
                          {isIncoming&&<span style={{fontSize:10,fontWeight:700,color:"var(--accent)",background:"var(--accentbg)",padding:"2px 7px",borderRadius:20,marginLeft:8}}>INCOMING</span>}
                        </div>
                        <span style={{fontSize:10,fontWeight:800,color:cfg.c,background:`${cfg.c}15`,padding:"3px 9px",borderRadius:20,textTransform:"uppercase",letterSpacing:"0.05em"}}>{cfg.label}</span>
                      </div>

                      <div style={{display:"flex",gap:9,alignItems:"center",marginBottom:r.message?10:12,flexWrap:"wrap"}}>
                        <span style={{padding:"5px 11px",background:"var(--greenbg)",border:"1px solid rgba(31,200,154,0.2)",borderRadius:7,fontSize:13,color:"var(--green)",fontWeight:600}}>{r.skill_offered}</span>
                        <span style={{color:"var(--text3)",fontSize:18}}>⇄</span>
                        <span style={{padding:"5px 11px",background:"var(--accentbg)",border:"1px solid rgba(107,95,250,0.2)",borderRadius:7,fontSize:13,color:"var(--accent2)",fontWeight:600}}>{r.skill_wanted}</span>
                        <span className="mono" style={{fontSize:11,color:"var(--yellow)",fontWeight:700}}>◇ {r.credits||2} credits</span>
                      </div>

                      {r.message&&<div style={{fontSize:13,color:"var(--text2)",background:"var(--bg3)",borderRadius:9,padding:"10px 13px",marginBottom:12,fontStyle:"italic",lineHeight:1.6}}>"{r.message}"</div>}

                      {r.status==="pending"&&isIncoming&&(
                        <div style={{display:"flex",gap:8}}>
                          <button className="btn btn-p btn-sm" onClick={()=>act(r.id,"accepted")}>✓ Accept</button>
                          <button className="btn btn-d btn-sm" onClick={()=>act(r.id,"declined")}>✕ Decline</button>
                        </div>
                      )}
                      {r.status==="accepted"&&<span style={{fontSize:12,color:"var(--green)",fontWeight:700}}>✓ Exchange in progress — reach out to coordinate sessions!</span>}
                      {r.status==="completed"&&<span style={{fontSize:12,color:"var(--text3)",fontWeight:600}}>✓ Completed exchange</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}

// ─── CHAT ──────────────────────────────────────────────────────
function Chat({user,initialChatUser,toast}) {
  const [contacts,setContacts]=useState([]);
  const [active,setActive]=useState(initialChatUser||null);
  const [msgs,setMsgs]=useState([]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [loadingContacts,setLoadingContacts]=useState(true);
  const [loadError,setLoadError]=useState("");
  const [reloadContactsKey,setReloadContactsKey]=useState(0);
  const [search,setSearch]=useState("");
  const [signalReady,setSignalReady]=useState(false);
  const [callPhase,setCallPhase]=useState("idle");
  const [callPeer,setCallPeer]=useState(null);
  const [incomingCall,setIncomingCall]=useState(null);
  const [micMuted,setMicMuted]=useState(false);
  const [cameraOff,setCameraOff]=useState(false);
  const [localStream,setLocalStream]=useState(null);
  const [remoteStream,setRemoteStream]=useState(null);
  const [callError,setCallError]=useState("");
  const bottomRef=useRef(null);
  const subRef=useRef(null);
  const signalRef=useRef(null);
  const peerRef=useRef(null);
  const localStreamRef=useRef(null);
  const localVideoRef=useRef(null);
  const remoteVideoRef=useRef(null);
  const pendingOfferRef=useRef(null);
  const pendingCandidatesRef=useRef([]);
  const lastMutationRef=useRef(0);
  const isVideoSupported = typeof window !== "undefined"
    && !!window.RTCPeerConnection
    && !!navigator.mediaDevices?.getUserMedia;
  const getOnline = useCallback((contactId) => {
    const c = contacts.find(entry => String(entry.id) === String(contactId));
    return !!c?.online;
  }, [contacts]);

  const resolveContact = useCallback((contactId) => {
    if(!contactId) return null;
    if(active?.id === contactId) return active;
    return contacts.find(contact => contact.id === contactId) || null;
  }, [active, contacts]);

  const upsertContactSummary = useCallback((contactId, summary) => {
    setContacts(prev => {
      const next = prev.map(contact => contact.id === contactId ? { ...contact, ...summary } : contact);
      next.sort((a,b) => (b.lastActivity || "").localeCompare(a.lastActivity || ""));
      return next;
    });
  }, []);

  const ensureActiveInContacts = useCallback((contact) => {
    if(!contact) return;
    setContacts(prev => {
      if(prev.some(existing => existing.id === contact.id)) return prev;
      const next = [contact, ...prev];
      next.sort((a,b) => (b.lastActivity || "").localeCompare(a.lastActivity || ""));
      return next;
    });
  }, []);

  const openThread = useCallback((contact) => {
    if(!contact) return;
    setActive(contact);
    ensureActiveInContacts(contact);
  }, [ensureActiveInContacts]);

  const sendSignal = useCallback(async (payload) => {
    if(!signalRef.current || !signalReady) return;
    const packet = {
      ...payload,
      fromId: user.id,
      fromName: user.full_name || user.email || "User",
      createdAt: new Date().toISOString(),
    };
    await signalRef.current.send({
      type: "broadcast",
      event: "signal",
      payload: packet,
    });
  }, [signalReady, user.email, user.full_name, user.id]);

  const endCall = useCallback(async (notify = true) => {
    const peerId = callPeer?.id;
    if(notify && peerId) {
      await sendSignal({ type: "end", toId: peerId });
    }
    if(peerRef.current) {
      peerRef.current.onicecandidate = null;
      peerRef.current.ontrack = null;
      peerRef.current.onconnectionstatechange = null;
      peerRef.current.close();
      peerRef.current = null;
    }
    if(localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    pendingOfferRef.current = null;
    pendingCandidatesRef.current = [];
    setIncomingCall(null);
    setCallPeer(null);
    setCallPhase("idle");
    setMicMuted(false);
    setCameraOff(false);
    setLocalStream(null);
    setRemoteStream(null);
  }, [callPeer?.id, sendSignal]);

  const ensureLocalMedia = useCallback(async () => {
    if(localStreamRef.current) return localStreamRef.current;
    if(!isVideoSupported) throw new Error("Video calling is not supported in this browser.");
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    setLocalStream(stream);
    return stream;
  }, [isVideoSupported]);

  const flushPendingCandidates = useCallback(async () => {
    if(!peerRef.current || !peerRef.current.remoteDescription) return;
    while(pendingCandidatesRef.current.length) {
      const candidate = pendingCandidatesRef.current.shift();
      try {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {
        // Ignore malformed candidates from stale signaling packets.
      }
    }
  }, []);

  const createPeer = useCallback(async (peerUser, stream) => {
    if(peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
      ],
    });
    const inbound = new MediaStream();
    setRemoteStream(inbound);

    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });

    pc.ontrack = event => {
      event.streams[0]?.getTracks().forEach(track => inbound.addTrack(track));
    };

    pc.onicecandidate = event => {
      if(event.candidate) {
        sendSignal({
          type: "candidate",
          toId: peerUser.id,
          candidate: event.candidate.toJSON(),
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if(pc.connectionState === "connected") {
        setCallPhase("in-call");
        setCallError("");
      }
      if(pc.connectionState === "failed" || pc.connectionState === "disconnected") {
        setCallError("Call dropped. Check your network and try again.");
        endCall(false);
      }
    };

    peerRef.current = pc;
    return pc;
  }, [endCall, sendSignal]);

  const handleIncomingSignal = useCallback(async (payload) => {
    if(!payload || payload.toId !== user.id || payload.fromId === user.id) return;

    if(payload.type === "offer") {
      if(callPhase !== "idle") {
        await sendSignal({ type: "busy", toId: payload.fromId });
        return;
      }
      const peerUser = resolveContact(payload.fromId) || {
        id: payload.fromId,
        full_name: payload.fromName || "User",
      };
      ensureActiveInContacts(peerUser);
      setCallPeer(peerUser);
      pendingOfferRef.current = payload.sdp;
      pendingCandidatesRef.current = [];
      setIncomingCall({ fromId: payload.fromId, fromName: payload.fromName || "User" });
      setCallPhase("incoming");
      return;
    }

    if(payload.type === "answer") {
      if(!peerRef.current || !payload.sdp) return;
      await peerRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      await flushPendingCandidates();
      setCallPhase("connecting");
      return;
    }

    if(payload.type === "candidate") {
      if(payload.fromId !== callPeer?.id) return;
      if(peerRef.current?.remoteDescription) {
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
        } catch {
          // Ignore stale candidates.
        }
      } else {
        pendingCandidatesRef.current.push(payload.candidate);
      }
      return;
    }

    if(payload.type === "decline") {
      if(payload.fromId === callPeer?.id) {
        toast(`${payload.fromName || "User"} declined the call.`, "warning");
        endCall(false);
      }
      return;
    }

    if(payload.type === "busy") {
      if(payload.fromId === callPeer?.id) {
        toast(`${payload.fromName || "User"} is on another call.`, "warning");
        endCall(false);
      }
      return;
    }

    if(payload.type === "end") {
      if(payload.fromId === callPeer?.id) {
        toast("Call ended.", "info");
        endCall(false);
      }
    }
  }, [callPeer?.id, callPhase, endCall, ensureActiveInContacts, flushPendingCandidates, resolveContact, sendSignal, toast, user.id]);

  const startVideoCall = useCallback(async () => {
    if(!active || callPhase !== "idle") return;
    if(!signalReady) {
      toast("Call signaling is still connecting. Try again in a moment.", "warning");
      return;
    }
    try {
      setCallError("");
      setCallPeer(active);
      setCallPhase("outgoing");
      const stream = await ensureLocalMedia();
      const pc = await createPeer(active, stream);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await sendSignal({ type: "offer", toId: active.id, sdp: offer });
      setCallPhase("connecting");
    } catch (error) {
      setCallError(error.message || "Unable to start call.");
      toast(error.message || "Unable to start call.", "error");
      endCall(false);
    }
  }, [active, callPhase, createPeer, endCall, ensureLocalMedia, sendSignal, signalReady, toast]);

  const acceptCall = useCallback(async () => {
    if(!incomingCall || !pendingOfferRef.current) return;
    const peerUser = resolveContact(incomingCall.fromId) || {
      id: incomingCall.fromId,
      full_name: incomingCall.fromName,
    };
    openThread(peerUser);
    setCallPeer(peerUser);
    setIncomingCall(null);
    setCallPhase("connecting");
    try {
      setCallError("");
      const stream = await ensureLocalMedia();
      const pc = await createPeer(peerUser, stream);
      await pc.setRemoteDescription(new RTCSessionDescription(pendingOfferRef.current));
      await flushPendingCandidates();
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await sendSignal({ type: "answer", toId: peerUser.id, sdp: answer });
      pendingOfferRef.current = null;
    } catch (error) {
      setCallError(error.message || "Unable to accept call.");
      toast(error.message || "Unable to accept call.", "error");
      endCall(false);
    }
  }, [createPeer, endCall, ensureLocalMedia, flushPendingCandidates, incomingCall, openThread, resolveContact, sendSignal, toast]);

  const declineCall = useCallback(async () => {
    if(!incomingCall) return;
    await sendSignal({ type: "decline", toId: incomingCall.fromId });
    setIncomingCall(null);
    setCallPeer(null);
    setCallPhase("idle");
    pendingOfferRef.current = null;
    pendingCandidatesRef.current = [];
  }, [incomingCall, sendSignal]);

  const toggleMic = useCallback(() => {
    const stream = localStreamRef.current;
    if(!stream) return;
    const nextMuted = !micMuted;
    stream.getAudioTracks().forEach(track => {
      track.enabled = !nextMuted;
    });
    setMicMuted(nextMuted);
  }, [micMuted]);

  const toggleCamera = useCallback(() => {
    const stream = localStreamRef.current;
    if(!stream) return;
    const nextOff = !cameraOff;
    stream.getVideoTracks().forEach(track => {
      track.enabled = !nextOff;
    });
    setCameraOff(nextOff);
  }, [cameraOff]);

  useEffect(()=>{
    let alive=true;
    (async()=>{
      try{
        setLoadError("");
        const loadedContacts=await db.getChatContacts(user);
        if(!alive) return;
        const merged=initialChatUser
          ? [initialChatUser, ...loadedContacts.filter(contact=>contact.id!==initialChatUser.id)]
          : loadedContacts;
        setContacts(merged);
        if(initialChatUser){
          setActive(initialChatUser);
        } else if(!active && merged.length>0){
          setActive(merged[0]);
        }
      }catch(e){
        if(alive){
          setLoadError(e.message||"Failed to load conversations.");
          toast(e.message,"error");
        }
      }finally{
        if(alive) setLoadingContacts(false);
      }
    })();
    return()=>{ alive=false; };
  },[initialChatUser,reloadContactsKey,toast,user]);

  useEffect(()=>{
    if(!active) return;
    setLoading(true);
    let alive=true;
    (async()=>{
      try{
        const m=await db.getMessages(user.id,active.id);
        if(alive) setMsgs(m);
      }catch(e){
        if(alive) toast(e.message,"error");
      }finally{
        if(alive) setLoading(false);
      }
    })();
    return ()=>{ alive=false; subRef.current?.unsubscribe(); };
  },[active,toast,upsertContactSummary,user.id]);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs]);

  useEffect(() => {
    if(localVideoRef.current) {
      localVideoRef.current.srcObject = localStream || null;
    }
  }, [localStream]);

  useEffect(() => {
    if(remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream || null;
    }
  }, [remoteStream]);

  useEffect(() => {
    setSignalReady(false);
    return () => {
      signalRef.current = null;
      endCall(false);
    };
  }, [endCall, handleIncomingSignal, user?.id]);

  const send=async()=>{
    if(Date.now()-lastMutationRef.current<500) return;
    lastMutationRef.current=Date.now();
    if(!input.trim()||!active) return;
    const text=input.trim(); setInput("");
    const optimistic={id:`opt-${Date.now()}`,from_id:user.id,to_id:active.id,text,created_at:new Date().toISOString()};
    setMsgs(m=>[...m,optimistic]);
    upsertContactSummary(active.id,{lastMessage:text,lastActivity:optimistic.created_at,lastType:"message"});
    try{ await db.sendMessage({from_id:user.id,to_id:active.id,text}); }
    catch(e){ toast("Failed to send","error"); setMsgs(m=>m.filter(x=>x.id!==optimistic.id)); setInput(text); }
  };

  const filtered=contacts.filter(c=>!search||c.full_name.toLowerCase().includes(search.toLowerCase()));
  const isInCallWithActive = !!active && !!callPeer && active.id === callPeer.id && callPhase !== "idle";
  const currentCallLabel = callPhase === "incoming"
    ? `Incoming call from ${incomingCall?.fromName || "User"}`
    : callPhase === "connecting"
      ? `Connecting with ${callPeer?.full_name || "User"}...`
      : callPhase === "in-call"
        ? `In call with ${callPeer?.full_name || "User"}`
        : "";

  return (
    <div style={{display:"flex",height:"calc(100vh - 56px)"}}>
      {/* Contact list */}
      <div style={{width:250,borderRight:"1px solid var(--border)",overflowY:"auto",flexShrink:0,background:"var(--bg2)"}}>
        <div style={{padding:"10px 12px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:11,color:"var(--text3)",fontWeight:700}}>Conversations</span>
          <span style={{fontSize:10,color:"var(--text3)",fontWeight:700}}>API chat</span>
        </div>
        <div style={{padding:"12px 12px 8px",borderBottom:"1px solid var(--border)"}}>
          <input className="inp" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{padding:"7px 11px",fontSize:12}}/>
        </div>
        <ErrorBanner message={loadError} onRetry={()=>setReloadContactsKey(v=>v+1)} />
        {loadingContacts?<div style={{display:"flex",justifyContent:"center",padding:24}}><Spinner size={20}/></div>:(
          filtered.length===0?(
            <div style={{padding:20,fontSize:12,color:"var(--text3)",textAlign:"center"}}>No conversations yet</div>
          ):(
            filtered.map(c=>(
              <div key={c.id} onClick={()=>openThread(c)} style={{padding:"12px 14px",display:"flex",gap:10,alignItems:"center",cursor:"pointer",transition:"background 0.15s",background:active?.id===c.id?"rgba(107,95,250,0.1)":"none",borderLeft:active?.id===c.id?"2px solid var(--accent)":"2px solid transparent"}}
                onMouseEnter={e=>{if(active?.id!==c.id)e.currentTarget.style.background="rgba(255,255,255,0.03)"}}
                onMouseLeave={e=>{if(active?.id!==c.id)e.currentTarget.style.background="none"}}>
                <Av name={c.full_name} size={36} color={c.color} online={getOnline(c.id) || c.online}/>
                <div style={{minWidth:0,flex:1}}>
                  <div style={{fontSize:13,fontWeight:700}}>{c.full_name}</div>
                  <div style={{fontSize:11,color:"var(--text3)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.lastMessage||(c.skills_offered||[]).slice(0,2).join(", ")||"No skills"}</div>
                </div>
                {c.lastActivity&&<div style={{fontSize:10,color:"var(--text3)",flexShrink:0}}>{timeAgo(c.lastActivity)}</div>}
              </div>
            ))
          )
        )}
      </div>

      {/* Chat area */}
      {active?(
        <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
          {callPhase === "incoming" && incomingCall && (
            <div style={{margin:"10px 16px 0",padding:"10px 12px",borderRadius:10,border:"1px solid rgba(249,115,22,0.3)",background:"var(--orangebg)",display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontWeight:700,fontSize:12,color:"var(--orange)",flex:1}}>{incomingCall.fromName} is calling you...</span>
              <button className="btn btn-p btn-sm" onClick={acceptCall}>Accept</button>
              <button className="btn btn-d btn-sm" onClick={declineCall}>Decline</button>
            </div>
          )}

          <div style={{padding:"12px 18px",borderBottom:"1px solid var(--border)",display:"flex",gap:12,alignItems:"center",background:"var(--bg2)"}}>
            <Av name={active.full_name} size={34} color={active.color} online={getOnline(active.id) || active.online}/>
            <div>
              <div style={{fontWeight:700,fontSize:14}}>{active.full_name}</div>
              <div style={{fontSize:11,color:(getOnline(active.id)||active.online)?"var(--green)":"var(--text3)",fontWeight:600}}>{(getOnline(active.id)||active.online)?"● Online":"○ Offline"}</div>
            </div>
            <div style={{marginLeft:"auto",display:"flex",gap:6}}>
              {(active.skills_offered||[]).slice(0,2).map(s=><span key={s} className="badge" style={{background:"var(--greenbg)",color:"var(--green)",border:"1px solid rgba(31,200,154,0.2)",fontSize:10}}>↑ {s}</span>)}
              {callPhase === "idle" ? (
                <button className="btn btn-s btn-sm" onClick={startVideoCall} disabled={!isVideoSupported || !signalReady}>Video Call</button>
              ) : (
                <button className="btn btn-d btn-sm" onClick={()=>endCall(true)}>End Call</button>
              )}
            </div>
          </div>

          {isInCallWithActive && (
            <div style={{padding:"12px 18px",borderBottom:"1px solid var(--border)",background:"var(--bg3)"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <span style={{fontSize:12,color:"var(--accent2)",fontWeight:700}}>{currentCallLabel}</span>
                <span style={{fontSize:11,color:signalReady?"var(--green)":"var(--yellow)",fontWeight:700}}>{signalReady?"Signal ready":"Signal connecting"}</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 220px",gap:10}}>
                <div style={{background:"#000",border:"1px solid var(--border)",borderRadius:10,position:"relative",minHeight:180,overflow:"hidden"}}>
                  <video ref={remoteVideoRef} autoPlay playsInline style={{width:"100%",height:"100%",objectFit:"cover"}} />
                  {!remoteStream && <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"var(--text3)"}}>Waiting for remote video...</div>}
                </div>
                <div style={{background:"#000",border:"1px solid var(--border)",borderRadius:10,position:"relative",minHeight:180,overflow:"hidden"}}>
                  <video ref={localVideoRef} autoPlay playsInline muted style={{width:"100%",height:"100%",objectFit:"cover"}} />
                  {!localStream && <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"var(--text3)"}}>Camera preview</div>}
                </div>
              </div>
              <div style={{display:"flex",gap:8,marginTop:10}}>
                <button className="btn btn-s btn-sm" onClick={toggleMic}>{micMuted?"Unmute":"Mute"}</button>
                <button className="btn btn-s btn-sm" onClick={toggleCamera}>{cameraOff?"Camera On":"Camera Off"}</button>
                <button className="btn btn-d btn-sm" onClick={()=>endCall(true)}>Hang Up</button>
              </div>
            </div>
          )}

          {callPhase !== "idle" && !isInCallWithActive && currentCallLabel && (
            <div style={{padding:"8px 18px",fontSize:12,fontWeight:700,color:"var(--accent2)",background:"var(--accentbg)",borderBottom:"1px solid var(--border)"}}>{currentCallLabel}</div>
          )}

          {callError && (
            <div style={{padding:"8px 18px",fontSize:12,fontWeight:700,color:"var(--red)",background:"var(--redbg)",borderBottom:"1px solid var(--border)"}}>{callError}</div>
          )}

          {!isVideoSupported && (
            <div style={{padding:"8px 18px",fontSize:12,fontWeight:700,color:"var(--yellow)",background:"var(--yellowbg)",borderBottom:"1px solid var(--border)"}}>
              Video calling requires a modern browser with camera and microphone access.
            </div>
          )}

          <div style={{flex:1,overflowY:"auto",padding:"16px 18px 8px"}}>
            {loading?<div style={{display:"flex",justifyContent:"center",padding:30}}><Spinner/></div>:(
              msgs.length===0?(
                <div style={{textAlign:"center",padding:40,color:"var(--text3)"}}>
                  <div style={{fontSize:32,marginBottom:10}}>◻</div>
                  <div style={{fontWeight:700,marginBottom:6}}>Start the conversation!</div>
                  <p style={{fontSize:12}}>Say hi to {active.full_name.split(" ")[0]} 👋</p>
                </div>
              ):(
                msgs.map((m,i)=>{
                  const mine=m.from_id===user.id;
                  return (
                    <div key={m.id} style={{display:"flex",justifyContent:mine?"flex-end":"flex-start",marginBottom:10,animation:`msgIn 0.2s ease ${i*0.01}s both`,alignItems:"flex-end",gap:8}}>
                      {!mine&&<Av name={active.full_name} size={26} color={active.color} style={{marginBottom:2}}/>}
                      <div style={{maxWidth:"68%"}}>
                        <div style={{padding:"9px 13px",borderRadius:mine?"14px 14px 3px 14px":"14px 14px 14px 3px",background:mine?"var(--accent)":"var(--card2)",color:mine?"#fff":"var(--text)",fontSize:14,lineHeight:1.55,border:mine?"none":"1px solid var(--border)"}}>{m.text}</div>
                        <div style={{fontSize:9,color:"var(--text3)",marginTop:3,textAlign:mine?"right":"left"}}>{fmtTime(m.created_at)}</div>
                      </div>
                    </div>
                  );
                })
              )
            )}
            <div ref={bottomRef}/>
          </div>

          <div style={{padding:"10px 18px",borderTop:"1px solid var(--border)",display:"flex",gap:9,background:"var(--bg2)"}}>
            <input className="inp" placeholder={`Message ${active.full_name.split(" ")[0]}...`} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} style={{flex:1}}/>
            <button className="btn btn-p" onClick={send} disabled={!input.trim()} style={{padding:"10px 16px"}}>Send</button>
          </div>
        </div>
      ):(
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--text3)"}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:48,marginBottom:12}}>◻</div>
            <div style={{fontSize:16,fontWeight:700}}>Select a conversation</div>
            <p style={{fontSize:13,marginTop:6}}>Or go to People to start a new one</p>
            {callPhase === "incoming" && incomingCall && (
              <div style={{marginTop:14,display:"flex",gap:8,justifyContent:"center"}}>
                <button className="btn btn-p btn-sm" onClick={acceptCall}>Answer {incomingCall.fromName}</button>
                <button className="btn btn-d btn-sm" onClick={declineCall}>Decline</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── WALLET ────────────────────────────────────────────────────
function Wallet({user,toast}) {
  const earned=MOCK_TRANSACTIONS.filter(t=>t.type==="earn"||t.type==="bonus").reduce((s,t)=>s+t.credits,0);
  const spent=Math.abs(MOCK_TRANSACTIONS.filter(t=>t.type==="spend").reduce((s,t)=>s+t.credits,0));
  return (
    <div style={{padding:"24px 28px",maxWidth:800}}>
      <DemoBanner/>
      <div style={{background:"linear-gradient(135deg,rgba(107,95,250,0.12),rgba(31,200,154,0.07))",border:"1px solid rgba(107,95,250,0.25)",borderRadius:18,padding:"26px 28px",marginBottom:22,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-30,right:-30,width:140,height:140,borderRadius:"50%",background:"radial-gradient(circle,rgba(107,95,250,0.12),transparent)",animation:"orb 7s infinite"}}/>
        <div style={{fontSize:12,color:"var(--text3)",fontWeight:700,marginBottom:8,letterSpacing:"0.06em"}}>CURRENT BALANCE</div>
        <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:4}}>
          <span className="mono" style={{fontSize:54,fontWeight:800,color:"var(--yellow)",lineHeight:1}}>{user.credits||0}</span>
          <span style={{fontSize:18,color:"var(--text3)",fontWeight:600}}>credits</span>
        </div>
        <p style={{fontSize:13,color:"var(--text2)",marginBottom:20}}>Each credit = 1 hour of skill exchange time</p>
        <div style={{fontSize:12,color:"var(--text3)",fontStyle:"italic"}}>💡 Earn credits by teaching your skills to others</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:22}}>
        {[{label:"Total Earned",v:`+${earned}`,c:"var(--green)"},{label:"Total Spent",v:`-${spent}`,c:"var(--red)"},{label:"Net",v:`+${earned-spent}`,c:"var(--yellow)"}].map((s,i)=>(
          <div key={i} style={{padding:"16px 18px",background:"var(--card2)",border:"1px solid var(--border)",borderRadius:12,textAlign:"center"}}>
            <div className="mono" style={{fontSize:24,fontWeight:800,color:s.c}}>{s.v}</div>
            <div style={{fontSize:11,color:"var(--text3)",marginTop:4,fontWeight:700}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <div style={{padding:"14px 18px",borderBottom:"1px solid var(--border)",fontWeight:700,fontSize:14}}>Transaction History</div>
        {MOCK_TRANSACTIONS.map((t,i)=>(
          <div key={t.id} style={{padding:"13px 18px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid var(--border)",animation:`fadeUp 0.3s ease ${i*0.04}s both`}}>
            <div style={{width:36,height:36,borderRadius:9,flexShrink:0,background:t.type==="earn"||t.type==="bonus"?"var(--greenbg)":"var(--redbg)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:t.type==="earn"||t.type==="bonus"?"var(--green)":"var(--red)"}}>
              {t.type==="earn"?"↑":t.type==="bonus"?"★":"↓"}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:600}}>{t.label}</div>
              <div style={{fontSize:11,color:"var(--text3)"}}>{t.created_at}</div>
            </div>
            <div className="mono" style={{fontSize:15,fontWeight:800,color:t.credits>0?"var(--green)":"var(--red)"}}>
              {t.credits>0?"+":""}{t.credits}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PROFILE ───────────────────────────────────────────────────
function Profile({user,setUser,toast}) {
  const [editing,setEditing]=useState(false);
  const [form,setForm]=useState({full_name:user.full_name||"",bio:user.bio||"",location:user.location||"",skills_offered_str:(user.skills_offered||[]).join(", "),skills_wanted_str:(user.skills_wanted||[]).join(", ")});
  const [saving,setSaving]=useState(false);

  const set=k=>e=>setForm(f=>({...f,[k]:e.target.value}));

  const save=async()=>{
    setSaving(true);
    const updated={...user,...form,skills_offered:form.skills_offered_str.split(",").map(s=>s.trim()).filter(Boolean),skills_wanted:form.skills_wanted_str.split(",").map(s=>s.trim()).filter(Boolean)};
    try{
      await updateProfile(user.id, {full_name:form.full_name,bio:form.bio,location:form.location,skills_offered:updated.skills_offered,skills_wanted:updated.skills_wanted});
      setUser(updated);
      toast("Profile saved! ✓","success");
      setEditing(false);
    }catch(e){toast(e.message,"error");}finally{setSaving(false);}
  };

  const DAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  return (
    <div style={{padding:"24px 28px",maxWidth:760}}>
      <DemoBanner/>
      <div style={{background:"linear-gradient(135deg,rgba(107,95,250,0.1),rgba(31,200,154,0.05))",border:"1px solid var(--border2)",borderRadius:18,padding:"24px 26px",marginBottom:20,position:"relative"}}>
        <div style={{display:"flex",gap:16,alignItems:"flex-start",marginBottom:18}}>
          <Av name={user.full_name||"?"} size={66} color={user.color} online/>
          <div style={{flex:1}}>
            {editing?(
              <input className="inp" value={form.full_name} onChange={set("full_name")} style={{fontSize:18,fontWeight:700,marginBottom:10}}/>
            ):(
              <h2 style={{fontFamily:"'Fraunces',serif",fontSize:24,fontWeight:700,marginBottom:4}}>{user.full_name}</h2>
            )}
            <div style={{fontSize:12,color:"var(--text2)",marginBottom:8}}>{user.email}</div>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              <span className="badge" style={{background:"var(--greenbg)",color:"var(--green)",border:"1px solid rgba(31,200,154,0.2)"}}>Trust {user.trust_score||100}%</span>
              <span className="badge" style={{background:"var(--yellowbg)",color:"var(--yellow)",border:"1px solid rgba(245,200,66,0.2)"}}>◇ {user.credits||0} credits</span>
              <span className="badge" style={{background:"var(--accentbg)",color:"var(--accent2)",border:"1px solid rgba(107,95,250,0.2)"}}>⭐ {user.rating||0}</span>
              {user.role==="admin"&&<span className="badge" style={{background:"var(--accentbg)",color:"var(--accent2)",border:"1px solid rgba(107,95,250,0.2)"}}>Admin</span>}
            </div>
          </div>
          <button className={`btn ${editing?"btn-p":"btn-s"}`} onClick={()=>{if(editing)save();else setEditing(true);}} disabled={saving}>
            {saving?<Spinner/>:editing?"Save ✓":"Edit Profile"}
          </button>
        </div>

        {editing?(
          <textarea className="inp" value={form.bio} onChange={set("bio")} placeholder="Tell people about yourself..." rows={3}/>
        ):(
          <p style={{fontSize:14,color:"var(--text2)",lineHeight:1.7}}>{user.bio||<span style={{color:"var(--text3)",fontStyle:"italic"}}>No bio yet. Click Edit Profile to add one.</span>}</p>
        )}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        <div className="card" style={{padding:18}}>
          <h3 style={{fontSize:13,fontWeight:700,marginBottom:12,color:"var(--green)"}}>↑ SKILLS I OFFER</h3>
          {editing?(
            <div>
              <textarea className="inp" value={form.skills_offered_str} onChange={set("skills_offered_str")} placeholder="Python, React.js, Guitar..." rows={3} style={{fontSize:13}}/>
              <div style={{fontSize:11,color:"var(--text3)",marginTop:5}}>Separate with commas</div>
            </div>
          ):(
            (user.skills_offered||[]).length===0?(
              <p style={{fontSize:12,color:"var(--text3)",fontStyle:"italic"}}>No skills added. Click Edit Profile.</p>
            ):(user.skills_offered||[]).map(s=>(
              <div key={s} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
                <div style={{width:24,height:24,borderRadius:7,background:"var(--greenbg)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"var(--green)",fontWeight:700}}>↑</div>
                <span style={{fontSize:13,fontWeight:600}}>{s}</span>
              </div>
            ))
          )}
        </div>
        <div className="card" style={{padding:18}}>
          <h3 style={{fontSize:13,fontWeight:700,marginBottom:12,color:"var(--accent2)"}}>↓ SKILLS I WANT</h3>
          {editing?(
            <div>
              <textarea className="inp" value={form.skills_wanted_str} onChange={set("skills_wanted_str")} placeholder="Guitar, Spanish, Yoga..." rows={3} style={{fontSize:13}}/>
              <div style={{fontSize:11,color:"var(--text3)",marginTop:5}}>Separate with commas</div>
            </div>
          ):(
            (user.skills_wanted||[]).length===0?(
              <p style={{fontSize:12,color:"var(--text3)",fontStyle:"italic"}}>No skills added. Click Edit Profile.</p>
            ):(user.skills_wanted||[]).map(s=>(
              <div key={s} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
                <div style={{width:24,height:24,borderRadius:7,background:"var(--accentbg)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"var(--accent)",fontWeight:700}}>↓</div>
                <span style={{fontSize:13,fontWeight:600}}>{s}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {editing&&(
        <div className="card" style={{padding:18,marginBottom:16}}>
          <h3 style={{fontSize:13,fontWeight:700,marginBottom:12}}>Location</h3>
          <input className="inp" value={form.location} onChange={set("location")} placeholder="e.g. Mumbai, India"/>
        </div>
      )}

      <div className="card" style={{padding:18}}>
        <h3 style={{fontSize:13,fontWeight:700,marginBottom:12}}>Availability</h3>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {DAYS.map(d=>(
            <div key={d} style={{width:42,height:42,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,background:(user.availability||[]).includes(d)?"rgba(107,95,250,0.18)":"rgba(255,255,255,0.03)",border:(user.availability||[]).includes(d)?"1px solid rgba(107,95,250,0.35)":"1px solid var(--border)",color:(user.availability||[]).includes(d)?"var(--accent2)":"var(--text3)",cursor:"pointer",transition:"all 0.15s"}}>
              {d}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN ─────────────────────────────────────────────────────
function Admin({toast}) {
  const stats=[
    {label:"Total Users",v:MOCK_USERS.length+1,ic:"◉",c:"var(--accent)"},
    {label:"Active Skills",v:MOCK_SKILLS.length,ic:"◈",c:"var(--green)"},
    {label:"Exchanges",v:89,ic:"⇄",c:"var(--yellow)"},
    {label:"Open Disputes",v:2,ic:"⚠",c:"var(--red)"},
  ];
  return (
    <div style={{padding:"24px 28px"}}>
      <DemoBanner/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
        {stats.map((s,i)=>(
          <div key={i} style={{padding:"18px 20px",background:"var(--card2)",border:"1px solid var(--border)",borderRadius:14}}>
            <span style={{fontSize:20,color:s.c}}>{s.ic}</span>
            <div className="mono" style={{fontSize:26,fontWeight:800,color:s.c,margin:"8px 0 4px"}}>{s.v}</div>
            <div style={{fontSize:11,color:"var(--text3)",fontWeight:700,letterSpacing:"0.04em"}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <div style={{padding:"14px 18px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontWeight:700,fontSize:14}}>User Management</span>
          <button className="btn btn-p btn-sm" onClick={()=>toast("Export started","success")}>Export CSV</button>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{borderBottom:"1px solid var(--border)"}}>
                {["User","Email","Skills","Exchanges","Trust","Actions"].map(h=>(
                  <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:10,color:"var(--text3)",fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_USERS.map((u,i)=>(
                <tr key={u.id} style={{borderBottom:"1px solid var(--border)",animation:`fadeUp 0.3s ease ${i*0.05}s both`}}>
                  <td style={{padding:"11px 14px"}}><div style={{display:"flex",gap:9,alignItems:"center"}}><Av name={u.full_name} size={28} color={u.color}/><span style={{fontSize:13,fontWeight:600}}>{u.full_name}</span></div></td>
                  <td style={{padding:"11px 14px",fontSize:12,color:"var(--text2)"}}>{u.email}</td>
                  <td style={{padding:"11px 14px",fontSize:13}}>{(u.skills_offered||[]).length}</td>
                  <td style={{padding:"11px 14px",fontSize:13}}>{u.exchanges||0}</td>
                  <td style={{padding:"11px 14px"}}><span style={{fontSize:11,fontWeight:700,color:"var(--green)",background:"var(--greenbg)",padding:"2px 8px",borderRadius:20}}>{u.trust_score}%</span></td>
                  <td style={{padding:"11px 14px"}}><div style={{display:"flex",gap:6}}><button className="btn btn-g btn-sm" onClick={()=>toast(`Viewing ${u.full_name}`,"info")}>View</button><button className="btn btn-d btn-sm" onClick={()=>toast(`${u.full_name} suspended`,"warning")}>Suspend</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT APP ──────────────────────────────────────────────────
export default function App() {
  const { user: authUser, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const { isConnected, isReconnecting } = useConnectionState("skillbarter-connection-room");
  const [user,setUser]=useState(null);
  const [loading,setLoading]=useState(!DEMO_MODE);
  const [page,setPage]=useState("home");
  const [toasts,setToasts]=useState([]);
  const [chatUser,setChatUser]=useState(null);
  const [pendingCount,setPendingCount]=useState(0);

  const toast=useCallback((msg,type="info")=>setToasts(t=>[...t,{id:Date.now()+Math.random(),msg,type}]),[]);
  const rmToast=useCallback(id=>setToasts(t=>t.filter(x=>x.id!==id)),[]);

  // Resolve profile from authenticated session
  useEffect(()=>{
    if(DEMO_MODE){
      setLoading(false);
      return;
    }

    if(authLoading){
      setLoading(true);
      return;
    }

    let active = true;

    (async()=>{
      try{
        if(!authUser){
          if(active) setUser(null);
        } else {
          let profile=await db.getProfile(authUser.id);
          if(!profile){await new Promise(r=>setTimeout(r,500));profile=await db.getProfile(authUser.id);}
          if(!profile){profile=await db.ensureProfile(authUser);}
          if(active){
            setUser({...authUser,...(profile||{}),
              full_name:profile?.full_name||authUser.user_metadata?.full_name||authUser.email.split("@")[0],
              color:avatarColor(profile?.full_name||authUser.email)
            });
          }
        }
      } catch (error) {
        console.error("Failed to restore session", error);
      } finally {
        if(active) setLoading(false);
      }
    })();

    return()=>{ active=false; };
  },[authLoading,authUser]);

  useEffect(()=>{
    if(!user?.id) {
      setPendingCount(0);
      return;
    }

    let alive=true;
    const loadPending = async () => {
      try {
        const requests = await db.getRequests(user.id);
        if(alive) setPendingCount(requests.filter(request=>request.status==="pending" && request.to_user_id===user.id).length);
      } catch {
        if(alive) setPendingCount(0);
      }
    };

    loadPending();
    return ()=>{alive=false;};
  },[user?.id]);

  const goChat=useCallback((u)=>{setChatUser(u);setPage("chat");},[]);

  const renderPage=()=>{
    const p={user,setUser,setPage,toast,setChatUser:goChat};
    switch(page){
      case "home":     return <Dashboard {...p}/>;
      case "people":   return <People {...p}/>;
      case "explore":  return <Explore {...p}/>;
      case "matches":  return <Matches {...p}/>;
      case "requests": return <Requests {...p}/>;
      case "chat":     return <Chat user={user} initialChatUser={chatUser} toast={toast}/>;
      case "wallet":   return <Wallet {...p}/>;
      case "profile":  return <Profile {...p}/>;
      case "admin":    return <Admin {...p}/>;
      default:         return <Dashboard {...p}/>;
    }
  };

  if(loading) return (
    <>
      <StyleTag/>
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg)",flexDirection:"column",gap:16}}>
        <div style={{width:44,height:44,borderRadius:13,background:"linear-gradient(135deg,var(--accent),var(--accent2))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>⟡</div>
        <Spinner size={20}/>
        <div style={{fontSize:13,color:"var(--text3)"}}>Loading SkillBarter...</div>
      </div>
    </>
  );

  if(!user) return (
    <>
      <StyleTag/>
      {!isConnected&&(
        <div style={{position:"sticky",top:0,zIndex:10000,background:"rgba(240,82,82,0.9)",color:"#fff",padding:"8px 14px",fontSize:12,fontWeight:700,textAlign:"center"}}>
          {isReconnecting?"Reconnecting…":"Disconnected"}
        </div>
      )}
      <AuthPage
        signIn={signIn}
        signUp={signUp}
        onAuth={u=>setUser({...u,color:avatarColor(u.full_name||u.email||"user")})}
      />
      {toasts.map(t=><Toast key={t.id} msg={t.msg} type={t.type} onClose={()=>rmToast(t.id)}/>)}
    </>
  );

  return (
    <>
      <StyleTag/>
      {!isConnected&&(
        <div style={{position:"sticky",top:0,zIndex:10000,background:"rgba(240,82,82,0.9)",color:"#fff",padding:"8px 14px",fontSize:12,fontWeight:700,textAlign:"center"}}>
          {isReconnecting?"Reconnecting…":"Disconnected"}
        </div>
      )}
      <div style={{display:"flex",minHeight:"100vh"}}>
        <Sidebar page={page} setPage={setPage} user={user} pendingCount={pendingCount}/>
        <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
          <TopBar page={page} user={user} onLogout={async()=>{ await signOut(); setUser(null); setPage("home"); }} setPage={setPage}/>
          <main style={{flex:1,overflowY:"auto"}}>{renderPage()}</main>
        </div>
      </div>
      {toasts.map(t=><Toast key={t.id} msg={t.msg} type={t.type} onClose={()=>rmToast(t.id)}/>)}
    </>
  );
}
