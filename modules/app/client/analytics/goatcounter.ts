export function goatcounterTrack(path: string, title: string, event = true) {
  if (window.goatcounter) {
    window.goatcounter.count({ path, title, event });
  }
}
