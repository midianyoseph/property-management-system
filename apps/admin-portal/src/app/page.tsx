import { useTranslations } from 'next-intl';

export default function AdminHomePage() {
  const t = useTranslations('Home');
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p className="mt-2 text-muted-foreground">{t('description')}</p>
    </main>
  );
}
