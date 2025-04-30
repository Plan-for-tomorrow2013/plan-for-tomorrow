import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { PaginationParams, PaginatedResponse, Job } from '../../../../../shared/types/jobs'

// Helper function to extract number from address
function extractNumber(address: string): number {
  const match = address.match(/\d+/)
  return match ? parseInt(match[0]) : 0
}

export async function GET(request: Request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'address'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    // Get the jobs directory path
    const jobsDirectory = path.join(process.cwd(), 'data/jobs')

    // Read all files in the jobs directory
    const files = await fs.readdir(jobsDirectory)
    const jobFiles = files.filter(file => file.endsWith('.json'))

    // Read and parse each job file
    let jobs = await Promise.all(
      jobFiles.map(async (file) => {
        const filePath = path.join(jobsDirectory, file)
        const fileContents = await fs.readFile(filePath, 'utf8')
        const job = JSON.parse(fileContents)
        return job as Job
      })
    )

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase()
      jobs = jobs.filter(job =>
        job.address.toLowerCase().includes(searchLower) ||
        job.council?.toLowerCase().includes(searchLower)
      )
    }

    // Sort jobs
    jobs.sort((a, b) => {
      if (sortBy === 'address') {
        const numA = extractNumber(a.address || '')
        const numB = extractNumber(b.address || '')
        return sortOrder === 'asc' ? numA - numB : numB - numA
      } else {
        const valueA = a[sortBy as keyof Job] || ''
        const valueB = b[sortBy as keyof Job] || ''
        return sortOrder === 'asc'
          ? String(valueA).localeCompare(String(valueB))
          : String(valueB).localeCompare(String(valueA))
      }
    })

    // Calculate pagination
    const totalItems = jobs.length
    const totalPages = Math.ceil(totalItems / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedJobs = jobs.slice(startIndex, endIndex)

    // Create paginated response
    const response: PaginatedResponse<Job> = {
      data: paginatedJobs,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error reading jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}
