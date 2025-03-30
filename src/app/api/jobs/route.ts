import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Helper function to extract number from address
function extractNumber(address: string): number {
  const match = address.match(/\d+/)
  return match ? parseInt(match[0]) : 0
}

export async function GET() {
  try {
    // Get the jobs directory path
    const jobsDirectory = path.join(process.cwd(), 'data/jobs')
    
    // Read all files in the jobs directory
    const files = await fs.readdir(jobsDirectory)
    const jobFiles = files.filter(file => file.endsWith('.json'))

    // Read and parse each job file
    const jobs = await Promise.all(
      jobFiles.map(async (file) => {
        const filePath = path.join(jobsDirectory, file)
        const fileContents = await fs.readFile(filePath, 'utf8')
        const job = JSON.parse(fileContents)
        return {
          id: path.parse(file).name,
          address: job.address,
          council: job.council,
          currentStage: job.currentStage,
          createdAt: job.createdAt
        }
      })
    )

    // Sort jobs by the numeric value in their addresses
    const sortedJobs = jobs.sort((a, b) => {
      const numA = extractNumber(a.address || '')
      const numB = extractNumber(b.address || '')
      return numA - numB
    })

    return NextResponse.json(sortedJobs)
  } catch (error) {
    console.error('Error reading jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
} 