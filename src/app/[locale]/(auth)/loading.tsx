import { PageLoader } from '@/components/ui/page-loader';

// Shown while navigating to login/signup; the (auth) layout keeps the navbar.
export default function Loading() {
  return <PageLoader />;
}
