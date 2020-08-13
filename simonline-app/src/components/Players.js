import React, { useEffect, useState } from 'react'
import { retrievePlayersBasicData, context } from '../logic'
import { Feedback } from './'

const Players = () => {
    const [error, setError] = useState()
    const [playersData, setPlayersData] = useState()
    const user = context.user

    useEffect(() => {
        const interval = setInterval(() => {
            (async () => {
                try {
                    const players = await retrievePlayersBasicData(user.gameId)
                    setPlayersData(players)
                } catch (error) {
                    setError(error.message)
                    setTimeout( ()=> setError(undefined), 3000)
                }
            })()
        }, 1500)
        return () => clearInterval(interval)
    },[user.gameId])

    return (
        <>
            { playersData && playersData.map( player => <p key={player.id}>{player.username}</p>) }
            { error && <Feedback error={error}/> }
        </>
    )
}
export default React.memo(Players)