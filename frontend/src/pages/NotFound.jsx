import { Link } from 'react-router-dom';
import '../styles/notfound.css';

export default function NotFound() {
  return (
    <main className="notfound-page notfound-page--image">
      <img
        src="/404.png"
        alt="Page not found"
        className="notfound-image"
      />
      <Link to="/" className="notfound-back-link">Back to Gift Mart</Link>
    </main>
  );
}
