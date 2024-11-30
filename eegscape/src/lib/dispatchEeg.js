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
  nod: {
    right: () => {
      const customEvent = new CustomEvent(EEG_EVENT_CODES.nodRight, {});
      window.dispatchEvent(customEvent);
    },
    left: () => {
      const customEvent = new CustomEvent(EEG_EVENT_CODES.nodLeft, {});
      window.dispatchEvent(customEvent);
    },
    bottom: () => {
      const customEvent = new CustomEvent(EEG_EVENT_CODES.nodBottom, {});
      window.dispatchEvent(customEvent);
    },
    tilt: (degree) => {
      const customEvent = new CustomEvent(EEG_EVENT_CODES.yaw, {
        detail: degree,
      });
      window.dispatchEvent(customEvent);
    },
  },
};

export default dispatchEeg;
