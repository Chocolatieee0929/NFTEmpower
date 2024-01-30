import Home from './Home';
import Layout from '../components/Layout';
import CollectionCreate from './collection/create';
import CollectionList from './collection/list';
import CollectionTokens from './collection/[address]/tokens';

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
    path: '/collection/create',
    element: (
      <Layout>
        <CollectionCreate />
      </Layout>
    ),
  },
  {
    path: '/collection/list',
    element: (
      <Layout>
        <CollectionList></CollectionList>
      </Layout>
    ),
  },
  {
    path: '/collection/:nftAddress',
    element: (
      <Layout>
        <CollectionTokens></CollectionTokens>
      </Layout>
    ),
  },
];
