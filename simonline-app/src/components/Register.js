import React, { useEffect } from 'react'
import { withRouter, Link } from "react-router-dom"
import { isLoggedIn } from '../logic'
import { Form } from './'

const Register = ({ history }) => {

    useEffect(() => {
        isLoggedIn() && history.push('./home')
    },[history])
    
    return (
        <div className="bg content">
            <Link to={'landing'} className='title'>Simonline</Link>
            <Form type='Register' />
        </div>
    )
}
export default withRouter(Register)