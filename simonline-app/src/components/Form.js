import React, { useState } from 'react'
import { withRouter } from "react-router-dom"
import { login, register } from '../logic'
import Feedback from './Feedback'

const Form = ({ history, type }) => {
    const [ error, setError ] = useState()

    async function handleLogin(username, password) {
        try {
            await login(username, password)
            history.push('/home')
        } catch (error) {
            setError(error.message)
            setTimeout(()=> setError(undefined), 3000)
        }
    }

    async function handleRegister(username, password) {
        try {
            await register(username, password)
            history.push('./landing')
        } catch (error) {
            setError(error.message)
            setTimeout(() => setError(undefined), 3000)
        }
    }

    return (
        <>
            <h2>- {type} -</h2>
                <form onSubmit={ e => {
                    e.preventDefault()
                            
                    const username = e.target.username.value
                    const password = e.target.password.value

                    type === 'Login' ? handleLogin(username, password) : handleRegister(username, password)
                }}>
                    <input type="text" placeholder="Username" name="username" autoFocus/>
                    <input type="password" placeholder="Password" name="password"/>
                    <button>{type}</button>
                    { error && <Feedback error={error}/> }
                </form>
        </>
    )
}
export default withRouter(Form)