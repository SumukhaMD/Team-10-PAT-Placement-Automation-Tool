'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlacementDrive } from '@/lib/types';
import { Calendar, Briefcase, Users } from 'lucide-react';

interface DriveCardProps {
  drive: PlacementDrive & { companyName: string };
  onViewJobs?: () => void;
}

export function DriveCard({ drive, onViewJobs }: DriveCardProps) {
  const statusColor = {
    upcoming: 'bg-yellow-100 text-yellow-800',
    ongoing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
  };
  const normalizedStatus = String(drive.status).toLowerCase() === 'active' ? 'ongoing' : String(drive.status).toLowerCase();

  const daysRemaining = Math.ceil(
    (new Date(drive.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{drive.companyName}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {new Date(drive.startDate).toLocaleDateString()} - {new Date(drive.endDate).toLocaleDateString()}
            </p>
          </div>
          <Badge className={statusColor[normalizedStatus as keyof typeof statusColor] || statusColor.upcoming}>
            {normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="w-4 h-4 text-muted-foreground" />
            <span>{drive.jobPostings?.length || 0} positions</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>{drive.totalPositions} openings</span>
          </div>
        </div>
        
        {normalizedStatus === 'ongoing' && daysRemaining > 0 && (
          <p className="text-xs text-muted-foreground">
            Ends in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
          </p>
        )}

        {onViewJobs && (
          <Button onClick={onViewJobs} className="w-full" size="sm">
            View Jobs
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
