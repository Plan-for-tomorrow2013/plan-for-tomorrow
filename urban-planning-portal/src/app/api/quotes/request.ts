import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ error: 'Email functionality not implemented yet.' }, { status: 501 })
}
