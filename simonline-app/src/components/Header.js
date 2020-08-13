import React from 'react'
import { withRouter, Link } from 'react-router-dom'
import { logout, unjoin, context } from '../logic'
import Swal from 'sweetalert2'

const Header = ({ back, title, history }) => {
    const { id: userId, gameId } = context.user
    const stay = history.location.pathname

    const confirmUnjoin = (props) => {
        Swal.fire({
            title: 'Are you sure to leave game?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes!'
        }).then(async (result) => {
            if (result.value) {
                await unjoin(userId, gameId)
                history.push(props)
            }
        })
    }

    return (
        <div className="top-menu">
            { stay === '/waiting' 
            ? 
                <i className="fas fa-reply top-menu__back" onClick={()=>confirmUnjoin('./join')}></i>
            :
                <Link to={back}><i className="fas fa-reply top-menu__back"></i></Link>
            }
            <p className="top-menu__title">{title}</p>
            <i className="fas fa-sign-out-alt top-menu__logout" onClick={logout}></i>
        </div>
    )
}
export default withRouter(React.memo(Header))