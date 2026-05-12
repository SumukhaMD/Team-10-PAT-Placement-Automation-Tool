const RECRUITER_COMPANY_KEY = "placeit_recruiter_company_id"

export function getStoredRecruiterCompanyId() {
  if (typeof window === "undefined") return ""
  return localStorage.getItem(RECRUITER_COMPANY_KEY) || ""
}

export function setStoredRecruiterCompanyId(companyId: string) {
  if (typeof window === "undefined") return
  localStorage.setItem(RECRUITER_COMPANY_KEY, companyId)
}
