import React from 'react';
import { Link } from 'react-router-dom';
import "../styles/BreadCrumbs.css"

const BreadCrumb = ({path, title, active}) => {
    return (
        <Link className={`breadcrumb-segment ${active?'active': 'inactive'}`} to={path}>{title}</Link> 
    )
}

const BreadCrumbs = ({ routes, currentPath }) => {
    const findRootPath = (path) => {
        if (path){
            var step = routes.find(route => route.path == path);
            if (step){
                return findRootPath(step.parent).concat([step])
            } else {
                return []
            }
        } else {
            return []
        }
    }
    const paths = findRootPath(currentPath)
    return (
        <div className="breadcrumbs">{
            paths.map((item, index) => (
                <BreadCrumb
                    key={index}
                    path={item.path}
                    title={item.title}
                    active={index == paths.length - 1}
                />
            ))
        }</div>
    )

};

export default BreadCrumbs; 