// toast-helper.js

// Load toastr default options once
toastr.options = {
  closeButton: true,
  progressBar: true,
  positionClass: "toast-top-right",
  timeOut: "400000",
  escapeHtml: false
};

/**
 * Show a customizable toast
 * @param {Object} config - Configuration object
 * @param {string} config.type - 'success' | 'error' | 'info' | 'warning'
 * @param {string} config.title - Toast title
 * @param {string} config.description - Toast message or description
 * @param {string} config.iconUrl - Image URL for custom icon
 */
function showCustomToast({ type, title, description, iconUrl, action1, action2 }) {
  const actionsHtml = `
    <div class="toast-message__action">
        ${action1 ? `<a href="#!" class="btn-link text-gray">${action1}</a>` : ''}
        ${action2 ? `<a href="#!" class="btn-link text-primary">${action2}</a>` : ''}
    </div>
  `;
  const message = `
    <div class="toast-message__inner">
      <div class="toast-message__img">
        <img src="${iconUrl}" alt="icon" width="24" height="24" style="margin-right: 10px;" />
      </div>
      <div class="toast-message__content">
        <h6>${title}</h6>
        <p>${description}</p>
        ${actionsHtml}
      </div>
    </div>
  `;

  if (toastr[type]) {
    toastr[type](message);
  } else {
    console.warn('Invalid toast type:', type);
  }
}
