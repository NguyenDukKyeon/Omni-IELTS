const TRUSTED_YOUTUBE_ORIGINS=new Set(['https://www.youtube.com','https://www.youtube-nocookie.com']);

export class YouTubeSegmentPlayer{
  constructor({host,onStateChange,onError,onTimeUpdate,pollMs=150}={}){
    this.host=host;this.onStateChange=onStateChange;this.onError=onError;this.onTimeUpdate=onTimeUpdate;this.pollMs=Math.max(100,Math.min(500,Number(pollMs)||150));
    this.iframe=null;this.videoId='';this.a=0;this.b=0;this.loop=false;this.pollTimer=null;this.listenTimer=null;this.destroyed=false;this.ready=false;this.lastTime=0;this.duration=0;this.playerState=-1;this.playbackRate=1;this.messageHandler=event=>this.#handleMessage(event);
  }
  async mount(videoId,{startSeconds=0,endSeconds=0,autoplay=false}={}){
    if(this.destroyed)throw new Error('Player đã bị hủy.');
    if(!this.host)throw new Error('Thiếu vùng hiển thị YouTube.');
    if(!/^[A-Za-z0-9_-]{11}$/.test(String(videoId||'')))throw new Error('YouTube video ID không hợp lệ.');
    this.videoId=String(videoId);this.a=Math.max(0,Number(startSeconds||0));this.b=Math.max(this.a,Number(endSeconds||0));this.ready=false;this.host.replaceChildren();
    const id=`vocab-youtube-${Math.random().toString(36).slice(2,9)}`;const iframe=document.createElement('iframe');iframe.id=id;iframe.title='YouTube video player';iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';iframe.referrerPolicy='strict-origin-when-cross-origin';iframe.allowFullscreen=true;
    const params=new URLSearchParams({enablejsapi:'1',playsinline:'1',rel:'0',modestbranding:'1',origin:location.origin,start:String(Math.floor(this.a)),autoplay:autoplay?'1':'0'});iframe.src=`https://www.youtube-nocookie.com/embed/${encodeURIComponent(this.videoId)}?${params}`;this.iframe=iframe;this.host.append(iframe);globalThis.addEventListener('message',this.messageHandler);
    const ready=await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(new Error('YouTube player phản hồi quá lâu hoặc video không cho phép nhúng.')),15_000);const check=setInterval(()=>{if(this.ready){clearTimeout(timeout);clearInterval(check);resolve(true);}else this.#send({event:'listening',id});},250);iframe.addEventListener('load',()=>this.#send({event:'listening',id}),{once:true});}).catch(error=>{this.onError?.(error);throw error;});
    if(ready){this.#startPoll();if(this.a>0)this.seek(this.a);return this;}
    return this;
  }
  #send(payload){try{this.iframe?.contentWindow?.postMessage(JSON.stringify(payload),'*');}catch{}}
  #command(func,args=[]){this.#send({event:'command',func,args,id:this.iframe?.id});}
  #handleMessage(event){
    if(!TRUSTED_YOUTUBE_ORIGINS.has(event.origin))return;
    let data;try{data=typeof event.data==='string'?JSON.parse(event.data):event.data;}catch{return;}
    if(!data||data.id&&data.id!==this.iframe?.id)return;
    if(data.event==='onReady'){this.ready=true;this.#send({event:'listening',id:this.iframe?.id});this.onStateChange?.('ready');return;}
    if(data.event==='onError'){const error=this.#errorForCode(Number(data.info));this.onError?.(error,Number(data.info));return;}
    if(data.event==='onStateChange'){this.playerState=Number(data.info);this.onStateChange?.(this.playerState);if(this.playerState===0&&this.loop)this.playSegment();return;}
    if(data.event==='infoDelivery'&&data.info){
      if(Number.isFinite(Number(data.info.currentTime))){this.lastTime=Number(data.info.currentTime);this.onTimeUpdate?.(this.lastTime);}
      if(Number.isFinite(Number(data.info.duration)))this.duration=Number(data.info.duration);
      if(Number.isFinite(Number(data.info.playbackRate)))this.playbackRate=Number(data.info.playbackRate);
    }
  }
  #errorForCode(code){const messages={2:'URL hoặc video ID YouTube không hợp lệ.',5:'Video không phát được bằng HTML5 player.',100:'Video đã bị xóa hoặc đặt riêng tư.',101:'Chủ video không cho phép nhúng.',150:'Chủ video không cho phép nhúng.',153:'YouTube yêu cầu thông tin client/Referer hợp lệ.'};return new Error(messages[code]||`YouTube Player lỗi ${code}.`);}
  #startPoll(){clearInterval(this.pollTimer);this.pollTimer=setInterval(()=>{if(this.destroyed)return;this.#command('getCurrentTime');this.#command('getDuration');if(this.b>this.a&&this.lastTime>=this.b-.06){if(this.loop){this.seek(this.a);this.play();}else{this.pause();this.seek(this.b);this.onStateChange?.('segment-ended');}}},this.pollMs);}
  setSegment(startSeconds,endSeconds,{seek=true}={}){this.a=Math.max(0,Number(startSeconds||0));this.b=Math.max(this.a+.1,Number(endSeconds||this.a+.1));if(seek)this.seek(this.a);return{startSeconds:this.a,endSeconds:this.b};}
  setLoop(value){this.loop=Boolean(value);return this.loop;}
  playSegment({loop=this.loop}={}){this.loop=Boolean(loop);this.seek(this.a);this.play();}
  play(){this.#command('playVideo');}
  pause(){this.#command('pauseVideo');}
  seek(seconds){const value=Math.max(0,Number(seconds||0));this.lastTime=value;this.#command('seekTo',[value,true]);}
  setPlaybackRate(rate){const value=Math.max(.25,Math.min(2,Number(rate||1)));this.playbackRate=value;this.#command('setPlaybackRate',[value]);return value;}
  getCurrentTime(){return Number(this.lastTime||0);}
  getDuration(){return Number(this.duration||0);}
  destroy(){this.destroyed=true;clearInterval(this.pollTimer);clearInterval(this.listenTimer);this.pollTimer=null;this.listenTimer=null;globalThis.removeEventListener('message',this.messageHandler);this.pause();this.iframe?.remove();this.iframe=null;this.host?.replaceChildren();}
}

export class IeltsAudioController {
  constructor({ host, media, is1PlayOnly = false, onTimeUpdate, onStateChange, onSectionEnd, onError } = {}) {
    this.host = host;
    this.media = media || {};
    this.is1PlayOnly = Boolean(is1PlayOnly);
    this.onTimeUpdate = onTimeUpdate;
    this.onStateChange = onStateChange;
    this.onSectionEnd = onSectionEnd;
    this.onError = onError;
    this.player = null;
    this.currentTime = 0;
    this.activeSection = 1;
    this.playedSections = new Set();
    this.isPlaying = false;
  }

  async mount({ section = 1, startSeconds = 0 } = {}) {
    this.activeSection = section;
    this.currentTime = Math.max(0, Number(startSeconds || 0));
    if (this.host && this.media.videoId) {
      this.player = new YouTubeSegmentPlayer({
        host: this.host,
        onTimeUpdate: (t) => {
          this.currentTime = t;
          this.onTimeUpdate?.(t);
        },
        onStateChange: (s) => {
          if (s === 1 || s === 'playing') this.isPlaying = true;
          else if (s === 2 || s === 0 || s === 'paused') this.isPlaying = false;
          this.onStateChange?.(s);
          if (s === 'segment-ended') {
            this.playedSections.add(this.activeSection);
            this.onSectionEnd?.(this.activeSection);
          }
        },
        onError: this.onError
      });
      await this.player.mount(this.media.videoId, { startSeconds: this.currentTime, autoplay: false });
    }
    return this;
  }

  play() {
    if (this.is1PlayOnly && this.playedSections.has(this.activeSection)) {
      throw new Error(`Exam mode permits 1-play only. Section ${this.activeSection} has already been played.`);
    }
    this.isPlaying = true;
    this.player?.play();
  }

  pause() {
    this.isPlaying = false;
    this.player?.pause();
  }

  seek(seconds) {
    if (this.is1PlayOnly) {
      throw new Error('Seeking is disabled in Exam Mode.');
    }
    this.currentTime = Math.max(0, Number(seconds || 0));
    this.player?.seek(this.currentTime);
  }

  getCurrentTime() {
    return this.player ? this.player.getCurrentTime() : this.currentTime;
  }

  destroy() {
    this.player?.destroy();
    this.player = null;
    this.isPlaying = false;
  }
}

