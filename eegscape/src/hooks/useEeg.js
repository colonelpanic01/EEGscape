import EEG_EVENT_CODES from "../const/eeg";
import useEventSubscriber from "./useEventSubscriber";

function useEeg() {
  const concentration = {
    useFocus: (handler) => useEventSubscriber(EEG_EVENT_CODES.focus, handler),
    useRelax: (handler) => useEventSubscriber(EEG_EVENT_CODES.relax, handler),
  };

  return {
    concentration,
  };
}

export default useEeg;
