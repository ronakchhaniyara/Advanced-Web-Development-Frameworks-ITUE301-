/**
 * Lightweight Toast notification emitter via CustomEvent
 */
export const showToast = (message, type = "info", duration = 4000) => {
  window.dispatchEvent(
    new CustomEvent("app:toast", {
      detail: { message, type, duration },
    })
  );
};
