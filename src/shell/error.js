let errorScreen;
let errorMessage;
let retryBtn;
let retryCallback = null;

export function initError() {
  errorScreen = document.getElementById('error-screen');
  errorMessage = document.getElementById('error-message');
  retryBtn = document.getElementById('error-retry');

  const shellEl = document.getElementById('error-shell-version');
  const contentEl = document.getElementById('error-content-version');
  if (shellEl) shellEl.textContent = `Shell v...`;
  if (contentEl) contentEl.textContent = `Content v${__APP_VERSION__}`;

  retryBtn.addEventListener('click', () => {
    if (retryCallback) {
      hideError();
      retryCallback();
    } else {
      window.location.reload();
    }
  });
}

export function showError(message, onRetry) {
  retryCallback = onRetry || null;
  errorMessage.textContent = message || 'An unexpected error occurred.';
  errorScreen.hidden = false;
}

export function hideError() {
  errorScreen.hidden = true;
}
