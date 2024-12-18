import EEG_EVENT_CODES from "../const/eeg";
import useEventSubscriber from "./useEventSubscriber";

function useReceiveEeg() {
  const concentration = {
    useFocus: (handler) => useEventSubscriber(EEG_EVENT_CODES.focus, handler),
    useRelax: (handler) => useEventSubscriber(EEG_EVENT_CODES.relax, handler),
  };

  const nod = {
    useNodLeft: (handler) =>
      useEventSubscriber(EEG_EVENT_CODES.nodLeft, handler),
    useNodBottom: (handler) =>
      useEventSubscriber(EEG_EVENT_CODES.nodBottom, handler),
    useNodRight: (handler) =>
      useEventSubscriber(EEG_EVENT_CODES.nodRight, handler),
  };

  const tilt = {
    useTilt: (handler) =>
      useEventSubscriber(EEG_EVENT_CODES.yaw, (e) => {
        handler(e.detail);
      }),
  };

  const blink = {
    useBlink: (handler) => useEventSubscriber(EEG_EVENT_CODES.blink, handler),
  };

  return {
    concentration,
    nod,
    tilt,
    blink,
  };
}

export default useReceiveEeg;
