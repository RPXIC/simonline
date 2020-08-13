import React from 'react'
import logo from '../logo.svg'
import './Landing.sass'
import { withRouter } from 'react-router-dom'

const Landing = ({ history }) => {

        return (
                <div className="bg landing">
                        <p className="landing__title">Simonline</p>
                        <img src={logo} className="landing__img" alt="logo" />
                        <p className="landing__login" onClick={e => {
                                e.preventDefault()
                                history.push('./login')
                        }}>Login</p>
                        <p className="landing__register" onClick={e => {
                                e.preventDefault()
                                history.push('./register')
                        }}>Register</p>
                </div>
        )
}
export default withRouter(Landing)