export class Sound {
 constructor(){this.enabled=false;this.volume=.65;this.buffers=new Map();this.bgm=null;this.loading=null;this.active=new Set();}
 async enable(value){this.enabled=value;if(!value){this.stop();return;}try{this.ctx??=new(window.AudioContext||window.webkitAudioContext)();this.gain??=this.ctx.createGain();this.gain.gain.value=this.volume;this.gain.connect(this.ctx.destination);await this.ctx.resume();this.loading??=Promise.all(['bgm','hit','cut','flip','win','click'].map(async name=>{try{const res=await fetch(new URL('../assets/audio/'+name+'.wav',import.meta.url));if(!res.ok)throw Error('audio');this.buffers.set(name,await this.ctx.decodeAudioData(await res.arrayBuffer()));}catch{this.failed=true;}}));await this.loading;if(this.enabled)this.music();}catch{this.failed=true;}}
 setVolume(v){this.volume=v;if(this.gain)this.gain.gain.value=v;}
 play(name,rate=1){if(!this.enabled||!this.buffers.has(name)||this.ctx.state!=='running')return;const node=this.ctx.createBufferSource(),gain=this.ctx.createGain();node.buffer=this.buffers.get(name);node.playbackRate.value=rate;gain.gain.value=name==='flip'?.16:name==='click'?.25:.65;node.connect(gain).connect(this.gain);node.start();this.active.add(node);node.onended=()=>{this.active.delete(node);node.disconnect();gain.disconnect();};}
 music(){if(this.bgm||!this.enabled||!this.buffers.has('bgm'))return;this.bgm=this.ctx.createBufferSource();this.bgm.buffer=this.buffers.get('bgm');this.bgm.loop=true;const gain=this.ctx.createGain();gain.gain.value=.28;this.bgm.connect(gain).connect(this.gain);this.bgm.start();this.bgmGain=gain;}
 stop(){if(this.bgm){this.bgm.stop();this.bgm.disconnect();this.bgmGain.disconnect();this.bgm=null;}for(const node of this.active){try{node.stop();}catch{}}}
 suspend(){this.ctx?.suspend();}
 resume(){if(this.enabled)this.ctx?.resume();}
}
