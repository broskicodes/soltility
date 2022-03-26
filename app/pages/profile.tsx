import { Page } from '@components/Page';
import { UserDashboard } from '@components/UserDashboard';
import type { NextPage } from 'next';

const Profile: NextPage = () => {
  return (
    <Page>
      <UserDashboard />
    </Page>
  );
};

export default Profile;
