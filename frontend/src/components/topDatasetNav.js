import React from 'react'; 
import styles from './topNav.module.css'; 
import { navData } from '../lib/datasetsData';
import { NavLink } from "react-router-dom";

const topDatasetsNav = (props) => {
    return (
        <div className={styles.topnav}>
            {
                navData.map (item =>{
                    return <NavLink key={item.id} className={styles.topitem} to={item.link}>
                    {item.icon}
                <span className={styles.linkText} id={item.text}>{item.text}</span>
                </NavLink>
                })
            }

        </div>
    ); 
}
export default topDatasetsNav; 