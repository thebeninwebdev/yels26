export default function AttendeesLoading() {
  return <section className="attendees-workspace attendee-loading" aria-label="Loading attendees">
    <div className="attendee-skeleton heading" />
    <div className="attendee-stats">{Array.from({ length: 4 }, (_, index) => <div className="attendee-skeleton stat" key={index} />)}</div>
    <div className="attendee-skeleton tabs" />
    <div className="attendee-loading-rows">{Array.from({ length: 7 }, (_, index) => <div className="attendee-skeleton row" key={index} />)}</div>
  </section>;
}
