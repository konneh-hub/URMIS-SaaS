import { redirect } from 'next/navigation';

export default function Home() {
  // redirect users to the login page as the app entry
  redirect('/login');
}
