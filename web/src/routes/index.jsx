import Home from './Home';
import Profile from './Profile';
import Layout from '../components/Layout';
import CreateNft from './CreateNft';

export default [
  {
    path: '/',
    element: (
      <Layout>
        <Home />
      </Layout>
    ),
  },
  {
    path: '/profile',
    element: (
      <Layout>
        <Profile />
      </Layout>
    ),
  },
  {
    path: '/create-collection',
    element: (
      <Layout>
        <CreateNft />
      </Layout>
    ),
  },
];
