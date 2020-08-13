import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { retrieveGames, context, join } from '../logic'
import { Feedback } from '.'

const useGames = ({ history }) => {
    const [games, setGames] = useState()
    const [error, setError] = useState(undefined)

    useEffect(() => {
        const interval = setInterval(() => {
            (async () => {
                try {
                    const games = await retrieveGames()
                    setGames(games)
                } catch (error) {
                    setError(error.message)
                    setTimeout(()=> setError(undefined), 3000)                  
                }
            })()
        }, 2500)
        return () => clearInterval(interval)
    },[])

    async function handleJoin(gameId) {
        try {
            let user = context.user
            const userId = context.user.id
            await join(userId, gameId)
            user.gameId = gameId
            context.user = user
            history.push('/waiting')
        } catch (error) {
            setError(error.message)
            setTimeout(()=> setError(undefined), 3000)
        }
    }

    return (
        <div className="groups">
            { error && <Feedback error={error}/> }    
            { games && games.map(game => <p key={game.id} onClick={ e => {
                e.preventDefault()
                const gameId = e._targetInst.key

                if (game.status === 'waiting') {
                    handleJoin(gameId) 
                } else {
                    setError(`game is ${game.status}`)
                    setTimeout( () => setError(undefined), 3000)  
                }
            }}>{game.name}</p>)}
        </div>
    )
}
export default withRouter(useGames)