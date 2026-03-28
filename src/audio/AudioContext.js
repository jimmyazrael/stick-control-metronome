class AudioContextManager {
  constructor() {
    this.context = new AudioContext();
    this.setupLifecycleHandlers();
  }

  setupLifecycleHandlers() {
    const resumeContext = () => {
      if (this.context.state === 'suspended') {
        this.context.resume();
      }
    };

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        resumeContext();
      }
    });

    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        resumeContext();
      }
    });

    ['click', 'touchstart', 'keydown'].forEach(event => {
      document.addEventListener(event, resumeContext, { once: true });
    });
  }

  getContext() {
    return this.context;
  }
}

export default new AudioContextManager();
