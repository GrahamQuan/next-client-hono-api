'use client';

import { useState } from 'react';
import { languages } from '@/i18n/routing';
import { useLocale } from 'next-intl';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { usePathname, useRouter } from '@/i18n/navigation';
import { Languages } from 'lucide-react';

export default function LocaleSwitcher() {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [localeVal, setLocaleVal] = useState(currentLocale);

  const onValueChange = (newLocale: string) => {
    const url = pathname;

    setLocaleVal(newLocale);
    router.replace(url, { locale: newLocale });
  };

  return (
    <Select
      value={localeVal}
      defaultValue={currentLocale}
      onValueChange={onValueChange}
    >
      <SelectTrigger className='flex h-8 w-[80px] items-center gap-1 rounded-lg border-none bg-black/40 px-2 text-white/40 lg:h-11'>
        <Languages className='h-4 w-4' />
        <SelectValue placeholder='locale'>
          {localeVal.toUpperCase()}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className='max-h-fit bg-black/40'>
        {languages.map((language) => (
          <SelectItem
            value={language.locale}
            key={language.locale}
            className='hover:!bg-white/40 text-white/40 hover:cursor-pointer focus:bg-white/40'
          >
            {language.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
