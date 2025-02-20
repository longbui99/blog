import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import "../styles/BreadCrumbs.css"

const BreadCrumb = ({path, title, active}) => {
    return (
        <Link className={`breadcrumb-segment ${active?'active': 'inactive'}`} to={path}>{title}</Link> 
    )
}

const BreadCrumbs = () => {
    const routes = useSelector(state => state.routes.items);
    const currentPath = useSelector(state => state.routes.activeRoute);

    const findRootPath = (path) => {
        if (path) {
            const step = routes.find(route => route.path === path);
            if (step) {
                return findRootPath(step.parent).concat([step]);
            }
        }
        return [];
    }

    const paths = findRootPath(currentPath);

    return (
        <div className="breadcrumbs">{
            paths.map((item, index) => (
                <BreadCrumb
                    key={item.path}
                    path={item.path}
                    title={item.title}
                    active={index === paths.length - 1}
                />
            ))
        }</div>
    )
}

export default BreadCrumbs; 