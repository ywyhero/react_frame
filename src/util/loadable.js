import Loadable from 'react-loadable';

// 懒加载，后面需要加过度动画可以配置上 loading
export default function IcLoadable(props) {
    let {delay = 0, ...rest} = props;

    return (
        Loadable({
            ...rest,
            delay,
            loading: () => null
        })
    )
};
