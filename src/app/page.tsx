import { redirect } from 'next/navigation';
import { Button } from "@/components/ui/button";

export default function Home() {
  redirect('/dashboard');
}
