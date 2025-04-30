"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { Job } from "../../../../shared/types/jobs"

interface JobContextType {
  jobs: Job[]
  currentJob: Job | null
  setCurrentJob: (job: Job | null) => void
  addJob: (job: Job) => void
  updateJob: (job: Job) => void
  removeJob: (jobId: string) => void
}

const JobContext = createContext<JobContextType | undefined>(undefined)

export function JobProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [currentJob, setCurrentJob] = useState<Job | null>(null)

  // Load jobs from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedJobs = localStorage.getItem("jobs")
      const savedCurrentJobId = localStorage.getItem("currentJobId")

      if (savedJobs) {
        try {
          const parsedJobs = JSON.parse(savedJobs) as Job[]
          setJobs(parsedJobs)

          if (savedCurrentJobId) {
            const job = parsedJobs.find((j) => j.id === savedCurrentJobId)
            if (job) setCurrentJob(job)
          }
        } catch (error) {
          console.error("Error parsing saved jobs:", error)
          // Clear invalid localStorage data
          localStorage.removeItem("jobs")
          localStorage.removeItem("currentJobId")
        }
      }
    }
  }, [])

  // Save jobs to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined" && jobs.length > 0) {
      localStorage.setItem("jobs", JSON.stringify(jobs))
    }
  }, [jobs])

  // Save current job ID to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (currentJob) {
        localStorage.setItem("currentJobId", currentJob.id)
      } else {
        localStorage.removeItem("currentJobId")
      }
    }
  }, [currentJob])

  const addJob = (job: Job) => {
    setJobs((prevJobs) => [...prevJobs, job])
    setCurrentJob(job) // Automatically set as current job
  }

  const updateJob = (updatedJob: Job) => {
    setJobs((prevJobs) => prevJobs.map((job) => (job.id === updatedJob.id ? updatedJob : job)))

    if (currentJob && currentJob.id === updatedJob.id) {
      setCurrentJob(updatedJob)
    }
  }

  const removeJob = (jobId: string) => {
    setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId))

    if (currentJob && currentJob.id === jobId) {
      const remainingJobs = jobs.filter((job) => job.id !== jobId)
      setCurrentJob(remainingJobs.length > 0 ? remainingJobs[0] : null)
    }
  }

  return (
    <JobContext.Provider
      value={{
        jobs,
        currentJob,
        setCurrentJob,
        addJob,
        updateJob,
        removeJob,
      }}
    >
      {children}
    </JobContext.Provider>
  )
}

export function useJob() {
  const context = useContext(JobContext)
  if (context === undefined) {
    throw new Error("useJob must be used within a JobProvider")
  }
  return context
}
