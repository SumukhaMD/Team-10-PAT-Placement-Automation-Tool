// ============ USER & AUTH ============
export type UserRole = "STUDENT" | "RECRUITER" | "ADMIN" | "TPO"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  phone?: string
  avatar?: string
  emailVerified: boolean
  accountLocked: boolean
  failedLoginAttempts: number
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
  requiresOtp?: boolean
}

// ============ STUDENT ============
export interface StudentProfile {
  id: string
  userId: string
  universityId?: string
  name?: string
  email?: string
  phone?: string
  college?: string
  batch?: string
  branch?: string
  graduationYear?: number
  cgpa?: number
  backlogs?: number
  bio?: string
  resumeUrl?: string
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  skills?: string[]
  placementStatus?: "NOT_PLACED" | "PLACED" | "NOT_ELIGIBLE" | "OFFER_ACCEPTED" | "REJECTED"
  placedCompanyId?: string
  placedJobId?: string
  createdAt: string
  updatedAt: string
}

export interface Education {
  id: string
  studentId: string
  institution: string
  degree: string
  field: string
  startYear: number
  endYear?: number
  grade?: string
  current: boolean
}

export interface Experience {
  id: string
  studentId: string
  company: string
  title: string
  type: "INTERNSHIP" | "FULL_TIME" | "PART_TIME" | "CONTRACT"
  startDate: string
  endDate?: string
  current: boolean
  description?: string
}

export interface Certification {
  id: string
  studentId: string
  name: string
  issuer: string
  issueDate: string
  expiryDate?: string
  credentialUrl?: string
}

// ============ COMPANY ============
export interface Company {
  id: string
  name: string
  logo?: string
  description?: string
  website?: string
  industry?: string
  size?: "STARTUP" | "SMALL" | "MEDIUM" | "LARGE" | "ENTERPRISE"
  location?: string
  address?: {
    street?: string
    city?: string
    state?: string
    country?: string
  }
  email?: string
  phone?: string
  status?: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED" | "ACTIVE"
  recruiters?: number
  activeDrives?: number
  totalHires?: number
  createdAt?: string
  updatedAt?: string
}

export interface Recruiter {
  id: string
  userId: string
  companyId: string
  name: string
  email: string
  phone?: string
  designation: string
  isPrimary: boolean
  company?: Company
}

// ============ PLACEMENT DRIVE ============
export type DriveStatus = "UPCOMING" | "ACTIVE" | "COMPLETED" | "CANCELLED" | "upcoming" | "ongoing" | "completed"

