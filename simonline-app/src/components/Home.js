import React, { useEffect } from 'react'
import { withRouter, Link } from 'react-router-dom'
import { context, isLoggedIn } from '../logic'
import { Header } from '.'
import'./Home.sass'

const Home = ({ history }) => {

    useEffect(() => { 
        if (!isLoggedIn()) history.push('./landing')
    },[history])

    return (
        <div className="bg home">
            <Header back="landing" title={`Welcome ${context.user.username}`}/>
            <Link className="home__multi-player" to={'multiplayer'}>Multiplayer</Link>
        </div>
    )
}
export default withRouter(Home)