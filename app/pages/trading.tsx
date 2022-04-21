import { Page } from '@components/Page';
import { TradeDashboard } from '@components/TradeDashboard';
import type { NextPage } from 'next';

const TradePage: NextPage = () => {
  return (
    <Page>
      <TradeDashboard />
    </Page>
  );
};

export default TradePage;
