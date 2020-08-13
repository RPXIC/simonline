import React, { useEffect, useState } from 'react'
import { withRouter } from 'react-router-dom'
import { context, isLoggedIn, createGame } from '../logic'
import { Header, Feedback} from './'
import'./Create.sass'

const Create = ({ history }) => {
    const [ error, setError ] = useState()
    const owner = context.user.id

    useEffect(() => { 
        if (!isLoggedIn()) history.push('./landing')
    },[history])

    async function handleCreateGame(name, owner) {
        try {
            await createGame(name, owner)
            history.push('/multiplayer')
        } catch (error) {
            setError(error.message)
            setTimeout(()=> setError(undefined), 3000)    
        }
    }

    return (
        <div className="bg create-group">
            <Header back="multiplayer" title="Create Game"/>
            <form className="form" onSubmit={ e => {
                e.preventDefault()

                const name = e.target.name.value
                
                handleCreateGame(name, owner)
            }}>
                <input className="label" name="name" type="text" placeholder="Name of game" autoFocus/>
                {error && <Feedback error={error}/>}
                <button className="button">Create</button>
            </form>
        </div>
    )
}
export default withRouter(Create)