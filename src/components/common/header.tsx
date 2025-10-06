'use client';

import type { Route } from 'next';
import Link from 'next/link';

import { useSession } from '@/lib/auth-client';

import LoginInBtn from '../auth/login-in-btn';
import SignOut from '../auth/sign-out';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import LocaleSwitcher from './locale-switch';

const links: { href: string; label: string }[] = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/protected', label: 'Protected' },
];

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className='sticky top-0 flex h-16 w-full border-b px-5 backdrop-blur-xl'>
      <nav className='mx-auto flex w-full max-w-5xl items-center justify-between'>
        <ul className='flex items-center gap-4'>
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href as Route}>{link.label}</Link>
            </li>
          ))}
        </ul>
        <div className='flex items-center gap-3'>
          <LocaleSwitcher />
          {session ? (
            <div className='flex items-center gap-2'>
              <Avatar>
                <AvatarImage src={session?.user?.image || undefined} />
                <AvatarFallback className='text-sm uppercase'>
                  {session?.user?.name?.slice(0, 2) ||
                    session?.user?.email?.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <SignOut />
            </div>
          ) : (
            <LoginInBtn />
          )}
        </div>
      </nav>
    </header>
  );
}
