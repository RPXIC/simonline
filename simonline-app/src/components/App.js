import React from 'react'
import { Landing, Login, Register, Home, Multiplayer, Create, Join, WaitingRoom, Game } from './'
import { Route } from 'react-router-dom'
import './App.sass'

const App = () => {
  return (
    <div className="app">
      <Route exact path="/" component={Landing} />
      <Route path="/landing" component={Landing} />
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
      <Route path="/home/" component={Home} />
      <Route path="/multiplayer" component={Multiplayer} />
      <Route path="/create" component={Create}/>
      <Route path="/join" component={Join} />
      <Route path="/waiting" component={WaitingRoom} />
      <Route path="/game" component={Game} />
    </div>
  )
}
export default App