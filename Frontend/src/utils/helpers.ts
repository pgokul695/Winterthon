export const secondsToMinutes = (s: number) =>
  `${Math.floor(s / 60)}:${s % 60}`;
