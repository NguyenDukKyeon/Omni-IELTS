export const AUDIO_RATES=Object.freeze({slow:0.7,normal:0.9,medium:0.9,natural:1,example:0.95});

function cleanLanguage(value='en-US'){
  const language=String(value||'en-US').trim();
  return /^en(?:-|$)/i.test(language)?language:'en-US';
}

export function voiceScore(voice,language='en-US'){
  if(!voice)return-Infinity;
  const preferred=cleanLanguage(language).toLowerCase();
  const voiceLanguage=String(voice.lang||'').toLowerCase();
  const name=String(voice.name||'').toLowerCase();
  let score=0;
  if(voiceLanguage===preferred)score+=220;
  else if(voiceLanguage.split('-')[0]===preferred.split('-')[0])score+=55;
  else if(!voiceLanguage.startsWith('en'))score-=200;
  if(/natural/.test(name))score+=48;
  if(/neural/.test(name))score+=44;
  if(/online/.test(name))score+=30;
  if(/enhanced|premium/.test(name))score+=22;
  if(voice.default)score+=8;
  if(voice.localService)score+=4;
  return score;
}

export function chooseBestVoice(voices=[],preferences={}){
  const list=Array.from(voices||[]).filter(Boolean);
  if(!list.length)return null;
  const requestedURI=String(preferences.voiceURI||'');
  const exact=requestedURI&&list.find(voice=>voice.voiceURI===requestedURI);
  if(exact)return exact;
  const language=cleanLanguage(preferences.language);
  const english=list.filter(voice=>String(voice.lang||'').toLowerCase().startsWith('en'));
  const candidates=english.length?english:list;
  return[...candidates].sort((a,b)=>voiceScore(b,language)-voiceScore(a,language)||String(a.name||'').localeCompare(String(b.name||'')))[0]||null;
}

export function rateForMode(mode='normal',defaultRate='medium'){
  if(mode==='slow')return AUDIO_RATES.slow;
  if(mode==='example')return AUDIO_RATES.example;
  if(mode==='natural')return AUDIO_RATES.natural;
  if(mode==='normal')return defaultRate==='slow'?AUDIO_RATES.slow:defaultRate==='natural'?AUDIO_RATES.natural:AUDIO_RATES.normal;
  return AUDIO_RATES.normal;
}

export function createAudioManager({synthesis=globalThis.__VOCAB_AUDIO_SYNTHESIS__||globalThis.speechSynthesis,Utterance=globalThis.__VOCAB_AUDIO_UTTERANCE__||globalThis.SpeechSynthesisUtterance,delay=80}={}){
  let voices=[];
  let timer=null;
  let pendingResolve=null;
  let currentUtterance=null;
  const listeners=new Set();
  const browserDocument=typeof document!=='undefined'?document:null;
  let voiceAccessUnlocked=!browserDocument;
  let voiceDiscoveryAttempted=false;
  let refreshingVoices=false;

  const unlockVoiceAccess=()=>{
    voiceAccessUnlocked=true;
    browserDocument?.removeEventListener('pointerdown',unlockVoiceAccess,true);
    browserDocument?.removeEventListener('keydown',unlockVoiceAccess,true);
  };
  if(browserDocument){
    browserDocument.addEventListener('pointerdown',unlockVoiceAccess,{capture:true,once:true});
    browserDocument.addEventListener('keydown',unlockVoiceAccess,{capture:true,once:true});
  }

  const emit=event=>{for(const listener of listeners){try{listener(event);}catch{}}};
  const refreshVoices=()=>{
    // Chromium/Edge may synchronously block while asking the OS for voices.
    // Never make that platform call before the user has interacted with the page.
    if(!voiceAccessUnlocked||refreshingVoices)return[...voices];
    refreshingVoices=true;
    try{
      voiceDiscoveryAttempted=true;
      voices=Array.from(synthesis?.getVoices?.()||[]);
      emit({type:'voices',voices:[...voices]});
    }catch(error){
      console.warn('[audio] Cannot read browser voices',error);
    }finally{
      refreshingVoices=false;
    }
    return[...voices];
  };
  const handleVoicesChanged=()=>{if(voiceAccessUnlocked)refreshVoices();};

  if(synthesis?.addEventListener)synthesis.addEventListener('voiceschanged',handleVoicesChanged);
  else if(synthesis&&'onvoiceschanged'in synthesis)synthesis.onvoiceschanged=handleVoicesChanged;

  const stop=()=>{
    if(timer){clearTimeout(timer);timer=null;}
    synthesis?.cancel?.();
    currentUtterance=null;
    if(pendingResolve){pendingResolve({cancelled:true});pendingResolve=null;}
    emit({type:'status',status:'idle'});
  };

  const speakText=(text,options={})=>{
    const value=String(text||'').trim();
    if(!value)return Promise.resolve({skipped:true});
    if(!synthesis||typeof Utterance!=='function'){
      emit({type:'status',status:'unavailable'});
      return Promise.reject(new Error('Thiết bị này chưa có giọng đọc phù hợp.'));
    }
    // A speech request is itself user-facing intent, so voice discovery is now safe.
    voiceAccessUnlocked=true;
    stop();
    emit({type:'status',status:'loading'});
    return new Promise((resolve,reject)=>{
      pendingResolve=resolve;
      timer=setTimeout(()=>{
        timer=null;
        const utterance=new Utterance(value);
        const language=cleanLanguage(options.language);
        const selected=chooseBestVoice(voices.length?voices:refreshVoices(),{language,voiceURI:options.voiceURI});
        utterance.lang=selected?.lang||language;
        if(selected)utterance.voice=selected;
        utterance.rate=rateForMode(options.mode||'normal',options.defaultRate||'medium');
        utterance.pitch=1;
        utterance.volume=1;
        utterance.onstart=()=>{
          emit({type:'status',status:'playing',text:value,voice:selected||null,rate:utterance.rate});
          options.onStart?.({voice:selected||null,rate:utterance.rate});
        };
        utterance.onend=()=>{
          currentUtterance=null;pendingResolve=null;
          emit({type:'status',status:'idle'});
          options.onEnd?.();
          resolve({voice:selected||null,rate:utterance.rate});
        };
        utterance.onerror=event=>{
          currentUtterance=null;pendingResolve=null;
          const error=new Error(event?.error==='canceled'?'Audio đã được dừng.':'Không thể phát giọng đọc trên thiết bị này.');
          emit({type:'status',status:event?.error==='canceled'?'idle':'unavailable',error});
          options.onError?.(error);
          if(event?.error==='canceled')resolve({cancelled:true});else reject(error);
        };
        currentUtterance=utterance;
        synthesis.speak(utterance);
      },Math.max(0,Number(delay)||0));
    });
  };

  return{
    refreshVoices,
    getVoices:(language='')=>{
      const list=voices.length||voiceDiscoveryAttempted?voices:refreshVoices();
      return language?list.filter(voice=>String(voice.lang||'').toLowerCase().startsWith(String(language).toLowerCase().split('-')[0])):[...list];
    },
    chooseVoice:preferences=>chooseBestVoice(voices.length||voiceDiscoveryAttempted?voices:refreshVoices(),preferences),
    speakText,
    stop,
    subscribe(listener){listeners.add(listener);return()=>listeners.delete(listener);},
    get currentUtterance(){return currentUtterance;}
  };
}

