export function navigate(search: string): void {
  const url = search ? `${window.location.pathname}?${search}` : window.location.pathname;
  history.pushState(null, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
