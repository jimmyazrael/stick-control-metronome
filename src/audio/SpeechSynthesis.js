export class SpeechSynthesis {
  constructor() {
    this.synth = window.speechSynthesis;
    this.enabled = true;
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;
    // iOS requires speech synthesis to be initialized on user interaction
    if (this.synth) {
      const utterance = new SpeechSynthesisUtterance('');
      utterance.volume = 0;
      this.synth.speak(utterance);
      this.initialized = true;
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  announceLastRepetitions(repetitionsRemaining) {
    if (!this.enabled || repetitionsRemaining > 3 || !this.synth) return;

    // Cancel any pending speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(`${repetitionsRemaining}`);
    utterance.rate = 1.0;
    utterance.volume = 1.0;
    utterance.lang = 'en-US';

    // iOS compatibility: use default voice
    const voices = this.synth.getVoices();
    if (voices.length > 0) {
      utterance.voice = voices[0];
    }

    this.synth.speak(utterance);
  }

  announceExerciseChange(exerciseNumber) {
    if (!this.enabled || !this.synth) return;

    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(`Exercise ${exerciseNumber}`);
    utterance.rate = 1.0;
    utterance.volume = 1.0;
    utterance.lang = 'en-US';

    const voices = this.synth.getVoices();
    if (voices.length > 0) {
      utterance.voice = voices[0];
    }

    this.synth.speak(utterance);
  }
}
