import { YouTubeSegmentPlayer } from './ielts-media-player.js';

let activeAdapter=null;

function ensureHost(){
  const dialog=document.querySelector('#v10SentenceLoopDialog');if(!dialog)throw new Error('Sentence Loop chưa được mount.');
  let host=dialog.querySelector('#v10SentenceYoutubeHost');
  if(!host){host=document.createElement('section');host.id='v10SentenceYoutubeHost';host.className='v10-sentence-youtube-host';host.hidden=true;const panel=dialog.querySelector('#v10SentenceLoopPanel');dialog.insertBefore(host,panel||null);}
  return{dialog,host};
}

export function createYoutubeSentencePlayer(videoId,initialSentence=null){
  if(!/^[A-Za-z0-9_-]{11}$/.test(String(videoId||'')))throw new Error('YouTube video ID không hợp lệ.');
  activeAdapter?.destroy?.();const{dialog,host}=ensureHost();host.hidden=false;
  const player=new YouTubeSegmentPlayer({host,onError:error=>{host.dataset.status='error';host.setAttribute('aria-label',error.message);},onStateChange:state=>{host.dataset.status=String(state);}});
  const startSeconds=Math.max(0,Number(initialSentence?.startMs||0)/1000),endSeconds=Math.max(startSeconds+.1,Number(initialSentence?.endMs||0)/1000||startSeconds+10);
  const ready=player.mount(String(videoId),{startSeconds,endSeconds,autoplay:false});
  let destroyed=false;
  const adapter={
    videoId:String(videoId),
    async playSegment(sentence,{rate=1,loop=false}={}){if(destroyed)throw new Error('YouTube player đã đóng.');await ready;player.setPlaybackRate(rate);player.setSegment(Number(sentence?.startMs||0)/1000,Number(sentence?.endMs||0)/1000);player.playSegment({loop});},
    pause(){player.pause();},
    setPlaybackRate(rate){return player.setPlaybackRate(rate);},
    destroy(){if(destroyed)return;destroyed=true;try{player.destroy();}catch{}host.hidden=true;host.removeAttribute('data-status');if(activeAdapter===adapter)activeAdapter=null;}
  };
  activeAdapter=adapter;dialog.addEventListener('close',()=>adapter.destroy(),{once:true});return adapter;
}

export function destroyYoutubeSentencePlayer(){activeAdapter?.destroy?.();}
