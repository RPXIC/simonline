import React, { useEffect } from 'react'
import { withRouter, Link } from "react-router-dom"
import { isLoggedIn } from '../logic'
import { Form } from './'
import'./Login.sass'

const Login = ({ history }) => {

    useEffect(() => {
        isLoggedIn() && history.push('./home')
    },[history])

    return (
        <div className="bg content">
            <Link to={'landing'} className='title'>Simonline</Link>
            <Form type='Login' />
        </div>
    )
}
export default withRouter(Login)