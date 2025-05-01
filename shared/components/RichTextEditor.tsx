'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>
})

interface RichTextEditorProps {
  value: string
  onChange?: (value: string) => void
  readOnly?: boolean
}

export function RichTextEditor({ value, onChange, readOnly = false }: RichTextEditorProps) {
  const modules = {
    toolbar: readOnly ? false : [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link'],
      ['clean']
    ],
  }

  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      modules={modules}
      readOnly={readOnly}
    />
  )
}