export interface PlacementDrive {
  id: string
  title: string
  description?: string
  companyId: string
  company?: Company
  startDate: string
  endDate: string
  registrationDeadline?: string
  status: DriveStatus
  eligibilityCriteria?: EligibilityCriteria
  totalPositions?: number
  applicationsCount?: number
  positions?: number
  jobType?: string
  location?: string
  salary?: {
    min?: number
    max?: number
    currency?: string
  }
  jobPostings?: unknown[]
  createdBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface EligibilityCriteria {
  minCgpa: number
  maxBacklogs: number
  allowedBranches: string[]
  graduationYears: number[]
}

// ============ JOB POSTING ============
export type JobType = "FULL_TIME" | "INTERNSHIP" | "CONTRACT" | "PART_TIME"
export type JobStatus = "DRAFT" | "OPEN" | "CLOSED" | "FILLED" | "ACTIVE" | "ON_HOLD"

export interface JobPosting {
  id: string
  driveId?: string
  companyId: string
  company?: Company
  title: string
  description?: string
  requirements?: string[]
  responsibilities?: string[]
  type?: JobType
  jobType?: JobType
  location: string
  isRemote?: boolean
  salaryMin?: number
  salaryMax?: number
  salaryCurrency?: string
  salaryPeriod?: "YEARLY" | "MONTHLY"
  salary?: {
    min?: number
    max?: number
    currency?: string
    amount?: number | string
  }
  positions?: number
  applicationDeadline?: string
  deadline?: string
  status?: JobStatus
  eligibilityCriteria?: EligibilityCriteria
  applicationsCount?: number
  createdBy?: string
  createdAt?: string
  updatedAt?: string
  experience?: string
}

// ============ APPLICATION ============
export type ApplicationStatus = 
  | "APPLIED" 
  | "UNDER_REVIEW" 
  | "SHORTLISTED" 
  | "INTERVIEW" 
  | "SELECTED" 
  | "REJECTED" 
  | "WITHDRAWN"

export interface JobApplication {
  id: string
  jobId: string
  job?: JobPosting
  studentId: string
  student?: StudentProfile
  status: ApplicationStatus
  coverLetter?: string
  resumeUrl?: string
  appliedAt?: string
  updatedAt?: string
  statusHistory?: ApplicationStatusHistory[]
  history?: Array<{
    status: string
    timestamp: string
    feedback?: string
  }>
}

export interface ApplicationStatusHistory {
  status: ApplicationStatus
  changedAt: string
  changedBy: string
  feedback?: string
}

// ============ INTERVIEW ============
export type InterviewType = "TECHNICAL" | "HR" | "MANAGERIAL" | "GROUP" | "CODING" | "telephonic" | "video" | "in-person"
export type InterviewStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW" | "scheduled" | "completed" | "cancelled" | "PENDING" | "RESCHEDULED"
export type InterviewMode = "IN_PERSON" | "VIDEO" | "PHONE" | "ONLINE" | "ONSITE"

export interface Interview {
  id: string
  applicationId?: string
  application?: JobApplication
  company?: Company
  student?: StudentProfile
  studentId?: string
  round?: number
  roundType?: string
  type: InterviewType
  mode?: InterviewMode
  scheduledAt?: string
  scheduledDate?: string
  duration?: number // in minutes
  location?: string
  meetingLink?: string
  status: InterviewStatus
  feedback?: string
  rating?: number
  interviewers?: string[] | string
  createdBy?: string
  createdAt?: string
  updatedAt?: string
}

// ============ NOTIFICATION ============
export type NotificationType = 
  | "OTP" 
  | "APPLICATION_UPDATE" 
  | "INTERVIEW_SCHEDULED" 
  | "DRIVE_ANNOUNCEMENT" 
  | "JOB_POSTED"
  | "SYSTEM"

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, unknown>
  read: boolean
  createdAt: string
  actionUrl?: string
  actionText?: string
}

// ============ ANALYTICS ============
export interface DashboardStats {
  totalStudents: number
  placedStudents: number
  totalCompanies: number
  activeCompanies: number
  totalJobs: number
  openJobs: number
  totalApplications: number
  totalDrives: number
  activeDrives: number
  averagePackage: number
  highestPackage: number
  placementRate: number
}

export interface PlacementAnalytics {
  byBranch: { branch: string; placed: number; total: number; percentage: number }[]
  byCompany: { company: string; count: number }[]
  byMonth: { month: string; count: number }[]
  salaryDistribution: { range: string; count: number }[]
}

// ============ PAGINATION ============
export interface PaginatedResponse<T> {
  data: T[]
  total?: number
  page?: number
  limit?: number
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export type Application = JobApplication

// ============ API RESPONSES ============
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// ============ FORM DATA ============
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: UserRole
  phone?: string
}

export interface JobFormData {
  title: string
  description: string
  requirements: string[]
  responsibilities: string[]
  type: JobType
  location: string
  isRemote: boolean
  salaryMin: number
  salaryMax: number
  salaryCurrency: string
  salaryPeriod: "YEARLY" | "MONTHLY"
  positions: number
  applicationDeadline: string
  eligibilityCriteria?: EligibilityCriteria
}

export interface DriveFormData {
  title: string
  description?: string
  companyId: string
  startDate: string
  endDate: string
  registrationDeadline: string
  totalPositions: number
  eligibilityCriteria: EligibilityCriteria
}

export interface StudentProfileFormData {
  universityId: string
  branch: string
  graduationYear: number
  cgpa: number
  backlogs: number
  bio?: string
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  skills: string[]
}
