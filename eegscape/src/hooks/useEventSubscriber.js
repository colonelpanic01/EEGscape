import { useEffect, useRef } from "react";

function useEventSubscriber(eventName, handler) {
  const savedHandler = useRef(handler);

  // Update the handler reference if it changes
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!window?.addEventListener) return;

    const eventListener = (event) => savedHandler.current(event);

    // Add event listener
    window.addEventListener(eventName, eventListener);

    // Cleanup on unmount or dependency change
    return () => {
      window.removeEventListener(eventName, eventListener);
    };
  }, [eventName]);
}

export default useEventSubscriber;
