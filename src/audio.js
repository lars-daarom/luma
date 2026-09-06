/* Original procedural score. No samples, downloads, or external services. */
class LumaAudio {
  constructor(getSettings) { this.getSettings = getSettings; this.ctx = null; this.theme = 0; this.step = 0; this.next = 0; this.timer = null; this.energy = 0; this.available = true; }
  async unlock() {
    try {
      if (!this.ctx) {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) { this.available = false; return; }
        this.ctx = new Audio();
        this.master = this.ctx.createGain(); this.master.gain.value = 0.7;
        const limiter = this.ctx.createDynamicsCompressor(); limiter.threshold.value = -12; limiter.knee.value = 18; limiter.ratio.value = 5;
        this.master.connect(limiter); limiter.connect(this.ctx.destination);
        this.music = this.ctx.createGain(); this.fx = this.ctx.createGain(); this.music.connect(this.master); this.fx.connect(this.master);
        const delay = this.ctx.createDelay(1); delay.delayTime.value = 0.32;
        const feedback = this.ctx.createGain(); feedback.gain.value = 0.22;
        const wet = this.ctx.createGain(); wet.gain.value = 0.14;
        this.music.connect(delay); delay.connect(feedback); feedback.connect(delay); delay.connect(wet); wet.connect(this.master);
        this.next = this.ctx.currentTime + 0.1;
        this.timer = setInterval(() => this.schedule(), 100);
      }
      if (this.ctx.state !== 'running') await this.ctx.resume();
      this.sync();
    } catch (_) { this.available = false; }
  }
  sync() {
    if (!this.ctx) return;
    const s = this.getSettings(), now = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(s.muted || document.hidden ? 0 : 0.7, now, 0.12);
    this.music.gain.setTargetAtTime(s.music ? 0.7 : 0,now,0.2);
    this.fx.gain.setTargetAtTime(s.sound ? 0.65 : 0,now,0.05);
  }
  setTheme(theme) { if (this.theme !== theme) { this.theme = theme; this.step = 0; if (this.ctx) this.next = this.ctx.currentTime + 0.1; } }
  tone(midi,time,duration,gain,bus,type='sine',bright=false) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator(), env = this.ctx.createGain();
    osc.type = type; osc.frequency.value = 440 * Math.pow(2,(midi-69)/12);
    env.gain.setValueAtTime(0,time); env.gain.linearRampToValueAtTime(gain,time+0.015);
    env.gain.exponentialRampToValueAtTime(0.0001,time+duration);
    osc.connect(env); env.connect(bus); osc.start(time); osc.stop(time+duration+0.025);
    osc.onended = () => { osc.disconnect(); env.disconnect(); };
    if (bright) this.tone(midi+12,time,Math.min(duration,0.23),gain*0.18,bus,'sine');
  }
  schedule() {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const s = this.getSettings();
    if (!s.music || s.muted || document.hidden) { this.next = this.ctx.currentTime + 0.15; return; }
    if (this.next < this.ctx.currentTime) this.next = this.ctx.currentTime + 0.05;
    const theme = LumaEngine.WORLDS[this.theme], eighth = 60/theme.bpm/2;
    const scale = [0,2,4,7,9,12,14,16], melodies = [[0,4,2,5,1,4,3,2],[0,2,4,1,5,3,2,4],[2,4,5,3,0,2,4,1],[0,3,1,4,2,5,4,2],[0,4,3,1,5,2,4,3],[0,2,5,4,3,1,4,2]];
    while (this.next < this.ctx.currentTime + 0.25) {
      const step = this.step, bar = Math.floor(step/16)%4, progression = [0,-5,-3,-5], base = theme.key + progression[bar];
      if (step % 16 === 0) {
        [0,7,16].forEach((note,i) => this.tone(base+note,this.next+i*0.045,eighth*18,0.028,this.music));
        this.tone(base-24,this.next,eighth*12,0.08,this.music);
      }
      if (step % 2 === 0 || this.energy > 0.5) {
        const m = melodies[this.theme][Math.floor(step/2)%8];
        this.tone(base+12+scale[m],this.next,eighth*2.9,step%4===0 ? 0.058 : 0.035,this.music,'sine',true);
      }
      if (this.energy > 0.75 && step%4 === 2) this.tone(base+31,this.next,0.15,0.015,this.music,'triangle');
      this.next += eighth; this.step++;
    }
  }
  effect(kind, amount=0) {
    if (!this.ctx || this.ctx.state !== 'running' || !this.getSettings().sound || this.getSettings().muted) return;
    const t = this.ctx.currentTime, key = LumaEngine.WORLDS[this.theme].key;
    if (kind === 'turn') { this.tone(key+12+[0,2,4,7,9][amount%5],t,0.16,0.085,this.fx,'sine',true); this.tone(key-5,t,0.025,0.05,this.fx,'triangle'); }
    if (kind === 'bloom') [12,16,19].forEach((v,i)=>this.tone(key+v,t+i*0.07,0.75,0.055,this.fx,'sine',true));
    if (kind === 'win') [0,4,7,12,16,19,24].forEach((v,i)=>this.tone(key+v,t+i*0.10,1.2,0.08,this.fx,'sine',true));
    if (kind === 'tap') this.tone(key+19,t,0.07,0.04,this.fx);
    if (kind === 'hint') [19,16].forEach((v,i)=>this.tone(key+v,t+i*0.09,0.35,0.05,this.fx));
    if (kind === 'undo') this.tone(key+7,t,0.13,0.055,this.fx);
  }
  pause() { if (this.ctx) { this.sync(); this.ctx.suspend().catch(()=>{}); } }
}
