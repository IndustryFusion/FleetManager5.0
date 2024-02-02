'use client'

import { useEffect } from "react";
import { useRouter } from 'next/navigation'

export default function WelcomePage() {
  const router = useRouter();
  //const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken') || null);
  useEffect(() => {
    // Always do navigations after the first render
    router.push('/login');
  }, [])
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
    </main>
  );
}
