import { Link, useLocation } from 'react-router';
import { Video, Search, Upload, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

export function Header() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Video className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Semantic Search
              </h1>
              <p className="text-xs text-gray-500">AI-Powered Video Search</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/">
              <Button
                variant={isActive('/') ? 'default' : 'ghost'}
                className={isActive('/') ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            
            <Link to="/search">
              <Button
                variant={isActive('/search') ? 'default' : 'ghost'}
                className={isActive('/search') ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </Link>
            
            <Link to="/upload">
              <Button
                variant={isActive('/upload') ? 'default' : 'ghost'}
                className={isActive('/upload') ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </Link>
          </nav>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            <Link to="/search">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/upload">
              <Button 
                size="icon"
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Upload className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
