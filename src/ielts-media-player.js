let apiPromise=null;

export function loadYouTubeIframeApi(){
  if(globalThis.YT?.Player)return Promise.resolve(globalThis.YT);
  if(apiPromise)return apiPromise;
  apiPromise=new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(new Error('YouTube Player API phản hồi quá lâu.')),15_000);
    const previous=globalThis.onYouTubeIframeAPIReady;
    globalThis.onYouTubeIframeAPIReady=()=>{clearTimeout(timeout);try{previous?.();}catch{}resolve(globalThis.YT);};
    let script=document.querySelector('script[data-vocab-youtube-api]');
    if(!script){script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.async=true;script.dataset.vocabYoutubeApi='true';script.onerror=()=>{clearTimeout(timeout);reject(new Error('Không tải được YouTube Player API.'));};document.head.append(script);}
  }).catch(error=>{apiPromise=null;throw error;});
  return apiPromise;
}

export class YouTubeSegmentPlayer{
  constructor({host,onStateChange,onError,onTimeUpdate,pollMs=150}={}){
    this.host=host;this.onStateChange=onStateChange;this.onError=onError;this.onTimeUpdate=onTimeUpdate;this.pollMs=Math.max(100,Math.min(500,Number(pollMs)||150));
    this.player=null;this.videoId='';this.a=0;this.b=0;this.loop=false;this.pollTimer=null;this.destroyed=false;this.lastTime=0;
  }
  async mount(videoId,{startSeconds=0,endSeconds=0,autoplay=false}={}){
    if(this.destroyed)throw new Error('Player đã bị hủy.');
    if(!this.host)throw new Error('Thiếu vùng hiển thị YouTube.');
    const YT=await loadYouTubeIframeApi();this.videoId=String(videoId||'');this.a=Math.max(0,Number(startSeconds||0));this.b=Math.max(this.a,Number(endSeconds||0));
    if(this.player?.destroy)this.player.destroy();this.host.replaceChildren();
    const element=document.createElement('div');element.id=`yt-player-${Math.random().toString(36).slice(2,9)}`;this.host.append(element);
    await new Promise((resolve,reject)=>{
      this.player=new YT.Player(element,{videoId:this.videoId,playerVars:{playsinline:1,rel:0,modestbranding:1,origin:location.origin,start:Math.floor(this.a),autoplay:autoplay?1:0},events:{
        onReady:event=>{if(this.a>0)event.target.seekTo(this.a,true);this.#startPoll();resolve();},
        onStateChange:event=>{this.onStateChange?.(event.data);if(event.data===YT.PlayerState.ENDED&&this.loop)this.playSegment();},
        onError:event=>{const error=this.#errorForCode(event.data);this.onError?.(error,event.data);reject(error);}
      }});
    });
    return this;
  }
  #errorForCode(code){
    const messages={2:'URL hoặc video ID YouTube không hợp lệ.',5:'Video không phát được bằng HTML5 player.',100:'Video đã bị xóa hoặc đặt riêng tư.',101:'Chủ video không cho phép nhúng.',150:'Chủ video không cho phép nhúng.',153:'YouTube yêu cầu thông tin client/Referer hợp lệ.'};
    return new Error(messages[code]||`YouTube Player lỗi ${code}.`);
  }
  #startPoll(){
    clearInterval(this.pollTimer);this.pollTimer=setInterval(()=>{
      if(this.destroyed||!this.player?.getCurrentTime)return;
      try{
        const time=Number(this.player.getCurrentTime()||0);this.lastTime=time;this.onTimeUpdate?.(time);
        if(this.b>this.a&&time>=this.b-.04){if(this.loop){this.player.seekTo(this.a,true);this.player.playVideo();}else{this.player.pauseVideo();this.player.seekTo(this.b,true);this.onStateChange?.('segment-ended');}}
      }catch{}
    },this.pollMs);
  }
  setSegment(startSeconds,endSeconds,{seek=true}={}){this.a=Math.max(0,Number(startSeconds||0));this.b=Math.max(this.a+.1,Number(endSeconds||this.a+.1));if(seek)this.seek(this.a);return{startSeconds:this.a,endSeconds:this.b};}
  setLoop(value){this.loop=Boolean(value);return this.loop;}
  playSegment({loop=this.loop}={}){if(!this.player)return;this.loop=Boolean(loop);try{this.player.seekTo(this.a,true);this.player.playVideo();}catch{}}
  play(){try{this.player?.playVideo?.();}catch{}}
  pause(){try{this.player?.pauseVideo?.();}catch{}}
  seek(seconds){const value=Math.max(0,Number(seconds||0));try{this.player?.seekTo?.(value,true);}catch{}this.lastTime=value;}
  setPlaybackRate(rate){const value=Math.max(.25,Math.min(2,Number(rate||1)));try{const available=this.player?.getAvailablePlaybackRates?.()||[];const selected=available.length?available.reduce((best,item)=>Math.abs(item-value)<Math.abs(best-value)?item:best,available[0]):value;this.player?.setPlaybackRate?.(selected);return selected;}catch{return 1;}}
  getCurrentTime(){try{return Number(this.player?.getCurrentTime?.()||this.lastTime||0);}catch{return this.lastTime||0;}}
  getDuration(){try{return Number(this.player?.getDuration?.()||0);}catch{return 0;}}
  destroy(){this.destroyed=true;clearInterval(this.pollTimer);this.pollTimer=null;try{this.player?.destroy?.();}catch{}this.player=null;this.host?.replaceChildren();}
}
