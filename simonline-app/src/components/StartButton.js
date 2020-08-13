import React, { useState } from 'react'
import { Feedback } from './'
import { startGame } from '../logic'
import './StartButton.sass'

const StartButton = ({ user, gameStatus }) => {
    const [ error, setError ] = useState()

    return (
        <>
            <p className="start" onClick={
                (async () => {
                    if (user.id === gameStatus.owner && gameStatus.players.length > 1) {
                        await startGame(user.gameId)
                    } else if (user.id !== gameStatus.owner) {
                        setError(`Wait please, only the owner can start game`)
                        setTimeout(()=> setError(undefined), 3000)  
                    } else if (gameStatus.players.length <= 1) {
                        setError(`Wait to other players please`)
                        setTimeout(()=> setError(undefined), 3000) 
                    }
                })
            }>Start</p>
            { error && <Feedback error={error} /> }
        </>
    )
}
export default React.memo(StartButton)