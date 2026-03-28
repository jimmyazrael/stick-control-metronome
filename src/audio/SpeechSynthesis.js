export class SpeechSynthesis {
  constructor() {
    this.synth = window.speechSynthesis;
    this.enabled = true;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  announceLastRepetitions(repetitionsRemaining) {
    if (!this.enabled || repetitionsRemaining > 3) return;

    const utterance = new SpeechSynthesisUtterance(`${repetitionsRemaining} remaining`);
    utterance.rate = 1.2;
    utterance.volume = 0.7;
    this.synth.speak(utterance);
  }

  announceExerciseChange(exerciseNumber) {
    if (!this.enabled) return;

    const utterance = new SpeechSynthesisUtterance(`Exercise ${exerciseNumber}`);
    utterance.rate = 1.2;
    this.synth.speak(utterance);
  }
}
