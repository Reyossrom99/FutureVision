import React from 'react'
import styles from './datasets.module.css'
import AuthContext from '../context/AuthContext';
import { useContext } from 'react'
const LoginPage = () => {

    let {loginUser} = useContext(AuthContext)


    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentContainer}>
            <form onSubmit={loginUser}>
                <input type="text" name="username" placeholder="Enter username" />
                <input type="password" name="password" placeholder="enter password" />
                <input type="submit" />
            </form>
            </div>
        </div>
    )
}

export default LoginPage