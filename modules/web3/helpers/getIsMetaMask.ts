export function getIsMetaMask(): boolean {
  return window?.ethereum?.isMetaMask ?? false;
}
