import Index from '@/pages/index/index';
import Test from '@/pages/test/index';
const routes = [
    {
        path: '/',
        component: Index,
        exact: true,
        meta: {
            title: '首页'
        }
    }, {
        path: '/test',
        component: Test,
        exact: true,
        meta: {
            title: 'test'
        }
    }
]

export default routes;