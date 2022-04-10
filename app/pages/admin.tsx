import { Admin } from '@components/Admin';
import { Page } from '@components/Page';
import type { NextPage } from 'next';

const AdminPage: NextPage = () => {
  return (
    <Page>
      <Admin />
    </Page>
  );
};

export default AdminPage;
