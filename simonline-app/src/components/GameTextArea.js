import React from 'react'
import { Feedback } from './'

const GameTextArea = ({ winner, currentPlayerName, countdown, lastPlayerOut, playersRemain, num, error }) => {
    
    return (
        <div className="footer">
            {winner && <p className="footer__text">Player {winner} wins!</p>}

            {currentPlayerName && (
                <p className="footer__text">Turn of: {currentPlayerName}</p>
            )}

            {countdown && !num &&(
                <p className="footer__text">Remaining time: {countdown}sec.</p>
            )}

            {lastPlayerOut && (
                <p className="footer__text">Player {lastPlayerOut} out</p>
            )}

            {playersRemain && (
                <p className="footer__text">
                    Remaining players: {playersRemain}
                </p>
            )}
            {error && <Feedback error={error} />}
        </div>
    )
}
export default React.memo(GameTextArea)