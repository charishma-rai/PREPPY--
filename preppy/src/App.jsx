import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Calendar as CalendarIcon, Clock, BookOpen, BrainCircuit, 
  Settings, ChevronRight, ChevronLeft, Plus, Trash2, 
  CheckCircle2, XCircle, AlertCircle, RefreshCw, CalendarDays,
  Target, GraduationCap, Briefcase, Dumbbell, MoreHorizontal
} from 'lucide-react';

// --- Utility: Local Storage Hook ---
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(error);
    }
  };
  return [storedValue, setValue];
}

// --- Utility: Date Helpers ---
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};
const formatDate = (date) => date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const formatTime = (date) => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
const getDaysBetween = (start, end) => Math.ceil((end - start) / (1000 * 60 * 60 * 24));
const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Shared UI Components ---
const Card = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 ${onClick ? 'cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all' : ''} ${className}`}
  >
    {children}
  </div>
);

const Button = ({ children, variant = 'primary', onClick, disabled, className = '', icon: Icon }) => {
  const baseStyle = "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-md",
    secondary: "bg-pink-100 text-pink-900 hover:bg-pink-200",
    tertiary: "bg-blue-50 text-blue-800 hover:bg-blue-100",
    outline: "border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100",
    danger: "bg-red-50 text-red-600 hover:bg-red-100"
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

const Input = ({ label, type = 'text', value, onChange, placeholder, min }) => (
  <div className="flex flex-col gap-2">
    {label && <label className="text-sm font-medium text-slate-700 ml-1">{label}</label>}
    <input
      type={type}
      value={value}
      min={min}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all outline-none"
    />
  </div>
);

const Mascot = ({ message }) => (
  <div className="flex items-end gap-3 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-2xl shadow-sm border border-pink-200 z-10 shrink-0">
      🐷
    </div>
    <div className="bg-white px-5 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-slate-100 text-slate-700 text-sm font-medium">
      {message}
    </div>
  </div>
);

// --- Wizard Step Components ---
const Step1Basics = ({ data, updateData }) => {
  const daysLeft = data.date ? getDaysBetween(new Date(), new Date(data.date)) : null;

  return (
    <div className="space-y-6">
      <Mascot message="Let's start with the basics. What are we studying for?" />
      <Card className="space-y-6">
        <Input 
          label="Exam Name" 
          placeholder="e.g., Final Semester Exams, SAT, AWS Cert" 
          value={data.name} 
          onChange={(v) => updateData({ name: v })} 
        />
        <Input 
          label="Exam Date" 
          type="date" 
          min={new Date().toISOString().split('T')[0]}
          value={data.date} 
          onChange={(v) => updateData({ date: v })} 
        />
        {daysLeft !== null && (
          <div className="bg-blue-50/80 p-4 rounded-2xl flex items-center gap-4 text-blue-900">
            <CalendarDays className="text-blue-500" />
            <div>
              <p className="font-semibold text-lg">{daysLeft > 0 ? daysLeft : 0} days remaining</p>
              <p className="text-sm opacity-80">That's about {Math.floor(Math.max(0, daysLeft) / 7)} weeks.</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

const Step2Availability = ({ data, updateData }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  return (
    <div className="space-y-6">
      <Mascot message="How many hours can you realistically dedicate to studying each day?" />
      <Card className="space-y-4">
        {days.map(day => {
          const key = day.toLowerCase();
          return (
            <div key={day} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
              <span className="font-medium text-slate-700 w-24">{day}</span>
              <div className="flex items-center gap-3">
                <input 
                  type="range" 
                  min="0" max="16" step="0.5"
                  value={data[key] || 0}
                  onChange={(e) => updateData({ [key]: parseFloat(e.target.value) })}
                  className="w-32 md:w-48 accent-pink-400"
                />
                <span className="w-12 text-right font-semibold text-pink-600">{data[key] || 0}h</span>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
};

const Step3Commitments = ({ data, updateData }) => {
  const [newCommitment, setNewCommitment] = useState({ name: '', type: 'College', day: 'monday', hours: 2 });
  const types = [{id: 'College', icon: GraduationCap}, {id: 'Work', icon: Briefcase}, {id: 'Gym', icon: Dumbbell}, {id: 'Other', icon: MoreHorizontal}];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const addCommitment = () => {
    if (!newCommitment.name) return;
    updateData([...data, { ...newCommitment, id: generateId() }]);
    setNewCommitment({ name: '', type: 'College', day: 'monday', hours: 2 });
  };

  const removeCommitment = (id) => updateData(data.filter(c => c.id !== id));

  return (
    <div className="space-y-6">
      <Mascot message="Life happens! Let's block out time for your recurring commitments so we don't overschedule." />
      
      <Card className="space-y-4 bg-violet-50/50 border-violet-100">
        <h3 className="font-semibold text-violet-900 mb-2">Add a recurring commitment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input placeholder="E.g. Biology Lab" value={newCommitment.name} onChange={(v) => setNewCommitment({...newCommitment, name: v})} />
          <select 
            className="px-4 py-3 rounded-2xl border border-slate-200 bg-white"
            value={newCommitment.type} onChange={(e) => setNewCommitment({...newCommitment, type: e.target.value})}
          >
            {types.map(t => <option key={t.id} value={t.id}>{t.id}</option>)}
          </select>
          <select 
            className="px-4 py-3 rounded-2xl border border-slate-200 bg-white"
            value={newCommitment.day} onChange={(e) => setNewCommitment({...newCommitment, day: e.target.value})}
          >
            {days.map(d => <option key={d.toLowerCase()} value={d.toLowerCase()}>{d}</option>)}
          </select>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200">
            <span className="text-sm text-slate-500">Hours:</span>
            <input type="number" min="0.5" step="0.5" value={newCommitment.hours} onChange={(e) => setNewCommitment({...newCommitment, hours: parseFloat(e.target.value)})} className="w-16 outline-none bg-transparent" />
          </div>
        </div>
        <Button variant="secondary" onClick={addCommitment} className="w-full" icon={Plus}>Add Commitment</Button>
      </Card>

      {data.length > 0 && (
        <div className="space-y-3">
          {data.map(c => {
            const TypeIcon = types.find(t => t.id === c.type)?.icon || MoreHorizontal;
            return (
              <div key={c.id} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-100 rounded-xl text-slate-600"><TypeIcon size={18} /></div>
                  <div>
                    <p className="font-semibold text-slate-800">{c.name}</p>
                    <p className="text-sm text-slate-500 capitalize">{c.day}s • {c.hours} hours</p>
                  </div>
                </div>
                <button onClick={() => removeCommitment(c.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Step4Syllabus = ({ data, updateData }) => {
  const addSubject = () => {
    updateData([...data, { id: generateId(), name: 'New Subject', confidence: 'Average', topics: [] }]);
  };

  const updateSubject = (id, name) => updateData(data.map(s => s.id === id ? { ...s, name } : s));
  const removeSubject = (id) => updateData(data.filter(s => s.id !== id));

  const addTopic = (subjectId) => {
    updateData(data.map(s => {
      if (s.id === subjectId) {
        return { ...s, topics: [...s.topics, { id: generateId(), name: 'New Topic', confidence: 'Average', subtopics: [] }] };
      }
      return s;
    }));
  };

  const updateTopic = (subjectId, topicId, name) => {
    updateData(data.map(s => s.id === subjectId ? {
      ...s, topics: s.topics.map(t => t.id === topicId ? { ...t, name } : t)
    } : s));
  };

  const removeTopic = (subjectId, topicId) => {
    updateData(data.map(s => s.id === subjectId ? { ...s, topics: s.topics.filter(t => t.id !== topicId) } : s));
  };

  const addSubtopic = (subjectId, topicId) => {
    updateData(data.map(s => s.id === subjectId ? {
      ...s, topics: s.topics.map(t => t.id === topicId ? {
        ...t, subtopics: [...t.subtopics, { id: generateId(), name: 'New Subtopic' }]
      } : t)
    } : s));
  };

  const updateSubtopic = (subjectId, topicId, subtopicId, name) => {
    updateData(data.map(s => s.id === subjectId ? {
      ...s, topics: s.topics.map(t => t.id === topicId ? {
        ...t, subtopics: t.subtopics.map(st => st.id === subtopicId ? { ...st, name } : st)
      } : t)
    } : s));
  };

  const removeSubtopic = (subjectId, topicId, subtopicId) => {
    updateData(data.map(s => s.id === subjectId ? {
      ...s, topics: s.topics.map(t => t.id === topicId ? {
        ...t, subtopics: t.subtopics.filter(st => st.id !== subtopicId)
      } : t)
    } : s));
  };

  return (
    <div className="space-y-6">
      <Mascot message="Time to break it down! Add your subjects, topics, and specific subtopics. The more detailed, the better the plan." />
      
      {data.map((subject, sIdx) => (
        <Card key={subject.id} className="p-0 overflow-hidden border-2 border-slate-100">
          <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center gap-3">
            <div className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">{sIdx + 1}</div>
            <input 
              value={subject.name} 
              onChange={(e) => updateSubject(subject.id, e.target.value)}
              className="bg-transparent font-bold text-lg text-slate-800 outline-none w-full focus:border-b-2 focus:border-blue-300"
            />
            <button onClick={() => removeSubject(subject.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
          </div>
          
          <div className="p-4 space-y-4">
            {subject.topics.map((topic, tIdx) => (
              <div key={topic.id} className="ml-4 pl-4 border-l-2 border-slate-100 space-y-3">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                   <input 
                    value={topic.name} 
                    onChange={(e) => updateTopic(subject.id, topic.id, e.target.value)}
                    className="bg-slate-50 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 outline-none w-full focus:ring-2 focus:ring-blue-100"
                  />
                  <button onClick={() => removeTopic(subject.id, topic.id)} className="text-slate-400 hover:text-red-500"><XCircle size={16} /></button>
                </div>

                <div className="ml-6 space-y-2">
                  {topic.subtopics.map(subtopic => (
                    <div key={subtopic.id} className="flex items-center gap-2">
                      <div className="w-4 border-t border-slate-200"></div>
                      <input 
                        value={subtopic.name} 
                        onChange={(e) => updateSubtopic(subject.id, topic.id, subtopic.id, e.target.value)}
                        className="text-sm bg-transparent border-b border-dashed border-slate-300 text-slate-600 outline-none w-full py-1 focus:border-blue-400"
                        placeholder="Specific subtopic..."
                      />
                      <button onClick={() => removeSubtopic(subject.id, topic.id, subtopic.id)} className="text-slate-300 hover:text-red-400"><XCircle size={14} /></button>
                    </div>
                  ))}
                  <button onClick={() => addSubtopic(subject.id, topic.id)} className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 ml-6 mt-2">
                    <Plus size={12} /> Add Subtopic
                  </button>
                </div>
              </div>
            ))}
            <Button variant="ghost" onClick={() => addTopic(subject.id)} className="ml-4 text-sm py-2"><Plus size={16} /> Add Topic to {subject.name}</Button>
          </div>
        </Card>
      ))}
      <Button variant="outline" onClick={addSubject} className="w-full border-dashed"><Plus size={18} /> Add Subject</Button>
    </div>
  );
};

const Step5Confidence = ({ data, updateData }) => {
  const setTopicConfidence = (subjectId, topicId, level) => {
    updateData(data.map(s => s.id === subjectId ? {
      ...s, topics: s.topics.map(t => t.id === topicId ? { ...t, confidence: level } : t)
    } : s));
  };

  const levels = [
    { id: 'Weak', color: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200' },
    { id: 'Average', color: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200' },
    { id: 'Strong', color: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200' }
  ];

  return (
    <div className="space-y-6">
      <Mascot message="Be honest! How confident do you feel about these topics? I'll schedule more time for the weak ones early on." />
      <div className="space-y-6">
        {data.map(subject => (
          <div key={subject.id} className="space-y-3">
            <h3 className="font-bold text-slate-800 border-b pb-2">{subject.name}</h3>
            {subject.topics.map(topic => (
              <div key={topic.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm gap-4">
                <div>
                  <p className="font-medium text-slate-700">{topic.name}</p>
                  <p className="text-xs text-slate-400">{topic.subtopics.length} subtopics</p>
                </div>
                <div className="flex gap-2">
                  {levels.map(l => (
                    <button
                      key={l.id}
                      onClick={() => setTopicConfidence(subject.id, topic.id, l.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${topic.confidence === l.id ? l.color + ' ring-2 ring-offset-1 ring-slate-300' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                    >
                      {l.id}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const Step6Preferences = ({ data, updateData }) => (
  <div className="space-y-6">
    <Mascot message="Almost done! How should we wrap up the plan before the big day?" />
    <Card className="space-y-6">
      <div className="space-y-3">
        <label className="font-medium text-slate-700 block">Buffer Days (Finish syllabus X days before exam)</label>
        <select 
          value={data.bufferDays} 
          onChange={(e) => updateData({...data, bufferDays: parseInt(e.target.value)})}
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
        >
          <option value={3}>3 Days (Risky)</option>
          <option value={7}>7 Days (Standard)</option>
          <option value={14}>14 Days (Safe)</option>
          <option value={21}>21 Days (Overachiever)</option>
        </select>
      </div>

      <div className="space-y-3">
        <label className="font-medium text-slate-700 block">Revision Style</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {['None', 'Daily Recap', 'Weekly Review', 'Spaced Repetition'].map(style => (
            <button
              key={style}
              onClick={() => updateData({...data, revisionStyle: style})}
              className={`p-3 rounded-xl border text-sm font-medium transition-all ${data.revisionStyle === style ? 'bg-pink-100 border-pink-300 text-pink-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="font-medium text-slate-700 block">Mock Test Frequency</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {['None', 'Weekly Mini Tests', 'Bi-Weekly Subject Tests', 'Full Mocks (Last 2 weeks)'].map(freq => (
            <button
              key={freq}
              onClick={() => updateData({...data, mockFrequency: freq})}
              className={`p-3 rounded-xl border text-sm font-medium transition-all ${data.mockFrequency === freq ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {freq}
            </button>
          ))}
        </div>
      </div>
    </Card>
  </div>
);

// --- Core Algorithm (Deterministic Scheduler) ---
const generateScheduleAlgorithm = (appState) => {
  const { examDetails, availability, commitments, syllabus, preferences } = appState;
  
  if (!examDetails.date) return [];

  const examDate = new Date(examDetails.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start scheduling from today/tomorrow
  
  // Calculate End Date for new topics (Exam Date - Buffer)
  const syllabusEndDate = new Date(examDate);
  syllabusEndDate.setDate(syllabusEndDate.getDate() - (preferences.bufferDays || 7));

  if (today >= syllabusEndDate) {
    alert("Not enough days left based on your buffer preference! Try reducing the buffer.");
    return [];
  }

  // 1. Flatten Syllabus into queue
  let studyQueue = [];
  syllabus.forEach(subject => {
    subject.topics.forEach(topic => {
      topic.subtopics.forEach(subtopic => {
        studyQueue.push({
          id: generateId(),
          subjectId: subject.id,
          subjectName: subject.name,
          topicId: topic.id,
          topicName: topic.name,
          subtopicId: subtopic.id,
          subtopicName: subtopic.name,
          confidence: topic.confidence,
          // Estimated minutes based on confidence
          durationReq: topic.confidence === 'Weak' ? 120 : (topic.confidence === 'Average' ? 90 : 60),
          type: 'study'
        });
      });
    });
  });

  if (studyQueue.length === 0) return [];

  // Sort queue: Weak first, then interleave subjects slightly (simplified: just by confidence for now)
  const confidenceWeight = { 'Weak': 3, 'Average': 2, 'Strong': 1 };
  studyQueue.sort((a, b) => confidenceWeight[b.confidence] - confidenceWeight[a.confidence]);

  // 2. Pre-calculate Daily Capacity Map for EVERY day from tomorrow through the exam
  const daysMap = new Map(); // timestamp -> { totalMins, usedMins, date }
  let currentDate = new Date(today);
  currentDate.setDate(currentDate.getDate() + 1);

  while (currentDate <= examDate) {
    const dayStr = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    let baseMins = (availability[dayStr] || 0) * 60;
    const dailyCommitments = commitments.filter(c => c.day === dayStr);
    const commitmentMins = dailyCommitments.reduce((sum, c) => sum + (c.hours * 60), 0);
    const availableMins = Math.max(0, baseMins - commitmentMins);

    daysMap.set(currentDate.getTime(), {
      date: new Date(currentDate),
      totalMins: availableMins,
      usedMins: 0
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  const dateKeys = Array.from(daysMap.keys()).sort();
  let schedule = [];

  // 3. Distribute the syllabus itself, subtopic by subtopic, moving forward day by day.
  // Everything that gets fully covered goes into coveredPool so later days can revisit it.
  let coveredPool = [];
  let queueIndex = 0;
  let dateIndex = 0;

  while (queueIndex < studyQueue.length && dateIndex < dateKeys.length) {
    const dayInfo = daysMap.get(dateKeys[dateIndex]);
    const task = studyQueue[queueIndex];
    const minsNeeded = task.durationReq;
    const minsAvailable = dayInfo.totalMins - dayInfo.usedMins;

    if (minsAvailable >= 30) { // Minimum 30 min block
      const allocMins = Math.min(minsNeeded, minsAvailable);
      const eventStartHour = 9 + (dayInfo.usedMins / 60);

      schedule.push({
        ...task,
        eventId: generateId(),
        date: dayInfo.date.toISOString(),
        duration: allocMins,
        status: 'pending',
        title: `${task.subjectName}: ${task.subtopicName}`,
        startTime: `${Math.floor(eventStartHour)}:${(eventStartHour % 1) * 60 === 0 ? '00' : '30'} AM`,
      });

      dayInfo.usedMins += allocMins;

      if (allocMins >= minsNeeded) {
        coveredPool.push(task);
        queueIndex++;
      } else {
        task.durationReq -= allocMins;
        dateIndex++;
      }
    } else {
      dateIndex++;
    }
  }

  // If the syllabus genuinely doesn't fit before the buffer window, don't drop it silently —
  // stack whatever's left onto the final available day so it's still visible on the plan.
  while (queueIndex < studyQueue.length) {
    const task = studyQueue[queueIndex];
    const fallbackDate = dateKeys.length
      ? new Date(daysMap.get(dateKeys[dateKeys.length - 1]).date)
      : new Date(examDate);
    schedule.push({
      ...task,
      eventId: generateId(),
      date: fallbackDate.toISOString(),
      duration: task.durationReq,
      status: 'pending',
      title: `${task.subjectName}: ${task.subtopicName} (Tight fit)`,
    });
    coveredPool.push(task);
    queueIndex++;
  }

  // 4. Walk every single day from tomorrow to the exam and fill remaining capacity with
  // mock tests, revision (style-dependent), and — as a safety net — rotating practice on
  // whatever's already been covered, so the plan never just goes blank partway through.
  let revisionRotation = 0;
  let dayCounter = 0;

  dateKeys.forEach(key => {
    const dayInfo = daysMap.get(key);
    const dayStr = dayInfo.date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const isBufferPeriod = dayInfo.date > syllabusEndDate;
    dayCounter++;
    const remainingCapacity = () => dayInfo.totalMins - dayInfo.usedMins;

    // -- Mock tests --
    if (preferences.mockFrequency !== 'None' && remainingCapacity() >= 45) {
      const isSunday = dayStr === 'sunday';
      const daysToExam = getDaysBetween(dayInfo.date, examDate);
      let shouldAddMock = false, mockDuration = 60, mockTitle = 'Weekly Mini Mock Test';

      if (preferences.mockFrequency === 'Weekly Mini Tests' && isSunday) {
        shouldAddMock = true; mockDuration = 60; mockTitle = 'Weekly Mini Mock Test';
      } else if (preferences.mockFrequency === 'Bi-Weekly Subject Tests' && isSunday && Math.floor(dayCounter / 7) % 2 === 0) {
        shouldAddMock = true; mockDuration = 90; mockTitle = 'Subject Test';
      } else if (preferences.mockFrequency === 'Full Mocks (Last 2 weeks)' && isSunday && daysToExam <= 14) {
        shouldAddMock = true; mockDuration = 120; mockTitle = 'Full Mock Test';
      }

      if (shouldAddMock) {
        const alloc = Math.min(mockDuration, remainingCapacity());
        schedule.push({
          eventId: generateId(), type: 'mock', date: dayInfo.date.toISOString(), duration: alloc,
          title: mockTitle, status: 'pending', subjectName: 'Mixed Topics', topicName: 'Test Conditions'
        });
        dayInfo.usedMins += alloc;
      }
    }

    // -- Revision, based on chosen style --
    if (preferences.revisionStyle !== 'None' && remainingCapacity() >= 30 && coveredPool.length > 0) {
      let shouldAddRevision = false, revisionDuration = 45, revisionTitle = 'Revision';

      if (preferences.revisionStyle === 'Daily Recap') {
        shouldAddRevision = true; revisionDuration = 30; revisionTitle = 'Daily Recap';
      } else if (preferences.revisionStyle === 'Weekly Review' && dayStr === 'saturday') {
        shouldAddRevision = true; revisionDuration = 90; revisionTitle = 'Weekly Revision Block';
      } else if (preferences.revisionStyle === 'Spaced Repetition' && dayCounter % 3 === 0) {
        shouldAddRevision = true; revisionDuration = 60; revisionTitle = 'Spaced Repetition Review';
      }

      if (shouldAddRevision) {
        const topic = coveredPool[revisionRotation % coveredPool.length];
        revisionRotation++;
        const alloc = Math.min(revisionDuration, remainingCapacity());
        schedule.push({
          eventId: generateId(), type: 'revision', date: dayInfo.date.toISOString(), duration: alloc,
          title: revisionTitle, status: 'pending',
          subjectName: topic.subjectName, topicName: `Revisit: ${topic.subtopicName}`
        });
        dayInfo.usedMins += alloc;
      }
    }

    // -- Safety net: any day that still has real free time left gets filled with
    // rotating practice, so the calendar stays populated all the way to the exam --
    if (remainingCapacity() >= 30 && coveredPool.length > 0) {
      const topic = coveredPool[revisionRotation % coveredPool.length];
      revisionRotation++;
      const alloc = Math.min(isBufferPeriod ? 90 : 60, remainingCapacity());
      schedule.push({
        eventId: generateId(), type: 'revision', date: dayInfo.date.toISOString(), duration: alloc,
        title: isBufferPeriod ? 'Final Revision Phase' : 'Practice & Review', status: 'pending',
        subjectName: topic.subjectName, topicName: `Revisit: ${topic.subtopicName}`
      });
      dayInfo.usedMins += alloc;
    }
  });

  // Sort final schedule chronologically
  return schedule.sort((a, b) => new Date(a.date) - new Date(b.date));
};


// --- Calendar & Detail Views ---
const CalendarView = ({ schedule, setSchedule, onRegenerate }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [viewMode, setViewMode] = useState('week'); // 'week' | 'month'
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);

  // Group schedule by week
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const displayDate = addDays(today, currentWeekOffset * 7);
  const weekStart = new Date(displayDate);
  const dayOfWeek = weekStart.getDay(); 
  weekStart.setDate(weekStart.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Adjust to Monday

  const weekDays = Array.from({length: 7}).map((_, i) => addDays(weekStart, i));

  const weekEvents = schedule.filter(e => {
    const d = new Date(e.date);
    d.setHours(0,0,0,0);
    return d >= weekStart && d <= addDays(weekStart, 6);
  });

  // Group schedule by month (6-row grid, Monday-start, includes leading/trailing days)
  const monthAnchor = new Date(today.getFullYear(), today.getMonth() + currentMonthOffset, 1);
  const monthStartDow = monthAnchor.getDay();
  const monthGridStart = addDays(monthAnchor, -(monthStartDow === 0 ? 6 : monthStartDow - 1));
  const monthGridDays = Array.from({length: 42}).map((_, i) => addDays(monthGridStart, i));

  const eventsByDay = useMemo(() => {
    const map = {};
    schedule.forEach(e => {
      const key = new Date(e.date).toDateString();
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [schedule]);

  const handleAction = (eventId, action) => {
    if (action === 'complete') {
      setSchedule(schedule.map(e => e.eventId === eventId ? { ...e, status: 'completed' } : e));
      setSelectedEvent(null);
    } else if (action === 'toggle') {
      // Quick checklist-style toggle, used by the day detail view — doesn't touch the sidebar
      setSchedule(prev => prev.map(e => e.eventId === eventId ? { ...e, status: e.status === 'completed' ? 'pending' : 'completed' } : e));
    } else if (action === 'skip') {
      // Simple Reschedule: mark skipped, copy event, change date to next week
      setSchedule(prev => {
        const updated = prev.map(e => e.eventId === eventId ? { ...e, status: 'skipped' } : e);
        const skippedEvent = prev.find(e => e.eventId === eventId);
        if (skippedEvent) {
          updated.push({
            ...skippedEvent, 
            eventId: generateId(), 
            date: addDays(new Date(skippedEvent.date), 7).toISOString(), 
            status: 'pending',
            title: `${skippedEvent.title} (Rescheduled)`
          });
        }
        return updated.sort((a, b) => new Date(a.date) - new Date(b.date));
      });
      setSelectedEvent(null);
    }
  };

  const getStatusColor = (status, type) => {
    if (status === 'completed') return 'bg-emerald-100 border-emerald-200 text-emerald-800 opacity-60';
    if (status === 'skipped') return 'bg-slate-100 border-slate-200 text-slate-500 opacity-50 line-through';
    if (type === 'revision') return 'bg-purple-100 border-purple-200 text-purple-800';
    if (type === 'mock') return 'bg-orange-100 border-orange-200 text-orange-800';
    if (type === 'catchup') return 'bg-amber-100 border-amber-200 text-amber-800';
    return 'bg-blue-50 border-blue-200 text-blue-900'; // study
  };

  // --- Day detail modal (click any day to see everything on it as a checklist) ---
  const [dayDetailDate, setDayDetailDate] = useState(null);
  const dayDetailEvents = dayDetailDate ? (eventsByDay[dayDetailDate.toDateString()] || []) : [];

  // --- Missed-session catch-up (only surfaces if a day has run out with pending study sessions) ---
  const [dismissedCatchup, setDismissedCatchup] = useState([]);

  const missedSubjects = useMemo(() => {
    const missed = schedule.filter(e => e.status === 'pending' && e.type === 'study' && new Date(e.date) < today);
    if (missed.length === 0) return [];
    const bySubject = {};
    missed.forEach(e => { bySubject[e.subjectName] = (bySubject[e.subjectName] || 0) + 1; });
    return Object.entries(bySubject).map(([name, count]) => ({ name, count }));
  }, [schedule]);

  const addCatchupSession = (subjectName) => {
    // Find the next day, starting tomorrow, that isn't already packed
    let candidate = addDays(today, 1);
    for (let i = 0; i < 30; i++) {
      const key = candidate.toDateString();
      const existingMins = (eventsByDay[key] || []).reduce((sum, e) => sum + (e.duration || 0), 0);
      if (existingMins < 4 * 60) break;
      candidate = addDays(candidate, 1);
    }
    const newEvent = {
      eventId: generateId(), type: 'catchup', date: candidate.toISOString(), duration: 60,
      status: 'pending', title: `Catch-up: ${subjectName}`, subjectName, topicName: 'Extra practice time'
    };
    setSchedule(prev => [...prev, newEvent].sort((a, b) => new Date(a.date) - new Date(b.date)));
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-6rem)]">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Your Plan</h2>
          <p className="text-sm text-slate-500">
            {viewMode === 'week' ? `Week of ${formatDate(weekStart)}` : monthAnchor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${viewMode === 'week' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${viewMode === 'month' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
            >
              Month
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => viewMode === 'week' ? setCurrentWeekOffset(prev => prev - 1) : setCurrentMonthOffset(prev => prev - 1)} className="p-2"><ChevronLeft size={20}/></Button>
            <Button variant="ghost" onClick={() => { setCurrentWeekOffset(0); setCurrentMonthOffset(0); }} className="px-4 py-2 text-sm">Today</Button>
            <Button variant="ghost" onClick={() => viewMode === 'week' ? setCurrentWeekOffset(prev => prev + 1) : setCurrentMonthOffset(prev => prev + 1)} className="p-2"><ChevronRight size={20}/></Button>
          </div>
        </div>
      </div>

      {/* Catch-up prompt — only appears if a day has passed with a session left unchecked */}
      {missedSubjects.filter(s => !dismissedCatchup.includes(s.name)).map(s => (
        <div key={s.name} className="mb-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-amber-500 shrink-0" size={20} />
            <p className="text-sm text-amber-900">
              <span className="font-semibold">{s.count} missed session{s.count > 1 ? 's' : ''}</span> in {s.name}. Want to add an extra hour to catch up?
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" onClick={() => setDismissedCatchup(prev => [...prev, s.name])} className="text-xs px-3 py-1.5">
              No thanks
            </Button>
            <Button
              variant="secondary"
              onClick={() => { addCatchupSession(s.name); setDismissedCatchup(prev => [...prev, s.name]); }}
              className="text-xs px-3 py-1.5"
            >
              Add extra hour
            </Button>
          </div>
        </div>
      ))}

      {/* Main Grid Area */}
      <div className="flex-1 flex gap-6">
        {/* Weekly List View (Simplified Grid for robustness) */}
        {viewMode === 'week' && (
        <div className="flex-1 space-y-6 pb-20">
          {weekDays.map(day => {
            const dayEvents = weekEvents.filter(e => new Date(e.date).toDateString() === day.toDateString());
            const isToday = day.toDateString() === today.toDateString();

            return (
              <div key={day.toISOString()} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
                {/* Day Header */}
                <div
                  onClick={() => setDayDetailDate(day)}
                  className={`p-4 md:w-32 shrink-0 border-b md:border-b-0 md:border-r border-slate-100 flex flex-row md:flex-col items-center md:items-start justify-between md:justify-start cursor-pointer hover:bg-pink-50/70 transition-colors ${isToday ? 'bg-pink-50/50' : 'bg-slate-50/30'}`}
                >
                  <div>
                    <p className={`text-sm font-semibold uppercase tracking-wider ${isToday ? 'text-pink-600' : 'text-slate-500'}`}>{day.toLocaleDateString('en-US', {weekday: 'short'})}</p>
                    <p className={`text-2xl font-light ${isToday ? 'text-pink-900' : 'text-slate-800'}`}>{day.getDate()}</p>
                  </div>
                  {isToday && <span className="md:mt-4 text-xs font-bold bg-pink-100 text-pink-700 px-2 py-1 rounded-full">TODAY</span>}
                </div>
                
                {/* Events */}
                <div className="p-4 flex-1 flex flex-col gap-3 min-h-[100px]">
                  {dayEvents.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm text-slate-400 italic">No tasks scheduled.</div>
                  ) : (
                    dayEvents.map(event => (
                      <div 
                        key={event.eventId} 
                        onClick={() => setSelectedEvent(event)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${getStatusColor(event.status, event.type)}`}
                      >
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">{event.type}</p>
                          <p className="font-semibold">{event.title}</p>
                          <p className="text-sm opacity-80">{event.subjectName} {event.topicName ? `• ${event.topicName}` : ''}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium opacity-80 whitespace-nowrap bg-white/40 px-3 py-1.5 rounded-xl">
                          <Clock size={14} />
                          {event.duration} min
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* Monthly Grid View (everything visible in one box) */}
        {viewMode === 'month' && (
        <div className="flex-1 pb-20">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Weekday labels */}
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                <div key={d} className="p-2 text-center text-xs font-bold uppercase tracking-wider text-slate-400">{d}</div>
              ))}
            </div>
            {/* Day cells */}
            <div className="grid grid-cols-7">
              {monthGridDays.map(day => {
                const dayEvents = eventsByDay[day.toDateString()] || [];
                const isToday = day.toDateString() === today.toDateString();
                const isCurrentMonth = day.getMonth() === monthAnchor.getMonth();
                const visibleEvents = dayEvents.slice(0, 3);
                const extraCount = dayEvents.length - visibleEvents.length;

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => setDayDetailDate(day)}
                    className={`min-h-[110px] p-2 border-b border-r border-slate-100 flex flex-col gap-1 cursor-pointer hover:bg-pink-50/40 transition-colors ${isCurrentMonth ? 'bg-white' : 'bg-slate-50/40'}`}
                  >
                    <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-pink-500 text-white' : isCurrentMonth ? 'text-slate-600' : 'text-slate-300'}`}>
                      {day.getDate()}
                    </span>
                    <div className="flex flex-col gap-1">
                      {visibleEvents.map(event => (
                        <div
                          key={event.eventId}
                          onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}
                          className={`px-2 py-1 rounded-lg border text-[11px] leading-tight cursor-pointer truncate hover:scale-[1.02] transition-all ${getStatusColor(event.status, event.type)}`}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                      {extraCount > 0 && (
                        <span className="text-[11px] text-slate-400 font-medium pl-1">+{extraCount} more</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        )}

        {/* Detail Sidebar Panel */}
        {selectedEvent && (
          <div className="w-80 shrink-0 bg-white border border-slate-200 shadow-xl rounded-3xl p-6 flex flex-col animate-in slide-in-from-right-8 duration-300">
             <div className="flex justify-between items-start mb-6">
               <h3 className="font-bold text-xl text-slate-800 leading-tight">Session Details</h3>
               <button onClick={() => setSelectedEvent(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-full"><XCircle size={24}/></button>
             </div>
             
             <div className="flex-1 space-y-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Subject</p>
                  <p className="text-slate-800 font-medium">{selectedEvent.subjectName}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Topic</p>
                  <p className="text-slate-800">{selectedEvent.topicName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Specifics</p>
                  <p className="text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">{selectedEvent.subtopicName || 'General Review'}</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 bg-blue-50 p-3 rounded-2xl border border-blue-100">
                    <p className="text-xs font-bold text-blue-400 uppercase mb-1">Duration</p>
                    <p className="text-blue-900 font-semibold">{selectedEvent.duration} mins</p>
                  </div>
                  <div className="flex-1 bg-amber-50 p-3 rounded-2xl border border-amber-100">
                    <p className="text-xs font-bold text-amber-500 uppercase mb-1">Status</p>
                    <p className="text-amber-900 font-semibold capitalize">{selectedEvent.status}</p>
                  </div>
                </div>
             </div>

             <div className="pt-6 border-t border-slate-100 space-y-3 mt-auto">
               {selectedEvent.status === 'pending' && (
                 <>
                  <Button onClick={() => handleAction(selectedEvent.eventId, 'complete')} className="w-full bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30" icon={CheckCircle2}>Mark Complete</Button>
                  <Button variant="outline" onClick={() => handleAction(selectedEvent.eventId, 'skip')} className="w-full" icon={RefreshCw}>Skip & Reschedule</Button>
                 </>
               )}
               {selectedEvent.status !== 'pending' && (
                 <p className="text-center text-sm text-slate-500 italic">This session is {selectedEvent.status}.</p>
               )}
             </div>
          </div>
        )}
      </div>

      {/* Day Detail Checklist Modal */}
      {dayDetailDate && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          onClick={() => setDayDetailDate(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {dayDetailDate.toLocaleDateString('en-US', { weekday: 'long' })}
                </p>
                <h3 className="text-lg font-bold text-slate-800">
                  {dayDetailDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </h3>
              </div>
              <button onClick={() => setDayDetailDate(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-full">
                <XCircle size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {dayDetailEvents.length === 0 ? (
                <p className="text-sm text-slate-400 italic text-center py-8">Nothing scheduled this day.</p>
              ) : (
                dayDetailEvents.map(event => (
                  <div key={event.eventId} className={`flex items-center gap-3 p-3 rounded-2xl border ${getStatusColor(event.status, event.type)}`}>
                    <button
                      onClick={() => handleAction(event.eventId, 'toggle')}
                      className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${event.status === 'completed' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 bg-white hover:border-pink-300'}`}
                    >
                      {event.status === 'completed' && <CheckCircle2 size={16} className="text-white" />}
                    </button>
                    <div
                      onClick={() => { setSelectedEvent(event); setDayDetailDate(null); }}
                      className="flex-1 min-w-0 cursor-pointer"
                    >
                      <p className="text-xs font-bold uppercase tracking-wider opacity-70">{event.type}</p>
                      <p className={`font-semibold truncate ${event.status === 'completed' ? 'line-through opacity-60' : ''}`}>{event.title}</p>
                      <p className="text-xs opacity-70">{event.duration} min</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings/Regen Fab */}
      <button onClick={onRegenerate} className="fixed bottom-6 right-6 bg-slate-900 text-white p-4 rounded-full shadow-lg hover:bg-slate-800 hover:scale-105 transition-all z-50 flex items-center gap-2">
        <Settings size={20} /> <span className="font-semibold pr-2">Modify Plan</span>
      </button>
    </div>
  );
};


// --- Main App Component ---
export default function App() {
  // State initialization with custom hook
  const [currentView, setCurrentView] = useLocalStorage('preppy_view', 'home'); // 'home', 'wizard', 'calendar'
  const [wizardStep, setWizardStep] = useState(1);
  
  const [examDetails, setExamDetails] = useLocalStorage('preppy_exam', { name: '', date: '' });
  const [availability, setAvailability] = useLocalStorage('preppy_avail', { monday: 2, tuesday: 2, wednesday: 2, thursday: 2, friday: 2, saturday: 4, sunday: 4 });
  const [commitments, setCommitments] = useLocalStorage('preppy_commitments', []);
  const [syllabus, setSyllabus] = useLocalStorage('preppy_syllabus', [
    { id: generateId(), name: 'Math', topics: [{ id: generateId(), name: 'Calculus', confidence: 'Average', subtopics: [{ id: generateId(), name: 'Derivatives' }] }] }
  ]);
  const [preferences, setPreferences] = useLocalStorage('preppy_prefs', { bufferDays: 7, revisionStyle: 'Weekly Review', mockFrequency: 'Weekly Mini Tests' });
  const [schedule, setSchedule] = useLocalStorage('preppy_schedule', []);
  
  const [isGenerating, setIsGenerating] = useState(false);

  // Flow handlers
  const startWizard = () => setCurrentView('wizard');
  const nextStep = () => setWizardStep(prev => Math.min(prev + 1, 6));
  const prevStep = () => setWizardStep(prev => Math.max(prev - 1, 1));
  
  const finishWizard = () => {
    setIsGenerating(true);
    // Simulate thinking time for effect
    setTimeout(() => {
      const generated = generateScheduleAlgorithm({
        examDetails, availability, commitments, syllabus, preferences
      });
      setSchedule(generated);
      setIsGenerating(false);
      setCurrentView('calendar');
      setWizardStep(1); // Reset for next time
    }, 1500);
  };

  const returnToWizard = () => {
    setCurrentView('wizard');
    setWizardStep(1);
  };

  const wipeData = () => {
    if(window.confirm("Clear all data and start over?")) {
      window.localStorage.clear();
      window.location.reload();
    }
  }

  // --- Render Functions ---
  const renderHome = () => (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
      <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center text-5xl shadow-xl shadow-pink-100/50 mb-8 border-4 border-white animate-bounce-slow">
        🐷
      </div>
      <h1 className="text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">Preppy.</h1>
      <p className="text-xl text-slate-500 mb-12 font-medium">Your AI Study Companion</p>
      
      <h2 className="text-2xl font-bold text-slate-700 mb-8">What would you like to do today?</h2>
      
      <div className="grid grid-cols-1 gap-6 max-w-md w-full">
        <Card onClick={startWizard} className="group hover:-translate-y-1 !p-8 bg-gradient-to-br from-white to-pink-50/30 border-pink-100">
          <div className="bg-pink-100 w-16 h-16 rounded-2xl flex items-center justify-center text-pink-600 mb-6 group-hover:scale-110 transition-transform shadow-inner">
            <CalendarIcon size={32} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Build My Study Plan</h3>
          <p className="text-slate-500">Create a personalized schedule based on your syllabus, strengths, and available time.</p>
        </Card>
      </div>
      
      {schedule.length > 0 && (
         <button onClick={() => setCurrentView('calendar')} className="mt-8 text-blue-600 font-semibold hover:underline">
           Or view your existing plan
         </button>
      )}
    </div>
  );

  const renderWizard = () => (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {/* Wizard Header Progress */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-xl">🐷</div>
          <span className="font-bold text-slate-800 text-lg">Preppy Setup</span>
        </div>
        <div className="flex gap-2">
          {[1,2,3,4,5,6].map(s => (
            <div key={s} className={`h-2 w-12 rounded-full transition-all duration-500 ${s <= wizardStep ? 'bg-pink-400' : 'bg-slate-100'}`} />
          ))}
        </div>
        <button onClick={() => setCurrentView('home')} className="text-slate-400 hover:text-slate-700 text-sm font-medium">Cancel</button>
      </header>

      {/* Wizard Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-6 md:p-12 overflow-y-auto pb-32">
        {isGenerating ? (
          <div className="h-full flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center text-4xl animate-pulse">🐷</div>
            <h2 className="text-2xl font-bold text-slate-800">Crunching the numbers...</h2>
            <p className="text-slate-500 max-w-md">I'm taking your syllabus, analyzing your confidence levels, weaving around your commitments, and building the perfect schedule.</p>
          </div>
        ) : (
          <div className="animate-in slide-in-from-right-4 fade-in duration-300">
            {wizardStep === 1 && <Step1Basics data={examDetails} updateData={(d) => setExamDetails({...examDetails, ...d})} />}
            {wizardStep === 2 && <Step2Availability data={availability} updateData={(d) => setAvailability({...availability, ...d})} />}
            {wizardStep === 3 && <Step3Commitments data={commitments} updateData={setCommitments} />}
            {wizardStep === 4 && <Step4Syllabus data={syllabus} updateData={setSyllabus} />}
            {wizardStep === 5 && <Step5Confidence data={syllabus} updateData={setSyllabus} />}
            {wizardStep === 6 && <Step6Preferences data={preferences} updateData={(d) => setPreferences({...preferences, ...d})} />}
          </div>
        )}
      </main>

      {/* Wizard Footer Navigation */}
      {!isGenerating && (
        <footer className="bg-white border-t border-slate-100 p-4 fixed bottom-0 left-0 right-0 z-20">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <Button variant="ghost" onClick={prevStep} disabled={wizardStep === 1} className={wizardStep === 1 ? 'opacity-0' : ''}>
              <ChevronLeft size={20} /> Back
            </Button>
            
            {wizardStep < 6 ? (
              <Button onClick={nextStep} className="bg-pink-600 hover:bg-pink-700 text-white shadow-pink-500/30">
                Continue <ChevronRight size={20} />
              </Button>
            ) : (
              <Button onClick={finishWizard} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/30" icon={Target}>
                Generate Plan
              </Button>
            )}
          </div>
        </footer>
      )}
    </div>
  );

  const renderCalendar = () => (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm relative z-10">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('home')}>
          <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-xl shadow-sm border border-pink-200">🐷</div>
          <span className="font-extrabold text-slate-800 text-xl tracking-tight">Preppy Planner</span>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={wipeData} className="text-xs text-red-500 font-medium hover:underline">Reset All Data</button>
           <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 border border-slate-200">
             <BookOpen size={20} />
           </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <CalendarView 
          schedule={schedule} 
          setSchedule={setSchedule} 
          onRegenerate={returnToWizard}
        />
      </main>
    </div>
  );

  // Render switch
  return (
    <div className="text-slate-900 font-sans selection:bg-pink-200 antialiased min-h-screen w-full">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounce-slow { 0%, 100% { transform: translateY(-5%); } 50% { transform: translateY(5%); } }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
      `}} />
      {currentView === 'home' && renderHome()}
      {currentView === 'wizard' && renderWizard()}
      {currentView === 'calendar' && renderCalendar()}
    </div>
  );
}
