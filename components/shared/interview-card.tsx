'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Interview } from '@/lib/types';
import { Calendar, Clock, Video, Phone, MapPin } from 'lucide-react';

interface InterviewCardProps {
  interview: Interview & { studentName?: string; jobTitle?: string };
  onReschedule?: () => void;
  onCancel?: () => void;
}

export function InterviewCard({ interview, onReschedule, onCancel }: InterviewCardProps) {
  const scheduledAt = interview.scheduledAt || interview.scheduledDate || new Date().toISOString();
  const typeIcon = {
    telephonic: <Phone className="w-4 h-4" />,
    video: <Video className="w-4 h-4" />,
    'in-person': <MapPin className="w-4 h-4" />,
  };

  const statusColor = {
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };
  const normalizedType = String(interview.type).toLowerCase() === 'phone' ? 'telephonic' : String(interview.type).toLowerCase();
  const normalizedStatus = String(interview.status).toLowerCase();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">Round {interview.round}</CardTitle>
            {interview.jobTitle && <p className="text-sm text-muted-foreground">{interview.jobTitle}</p>}
          </div>
          <Badge className={statusColor[normalizedStatus as keyof typeof statusColor] || statusColor.scheduled}>
            {normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>{new Date(scheduledAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span>{new Date(scheduledAt).toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {typeIcon[normalizedType as keyof typeof typeIcon] || typeIcon.video}
          <span className="capitalize">{normalizedType}</span>
        </div>
        
        {normalizedStatus === 'scheduled' && (
          <div className="flex gap-2 pt-2">
            {onReschedule && (
              <Button variant="outline" size="sm" onClick={onReschedule} className="flex-1">
                Reschedule
              </Button>
            )}
            {onCancel && (
              <Button variant="destructive" size="sm" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
