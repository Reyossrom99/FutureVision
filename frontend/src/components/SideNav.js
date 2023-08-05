import React from 'react'; 
import { navData } from '../lib/navData';
import styles from './sideNav.module.css'; 
import { NavLink } from "react-router-dom";


const SideNav = (props) => {
    return (
        <div className={styles.sidenav}>
            {navData.map (item => {
                return <NavLink key={item.id} className={styles.sideitem} to={item.link}>
                    {item.icon}
                <span className={styles.linkText} id={item.text}>{item.text}</span>
                </NavLink>
            })}
        </div>
    ); 
}
export default SideNav; 