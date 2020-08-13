import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { isLoggedIn, retrieveGameStatus, context } from '../logic'
import { Players, StartButton, Header, Feedback } from './'
import './WaitingRoom.sass'

const WaitingRoom = ({ history }) => {
    const [error, setError] = useState()
    const [gameStatus, setGameStatus] = useState()
    const user = context.user

    useEffect(() => {
        if (!isLoggedIn() || !user.gameId) history.push('./landing')

        const interval = setInterval(() => {
            (async () => {
                try {
                    const game = await retrieveGameStatus(user.gameId)
                    setGameStatus(game)
                    if (game.status === "started") {
                        clearInterval(interval)
                        history.push('./game')
                    }
                } catch (error) {
                    setError(error.message)
                    setTimeout( ()=> setError(undefined), 3000)
                }
            })()
        }, 1500)
        return () => clearInterval(interval)
    },[history, user.gameId])

    return (
        <div className="bg waiting-room">
            <Header back="join" title="Waiting Room"/>
            <div className="players">
                <StartButton user={user} gameStatus={gameStatus} />
                { error && <Feedback error={error} /> }
                <Players />
            </div>
        </div>
    )
}
export default React.memo(withRouter(WaitingRoom))