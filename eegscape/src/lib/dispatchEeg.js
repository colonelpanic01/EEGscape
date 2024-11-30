import EEG_EVENT_CODES from "../const/eeg";

const dispatchEeg = {
  concentration: {
    focus: () => {
      const customEvent = new CustomEvent(EEG_EVENT_CODES.focus, {});
      window.dispatchEvent(customEvent);
    },
    relax: () => {
      const customEvent = new CustomEvent(EEG_EVENT_CODES.relax, {});
      window.dispatchEvent(customEvent);
    },
  },
};

export default dispatchEeg;
