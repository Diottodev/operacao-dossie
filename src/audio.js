export class SoundSystem {
  constructor() {
    this.context = null;
    this.muted = false;
    this.musicTimer = null;
    this.musicStep = 0;
    this.intensity = 0;
  }

  ensure() {
    if (this.muted) return false;
    try {
      this.context ||= new (window.AudioContext || window.webkitAudioContext)();
      if (this.context.state === 'suspended') this.context.resume();
      return true;
    } catch {
      return false;
    }
  }

  tone(frequency, duration, wave = 'square', volume = .035, endFrequency = null, delay = 0) {
    if (!this.ensure()) return;
    const now = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(frequency, now);
    if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + duration);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(this.context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + .02);
  }

  noise(duration = .1, volume = .025) {
    if (!this.ensure()) return;
    const length = Math.floor(this.context.sampleRate * duration);
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    gain.gain.setValueAtTime(volume, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001, this.context.currentTime + duration);
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.context.destination);
    source.start();
  }

  sfx(name) {
    if (name === 'click') this.tone(420, .045, 'square', .025, 520);
    if (name === 'dash') { this.noise(.13, .035); this.tone(180, .14, 'sawtooth', .035, 480); }
    if (name === 'decoy') { this.tone(630, .08, 'square', .03); this.tone(840, .12, 'square', .025, null, .09); }
    if (name === 'pickup') {
      this.tone(440, .09, 'square', .04);
      this.tone(660, .11, 'square', .04, null, .08);
      this.tone(880, .2, 'triangle', .045, null, .17);
    }
    if (name === 'coffee') { this.tone(520, .1, 'sine', .04, 780); this.tone(780, .25, 'sine', .03, 1040, .1); }
    if (name === 'hit') { this.noise(.22, .07); this.tone(170, .35, 'sawtooth', .065, 48); }
    if (name === 'alert') {
      this.tone(740, .17, 'square', .04);
      this.tone(520, .17, 'square', .04, null, .2);
      this.tone(740, .17, 'square', .04, null, .4);
    }
    if (name === 'win') [392, 494, 587, 784].forEach((note, index) => this.tone(note, .35, 'triangle', .05, null, index * .13));
    if (name === 'lose') { this.tone(240, .7, 'sawtooth', .055, 55); this.tone(120, .9, 'square', .03, 40, .15); }
  }

  startMusic() {
    if (this.musicTimer) return;
    this.musicStep = 0;
    this.musicTimer = window.setInterval(() => {
      if (this.muted || !this.context) return;
      const bass = [55, 55, 65.41, 55, 73.42, 65.41, 49, 55];
      const step = this.musicStep % 8;
      this.tone(bass[step], .2, 'triangle', .018 + this.intensity * .008);
      if (step % 2 === 0) this.tone(110, .045, 'square', .009);
      if (this.intensity > .45 && step % 2) this.tone(880, .035, 'square', .006 + this.intensity * .005);
      this.musicStep += 1;
    }, 260);
  }

  stopMusic() {
    window.clearInterval(this.musicTimer);
    this.musicTimer = null;
  }

  setMuted(muted) {
    this.muted = muted;
    if (muted && this.context) this.context.suspend();
    if (!muted && this.context) this.context.resume();
  }
}
