export default function PageIntro({ label, title, copy }) {
  return (
    <header className="page-intro">
      <p className="section-label">{label}</p>
      <h1>{title}</h1>
      <p>{copy}</p>
    </header>
  );
}
