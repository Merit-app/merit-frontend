import { redirect } from 'next/navigation';

// Saved scholarships now live in the unified /saved page
export default function ScholarshipsSavedRedirect() {
  redirect('/saved');
}
