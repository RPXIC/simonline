import React from 'react'

const Board = ({ color, userId, currentPlayer, showClick, send, num }) => {
    return (
        <div className="board">
        <div className="container">
          <div
            className={
              color === "r"
                ? "container__red--active"
                : "container__red"
            }
            onClick={ e  => {
                e.preventDefault()
                if (userId === currentPlayer) {
                  showClick('r')
                  send(0)
                }
            }}
          ></div>
          <div
            className={
              color === "g"
                ? "container__green--active"
                : "container__green"
            }
            onClick={ e => {
                e.preventDefault()
                if (userId === currentPlayer) {
                  showClick('g')
                  send(1)
                }
            }}
          ></div>
          <div
            className={
              color === "b"
                ? "container__blue--active"
                : "container__blue"
            }
            onClick={ e => {
                e.preventDefault()
                if (userId === currentPlayer) {
                  showClick('b')
                  send(2)
                }            
              }}
          ></div>
          <div
            className={
              color === "y"
                ? "container__yellow--active"
                : "container__yellow"
            }
            onClick={ e => {
                e.preventDefault()
                if (userId === currentPlayer) {
                  showClick('y')
                  send(3)
                }
            }}
          ></div>
          {num ? <div className="container__gray">{num}</div> : <div className="container__gray"></div>}
        </div>
      </div>
    )
}
export default React.memo(Board)