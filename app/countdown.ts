export function getCountdown(
  now: number | null,
  startsAt: string | null,
  endsAt: string | null,
) {
  const explicitZone = /T.*(?:Z|[+-]\d{2}:\d{2})$/i;
  const start =
    startsAt && explicitZone.test(startsAt) ? Date.parse(startsAt) : NaN;
  const end = endsAt && explicitZone.test(endsAt) ? Date.parse(endsAt) : NaN;
  if (
    now === null ||
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    end <= start
  )
    return { state: "unconfirmed", values: ["--", "--", "--", "--"] };
  const state = now >= end ? "ended" : now >= start ? "live" : "upcoming";
  const seconds = Math.max(0, Math.floor((start - now) / 1000));
  return {
    state,
    values: [
      Math.floor(seconds / 86400),
      Math.floor(seconds / 3600) % 24,
      Math.floor(seconds / 60) % 60,
      seconds % 60,
    ].map((n) => String(n).padStart(2, "0")),
  };
}
