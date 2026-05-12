'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JobPosting } from '@/lib/types';
import { MapPin, Briefcase, DollarSign, Clock, ArrowRight } from 'lucide-react';

interface JobCardProps {
  job: JobPosting;
  onApply?: () => void;
}

export function JobCard({ job, onApply }: JobCardProps) {
  const companyName = job.company?.name || 'Company'
  const companyLogo = job.company?.logo
  const salaryMin = job.salary?.min ?? job.salaryMin ?? 0
  const salaryMax = job.salary?.max ?? job.salaryMax ?? 0
  const jobType = job.jobType || job.type || 'FULL_TIME'
  const deadline = job.deadline || job.applicationDeadline
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {companyLogo && (
                <img src={companyLogo} alt={companyName} className="w-10 h-10 rounded" />
              )}
              <div>
                <CardTitle className="text-lg">{job.title}</CardTitle>
                <CardDescription>{companyName}</CardDescription>
              </div>
            </div>
          </div>
          <Badge variant="secondary">{jobType}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span>{salaryMin}K - {salaryMax}K</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              <span>{job.applicationsCount} applied</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{deadline ? new Date(deadline).toLocaleDateString() : 'Open'}</span>
            </div>
          </div>

          <div className="pt-2 border-t">
            <Button onClick={onApply} className="w-full" size="sm">
              View & Apply <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
