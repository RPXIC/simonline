import React, { useEffect } from 'react'
import { withRouter, Link } from 'react-router-dom'
import { Header } from './'
import { isLoggedIn } from '../logic'
import'./Multiplayer.sass'

const Multiplayer = ({ history }) => {

    useEffect(() => { 
        if (!isLoggedIn()) history.push('./landing')
    },[history])

    return (
        <div className="bg multiplayer">
            <Header back="home" title="Multiplayer"/>
            <Link to={'create'} className='create-game'>Create game</Link>
            <Link to={'join'} className='join-game'>Join Game</Link>
        </div>
    )
}
export default withRouter(Multiplayer)