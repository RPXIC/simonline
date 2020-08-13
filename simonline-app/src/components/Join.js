import React, { useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { isLoggedIn } from '../logic'
import { Header } from './'
import Games from './Games'
import'./Join.sass'

const Join = ({ history }) => {
    useEffect(() => { 
        if (!isLoggedIn()) history.push('./landing')
    },[history])

    return (
        <div className="bg join-group">
            <Header back="multiplayer" title="Join Game"/>
            <Games />
        </div>
    )
}
export default withRouter(Join)