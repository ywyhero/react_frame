import React from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import routes from '@/router/routes'
import loadable from '@/util/loadable';
import '@/util/rem'
const basePath = ''
const Router = () => (
    <BrowserRouter>
        <Switch>
            {
                routes.map((route, index) => {
                    return <Route
                        key={index}
                        exact={route.exact}
                        path={`${basePath}${route.path}`}
                        render={props => {
                            document.title = route.meta.title;
                            // react-loadable 用于分片加载
                            return <route.component component={loadable({
                                loader: () => props.component
                            })}></route.component>
                        }}
                    />
                })
            }
        </Switch>
    </BrowserRouter>
);


export default Router;