'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Application } from '@/lib/types';
import { CheckCircle, Clock, XCircle, Award } from 'lucide-react';

interface ApplicationCardProps {
  application: Application & { jobTitle: string; companyName: string };
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const statusConfig = {
    applied: { icon: Clock, color: 'bg-blue-100 text-blue-800', label: 'Applied' },
    shortlisted: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Shortlisted' },
    rejected: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Rejected' },
    offer: { icon: Award, color: 'bg-purple-100 text-purple-800', label: 'Offer' },
  };

  const config = statusConfig[String(application.status).toLowerCase() as keyof typeof statusConfig] || statusConfig.applied;
  const Icon = config.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{application.jobTitle}</CardTitle>
            <p className="text-sm text-muted-foreground">{application.companyName}</p>
          </div>
          <Badge className={config.color}>
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">
          Applied on {new Date(application.appliedAt || new Date().toISOString()).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}
