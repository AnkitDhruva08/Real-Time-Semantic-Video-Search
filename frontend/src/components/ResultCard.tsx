import { Clock, Play, TrendingUp } from 'lucide-react';
import { SearchResult } from '../types/video';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ResultCardProps {
  result: SearchResult;
  onClick: () => void;
}

export function ResultCard({ result, onClick }: ResultCardProps) {
  const { video, frame, similarity, timestamp } = result;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getSimilarityColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-500';
    if (score >= 0.8) return 'bg-blue-500';
    if (score >= 0.7) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  return (
    <Card 
      className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden"
      onClick={onClick}
    >
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        <ImageWithFallback
          src={frame.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
            <Play className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Timestamp badge */}
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded text-sm font-medium">
          {formatTime(timestamp)}
        </div>

        {/* Similarity score */}
        <div className="absolute top-3 left-3">
          <Badge className={`${getSimilarityColor(similarity)} text-white`}>
            <TrendingUp className="h-3 w-3 mr-1" />
            {(similarity * 100).toFixed(0)}% match
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {video.title}
        </h3>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(video.duration)}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <span>Frame at {formatTime(timestamp)}</span>
          </div>
        </div>

        {/* Upload date */}
        <div className="mt-2 text-xs text-gray-500">
          Uploaded {new Date(video.uploadedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>
      </CardContent>
    </Card>
  );
}
