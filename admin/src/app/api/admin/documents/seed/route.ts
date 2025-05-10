import { NextResponse } from 'next/server'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

const INITIAL_DOCUMENTS = [
  {
    sourceFile: 'cdc-dual-occupancy.pdf',
    title: 'CDC Dual Occupancy',
    description: 'Complying Development Certificate assessment for dual occupancy'
  },
  {
    sourceFile: 'cdc-dwelling.pdf',
    title: 'CDC Dwelling',
    description: 'Complying Development Certificate assessment for a new dwelling'
  },
  {
    sourceFile: 'cdc-secondary-dwelling.pdf',
    title: 'CDC Secondary Dwelling',
    description: 'Complying Development Certificate assessment for secondary dwelling'
  }
]

export async function POST() {
  try {
    // Create admin-documents directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'uploads', 'admin-documents')
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Directory might already exist, that's okay
    }

    const migratedDocuments = []

    for (const doc of INITIAL_DOCUMENTS) {
      try {
        // Read the source file
        const sourceFilePath = join(process.cwd(), 'public', 'assessments', doc.sourceFile)
        const fileContent = await readFile(sourceFilePath)

        // Generate a unique fileName while keeping the original name pattern
        const uniqueFilename = `${doc.sourceFile.split('.')[0]}_${uuidv4()}.pdf`
        
        // Write to the new location
        const newFilePath = join(uploadDir, uniqueFilename)
        await writeFile(newFilePath, fileContent)

        // Create document record
        const document = {
          id: uuidv4(),
          title: doc.title,
          description: doc.description,
          fileName: uniqueFilename,
          originalName: doc.sourceFile,
          type: 'application/pdf',
          uploadedAt: new Date().toISOString(),
          size: fileContent.length
        }

        migratedDocuments.push(document)
      } catch (error) {
        console.error(`Error migrating ${doc.sourceFile}:`, error)
      }
    }

    // TODO: Save documents metadata to database
    return NextResponse.json({ 
      success: true, 
      message: 'Documents migrated successfully',
      documents: migratedDocuments
    })
  } catch (error) {
    console.error('Error in migration:', error)
    return NextResponse.json(
      { error: 'Failed to migrate documents' },
      { status: 500 }
    )
  }
} 