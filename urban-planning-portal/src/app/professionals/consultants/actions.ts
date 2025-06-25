'use server';

export async function updateConsultantNotes(id: string, notes: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/consultants/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notes }),
    });

    if (!response.ok) {
      throw new Error('Failed to update notes');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating notes:', error);
    throw error;
  }
}
