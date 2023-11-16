import React from 'react'; 
import { navData } from '../lib/navData';
import styles from './sideNav.module.css'; // Correct the import statement here
import { NavLink } from "react-router-dom";

const SideNav = (props) => {
    return (
        <div className={styles.sideNavContainer}>
            {navData.map (item => {
                return (
                    <NavLink key={item.id} className={styles.sideNavElement} to={item.link}>
                        {item.icon}
                        <span id={item.text}>{item.text}</span>
                    </NavLink>
                );
            })}
        </div>
    ); 
}
export default SideNav;