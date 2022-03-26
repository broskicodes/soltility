import { Landing } from '@components/Landing';
import { Page } from '@components/Page';
import type { NextPage } from 'next';

const Home: NextPage = () => {
  return (
    <Page>
      <Landing />
    </Page>
  );
};

export default Home;
