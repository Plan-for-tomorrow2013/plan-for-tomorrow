"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { Job } from "../types/jobs"

interface JobContextType {
  jobs: Job[]
  currentJob: Job | null
  setCurrentJob: (job: Job | null) => void
  addJob: (job: Job) => void
  updateJob: (job: Job) => void
  removeJob: (jobId: string) => void
  clearJobs: () => void // Added for better state management
}

const JobContext = createContext<JobContextType | undefined>(undefined)

export interface JobProviderProps {
  children: ReactNode
  storageKey?: string // Allow customizing storage key per portal
}

export function JobProvider({ children, storageKey = "jobs" }: JobProviderProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [currentJob, setCurrentJob] = useState<Job | null>(null)

  const currentJobKey = `${storageKey}_current`

  // Load jobs from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedJobs = localStorage.getItem(storageKey)
      const savedCurrentJobId = localStorage.getItem(currentJobKey)

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
          localStorage.removeItem(storageKey)
          localStorage.removeItem(currentJobKey)
        }
      }
    }
  }, [storageKey, currentJobKey])

  // Save jobs to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (jobs.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(jobs))
      } else {
        localStorage.removeItem(storageKey)
      }
    }
  }, [jobs, storageKey])

  // Save current job ID to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (currentJob) {
        localStorage.setItem(currentJobKey, currentJob.id)
      } else {
        localStorage.removeItem(currentJobKey)
      }
    }
  }, [currentJob, currentJobKey])

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

  const clearJobs = () => {
    setJobs([])
    setCurrentJob(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem(storageKey)
      localStorage.removeItem(currentJobKey)
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
        clearJobs,
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
