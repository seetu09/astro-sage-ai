import { getUserFromAuthHeader } from '@/lib/serverWallet';
import { chartFingerprint, hasPurchasedReport, getPurchasedReport } from '@/lib/serverPurchasedReports';
import KundaliClient from './KundaliClient';

interface PageProps {
  searchParams: {
    birthDate?: string;
    birthTime?: string;
    place?: string;
    latitude?: string;
    longitude?: string;
    timezone?: string;
    name?: string;
    email?: string;
  };
}

export default async function KundaliPage({ searchParams }: PageProps) {
  const birthDate = searchParams.birthDate || '';
  const birthTime = searchParams.birthTime || '';
  const place = searchParams.place || '';
  const latitude = searchParams.latitude ? parseFloat(searchParams.latitude) : null;
  const longitude = searchParams.longitude ? parseFloat(searchParams.longitude) : null;
  const timezone = searchParams.timezone || '+05:30';
  const name = searchParams.name || '';
  const email = searchParams.email || '';

  const fingerprint = chartFingerprint({
    latitude,
    longitude,
    birthDate,
    birthTime,
    timezone,
  });

  const user = await getUserFromAuthHeader(new Request('http://localhost', {
    headers: { authorization: '' },
  }));

  const isOwned = user?.email
    ? await hasPurchasedReport(user.email, fingerprint, user.id)
    : false;

  const ownedReport = isOwned && user?.email
    ? await getPurchasedReport({ email: user.email, userId: user.id, fingerprint })
    : null;

  return (
    <KundaliClient
      birthDate={birthDate}
      birthTime={birthTime}
      place={place}
      latitude={latitude ?? undefined}
      longitude={longitude ?? undefined}
      timezone={timezone}
      name={name}
      email={email}
      chartFingerprint={fingerprint}
      isOwned={isOwned}
      ownedReport={ownedReport}
      userEmail={user?.email ?? null}
    />
  );
}
