import React, { useState, useEffect, useCallback, useRef } from 'react'
import { withRouter } from 'react-router-dom'
import { retrieveGameStatus, retrievePlayersBasicData, playCombination, context } from '../logic'
import { GameTextArea, Board } from './'
import './Game.sass'
const { wait } = require('simonline-utils')

const Game = ({ history }) => {
  const [error, setError] = useState(undefined)
  const [currentPlayerName, setCurrentPlayerName] = useState()
  const [currentPlayer, setCurrentPlayerId] = useState()
  const [lastPlayerOut, setLastPlayerOut] = useState()
  const [playersRemain, setPlayersRemain] = useState()
  const [winner, setWinner] = useState()
  const [countdown, setCountdown] = useState()
  const [status, setStatus] = useState()
  const [combinationLaunched, setCombinationLaunched] = useState()
  const [color, setColor] = useState('')
  const [combinationPlayer, setCombinationPlayer] = useState([])
  const [num, setNum] = useState(3)
  const playersName = useRef()
  const { gameId, id:userId } = context.user
  
  useEffect(() => {
    if (!num) return
    setTimeout(() => setNum(num -1), 1000)
  },[num, gameId])

  useEffect(() => {
    (async () => {
      playersName.current = await retrievePlayersBasicData(gameId) 
      const interval = setInterval(() => {
        if (gameId) {
          (async () => {
            try {
              let status = await retrieveGameStatus(gameId)
              setStatus(status)
              if (status.status === "started" && playersName.current) {
                //current player
                const currentPlayerData = playersName.current.find(
                  x => x.id === status.currentPlayer
                )
                setCurrentPlayerName(currentPlayerData.username)
                setCurrentPlayerId(currentPlayerData.id)
                //countdown
                const x = Math.floor(
                  (new Date() - new Date(status.turnStart)) / 1000
                )
                setCountdown(status.turnTimeout - x)
                //players remain
                if (status.watching.length > 0) {
                  setPlayersRemain(
                    status.players.length - status.watching.length
                  )
                } else setPlayersRemain(status.players.length)
                //last player out
                if (status.watching.length > 0) {
                  const lastPlayerOutObj = playersName.current.find(
                    x => x.id === status.watching[status.watching.length - 1]
                  )
                  setLastPlayerOut(lastPlayerOutObj.username)
                }
              } else if (status.status === "finished") {
                const playerWin = playersName.current.find(
                  x => x.id === status.currentPlayer
                )
                setWinner(playerWin.username)
                setLastPlayerOut(undefined)
                setCountdown(undefined)
                setCurrentPlayerName(undefined)
                setPlayersRemain(undefined)
                clearInterval(interval)
                setTimeout(() => history.push('multiplayer'), 5000)
              }
            } catch (error) {
              setError(error.message)
              setTimeout(() => setError(undefined), 3000)
            }
          })()
        } else history.push("landing")
      }, 1000)
    })()
  }, [gameId, history])

  const showCombination = useCallback(async(combination) => {
    await wait(500)
    return new Promise(resolve => {
      const refColor = ["r", "g", "b", "y"]

      ;(function showColor(i) {
        if (i < combination.length) {
          setColor(refColor[combination[i]])
          setTimeout(() => setColor(''), 1000)
          setTimeout(() => showColor(i + 1), 2000)
        } else {
          resolve()
        }
      })(0)
    })
  }, [])

  const showClick = useCallback((comb) => {
    setColor(comb)
    setTimeout(() => setColor(''), 350)
  },[])

  useEffect(() => {
    setCombinationLaunched(false)
  }, [currentPlayerName])

  useEffect(() => {
    if (status && !combinationLaunched && status.status === 'started' && !num) {
      (async() => {
        setCombinationLaunched(true)
        await showCombination(status.pushCombination)
      })()
    }
  }, [status, combinationLaunched, num, showCombination])


  useEffect(() => {
    if (status && combinationPlayer.length) { 
      (async() => {
        const { pushCombination } = status
  
        if (pushCombination.length === combinationPlayer.length) {
          await playCombination(gameId, combinationPlayer)
          setCombinationPlayer([])
        }
      })()
    }
  }, [combinationPlayer, gameId, status])

  const send = useCallback((comb) => {
    setCombinationPlayer([...combinationPlayer, comb])
  }, [combinationPlayer])

  return (
    <div className="bg game">
      <div className="top-menu"></div>
      <Board 
        color={color}
        userId={userId}
        currentPlayer={currentPlayer}
        showClick={showClick}
        send={send}
        num={num}
      />
      {!num && <GameTextArea 
        winner={winner} 
        currentPlayerName={currentPlayerName} 
        countdown={countdown} 
        lastPlayerOut={lastPlayerOut} 
        playersRemain={playersRemain} error={error}
      />}
    </div>
  )
}
export default withRouter(Game)