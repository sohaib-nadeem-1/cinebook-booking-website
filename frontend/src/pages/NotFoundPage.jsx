import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';
import { EmptyState } from '../components/common/States.jsx';
import { useDocTitle } from '../hooks/useDocTitle.js';

export default function NotFoundPage() {
  useDocTitle('Page not found');
  return <div className="min-h-[60vh] grid place-items-center px-4"><EmptyState icon={Film} title="This reel is missing" message="The page you’re looking for doesn’t exist or has moved." action={<div className="flex gap-2"><Link to="/" className="btn-primary">Back to Home</Link><Link to="/movies" className="btn-secondary">Browse movies</Link></div>} /></div>;
}