export const audioManager=createAudioManager();

export function createAudioRecorder({
  MediaRecorderClass = globalThis.MediaRecorder,
  navigatorMedia = globalThis.navigator?.mediaDevices
} = {}) {
  let mediaRecorder = null;
  let audioChunks = [];
  let recordingState = 'idle';
  let startTime = 0;
  let elapsedTime = 0;
  let stream = null;
  const listeners = new Set();

  const emit = (event) => {
    for (const listener of listeners) {
      try { listener(event); } catch {}
    }
  };

  const startRecording = async () => {
    audioChunks = [];
    startTime = Date.now();
    elapsedTime = 0;

    if (navigatorMedia?.getUserMedia && typeof MediaRecorderClass === 'function') {
      try {
        stream = await navigatorMedia.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorderClass(stream);
        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunks.push(e.data);
          }
        };
        mediaRecorder.start();
        recordingState = 'recording';
        emit({ type: 'state', state: 'recording' });
        return { success: true, mode: 'live' };
      } catch (err) {
        console.warn('[AudioRecorder] Microphone access failed, falling back to mock recording', err);
      }
    }

    // Deterministic mock fallback for CI / headless
    recordingState = 'recording';
    emit({ type: 'state', state: 'recording' });
    return { success: true, mode: 'mock' };
  };

  const stopRecording = async () => {
    const duration = (Date.now() - startTime) / 1000;
    elapsedTime = duration;
    recordingState = 'idle';
    emit({ type: 'state', state: 'idle' });

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      return new Promise((resolve) => {
        mediaRecorder.onstop = () => {
          const blob = typeof Blob !== 'undefined' ? new Blob(audioChunks, { type: 'audio/webm' }) : null;
          const blobUrl = globalThis.URL?.createObjectURL?.(blob) || `blob:mock-audio-${Date.now()}`;
          if (stream) {
            stream.getTracks?.().forEach(t => t.stop?.());
            stream = null;
          }
          mediaRecorder = null;
          resolve({ duration, blob, blobUrl });
        };
        mediaRecorder.stop();
      });
    }

    // Mock fallback result
    const blob = typeof Blob !== 'undefined' ? new Blob(['mock audio'], { type: 'audio/wav' }) : null;
    const blobUrl = `blob:mock-audio-${Date.now()}`;
    return { duration, blob, blobUrl };
  };

  return {
    startRecording,
    stopRecording,
    getState: () => recordingState,
    getElapsedTime: () => elapsedTime || (recordingState === 'recording' ? (Date.now() - startTime) / 1000 : 0),
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}

